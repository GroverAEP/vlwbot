import { downloadBiliVideo } from "../../../../infrastructure/services/BilibiliServices/getVideo.js";

export const handlerBiliGetVideo= {
    name: "mp3",       // Nombre del handler
    role: "all",       // Role del handler
    run: biliGetVideo, // Nombre de la funcion 
};

export async function TestFunction({msg,client,cmd}) {
    try {

    } catch (error) {
                
    }
}