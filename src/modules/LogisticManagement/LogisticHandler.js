import { handlerCreateProduct } from "./handlers/flows/handlerCreateProduct.js";
import { handlerSearchProduct } from "./handlers/flows/handlerSearchProduct.js";
import { handlerSellProduct } from "./handlers/flows/handlerSellProduct.js";
import { HandlerUpdatePriceProduct } from "./handlers/flows/handlerUpdatePriceProduct.js";
import { HandlerUpdateStockInventory } from "./handlers/flows/handlerUpdateStockInventory.js";
import { DatabaseConnectionManager } from "./services/dbManager.js";

export default class LogisticHandler {
    constructor(client) {
        this.client = client
        this.name = "inventory";
        this.role = "owner";
        this.pool = null;
        this.session = new Map();
        this.dbManager =  DatabaseConnectionManager;
        this.setSession = this.setSession.bind(this);
        this.getSession = this.getSession.bind(this);

        this.ENUM_STEP = Object.freeze({
            WAIT_PROCESS: 'WAIT_PROCESS',
            CONFIRM: 'CONFIRM',
            DONE: 'DONE',
            CANCELLED: 'CANCELLED'
            });
        this.triggers = {
                    create: {
                        lg: "Sirve para crear el producto",
                        example: "!crear {nombre:Producto_A,descripcion:Nuevo Producto,marca:gloria,proveedor:Representante_A,categoria:Bebidas,precio:15.0}",
                        cmd: ["crear"]
                    },
                    add:{
                        lg: "Sirve para agregar stock al producto",
                        example: "!agregar PROD-AB2C2D 2",
                        cmd: ["agregar"],
                    },
                    delete:{
                        lg: "Sirve para eliminar el producto",
                        example: "!eliminar PROD-AB2C2D",
                        cmd: ["eliminar"]
                    },
                    update:{
                        lg: "Sirve para actualizar el stock del producto",
                        example:"!actualizar",
                        cmd: ["actualizar"]
                    },
                    sell:{
                        lg: "Sirve para vender uno o mas productos",
                        example:"!vender\n codigo:PROD-AB2C2D,cantidad:2 | codigo:PROD-AD5C2D,cantidad:3 \n",
                        cmd: ["vender"],
                    }
                }

        // this.inventoryService = new InventoryService();
    }
    
    // getConnection(){
    //     const Conexion = client.db.postgres; 
    //     const pool = Conexion.getInstance();
    //     // this.pool = pool;
    //     return pool;
    // }

    setSession({from,action="",data={}}){
        switch (action) {
            // case "cancelled": 
            case "WAIT_PROCESS":
                if (!this.session.get(from)) {
                    this.session.set(from,{step:this.ENUM_STEP.WAIT_PROCESS})
                    console.log(`usuario habilitado en el session:${this.session.get(from)}`) // existe
                    return true;        
                }
                break;
            case "CONFIRMED":
                this.session.set(from,{step:this.ENUM_STEP.CONFIRM,data:data})
                console.log(`usuario habilitado en el session:${this.session.get(from)}`) // existe
                return false;        
            case "SUCCESS":
                this.session.delete(from)
                console.log(`usuario habilitado en el session:${this.session.get(from)}`) // existe
                return false;        
            
            case "CANCELLED": 
                this.session.delete(from);
                console.log(`usuario con la venta deshabilitada en el session:${this.session.get(from)}`) // existe
                return false;

            default:
                // if (!this.session.get(from)) {
                //     this.session.set(from,{step:this.ENUM_STEP.WAIT_PROCESS})
                //     console.log(`usuario habilitado en el session:${this.session.get(from)}`) // existe
                //     return true;        
                // }
                break;
            }
        return false;

    }

    // setSessionConfirmed({from}){
    //     if (this.session.get(from)) {
    //         this.
    //     }
    // }


    async getSession(){
        return this.session;
    }
    // data_bd:{
    //     getConnection,
    // }

    // data_Session:{
    //     getSession,
    //     setSession,
    //     updateSession,
    //     deleteSession
    // }


    async help(){
        let texto = "🔧*_Comandos de logistica*\n\n";

        for (const key in this.triggers) {
            const { lg, cmd ,example } = this.triggers[key];
            texto += `• *${key}*\n`;
            texto += `  ├ Alias: ${cmd.join(", ")}\n`;
            texto += `  └ Uso: ${lg}\n`;
            texto += `  └ Ejemplo: ${example}\n\n`
        }

        return texto;
    }

    async run({ msg, text }) {
        const {action, cmd} = ActionParser.detect(text,this.triggers);
        const words = text.toUpperCase().split(" "); 
        const codigo = words[1]; 
        const from = msg.key.participant || msg.key.remoteJid;;
        console.log(action)
        //Valida si el usuario existe en el session
        // 4 sesions para cada uno

//sesion pal sell en ves de guardar ids
//{sellProduct:{idUser = } }
        
        //Obtener la conexion dbManager
        // const pool =this.dbManager.getConnection(client);
        // console.log(pool)
        // if (!pool) {
        //     console.log("No hay una conexion a la bd no se pueden ejecutar estos comandos")
        // } 

        // context = {
        //     msg,
        //     client,
        //     cmd,
        //     pool,
        // }


        //Verificar si la session esta en uso
        console.log(`Verificando si session esta en uso:${this.session.get(from)}`)
        //Uso de la session
        //Si el usuario existe en el session y si seseesion tiene el step 
        if (this.session.get(from)) {
            return handlerSellProduct.run({
                msg,
                client,
                cmd:text,
                setSession:this.setSession,
                getSession:this.getSession,
                // getConnection: this.getConnection
            });
            // existe
        }

        switch (action) {
            case "add":
                return this.addProduct(msg, text);
            case "delete":
                return this.deleteProduct(msg, codigo);

            case "update_stock":
                return HandlerUpdateStockInventory(msg,client)
s
            case "update_price":
                return HandlerUpdatePriceProduct.run(msg, client);
            case "search":
                return handlerSearchProduct.run({msg,client,cmd});

            case "create":
                return handlerCreateProduct.run({msg,client,cmd})
            case "sell":
                return handlerSellProduct.run({
                    msg,
                    client,
                    cmd,
                    setSession:this.setSession,
                    getSession:this.getSession
                });

            default:
                console.log("comandos Logistica no usados")

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
        const cleanText = text.trim();
        const words = cleanText.split(/\s+/);
        const command = words[0];              // say
        const cmd = words.slice(1).join(" "); // hola como estas

        // Recorre cada acción y sus triggers
        for (const action in triggers) {
            const triggerData = triggers[action];
     // seguridad extra
            if (!triggerData?.cmd || !Array.isArray(triggerData.cmd)) continue;

            const triggerList = triggerData.cmd.map(t => t.toLowerCase());

            if (triggerList.includes(command)) {
                console.log(`Validando funcionalidades.. \n ${action} + ${cmd}`)
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