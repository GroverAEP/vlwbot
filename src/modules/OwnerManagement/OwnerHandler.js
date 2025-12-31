import { banUsers } from "./handlers/flows/handlerBan.js";
import { handlerShowDeleteMessage, ShowDeleteMessage } from "./handlers/flows/handlerShowDeleteMessage.js";

export default class OwnerHandler {
    constructor(client) {
        this.client = client
        this.name = "OwnerHandler";
        this.role = "owner";
        this.triggers = {
                    banUsers:{
                        lg: "Banear el uso del bot a usuarios especificos",
                        cmd : ["ban","banUsers"],
                        example: "!ban @mention"
                    },
                    ShowDeleteMessage:{
                        lg: "Ver mensajes eliminados en un grupo",
                        cmd: ["ShowDelMsg"],
                        example: "!ShowDelMsg"
                    },
                    // update:["update",actualizar],
                    // sell:["sell","vender"]
                }

        // this.inventoryService = new InventoryService();
    }
    async help(){
        let texto = "👑 *_Comandos de owners_* \n\n";

        for (const key in this.triggers) {
            const { lg, cmd, example } = this.triggers[key];
            texto += `• *${key}*\n`;
            texto += `  ├ Alias: ${cmd.join(", ")}\n`;
            texto += `  └ Uso: ${lg}\n`;
            texto += `  └ Ejemplo: ${example}\n\n`

        }

        return texto; 
    }

    async run({ msg, text }) {
        const action = ActionParser.detect(text);
        const words = text.toUpperCase().split(" "); 
        const cmd = words[1]; 

        switch (action) {
            case "banUsers":
                return banUsers(msg, this.client, cmd);

            case "showDeleteMessage":
                return handlerShowDeleteMessage(msg,this.client, cmd);
            
            
            // case "upda":
            //     return this.updateProduct(msg, codigo);

            // case "list":
            //     return this.listProducts(msg);

            default:
                console.log("Comandos Owners no usados.")
                // return this.reply(msg, "⚠️ Acción no reconocida en INVENTARIO.");
        }
    }

    async addProduct(msg, text) {
        // ejemplo: inventory add CocaCola 3 5.50
        const parts = text.split(" ");


        // quitar el comando
        const args = words.slice(1);

        // extraer datos
        const [name, mark, category, stockStr, priceStr] = args;

        const stock = Number(stockStr);
        const price = Number(priceStr);
        const date = new Date();       // objeto Date
        const timestamp = Date.now();  // número de milisegundos desde 1970
        const sku = (
            name.slice(0,3) +
            mark.slice(0,3) +
            category.slice(0,3)
        ).toUpperCase()

        // await this.inventoryService.add({ name, stock, price });
        const product = {
            sku,
            name,
            mark,
            category,
            stock,
            price,
            timestamp,
        }

        console.log(`Producto agregado con exito, SKU del producto: ${sku}`)
        this.client.db.local.add("products",product)
        // this.client.db.local.save("products")

        return this.reply(msg, "📦 Producto agregado.");
    }

    async deleteProduct(msg,sku) {
        await this.client.bd.local.remove("products.json", item => item.sku === sku);

        return this.reply(msg,"Producto eliminado");
    }

    async updateProduct(msg,sku) {
        await this.client.bd.local.update("products")

        return this.reply(msg,"Producto actualizado")
    }

    async listProducts(msg) {
        await this.client.bd.local.local("products")
    }
}


export  class ActionParser {
    static detect(text, triggers) {
         if (!text || typeof text !== "string") return null;

        const cleanText = text.toLowerCase().trim();

        // ✅ Solo toma la primera palabra como comando
        const command = cleanText.split(/\s+/)[0];

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