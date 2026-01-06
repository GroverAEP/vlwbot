export async function handlePrivateChat({msg,client,isFromMe ,userId, }) {
    //Id del usuario;
    
    //Obteniendo al usuario x la id
    let user = await client.manager.users.get(userId);
    
    //private_chat || Chat privado existe 
    const privateChatExist = client.manager.users.equals(userId,"private_chat",null);

    //Agrega el chat privado, En caso no exista.
    //La condicional (No es un mensaje mio y chat privado no existe o usuario no existe)
    //Usuario no existe
    if (!isFromMe && privateChatExist|| !user) {
        
        await client.manager.users.add_by_private({id:userId,name: msg.pushName});
        user = await client.manager.users.get(userId);
    }

    //Verifica el rol del usuario si es client
    const   isClient = client.middleware.isClient(user.role);

    //Ejecuta con el rol de cliente
    // if (!msg.key.fromMe && isClient) {
    //         console.log("El usuario es un:\n  --- Es un cliente");
           
            

    //     return;
    // }

    // if (!isCommand) return;


}