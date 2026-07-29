import { deleteFile } from "../../../../infrastructure/utils/deleteFile.js";
import { downloadYoutubeVideo } from "../../services/Youtube/getVideoUrl.js";
import { SuccessMp4GetVideo } from "../messages/SuccessMessage.js";


export const handlerYtGetVIdeo= {
    name: "mp3",
    role: "all",
    run: ytGetVideo,
};

async function ytGetVideo({msg,client,cmd}) {

        // Comando !yt
            // const query = text.slice(`${prefix}yt `.length).trim();
            
            if (!cmd) {
                await client.send.reply(msg, "❌ Debes escribir un enlace o nombre de canción. \n site:youtube - Utiliza: !yt {url} ");
              return; // ← Esto detiene TODO lo que viene después
            }   

            // if (parts.length === 1) {
            //     await client.send.reply(msg, "Comando no disponible");
            // } else {
            //     const url = parts[1];
            try {
              await client.send.reply(msg, "📥 Descargando el video, espera...");
              
              
              const {metadata,finalPath,peso} = await downloadYoutubeVideo(cmd);
              
              
              const fileSizeMB = parseFloat(peso) || metadata.estimated_size_mb || 100; // fallback
              // console.log(a.finalPath);
              const successMessage = new SuccessMp4GetVideo(metadata.platform);
              const caption = successMessage.generateMessage(metadata, peso);
              
              if (fileSizeMB > 200) {  // Ajusta según tu experiencia (100-128 MB suele ser el límite actual para video normal)
                console.log(`Video grande (${fileSizeMB} MB) → enviando directamente como documento`);

                await client.send.document(msg,{
                    url: finalPath
                  },{
                    mimetype: 'video/mp4',
                    fileName: `${metadata.title.substring(0, 60).replace(/[^\w\s-]/g, '') || "video"}.mp4`,
                    caption: caption,
                    quoted: msg
                  });

            //     await client.sock.sendMessage(msg.key.remoteJid, {
            //     document: { url: finalPath },
            //     mimetype: 'video/mp4',
            //     fileName: `${metadata.title.substring(0, 60).replace(/[^\w\s-]/g, '') || "video"}.mp4`,
            //     caption: caption
            // }, { quoted: msg });
                  setTimeout(() => deleteFile(finalPath), 5000);

                  console.log("Enviado como documento por tamaño estimado");
              } else{

                  console.log(`Url del video: ${finalPath}`)
                  await client.send.video(msg,{ url: finalPath }, 
                    {caption:
                      caption});
                  // await multimedia.sendVideo(sender, filePath, "Un video para aprender PokeApi");
                  // Limpieza si quieres
                  setTimeout(() => deleteFile(finalPath), 5000);
                  return;

              }
              
            } catch (error) {
            console.log("Error capturado:", error);

    // Verificación segura
    //const errorMessage = error?.message || String(error || "");
    //console.log(errorMessage);
    //if (errorMessage.includes("BAD_FILE_SIZE") || errorMessage.includes("File size too large")) {
    //    console.warn("Video demasiado grande para envío como video → reenviando como documento");

   //     try {
    //        await client.send.document(msg, { url: finalPath }, {
    //            caption: caption + "\n\n📄 Enviado como documento (tamaño grande)",
    //            mimetype: 'video/mp4'
   //         });

    //        console.log("Video enviado exitosamente como documento");
    //        setTimeout(() => deleteFile(videoPath), 5000);

    //    } catch (docError) {
    //        console.error("También falló como documento:", docError);
    //        await client.send.reply(msg, "❌ El video es demasiado grande para enviarse en WhatsApp (>2 GB aprox.).");
    //        await deleteFile(videoPath);
    //    }

   // } else {
    //    console.error("Error al enviar video:", error);
    //    await client.send.reply(msg, "❌ Error al enviar el video. Inténtalo más tarde.");
    //    await deleteFile(videoPath);
    //}
}
        
} 