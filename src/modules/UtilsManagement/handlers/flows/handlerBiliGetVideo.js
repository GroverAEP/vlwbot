import { downloadBiliVideo } from "../../../../infrastructure/services/BilibiliServices/getVideo.js";

export const handlerBiliGetVideo= {
    name: "mp3",
    role: "all",
    run: biliGetVideo,
};

export async function biliGetVideo({msg,client,cmd}) {
    try {
        //Validacion de errors| caso query no exista
        if (!cmd) return await client.send.reply(msg, "❌ Debes escribir un enlace o nombre de video.");
        
           await client.send.reply(msg, "📥 Descargando video, espera...");
           const filePath = await downloadBiliVideo(cmd);
           await client.send.video(msg,{ url: filePath } , {caption: `Aquí está tu video de BiliBili 🎬`} );
           // setTimeout(() => deleteFile(filePath), 5000);
          
    } catch (error) {
        
        await client.send.reply(msg, `❌ Error al descargar el video de bili bili. ${error}`);
        console.error(error);
            
    }
}