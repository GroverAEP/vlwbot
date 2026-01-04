import fs from "fs-extra";

export class Users {
    constructor(dbPath) {
        this.dbPath = `${dbPath}/users.json`;
        this.users = []; // Inicializamos vacío
        
    }

    async load() {
        if (!fs.existsSync(this.dbPath)) {
            await fs.writeJson(this.dbPath, { users: [] }, { spaces: 2 });
        }
        const data = await fs.readJson(this.dbPath);
        this.users = data.users || [];
        return this.users;
    }

    async save() {
        await fs.writeJson(this.dbPath, { users: this.users }, { spaces: 2 });
    }

    async add_by_private({id,name}) {
        await this.load();
        
        const user = {
                id: id,
                name: name,
                private_chat: null,
                group_chats: [],
                status: "allow",
                role: "client"
        }

        // Evitar duplicados por id
        if (!this.users.find(u => u.id === user.id)) {
            this.users.push(user);
            await this.save();
        }
    }

    // async add_by_group({id,name}) {
    //     await this.load();
        
    //     const user = {
    //             id: id,
    //             name: name,
    //             private_chat: null,
    //             group_chats: [],
    //             status: "allow",
    //             role: "user"
    //     }
        

    //     // Evitar duplicados por id
    //     if (!this.users.find(u => u.id === user.id)) {
    //         this.users.push(user);
    //         await this.save();
    //     }
    // }

async add_group_chats({userId, groupJid}) {
    await this.load();
    const user = this.users.find(u => u.id === userId);
    
    if (user) {
        // Si group_chats no existe o no es array, inicialízalo
        if (!Array.isArray(user.group_chats)) {
            user.group_chats = [];
        }

        // Evita duplicados
        if (!user.group_chats.includes(groupJid)) {
            user.group_chats.push(groupJid);
            await this.save();
            console.log(`Grupo ${groupJid} agregado a ${userId}`);
            return true;
        } else {
            console.log(`El grupo ${groupJid} ya estaba en la lista`);
            return false; // Ya existía
        }
    }
    
    console.log(`Usuario ${userId} no encontrado`);
    return false; // Usuario no encontrado
}





    async remove(userId) {
        await this.load();
        this.users = this.users.filter(u => u.id !== userId);
        await this.save();
    }

    async update(userId, key, value) {
        await this.load();
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user[key] = value; // Actualiza la propiedad indicada
            await this.save();
            return true; // Éxito
        }
        return false; // Usuario no encontrado
    }

   // --- Nuevo método equals ---
   async equals(userId, key, value) {
        await this.load();

        const user = this.users.find(u => u.id === userId);
        if (!user) return false;
        return user[key] === value;
    }


    // --- Método corregido y recomendado ---
    async exists(userId) {
        await this.load();
        return this.users.some(u => u.id === userId);
    }

    // Si quieres uno síncrono (solo si ya cargaste antes con load())
    isUserSync(userId) {
        return this.users.some(u => u.id === userId);
    }

    async get(userId) {
        await this.load();
        return this.users.find(u => u.id === userId);
    }

    async all() {
        await this.load();
        return this.users;
    }
}
