import makeWASocket, { useMultiFileAuthState,  downloadMediaMessage
, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import fs from 'fs-extra'
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
// import ffmpeg from 'fluent-ffmpeg'
import pino from "pino"


import path from "path";

import { Sender } from "./src/class/sender.js";
import { config } from "./src/config/index.js";
import { DB_LOCAL } from './src/database/models/db.js';
import { all } from 'axios'
import { dispatchHandlers } from './src/handlers/message/handlerDispatch.js'
import { middleware } from './src/core/middleware/index.js'
import { Owners } from './src/core/owners.js'
import { Admins } from './src/core/admins.js'
import { Users } from './src/core/users.js'
import { downloadYoutubeMp3 } from './src/services/youtubeServices/getMp3Url.js'
import { deleteFile } from './src/utils/deleteFile.js'
import { downloadBiliVideo } from './src/services/BilibiliServices/getVideo.js'
import { downloadYoutubeVideo } from './src/services/youtubeServices/getVideoUrl.js'

// ffmpeg.setFfmpegPath(ffmpegInstaller.path)
const processedMessages = new Set();
const allowedChats = new Set();
const db_local = new DB_LOCAL(config);

let client;  // ← declarar variable globalmente (una sola vez)

async function startBot() {
  //Variables iniciales Const 
  const { state, saveCreds } = await useMultiFileAuthState('./src/auth')
  const { version } = await fetchLatestBaileysVersion()
  const deletedMessages = {}; 
  
  
  const sock = makeWASocket({
    version,
    auth: state,
    browser: ['Bot', 'Chrome', '1.0.0'],
    logger: pino({ level: 'debug' }),  // Solo esto. Nada más.
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
        owners: new Owners(config.routes.PATH_DATABASE)
      }
 
    };

  globalThis.client = client
  


  setupConnectionEvents(client,saveCreds);
  setupMessageEvents(client,sock);
  
  

  console.log("Process before activation - ")
  console.log(await client.db.local.load("chats"))

  // console.log(await client.db.local.save("users",[{id:"",name:"",role:""}]))
  console.log(await client.db.local.load("owners"))

  console.log("Process before activation - ")
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








function setupConnectionEvents(client,saveCreds) {
  // ==================== CONEXIÓN ====================
  client.sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // Mostrar QR si aparece
    if (qr) {
      console.log('📱 Escanea este código QR:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente a WhatsApp')
    
         // ======= Registrar owner automáticamente =======
        // ID limpio del bot
            const botOwnerId = client.sock.user.id ;

            console.log(client.sock.user)

            
            // Cargar owners desde tu manager
            const owners = await client.manager.owners.load();

            // Verificar si ya existe
            const alreadyOwner = owners.some(o => o.id === botOwnerId);

            if (!alreadyOwner) {
                await client.manager.owners.add({
                    // id: botOwnerId,
                    idbot: botOwnerId,
                    id: client.sock.user.lid,
                    name: client.sock.user.name || 'OwnerBot', // opcional desde config
                    status: 'free',
                    role: "owner"
                });
                console.log(`📝 Owner registrado: ${botOwnerId}`);
            }
      
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Conexión cerrada. Código:', code)

      // Si el código no es 401, intentamos reconectar
      if (code !== 401) {
        console.log('🔄 Intentando reconectar...')
        setTimeout(startBot, 5000);      
      } else {
        console.log('🚫 Sesión inválida. Borra la carpeta "session" y vuelve a escanear el QR.')
      
        
      }



    }
// if (connection === 'close') {
//   const code = lastDisconnect?.error?.output?.statusCode;
//   console.log('Conexión cerrada. Código:', code);

//   if (code === 401) {
//     console.log('Sesión cerrada por WhatsApp (401). Eliminando carpeta de autenticación y reiniciando...');

//     const fs = require('fs');
//     const path = require('path');
//     const { execSync } = require('child_process');

//     // Cambia esta ruta según cómo se llame tu carpeta de sesión
//     const sessionFolder = path.join(__dirname, 'session');     // ← común
//     // const sessionFolder = path.join(__dirname, 'auth_info'); // ← si usas este nombre
//     // const sessionFolder = path.join(__dirname, 'session_data');

//     try {
//       if (fs.existsSync(sessionFolder)) {
//         fs.rmSync(sessionFolder, { recursive: true, force: true });
//         console.log('Carpeta de sesión eliminada:', sessionFolder);
//       }

//       // Opción 1: Reiniciar con pm2 (recomendado en producción)
//       // execSync('pm2 restart tu-bot-name');

//       // Opción 2: Reiniciar con npm (ideal si usas node directamente o screen)
//       console.log('Reiniciando el bot en 3 segundos...');
//       setTimeout(() => {
//         execSync('npm run start', { stdio: 'inherit' }); // o 'npm start' según tu package.json
//         process.exit(0); // termina el proceso actual
//       }, 3000);

//     } catch (err) {
//       console.error('Error al eliminar carpeta o reiniciar:', err);
//       process.exit(1);
//     }

//   } else {
//     // Para cualquier otro código (red, timeout, etc.) → solo reconecta
//     console.log('Intentando reconectar en 5 segundos...');
//     setTimeout(startBot, 5000);
//   }
    
  });

  client.sock.ev.on('creds.update', saveCreds)

//   //agrega el owner que se conecta x primeravez en los owers y si ya existe que pase 
}


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
    client.sock.ev.on('messages.upsert', async ({ messages , type }) => {
      
      //evita mensajes antiguos
       if (type !== "notify") return; // <--- Solo procesa mensajes nuevos    

        const msg = messages[0];
        
        const chatId = msg.key.remoteJid;
        const userId = msg.key.participant || chatId;
        const text = getMessageText(msg);
        const allowedChats =  await client.db.local.load("chats")
        const loadUsers = await client.db.local.load("users")
        const owner = client.sock.user
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        console.log(mentioned || "sin menciones"); // ['51928250746@s.whatsapp.net']

        // console.log(`Mensaje enviando antes de frome${msg}`)
        // console.log(`Mensaje enviando despues de fromMe${msg}`)

        if (!msg.message || msg.key.fromMe) return;
        // Evitar duplicados
        if (client.processedMessages.has(msg.key.id)) return;
        client.processedMessages.add(msg.key.id);

        // Guardar para anti-delete
        client.deletedMessages.set(msg.key.id, msg);
        // Solo grupos


        if (!chatId.endsWith('@g.us')) return;


        
        // Sistema de activación por 
                // Buscar si el chat ya existe y está permitido
        let chat = allowedChats.find(c => c.id === chatId);

        if (!chat ) {
            if (text.toLowerCase() === '!start') {
                const metadata = await client.sock.groupMetadata(chatId);
              // Crear objeto nuevo
              
          //     async function getGroupAdmins(groupId) {
          //       const metadata = await sock.groupMetadata(groupId);
          //       return metadata.participants
          //           .filter(p => p.admin === "admin" || p.admin === "superadmin")
          //           .map(p => p.id);
          // }
              
                    async function getGroupAdmins(groupId) {
                          const metadata = await sock.groupMetadata(groupId);

                          const adminSet = new Set();
                          metadata.participants.forEach(p => {
                            if (p.admin === "admin" || p.admin === "superadmin") {
                              adminSet.add(p.id);
                            }
                          });
                          console.log(metadata)
                          console.log(metadata.participants)
                          console.log(adminSet)
                          
                          return Array.from(adminSet);;
                      }

                    const chat = {
                      id: chatId,
                      nombre: `${metadata.subject}`,       // opcional: puedes poner nombre del grupo
                      status: 'allowed',
                      // admins:  await getGroupAdmins(chatId)
                      admins: await getGroupAdmins(chatId)
                    };
                
                // const user ={
                //       id: userId,
                //       chatId: chatId,
                //       status: 'allow'

                      
                //   }

                allowedChats.push(chat)
                await client.db.local.save("chats",allowedChats)
                await client.send.reply(msg, `Bot activado en *${metadata.subject}*`);

            
              }
            return;
        }

        console.log(msg)
           // -------------------------------

            const normalizeId = (id) => {
                if (!id || typeof id !== 'string') return '';
                return id.replace(/\D/g, '') || id.split('@')[0].split(':')[0] || '';
            };

            const prefix = client.config.defaults.prefix;
            const VIDEO = client.config.routes.PATH_VIDEO;

            if (!text.startsWith(prefix)) return;

     

            if (!client.middleware.isBanned({msg,client})) {
              await client.send.reply(msg,"Este usuario no puede utilizar los comandos, has sido baneado")
              return;
            };


          const owners = await client.db.local.load("owners"); // array de owners
            const users = await client.db.local.load("users");   // array de usuarios

            // Verificar si es owner
            const isOwner = owners.some(o => normalizeId(o.id) === normalizeId(userId));
            
            if (!isOwner) {
                // Verificar si ya existe el usuario en la lista de users (normalizando IDs)
                let user = users.find(u => normalizeId(u.id) === normalizeId(userId) && u.chatId === chatId);

                if (!user) {
                    user = {
                        id: userId,
                        name: msg.pushName || "",   // pushName del mensaje
                        chatId: chatId,
                        status: 'allow',
                        role: 'user' // default
                    };
                    users.push(user);
                    await client.db.local.save("users", users);
                }
            }







        // Aquí irán tus comandos y handlers
        await handleCommands(msg, text, client);
        await handleFlows(msg, client);
    });
}
      
