import { downloadBiliVideo } from "../../../../infrastructure/services/BilibiliServices/getVideo.js";
import { SaludoMSG } from "../messages/SuccessMessage.js";

export const handlerSaludo= {
    name: "mp3",       // Nombre del handler
    role: "all",       // Role del handler
    run: saludo, // Nombre de la funcion 
};

 async function saludo({client,text}) {
    try {
        console.log("Saludo");
        await client.send.text(client.msg,SaludoMSG.generateMessage());
    } catch (error) {
                
    }
}