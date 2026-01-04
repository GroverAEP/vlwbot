import { handlerYtGetVIdeo } from "./handlers/flows/handlerYtGetVideos.js";
import { handlerMp3 } from "./handlers/flows/handlerMp.js";
import { handlerSearchPokemon } from "./handlers/flows/handlerPokemonSearch.js";
import { handlerStickerCommand } from "./handlers/flows/handlerStickerCommand.js";
import { handlerBiliGetVideo } from "./handlers/flows/handlerBiliGetVideo.js";
import { handlerSay } from "./handlers/flows/handlerSay.js";
import { handlerBotones } from "./handlers/flows/handlerBotones.js";

export default class UtilsHandler {
    constructor(client) {
        this.client = client
        this.name = "utils";
        this.role = "all";
        this.triggers = {
        //             sticker:{
        //                 lg: "Sirve para hacer stickers normales y animados",
        //                 cmd: ["s","sticker"],
        //                 example: "!s"
        //             },
        //             pokemon: {
        //                 lg: "Sirve para obtener un pokemon",
        //                 cmd: ["p","pokemon"],
        //                 example: "!p nombre_pokemon"
        //             },
        //             mp3:{
        //                 lg: "Sirve para obtener musicas de youtube",
        //                 cmd: ["mp3"],
        //                 example:"!mp3 url"
        //             },
        //             mp4:{
        //                 lg: 'Sirver para obtener videos de YT, Plataformas permitidas: Youtube facebook tiktok instagram x',
        //                 cmd: ["mp4"],
        //                 example:"!mp4 url"
        //             },
        //             // x:{
        //             //     lg: "Sirver para obtener videos de YT",
        //             //     cmd: ["mp4_x"],
        //             //     example:"!mp4_x url"
        //             // },
        //             // bili:{
        //             //     lg: "Sirve para obtener videos de bilibili",
        //             //     cmd: ["mp4_bili"],
        //             //     example: "!mp4_bili url"
        //             // },
        //             sayed:{
        //                 lg:"Sirve Para hablar",
        //                 cmd: ["say"],
        //                 example: "!say"
        //             },
        //             botones:{
        //                 lg:"Sirve Para hablar",
        //                 cmd: ["botones"],
        //                 example: "!botones"
        //             }

                    // test:["update","actualizar"],
                }

        // this.inventoryService = new InventoryService();
    }

    async test(){
        return "Utils funcionando"
    }
    
    async help(){
        let texto = "🔧*_Comandos de Utils_*\n\n";

        for (const key in this.triggers) {
            const { lg, cmd ,example } = this.triggers[key];
            texto += `• *${key}*\n`;
            texto += `  ├ Alias: ${cmd.join(", ")}\n`;
            texto += `  └ Uso: ${lg}\n`;
            texto += `  └ Ejemplo: ${example}\n\n`
        }

        return texto;
    }

    async can({}){

    }

    async run({msg, text}) {
        // console.log(`utlisHandler: ${text}`)
        const { action,  cmd } = ActionParser.detect(text,this.triggers);
        const words = text.toLowerCase().split(" "); 
        // const cmd = words[1]; 
        const args = text.split(" ");
        const sender = msg.key.participant || msg.key.remoteJid;
        
        const PREFIX = client.config.defaults.prefix;
        // const DisparadoresMenu = [`${PREFIX}s`, `${PREFIX}sticker`];
        console.log(`${words}`)
        console.log(`ejecutando el metodo run: ${action} -  ${cmd}`)
        console.log(`${action}`)
        
        try {
            
            if (action === null) return;
            switch (action) {
                // case "bili":
                //     return handlerBiliGetVideo.run({msg,client,cmd});
                // case "sayed":
                //     return handlerSay.run({msg,client,cmd});
                // case "botones":
                //     return handlerBotones.run({msg,client,cmd});
                // //     await client.sock.sendMessage(jid, {
                // text: '¿Qué deseas hacer?',
                // footer: 'Mi Bot',
                // title: 'Menú',
                // buttonText: 'Seleccionar',
                // sections: [
                //     {
                //     title: 'Opciones',
                //     rows: [
                //         { title: 'Confirmar venta', rowId: 'confirm' },
                //         { title: 'Cancelar', rowId: 'cancel' }
                //     ]
                //     }
                // ]
                // });
                default:
                    console.log("comandos utils no usados")
                    // return this.reply(msg, "⚠️ Acción no reconocida en INVENTARIO.");

                }
        } catch (error) {
            console.log(`Un error ocurrio en utilsHandler: ${error}`)
        }
    }

}


export class ActionParser {
    static detect(text, triggers) {
        if (!text || typeof text !== "string") {
            return { action: null, phrase: null };
        }

        const cleanText = text.trim();
        const words = cleanText.split(/\s+/);
        const command = words[0];              // say
        const cmd = words.slice(1).join(" "); // hola como estas

        for (const action in triggers) {
            const triggerData = triggers[action];

            // seguridad extra
            if (!triggerData?.cmd || !Array.isArray(triggerData.cmd)) continue;

            const triggerList = triggerData.cmd.map(t => t.toLowerCase());

            if (triggerList.includes(command)) {
                return {
                    action, // ej: "sayed"
                    cmd     // ej: "hola como estas"
                };
            }
        }

        console.log(`${command} no coincide con los triggers`);
        return { action: null, cmd: null };
    }
}