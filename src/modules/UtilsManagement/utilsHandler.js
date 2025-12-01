import { handlerPokemonApi } from "./handlers/flows/handlerPokemonSearch";
import { handlerStickerCommand } from "./handlers/flows/handlerStickerCommand";

export default class InventoryHandler {
    constructor(client) {
        super(client);
        this.name = "inventory";
        this.role = "all";
        this.triggers = {
                    sticker:["s","sticker"],
                    pokemon:["p","pokemon"],
                    // test:["update","actualizar"],
                }

        // this.inventoryService = new InventoryService();
    }
    async can({}){

    }

    async run({ msg, text }) {
        const action = ActionParser.detect(text);
        const words = text.toUpperCase().split(" "); 
        const codigo = words[1]; 

        const PREFIX = client.config.defaults.prefix;
        // const DisparadoresMenu = [`${PREFIX}s`, `${PREFIX}sticker`];

        switch (action) {
            case "s":
                return handlerStickerCommand.run(msg, client);

            case "p":
                return handlerPokemonApi.run(msg, client);

            default:
                // return this.reply(msg, "⚠️ Acción no reconocida en INVENTARIO.");
        }
    }

}


export  class ActionParser {
    static detect(text, triggers) {
        const words = text.toLowerCase().split(" ");
        // Recorre cada acción y sus triggers
        for (const action in triggers) {
            const triggerList = triggers[action];

            for (const word of words) {
                if (triggerList.includes(word)) {
                    return action; // add, delete, update, sell, etc.
                }
            }
        }

        return null; // nada coincide
    }
}