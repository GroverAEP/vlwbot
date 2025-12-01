import fs from 'fs'
// import ffmpeg from 'fluent-ffmpeg'
// import sharp from 'sharp'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { Handler } from '../../../core/handler.js';
// import { Image } from '@napi-rs/image';
// import pkg from '@napi-rs/image';
// const { Image } = pkg;

// Configurar ffmpeg path correcto
// Ruta fallback dentro del proyecto
const localFfmpegPath = path.join(process.cwd(), 'ffmpeg', 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

// Verificar si el path del paquete npm existe
let ffmpegPath = ffmpegInstaller.path;
if (!fs.existsSync(ffmpegPath)) {
    console.warn('⚠️ No se encontró FFmpeg en el paquete npm, usando ruta local');
    ffmpegPath = localFfmpegPath;
}

// Configurar fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

console.log('Usando FFmpeg en:', ffmpegPath);
// import { Sticker, StickerTypes } from 'wa-sticker-formatter'



// let Sharp;
// try {
//     Sharp = await import('sharp'); // solo funciona si está instalado
//     console.log("Usando Sharp nativo");
// } catch (err) {
//     try {
//         Sharp = await import('@img/sharp-wasm32'); // solo si está instalado
//         console.log("Usando Sharp WASM");
//     } catch (err) {
//         Sharp = null;
//         console.log("Usando Jimp");
//     }
// }
//////////////////////////////////////////////////
// Cuarto Comando : Sticker
// Uso: Creacion de Stickers de Imagenes y Videos
// Problema: El video no tiene resolucion automatica
//////////////////////////////////////////////////

export const handlerStickerCommand = new Handler(    
    "sticker",     // name 
    "all",         // role
    StickerCommand // run
    )


async function StickerCommand({msg,text,client,sock}){
  const PREFIX = client.config.defaults.prefix;
  const DisparadoresMenu = [`${PREFIX}s`, `${PREFIX}sticker`];
  
  console.log("handlerStickerComando")

    const normalize = (str) => str.trim().toLowerCase() 

    const isTrigger = (text, triggers) => {
        const normalizeText = normalize(text);
        return triggers.map(normalize).includes(normalizeText)
    }
  // triggers.some(t => t.toLowerCase() === text.toLowerCase().trim());
  
    if (!isTrigger(text, DisparadoresMenu)) {
    return;
    }
  
    let mediaMsg = await extractMedia(msg);
    
    console.log(msg);
    // ⚠️ Validación inicial
    console.log(mediaMsg);
    console.log(!mediaMsg);
    console.log(mediaMsg === null);
    if (!mediaMsg|| mediaMsg === null) {
      
      await client.send.reply(msg,'❌ Envía o responde a una imagen o video (mp4, mov, mkv, webm) con el comando *!sticker*')
      return;
    }


    console.log(msg)
    console.log(mediaMsg)

    console.log('🟡 Media detectada →', Object.keys(mediaMsg)[0])

    try {
      // 📥 Descargar el archivo multimedia
      const buffer = await downloadMediaMessage(
        { message: mediaMsg },
        'buffer',
        {},
        { logger: console }
      )

      if (!buffer || buffer.length < 1000) {
        throw new Error('⚠️ Buffer vacío o corrupto.')
      }

          // 📂 Rutas temporales
      const tempFolder = path.join(process.cwd(), "temp");
      const tempInput = path.join(tempFolder, "input.webp");
      const tempOutput = path.join(tempFolder, "sticker.webp");

    // Crear carpeta temp si no existe
      await fs.promises.mkdir(tempFolder, { recursive: true });

      // Limpiar archivos previos
      try { await fs.promises.unlink(tempInput); } catch {}
      try { await fs.promises.unlink(tempOutput); } catch {}
      // const tempInput = './src/temp_input'
      // const tempOutput = './src/sticker.webp'
      const isVideo =
        mediaMsg.videoMessage ||
        mediaMsg.mimetype?.includes('video') ||
        mediaMsg.mimetype?.includes('mp4') ||
        mediaMsg.mimetype?.includes('webm') ||
        mediaMsg.mimetype?.includes('mov') ||
        mediaMsg.mimetype?.includes('mkv')

      const inputPath = isVideo ? `${tempInput}.mp4` : `${tempInput}.jpg`
      fs.writeFileSync(inputPath, buffer)

      if (isVideo) {
        // 🎬 Conversión de video → sticker animado
        console.log('🎞️ Procesando video para sticker...')
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .inputFormat('mp4')
            .duration(6) // máximo 6 segundos
            .noAudio()
            .outputOptions([
              '-vf',
              'scale=512:512:force_original_aspect_ratio=decrease,fps=15,format=rgba',
              '-loop', '0'
            ])
            .output(tempOutput)
            .on('end', resolve)
            .on('error', reject)
            .run()
        })
      } else {
        // 🖼️ Imagen → Sticker





        
        console.log('🖼️ Procesando imagen para sticker...')
          //Utilizando el sharp
          // let safeBuffer = buffer;
          //     try {
          //         await sharp(buffer)
          //         .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          //         .toFormat("webp", { quality: 95, lossless: true })
          //         .toFile(tempOutput);
          //     } catch (err) {
          //         console.warn("⚠️ Sharp detectó problema. Reintentando con buffer crudo...");
          //         safeBuffer = Buffer.from(buffer);
          //         await sharp(safeBuffer)
          //         .resize(512, 512)
          //         .toFormat("webp")
          //         .toFile(tempOutput);
          //     }


          //  //Utilizando jimp
          //           try {
          //     // Import dinámico correcto en ESM

          //     // Leer la imagen desde el buffer
          //     const image = await Jimp.read(buffer);

          //     // Redimensionar a 512x512 manteniendo proporciones
          //     image.contain(512, 512, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

          //     // Guardar como WebP
          //     await image.writeAsync(tempOutput);

          // } catch (err) {
          //     console.warn("⚠️ Error al procesar con Jimp:", err);

          //     // Fallback simple
          //     const jimpModule = await import('jimp');
          //     const Jimp = jimpModule.default;

          //     const image = await Jimp.read(Buffer.from(buffer));
          //     image.resize(512, 512); // fallback sin proporción
          //     await image.writeAsync(tempOutput);
          // }

          
        // 🖼️ Imagen → sticker con @napi-rs/image
        // console.log('🖼️ Procesando imagen para sticker...');
        // try {
        //     const img = Image.decode(buffer);
        //     img.resize(512, 512);
        //     const webpBuffer = img.encode('webp');
        //     fs.writeFileSync(tempOutput, webpBuffer);
        // } catch (err) {
        //     console.error("⚠️ Error al procesar la imagen con @napi-rs/image:", err);
        //     await client.send.reply(msg, '⚠️ Error al procesar la imagen para sticker.');
        //     return;
        // }

        //uTILIZANDO FFMPEG

        



        try {




          let ext = 'jpg'; // default
          if (mediaMsg.mimetype) {
              if (mediaMsg.mimetype.includes('png')) ext = 'png';
              else if (mediaMsg.mimetype.includes('webp')) ext = 'webp';
              else if (mediaMsg.mimetype.includes('jpeg')) ext = 'jpg';
          }

          const tempInput = path.join(tempFolder, `input.${ext}`);
          fs.writeFileSync(tempInput, buffer);




     await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
            // quitar .inputFormat('png')
            .outputOptions([
                '-vf',
                'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
                '-vcodec', 'libwebp',
                '-lossless', '1',
                '-preset', 'default',
                '-loop', '0',
                '-an'
            ])
            .output(tempOutput)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
    console.log('✅ Sticker generado con FFmpeg');
} catch (err) {
    console.error('⚠️ Error al procesar la imagen con FFmpeg:', err);
    await client.send.reply(msg, '⚠️ Error al crear el sticker.');
}

          
              }

        // 📌 Confirmar que el archivo realmente existe
        if (!fs.existsSync(tempOutput)) {
          throw new Error("❌ No se generó el archivo sticker.webp");
        }
        
        console.log(tempOutput, fs.existsSync(tempOutput))

        // 📤 Enviar sticker al usuario
        await client.send.sticker(msg.key.remoteJid, fs.readFileSync(tempOutput) ,msg)

        console.log(`✅ Sticker enviado correctamente ${fs.readFileSync(tempOutput)}`)

        // 🧹 Limpiar archivos temporales (1 segundo después)
        setTimeout(() => {
          try {
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
            if (fs.existsSync(`${tempInput}.jpg`)) fs.unlinkSync(`${tempInput}.jpg`)
            if (fs.existsSync(`${tempInput}.mp4`)) fs.unlinkSync(`${tempInput}.mp4`)
            if (fs.existsSync(`${tempOutput}.jpg`)) fs.unlinkSync(`${tempOutput}.jpg`)
            if (fs.existsSync(`${tempOutput}.mp4`)) fs.unlinkSync(`${tempOutput}.mp4`)
            console.log('🧹 Archivos temporales eliminados')
          } catch (delErr) {
            console.warn('⚠️ Error al eliminar archivos temporales:', delErr)
          }
        }, 1000)
      } catch (err) {
        console.error('❌ Error al crear sticker:', err)
        await client.send.reply(msg,'⚠️ Error al crear el sticker. Asegúrate de que el video dure menos de 6 segundos o que la imagen sea válida.',
          msg
        )
    }
    }

