import makeWASocket, {
    useMultiFileAuthState,
    downloadMediaMessage,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import { execSync } from 'node:child_process';
import qrcode from 'qrcode-terminal'
import fs from 'fs-extra'
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
// import ffmpeg from 'fluent-ffmpeg'
import pino from "pino"
// import { execSync } from 'child_process';


import path from "path";

import { Sender } from "./src/core/models/sender.js";
import { config } from "./src/core/config/index.js";
import { DB_LOCAL } from './src/core/models/db.js';
import { dispatchHandlers } from './src/core/dispatcher/handlerDispatch.js'
import { middleware } from './src/core/middleware/index.js'
import { Admins } from './src/core/models/admins.js'
import { Users } from './src/core/models/user.js'
import { Console, group } from 'console';
import { downloadYoutubeVideo } from './src/modules/UtilsManagement/services/Youtube/getVideoUrl.js';
import { deleteFile } from './src/infrastructure/utils/deleteFile.js';
import { Group } from './src/core/models/group.js';
import { fileURLToPath } from 'url';
import { conexion_postgres } from './src/infrastructure/services/postgres/conexion_postgres_db.js';
import { ConexionPostgres } from './src/core/models/db/conexion_postgres.js';
import { Owner } from './src/core/models/owner.js';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path)
const processedMessages = new Set();
const allowedChats = new Set();
const db_local = new DB_LOCAL(config);
const db_postgress = ConexionPostgres;

let client;  // ← declarar variable globalmente (una sola vez)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startBot() {
  //Variables iniciales Const 
  
  const { state, saveCreds } = await useMultiFileAuthState(config.routes.PATH_AUTH)
  const { version } = await fetchLatestBaileysVersion()
  const deletedMessages = {}; 
  
  
  const sock = makeWASocket({
    version,
    auth: state,
    browser: ['Bot', 'Chrome', '1.0.0'],
    logger: pino({ level: 'debug' }),  // Solo esto. Nada más.
    syncFullHistory: false,   // opcional: evita descargar TODO el historial
    shouldSyncHistoryMessage: () => false, // si quieres evitar histori
      })
  
  globalThis.sock = sock; // <<--- Guardamos el sock global


  // CREAMOS EL CLIENT (CONTEXT) UNA SOLA VEZ
  //metodo para cargar las imagenes
  const multimedia  = setupMultiMedia(sock);

  client = {
      sock,
      send: new Sender(sock, 
        // { footer: config.BOT_CONFIG.footer }
      ),
      multimedia,
      db: {
        local: db_local,
        postgres: db_postgress,
      },
      config,
      sessions: new Map(),
      // allowedChats: await loadAllowedChats(config),
      processedMessages,
      middleware,
      deletedMessages: new Map(),
      manager:{
        users: new Users(config.routes.PATH_DATABASE),
        admins: new Admins(config.routes.PATH_DATABASE),
        owner: new Owner(config.routes.PATH_DATABASE),
        groups: new Group(config.routes.PATH_DATABASE)
      }
 
    };

  globalThis.client = client
  

  //Activamos la conexion 
  setupConnectionEvents(client,saveCreds);
  //Iniciamos los comandos
  setupMessageEvents(client,sock);
  
  

  // console.log("Process before activation - ")
  // console.log(await client.db.local.load("chats"))

  // console.log(await client.db.local.save("users",[{id:"",name:"",role:""}]))
  // console.log(await client.db.local.load("owners"))

  // console.log("Process before activation - ")
  // console.log(client.allowedChats)

  // console.log(client)
  // console.log(client.sock.user)
  // setupAntiDelete(client);

}

startBot().catch(err => console.error('Error crítico:', err));  // ← 1ª 
// vez (correcta)







export function setupMultiMedia(sock) {

    return {
        sendVideo: async (chatId, filePath, caption = "") => {
            if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado: " + filePath);
            const buffer = fs.readFileSync(filePath);
            return await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: "video/mp4",
                fileName: path.basename(filePath),
                caption
            });
        },

        sendAudio: async (chatId, filePath, caption = "") => {
            if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado: " + filePath);
            const buffer = fs.readFileSync(filePath);
            return await sock.sendMessage(chatId, {
                audio: buffer,
                mimetype: "audio/mp3",
                fileName: path.basename(filePath),
                caption
            });
        },

        sendImage: async (chatId, filePath, caption = "") => {
            if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado: " + filePath);
            const buffer = fs.readFileSync(filePath);
            return await sock.sendMessage(chatId, {
                image: buffer,
                mimetype: "image/jpeg",
                fileName: path.basename(filePath),
                caption
            });
        }
    }
}



