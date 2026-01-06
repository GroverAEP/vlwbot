import { handlerSaludo } from "./handlers/flows/handlerSaludo.js";
import { handlerActions } from "./handlers/flows/handlerActions.js";

const Mensaje = Object.freeze({
  SALUDO: "saludo",
  DESPEDIDA: "despedida"
});


export default class ReserveHandler {
    constructor(client) {
        this.client = client
        this.name = "reserve";
        this.session = new Map();
        this.ENUM_STEP = Object.freeze({
            GREETING: 'GREETING',
            MENU: 'MENU',
            INFORMATION: 'INFORMATION',
            OFFER: 'OFFER',
            UBICATION: 'UBICATION'
            });
    }
    setSession(from,action,data = {}){
        switch (action) {
            case this.ENUM_STEP.GREETING:
                
                break;
        
            default:
                break;
        }
    }

    async run({text}) {
        console.log(this.client.msg);
        console.log("Ejecutando las opciones de los botones")
        return await handlerSaludo.run({client,text}).then(
            await handlerActions.run({client,text})
        );
    }

}


// export class ActionParser {
//     static detect(text, triggers) {
//         if (!text || typeof text !== "string") {
//             return { action: null, phrase: null };
//         }

//         const cleanText = text.trim();
//         const words = cleanText.split(/\s+/);
//         const command = words[0];              // say
//         const cmd = words.slice(1).join(" "); // hola como estas

//         for (const action in triggers) {
//             const triggerData = triggers[action];

//             // seguridad extra
//             if (!triggerData?.cmd || !Array.isArray(triggerData.cmd)) continue;

//             const triggerList = triggerData.cmd.map(t => t.toLowerCase());

//             if (triggerList.includes(command)) {
//                 return {
//                     action, // ej: "sayed"
//                     cmd     // ej: "hola como estas"
//                 };
//             }
//         }

//         console.log(`${command} no coincide con los triggers`);
//         return { action: null, cmd: null };
//     }
// }