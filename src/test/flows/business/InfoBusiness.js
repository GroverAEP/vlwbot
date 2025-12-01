
// const act_sell = ["sell", "vender"]



// import Sender from "../../../class/sender.js";  

// // class Business extends Sender  {
// //     constructor(parameters) {
// //     self.menu =    "", 
// //     self.info =  ""

// // }

// //     addInfo(text){
// //         self.menu = text
// //        await t(msg, )
// //         // await sock.sendMessage()
// //     }

// // }




// Clase base opcional para centralizar métodos comunes
class BaseHandler {
    constructor(client) {
        this.client = client;
    }

    async reply(msg, text) {
        return this.client.send.reply(msg, text);
    }

    async addInfo(text){
        const info = {
        }
        //Con este metodo utilizamos el servicio para gregarlo al BD
        this.client.db.local.save("business",info)
    }
}

// Clase principal del handler
export class HandlerInfoBusiness extends BaseHandler {
    constructor(client) {
        super(client);
        this.name = "ban";
        this.role = "owner";
        this.triggers = {
            add:["add","agregar"],
            delete:["delete","eliminar"],
            update:["update",actualizar],
            sell:["sell","vender"]
        }
    }

    async run({ msg, text, client }) {
        //obtiene 
        const args = text.toLowerCase().split(" ");
        const action = args[1]; 

        // Detecta la acción indicada por el usuario
        if (this.triggers.add.includes(action))
            return this.addInfo(msg, "Agregando...");

        if (this.triggers.delete.includes(action))
            return this.deleteInfo(msg);

        if (this.triggers.update.includes(action))
            return this.updateInfo(msg);

        if (this.triggers.sell.includes(action))
            return this.sellInfo(msg);

        return this.client.send.reply(msg, "Acción no reconocida.");
        // Aquí la lógica principal del comando
        // this.addInfo(...)
        // this.deleteInfo(...)
    }

    async addInfo(msg, text) {
        return this.reply(msg, text);
    }

    async deleteInfo(msg) {
        // lógica de eliminación
    }

    async update(params) {
        // lógica de actualización
    }

    async getInfo(params) {
        // lógica para obtener info
    }
}