function setupConnectionEvents(client, saveCreds) {
  client.sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // Mostrar QR cuando aparece
    if (qr) {
      console.log('📱 Escanea este código QR:')
      qrcode.generate(qr, { small: true })
    }

    // Conexión exitosa → registrar owner si no existe
    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente a WhatsApp')

      try {
        const botUser = client.sock.user
        const botOwnerId = botUser?.id

        if (!botOwnerId) {
          console.warn('No se pudo obtener ID del bot')
          return
        }

        console.log('Información del bot:', botUser)

        const owners = await client.manager.owner.load()
        const ownersList = Array.isArray(owners) ? owners : []
        const alreadyOwner = ownersList.some(o => o.id === botOwnerId || o.idbot === botOwnerId)

        if (!alreadyOwner) {
          await client.manager.owner.add({          // ← "owner" singular, coincide con el manager
            idbot: botOwnerId,
            id: botUser.lid || botOwnerId,           // fallback razonable
            name: botUser.name || 'OwnerBot',
            status: 'free',
            role: 'owner'
          })
          console.log(`📝 Owner registrado: ${botOwnerId}`)
        }
      } catch (err) {
        console.error('Error al registrar owner:', err)
      }
    }

    // ────────────────────────────────────────────────
    // Manejo de desconexión
    if (connection === 'close') {
      const boom = lastDisconnect?.error
      const statusCode = boom?.output?.statusCode
      const errorMessage = boom?.message || boom?.output?.payload?.error || 'desconocido'

      console.log(`Conexión cerrada → Código: ${statusCode || 'sin código'} | Mensaje: ${errorMessage}`)

      // Casos donde NO queremos reconectar automáticamente (sesión inválida/corrupta)
      const shouldNotReconnect = [
        DisconnectReason.loggedOut,
        DisconnectReason.badSession,
        401,               // logout explícito
        500,               // bad session genérico
      ].includes(statusCode)

      // Errores criptográficos específicos (Bad MAC, decrypt, etc.)
      const isCryptoError = /Bad MAC|No matching sessions|decrypt/i.test(errorMessage)

      if (isCryptoError || shouldNotReconnect) {
        console.log('🚫 Sesión corrupta o inválida. Eliminando auth...')

        const sessionFolder = path.join(__dirname, 'src', 'infrastructure', 'auth')

        try {
          await fs.rm(sessionFolder, { recursive: true, force: true })
          console.log('🗑️ Carpeta de sesión eliminada:', sessionFolder)

          console.log('♻️ Reiniciando bot en 5 segundos...')
          setTimeout(() => {
            // Dejamos que nodemon/pm2 reinicie el proceso — evita procesos duplicados
            process.exit(1)
          }, 5000)
        } catch (err) {
          console.error('❌ No se pudo eliminar carpeta o reiniciar:', err)
          process.exit(1)
        }
      } 
      else {
        // Otros casos → reconectar con delay
        console.log('🔄 Intentando reconectar en 5 segundos...')
        setTimeout(() => startBot(), 5000)
      }
    }
  })
  client.sock.ev.on('creds.update', saveCreds)
}

// function setupConnectionEvents(client,saveCreds) {
//   // ==================== CONEXIÓN ====================
//   client.sock.ev.on('connection.update', async (update) => {
//     const { connection, lastDisconnect, qr } = update

//     // Mostrar QR si aparece
//     if (qr) {
//       console.log('📱 Escanea este código QR:')
//       qrcode.generate(qr, { small: true })
//     }

//     if (connection === 'open') {
//       console.log('✅ Bot conectado correctamente a WhatsApp')
    
      
//          // ======= Registrar owner automáticamente =======
//         // ID limpio del bot
//             const botOwnerId = client.sock.user.id ;

//             console.log(client.sock.user)

            
//             // Cargar owners desde tu manager
//             const owners = await client.manager.owners.load();

//             // Verificar si ya existe
//             const alreadyOwner = owners.some(o => o.id === botOwnerId);

