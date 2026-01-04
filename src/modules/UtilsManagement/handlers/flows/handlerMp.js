import { deleteFile } from "../../../../infrastructure/utils/deleteFile.js";
import { downloadYoutubeMp3 } from "../../services/Youtube/getMp3Url.js";
import { SuccessMp3GetAudio } from "../messages/SuccessMessage.js";

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
            // console.log("Entrando al metodo downloadYoutube")
            const {metadata,finalPath,peso} = await downloadYoutubeMp3(cmd);
            // await client.send.audio(sender,filePath,msg);
            
            const successMessage = new SuccessMp3GetAudio(metadata.platform);

            const msgGenerateMessage = successMessage.generateMessage(metadata,peso);

            const infoaudio = await client.send.reply(msg, msgGenerateMessage);
            // .then(async ()=>{
                // });
            await client.send.audio(infoaudio, finalPath,{quoted: infoaudio}).then(async()=>{
                await setTimeout(() => deleteFile(finalPath), 5000);
            });
                
        } catch (err) {
            await client.send.reply(msg, `❌ Error al descargar el audio. ${err}\n - 
                Utiliza: !mp3 {url - nombre}`);
            console.error(err);
        }

  } catch (error) {
    
  }  
} 