// ==================== COMANDOS BÁSICOS ====================
async function handleCommands(msg, text, client) {
    const prefix = client.config.defaults.prefix

    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    
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
        
        const VIDEO = client.config.routes.PATH_VIDEO;
        
        const chatId = msg.key.remoteJid;
        
        // Comando !mp3
        console.log(text)
        // Comando !bl
      
            



        dispatchHandlers(msg,text,client,sock);

    }


// ==================== FLOWS (próximamente) ====================
async function handleFlows(msg, client) {
    // Aquí irán registerFlow, orderFlow, etc.
    // Por ahora vacío
}
      
      // const enableChat = (chatId) => {
      //     allowedChats.add(chatId);
      //     console.log("Chat habilitado:", chatId);
      //     saveAllowedChats(); // Guardar cada vez que agregas uno

      // };



















  // const blockAllGroups = async (sock) => {
  //     const groups = await sock.groupFetchAllParticipating();

  //     Object.values(groups).forEach(g => {
  //         // NO se añaden a allowedChats, por lo tanto quedan bloqueados
  //         console.log(`Grupo bloqueado por defecto: ${g.subject} (${g.id})`);
  //         // console.log(`Grupo bloqueado por defecto: ${g.subject} (${g.id})`);
  //     });

  //     console.log("Todos los grupos iniciaron BLOQUEADOS.");
  //     // console.log("Todos los grupos iniciaron BLOQUEADOS.");
  // };

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