//             if (!alreadyOwner) {
//                 await client.manager.owners.add({
//                     // id: botOwnerId,
//                     idbot: botOwnerId,
//                     id: client.sock.user.lid,
//                     name: client.sock.user.name || 'OwnerBot', // opcional desde config
//                     status: 'free',
//                     role: "owner"
//                 });
//                 console.log(`📝 Owner registrado: ${botOwnerId}`);
//             }
      
//     }
//       const err = lastDisconnect?.error?.message || '';

//       if (
//         err.includes('Bad MAC') ||
//         err.includes('No matching sessions') ||
//         err.includes('decrypt')
//       ) {
//         console.log('🚫 Sesión criptográfica corrupta. Eliminando auth...');
        
//         const sessionFolder = path.join(__dirname, 'src', 'infrastructure', 'auth');
//         await fs.rm(sessionFolder, { recursive: true, force: true });

//         process.exit(1); // gestor reinicia
//   }



//     if (connection === 'close') {
//      const statusCode = lastDisconnect?.error?.output?.statusCode ?? null;
//       console.log(`Conexión cerrada. Motivo: ${statusCode || 'desconocido'}`)

//       const code = lastDisconnect?.error?.output?.statusCode
//       console.log('❌ Conexión cerrada. Código:', code)


//       const razonesQueNoReconectan = [
//             DisconnectReason.loggedOut,
//             DisconnectReason.badSession,
//             DisconnectReason.timedOut  // a veces 440
//         ]

//       if (!razonesQueNoReconectan.includes(statusCode)) {
//             console.log('Intentando reconectar...')
//         setTimeout(startBot, 5000);      
//         } else {
//             console.log('Sesión inválida o logout → borra la carpeta auth y enlaza de nuevo')
//         }

//       // Si el código no es 401, intentamos reconectar
//       if (code !== 401) {
//         console.log('🔄 Intentando reconectar...')
//         setTimeout(startBot, 5000);      
//       } else {
//         //     const fs = require('fs');
    
//         // const fs = require('fs/promises');
//         // const path = require('path');

//         console.log('🚫 Sesión inválida. Borra la carpeta "Auth" y vuelve a escanear el QR.') 

//   const sessionFolder = path.join(__dirname, 'src','infrastructure',`auth`);

//   try {
//     // Elimina la carpeta (exista o no)
//     await fs.rm(sessionFolder, { recursive: true, force: true });
//     console.log('🗑️ Carpeta de sesión eliminada:', sessionFolder);

//     console.log('♻️ Reiniciando el bot en 3 segundos...');
//     setTimeout(() => {
//       execSync('npm run start', { stdio: 'inherit' });
//       process.exit(0);
//     }, 3000);

//   } catch (err) {
//     console.error('❌ Error al eliminar carpeta o reiniciar:', err);
//     process.exit(1);
//   }
// // if (connection === 'close') {
// //   const code = lastDisconnect?.error?.output?.statusCode;
// //   console.log('Conexión cerrada. Código:', code);

// //   if (code === 401) {
// //     console.log('Sesión cerrada por WhatsApp (401). Eliminando carpeta de autenticación y reiniciando...');

// //     const fs = require('fs');
// //     const path = require('path');
// //     const { execSync } = require('child_process');

// //     // Cambia esta ruta según cómo se llame tu carpeta de sesión
// //     const sessionFolder = path.join(__dirname, 'session');     // ← común
// //     // const sessionFolder = path.join(__dirname, 'auth_info'); // ← si usas este nombre
// //     // const sessionFolder = path.join(__dirname, 'session_data');

// //     try {
// //       if (fs.existsSync(sessionFolder)) {
// //         fs.rmSync(sessionFolder, { recursive: true, force: true });
// //         console.log('Carpeta de sesión eliminada:', sessionFolder);
// //       }

// //       // Opción 1: Reiniciar con pm2 (recomendado en producción)
// //       // execSync('pm2 restart tu-bot-name');

// //       // Opción 2: Reiniciar con npm (ideal si usas node directamente o screen)
// //       console.log('Reiniciando el bot en 3 segundos...');
// //       setTimeout(() => {
// //         execSync('npm run start', { stdio: 'inherit' }); // o 'npm start' según tu package.json
// //         process.exit(0); // termina el proceso actual
// //       }, 3000);

// //     } catch (err) {
// //       console.error('Error al eliminar carpeta o reiniciar:', err);
// //       process.exit(1);
// //     }