async function  extractMedia(msg) {
  try{
    // 1️⃣ Ver una vez (viewOnceMessage o viewOnceMessageV2)
    if (msg.message.viewOnceMessage?.message) {
      const inner = msg.message.viewOnceMessage.message
      if (inner.imageMessage || inner.videoMessage) return inner
    }
  
    // 2️⃣ Imagen o video normal
    if (msg.message.imageMessage || msg.message.videoMessage) {
      return msg.message
    }
  
    // 3️⃣ Si responde a otro mensaje
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    if (quoted) {
      if (quoted.viewOnceMessage?.message) {
        const inner = quoted.viewOnceMessage.message
        if (inner.imageMessage || inner.videoMessage) return inner
      }
      if (quoted.imageMessage || quoted.videoMessage) return quoted
    }
  
    // 4️⃣ Si solo hay contexto (por ejemplo, reenviado)
    if (msg.message.messageContextInfo?.quotedMessage) {
      const quoted = msg.message.messageContextInfo.quotedMessage
      if (quoted.viewOnceMessage?.message) {
        const inner = quoted.viewOnceMessage.message
        if (inner.imageMessage || inner.videoMessage) return inner
      }
      if (quoted.imageMessage || quoted.videoMessage) return quoted
    }
  
    return null
  } catch (err){
    console.error('❌ Error al crear sticker:', err)
    await sock.sendMessage(sender, {
      text: '⚠️ Error el mensaje no llego.'
    })
  }























  
}
