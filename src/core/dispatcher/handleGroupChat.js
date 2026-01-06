export async function handleGroupChat({client,chatId,userId}) {
    // ---------- Identificar Es un grupo o un usuario midleware -------------------------
    let group = await client.manager.groups.get(chatId);
    // Informacion del grupo
    const metadata = await client.sock.groupMetadata(chatId);
    // usuario jid participante del grupo 
    const participantJid = metadata.participants.find(p => p.id === userId)?.jid;              
    //-----

    //obtiene el prefijo de comandos
    // const prefix = client.config.defaults.prefix;
    // if (!cleanText.startsWith(prefix)) return;
    
    //Si el grupo no existe se crea 
    if (!group) {
        //se agrega el grupo
        const group_data = {
            id: metadata.id,
            name: metadata.subject,
            admins: metadata.participants
            .filter(p => p.admin !== null)
            .map(p => p.id),  // Todos los admins (p.admin puede ser 'admin' o 'superadmin')
            participants: metadata.participants,
            owner: metadata.owner || 
            metadata.participants.find(p => p.admin === "superadmin")?.id || 
            null,
            } 
            await client.manager.groups.add({data: group_data});
        }
        
        
    //verifica si existe el participante y agrega al grupo a su
    if (participantJid) {
        await client.manager.users.add_group_chats({userId:participantJid,groupJid: chatId});
    }
    
    
    //Si no empieza con el prefijo,  
    // const command = cleanText.slice(prefix.length).trim();
                
    
    

}