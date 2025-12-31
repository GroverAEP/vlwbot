import { deleteFile } from "../../../../infrastructure/utils/deleteFile.js";
import { downloadYoutubeVideo } from "../../services/Youtube/getVideoUrl.js";


export const handlerYtGetVIdeo= {
    name: "mp3",
    role: "all",
    run: ytGetVideo,
};

async function ytGetVideo({msg,client,cmd}) {
  try {
      
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
                // console.log(a.finalPath);
              
                console.log(`Url del video: ${finalPath}`)
                await client.send.video(msg,{ url: finalPath }, 
                  {caption: `*🎥 Video de ${metadata.platform}*\n\n` +
           `📌 *Título*: ${metadata.title || "Sin título"}\n` +
           `👀 *Vistas*: ${metadata.views ? Number(metadata.views).toLocaleString() : "N/A"}\n` +
           `⏱️ *Duración*: ${metadata.duration}\n` +
           `❤️ *Likes*: ${metadata.like_count}\n` +
           `💬 *Comentarios*: ${metadata.comment_count}\n` +
           `🔁 *Compartido*: ${metadata.repost_count}\n\n` +
           `📁 *Peso*: ${peso || "Desconocido"}\n\n` +
           `Descargado con éxito ✅`} );
                // await multimedia.sendVideo(sender, filePath, "Un video para aprender PokeApi");
                // Limpieza si quieres
                setTimeout(() => deleteFile(finalPath), 5000);
                return;
            } catch (err) {
                await client.send.reply(msg, `❌ Error al descargar el video de Youtube.${err}`);
                console.error(err);
                return;
            }
        

  } catch (error) {
    
  }  
} 