import { group } from "console";
import fs from "fs-extra";
import path from 'path';

export class Group {
    constructor(dbPath) {
        this.dbPath = path.join(dbPath, 'groups.json');
        this.groups = []
    }

    async load() {
        console.log("chats manager")
        console.log(this.dbPath)
        if (!fs.existsSync(this.dbPath)) {
            await fs.writeJson(this.dbPath, { groups: [] }, { spaces: 2 });
        }
        const data = await fs.readJson(this.dbPath);
        this.groups = data.groups || [];
        return this.groups;
    }

    async save() {
        await fs.writeJson(this.dbPath, { groups: this.groups }, { spaces: 2 });
    }

    
    

    async add({data}) {
        await this.load();
        
        
        const {id, name , admins, participants,owner}= data;



        const group = {
            id: id,
            name: name,
            status: "",
            settings: {
                welcomeEnabled: false,                 // Enviar mensaje de bienvenida
                welcomeMessage: "¡Bienvenido @{user} al grupo {subject}! 👋", // Mensaje personalizado
                goodbyeEnabled: false,                 // Mensaje de despedida
                goodbyeMessage: "¡@{user} ha abandonado el grupo! 👋",
                showDelete: false,
                antiLink: false,
                antiSpam: false,
                maxWarnings: 3,
                autoMute: false,
                //   muteOnStart: false,                   // Mutear grupo al iniciar el bot
                onlyAdmins: false,                     // Solo admins pueden escribir (modo lento)
                modeNsfw: false
                },
            admins: admins ? admins : [],
            partipants: participants ? participants : [],
            owner: owner ? owner : "default",
            creation: Math.floor(Date.now() / 1000),
            participantsCount: participants.length || 0,
            lastActivity: Math.floor(Date.now() / 1000),
            warnings: {},
            bannedUsers: [],
            isCommunity: false,
            linkedGroupJid: null,
            isAnnounce: false
        };
                
        // Evitar duplicados por id
        if (!this.groups.find(u => u.id === group.id)) {
            this.groups.push(group);
            await this.save();
        }
    }

    async add_user_group({}){
        await this.load();
    
    // 1. Buscar el grupo por ID
    const group = this.groups.find(g => g.id === groupId);
    
    if (!group) {
        console.log(`Grupo ${groupId} no encontrado`);
        return false; // Grupo no existe
    }

    // 2. Normalizar participant (asegurar que tenga todos los campos necesarios)
    const normalizedParticipant = {
        id: participant.id,
        admin: participant.admin || null,
        isAdmin: participant.isAdmin || (participant.admin === "admin" || participant.admin === "superadmin"),
        isSuperAdmin: participant.isSuperAdmin || (participant.admin === "superadmin"),
        name: participant.name || "",
        joinedAt: participant.joinedAt || Math.floor(Date.now() / 1000),
        lastSeen: participant.lastSeen || null,
        warnings: participant.warnings || 0,
        isBanned: participant.isBanned || false,
        banUntil: participant.banUntil || null,
        isMuted: participant.isMuted || false,
        muteUntil: participant.muteUntil || null,
        isRestricted: participant.isRestricted || false,
        invitedBy: participant.invitedBy || null
    };

    // 3. Inicializar participants si no existe
    if (!Array.isArray(group.participants)) {
        group.participants = [];
    }

    // 4. Buscar si el participante YA existe en el grupo
    const existingParticipantIndex = group.participants.findIndex(p => p.id === normalizedParticipant.id);
    
    if (existingParticipantIndex !== -1) {
        // 5A. ACTUALIZAR participante existente
        group.participants[existingParticipantIndex] = {
            ...group.participants[existingParticipantIndex], // Mantener datos antiguos
            ...normalizedParticipant // Sobrescribir con nuevos datos
        };
        console.log(`Participante ${normalizedParticipant.id} actualizado en grupo ${groupId}`);
    } else {
        // 5B. AGREGAR nuevo participante
        group.participants.push(normalizedParticipant);
        console.log(`Participante ${normalizedParticipant.id} agregado a grupo ${groupId}`);
    }

    // 6. Actualizar campos derivados del grupo (admins, conteo, etc.)
    group.participantsCount = group.participants.length;
    group.admins = group.participants
        .filter(p => p.isAdmin)
        .map(p => p.id);
    group.owner = group.participants.find(p => p.isSuperAdmin)?.id || null;

    // 7. Guardar cambios
    await this.save();
    
    console.log(`Grupo ${groupId} actualizado. Total participantes: ${group.participantsCount}`);
    return true;

    }



    async remove(groupId) {
        await this.load();
        this.groups = this.groups.filter(u => u.id !== groupId);
        await this.save();
    }

    async allowedGroup({groupId}) {
        console.log(`🔄 allowedGroup llamado para: ${groupId}`);
    
        await this.load();
        console.log(`📂 Grupos cargados: ${this.groups.length}`);
        
        const group = this.groups.find(u =>{
           console.log(groupId);
           console.log(u.id)
           
            return u.id === groupId;

        } );
        if (!group) {
            console.log(`❌ Grupo NO encontrado: ${groupId}`);
            return false;
        }
        
        console.log(`✅ Grupo encontrado:`, { id: group.id, status: group.status });
        group['status'] = 'allowed';
        console.log(`✏️ Status actualizado en memoria: ${group.status}`);
        
        try {
            await this.save();
            console.log(`💾 save() ejecutado SIN errores`);
        } catch (error) {
            console.error(`💥 ERROR en save():`, error);
            return false;
        }
        
        // Verificar que se guardó
        await this.load();
        const verify = this.groups.find(u => u.id === groupId);
        console.log(`🔍 VERIFICACIÓN FINAL:`, verify?.status || 'NO ENCONTRADO');
        
        return true;
    }
    
    



    async update(userId, key, value) {
        await this.load();
        const group = this.groups.find(u => u.id === userId);
        if (group) {
            group[key] = value; // Actualiza la propiedad indicada
            await this.save();
            return true; // Éxito
        }
        return false; // Usuario no encontrado
    }

   // --- Nuevo método equals ---
   async equals(userId, field, value) {
        await this.load();

        const group = this.groups.find(u => u.id === userId);
        if (!group) return false;
        return group[field] === value;
    }
    
       // --- Nuevo método equals ---
   async vefGroupAllowed(groupId) {
        await this.load();

        const group = this.groups.find(u => u.id === groupId);
        if (!group) return false;
        // console.log(group);
        // console.log(!(group["status"] === "allowed"));
        return group["status"] === "allowed";
    }
    



    isUser(userId) {
        return this.groups.some(u => u.id === userId);
    }
    
    async get(groupId) {
        await this.load();
        return this.groups.find(u => u.id === groupId);
    }

    all() {
        return this.groups;
    }
}