// //   } else {
// //     // Para cualquier otro código (red, timeout, etc.) → solo reconecta
// //     console.log('Intentando reconectar en 5 segundos...');
// //     setTimeout(startBot, 5000);
// //   }
    
// }}});

//   client.sock.ev.on('creds.update', saveCreds)

// //   //agrega el owner que se conecta x primeravez en los owers y si ya existe que pase 
// }


// // ==================== CARGA DE CHATS PERMITIDOS ====================
// async function loadAllowedChats(config) {
//   const set_chat = {chats: []}
//     try {
//         const db_chats = `${config.routes.PATH_DATABASE}chats.json`

//         //crea un diccionario si es que no existe chats:{}
//         if (!fs.existsSync(db_chats)) {
//             await fs.writeJson(db_chats, set_chat, { spaces: 2 });
//             return [];
//         }

//         //obtiene los elementos del diccionario chats:{[]} o sino  una lista vacia
//         // Normalizamos a array de objetos
        
//             // Leemos los datos del archivo
//         const data = await fs.readJson(db_chats);
//         const chats = Array.isArray(data.chats) ? data.chats : [];

//         return chats.map(chat => ({
//           id: chat.id || "",
//           nombre: chat.nombre || "",
//           status: chat.status || "permitido" // valor por defecto
//         }));
//     } catch (err) {
//         console.error('Error cargando allowedChats, creando nuevo...');
//         await fs.writeJson(db_chats, set_chat, { spaces: 2 });
//         return [];
//     }
// }

// async function saveAllowedChats(config) {
//     const db_chats = `${config.routes.PATH_DATABASE}chats.json`
//     const set_chat = {chats: Array.from(client.allowedChats)}

    
//     await fs.writeJson(db_chats, set_chat, { spaces: 2 });
// }


// // ==================== ANTI-DELETE ====================
// function setupAntiDelete(client) {
//   client.sock.ev.on('messages.update', async (updates) => {
//         for (const { key, update } of updates) {
//             if (update.pollUpdates) continue;

//             const originalMsg = client.deletedMessages.get(key.id);
//             if (!originalMsg) continue;

//             const groupJid = key.remoteJid;
//             if (!groupJid.endsWith('@g.us')) continue;

//             await client.send.text(groupJid, 
//                 `*MENSAJE ELIMINADO*\n\n` +
//                 `Usuario: @${key.participant.split('@')[0]}\n` +
//                 `Mensaje: ${getMessageText(originalMsg)}`,
//                 { mentions: [key.participant] }
//             );
//         }
//     });
//   }

