
export default class InventoryHandler {
    constructor(client) {
        super(client);
        this.name = "inventory";
        this.role = "admin";
        this.triggers = {
                    add:["add","agregar"],
                    delete:["delete","eliminar"],
                    update:["update",actualizar],
                    sell:["sell","vender"]
                }

        // this.inventoryService = new InventoryService();
    }

    async run({ msg, text }) {
        const action = ActionParser.detect(text);
        const words = text.toUpperCase().split(" "); 
        const codigo = words[1]; 

        switch (action) {
            case "add":
                return this.addProduct(msg, text);

            case "delete":
                return this.deleteProduct(msg, codigo);

            case "update":
                return this.updateProduct(msg, codigo);

            case "list":
                return this.listProducts(msg);

            default:
                return this.reply(msg, "⚠️ Acción no reconocida en INVENTARIO.");
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