
export const handlerShowDeleteMessage= {
    name: "mp3",
    role: "all",
    run: ShowDeleteMessage,
};

export async function ShowDeleteMessage({msg,client,cmd}) {
    try {
        const chatId = msg.key.remoteJid;

        client.manager.chats.update(chatId,"showDelete",true)

        await client.send.reply(msg, "Se activado el comando de ver mensajes borrados.");
         
          
    } catch (error) {
        
        await client.send.reply(msg, `No se pudo activar el comando de mensajes borrados`);
        console.error(err);
            
    }
}