// ==================== MENSAJES ====================
async function setupMessageEvents(client) {
    
  const normalizeId = (id) => {
    console.log(normalizeId)
    if (!id || typeof id !== 'string') return '';
    
    // Quitar todo lo que venga después de “@”
    let base = id.split('@')[0];

    // Quitar todo lo que venga después de “:”
    base = base.split(':')[0];
    
    return base;
  };
  
  // Obtener admins
  async function getGroupAdmins(groupId) {
    // const metadata = await sock.groupMetadata(groupId);
    const adminSet = new Set();
    
      metadata.participants.forEach(p => {
          if (p.admin === "admin" || p.admin === "superadmin") {
              adminSet.add(p.id);
          }
      });

      return Array.from(adminSet);
  }

  //--------------------------Comands-----------------------------------

  client.sock.ev.on('messages.upsert', async ({ messages , type }) => {
    
      //BOT ACTIVO PARA EL MISMO USUARIO: 

      //evita mensajes antiguos
      if (type !== "notify") return; // <--- Solo procesa mensajes nuevos    
      //Capta los mensajes iniciales 
      const msg = messages[0];
      // Filtro anti-undefined / anti-session-corrupta
      //de donde viene el mnesaje
      const chatId = msg.key.remoteJid;
      
      console.log(`---ChatPosterior----\n`,
        `Mensaje: ${msg.message}\n`,
        `chatId: ${chatId}\n`,)
      
      
      if (!msg || !msg.message) {
          console.log("⚠️ Mensaje ignorado (undefined o no desencriptado)");
          return;
      }
      
      //obtiene el prefijo de comandos
      const prefix = client.config.defaults.prefix;
      
      //de donde viene el mnesaje
      //const chatId = msg.key.remoteJid;
      // Quien envio el mensaje
      const userId = msg.key.participant || msg.key.senderPn || msg.key.remoteJid;
      const userSenderPn = msg.key.senderPn;
      const participant = msg.key.participant;
      const allid = msg.key.remoteJid || msg.key.participant || msg.key.senderPn;
      
      // Log central del mensaje
      console.log(`------MESSAGE ARGUMENTS ----\n`,
        `Mensaje: ${msg}\n`,
        `chatId: ${chatId}\n`,
        `userId: ${userId}\n`,
        `Nombre: ${msg.pushName}`,
        `senderPn: ${userSenderPn}`,
        `Participatnt: ${participant}`
      )
      console.log(`-----MESSAGE ARGUMENTS -----`)
      console.log(`Tipo de chatId: ${chatId}`)
      console.log(`All_Id: ${allid}`)

      // Verificar que sea:
      // Un usuario - grupo - central
      // Filtramos chats no deseados (opcional: ignorar broadcasts, status, etc.)
      if (chatId.endsWith('@broadcast') ||     // Listas de difusión
          chatId.endsWith('@lid') ||
          chatId.endsWith('@newsletter') ||          // Llamadas o algo raro
          chatId === 'status@broadcast') {     // Estados
          return;
      }

      console.log(msg);

      const text = getMessageText(msg);
      await client.sock.ev.flush()
      await new Promise(r => setTimeout(r, 10))
        // console.log("Hola buenos dias, estas usando")
      await dispatchHandlers({msg,cleanText: text,client});
  

        
      }             
    )};//Termina la funcion Messages. upserts
      
        













        // // Aquí irán tus comandos y handlers
        // await handleFlows(msg, client);
        
        function isChatOrUser (chatId) {
          if (chatId.endsWith('@g.us')) {
            let chat = allowedChats.find(c => c.id === chatId);
            return !chat; // no permitido
          } else {
            let user = allowedUsers.find(u => u.id === chatId);
            return !user; // no permitido
          }
        }
      

//  ==================== COMANDOS BÁSICOS ====================
async function handleIsNotChat(msg, text, client,chat,user) {
        
        // Quitar el prefijo del inicio
        const cleanText = text.slice(prefix.length).trim();
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        if (!msg || !msg.key || !msg.key.remoteJid) {
          console.log("Mensaje ignorado: no tiene remoteJid");
            return;
        }
    
        const chatId = msg.key.remoteJid;
        if (command === 'ping') {
          await client.send.reply(msg, 'Pong!');
        }
        if (command === 'menu') {
          await client.send.reply(msg, `
            *MI BOT PRO 2025*
            
            !ping → prueba
            !start → activar bot
            !sticker → convierte imagen
            !e -> Un texto que se elimina en 10 segundos
            `);
          }
        
}

// ==================== UTILIDADES ====================
function getMessageText(msg) {
    return msg.message?.conversation ||
           msg.message?.extendedTextMessage?.text ||
           msg.message?.imageMessage?.caption ||
           '[Multimedia]';
}

export async function handleRule34(sock, msg, sender, text) {
  try {
        
      const tags = text.slice(5).trim().split(" ");
      if (tags.length === 0) {
          await sock.sendMessage(sender, {
        text: "⚠️ Debes escribir al menos un tag. Ejemplo:\n`!r34 catgirl`",
      });
      return;
    }

    await sock.sendMessage(sender, { text: "🔍 Buscando en Rule34..." });

    // const result = await fetchRule34(tags);
    if (!result) {
        await sock.sendMessage(sender, {
        text: "❌ No encontré resultados con esos tags. Intenta con otros.",
      });
      return;
    }

    // 🔹 Enviar imagen directamente
    const tempPath = path.join("./temp", `r34_${Date.now()}.jpg`);
    const response = await fetch(result.fileUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buffer));

    await sock.sendMessage(sender, {
      image: fs.readFileSync(tempPath),
      caption: `🔞 Resultado Rule34\n🧩 Tags: ${tags.join(", ")}\n⭐ Score: ${result.score}`,
    });

    // 🧹 Limpieza
    setTimeout(() => {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }, 2000);
  } catch (err) {
    console.error("❌ Error en handleRule34:", err);
    await sock.sendMessage(sender, {
      text: "⚠️ Ocurrió un error al buscar en Rule34.",
    });

  }

}