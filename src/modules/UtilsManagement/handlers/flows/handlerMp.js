import { deleteFile } from "../../../../infrastructure/utils/deleteFile.js";
import { downloadYoutubeMp3 } from "../../services/Youtube/getMp3Url.js";

export const handlerMp3= {
    name: "mp3",
    role: "all",
    run: mp3,
};

async function mp3({msg,client,cmd}) {
  try {
         //Validacion de errors| caso query no exista
         console.log(cmd)
        if (!cmd) {
            await client.send.reply(msg, "❌ Debes escribir un enlace o nombre de canción.\n Utiliza: !mp3 {url - nombre}");
            return; // ← Esto detiene TODO lo que viene después
        }   
        
        
        // Si query existe ejecuta todo esto.
        await client.send.reply(msg, "📥 Descargando Audio, espera...");
        try {
            const filePath = await downloadYoutubeMp3(cmd);
            // await client.send.audio(sender,filePath,msg);
            

                await client.send.audio(msg, filePath,{quoted: msg});

            setTimeout(() => deleteFile(filePath), 5000);
        } catch (err) {
            await client.send.reply(msg, `❌ Error al descargar el audio. ${err}\n - 
                Utiliza: !mp3 {url - nombre}`);
            //elimina la carpeta de auth y vuelve a ejecutra el npm run
            console.error(err);
        }

  } catch (error) {
    
  }  
} 