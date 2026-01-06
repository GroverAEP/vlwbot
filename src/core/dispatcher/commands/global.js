import ReserveHandler from "../../../modules/ReserveManagement/reserve.js";

export async function handleGlobalReserver({isFromMe, isCommand, messageText, chatType, isOwner, client }) {
    if(isCommand) return false;
    if (chatType !== 'private') {
        console.log("Este no es un usuario privado");
        return false;
    }

    //Si el mensaje viene del owner
    // if(isFromMe) return false;
    
    // client.mid.isFromMe
    // client.session.handleGlobalReserver
    // const reserve = new ReserveHandler(client);
    // reserve.run({text:messageText});

    console.log("Ejecutando la funcion handleGlobalReser");


    // console.log(`${messageText}`)
    // await handleGlobalReserver;
    // console.log("Imagen formato");
    // console.log("Hola buenos dias bienvenido al bot de freeze ice");

    return true;
}


// Dentro del mismo archivo, después de las funciones handlePrivateChat y handleGroupChat
export async function handleGlobalStart({ 
            msg, 
            group, 
            isCommand,
            commandText, 
            chatType, 
            isOwner, 
            client }) {
    
    //Si es un comando ! - sino devuelve;
    if (!isCommand) return;
    //Si el comando es start
    if (commandText.toLowerCase() !== 'start') return false;
    //Si es un owner
    // if (isOwner) return true; // owner no necesita "activar"

    
    if (chatType === 'group') {
        //Si el grupo existe pero no tiene el stado allowed;
        console.log(group);

        if (group && group.status !== "allowed") {
            await client.manager.groups.allowedGroup({groupId:group.id});
            console.log("Grupo activado");
        }else{
            console.log("Este grupo ya esta activado")
        };


        await client.send.reply(msg, `${group && !group.status !== "allowed"}`);
        // await client.send.reply(msg, `✅ Bot activado en este grupo`);
    } else if (chatType === 'private') {
        console.log(`✅ Bot activado para ti`)
        // await client.send.reply(msg, `✅ Bot activado para ti`);
    }
    
    return true; // → indica que se manejó el comando
}

export async function handleGlobalHelp({ msg, vefGroupAllowed,chatType ,isCommand, commandText, isOwner, client, handlers }) {
    if (!isCommand) return;
    if (commandText.toLowerCase() !== 'help') return false;

    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%")
    // console.log(!vefGroupAllowed)
    // console.log(!(vefGroupAllowed))
    // console.log(vefGroupAllowed)
    // console.log(chatType)
    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%")

    if (!vefGroupAllowed && chatType === 'group') {
        await client.send.reply(msg,'Grupo no permitido para los comandos.\n Pidele un administrador que inicie !start');
        return false;
    }; 
    
    // if (isOwner) return true; // owner no necesita "activar"

    let menu = `📜 *Menú de comandos*  —  ${msg.pushName || 'Usuario'}\n\n`;

    for (const handler of handlers) {
        if (handler.role === 'owner' && !isOwner) continue;

        if (typeof handler.help !== 'function') continue;

        try {
            const handlerMenu = await handler.help();
            if (handlerMenu) menu += handlerMenu + '\n\n';
        } catch (err) {
            console.error(`Error en help de ${handler.constructor.name}:`, err);
        }
    }

    const finalMenu = menu.trim() || 'No hay comandos disponibles.';
    await client.send.reply(msg, finalMenu);
    
    return true; // → indica que se manejó
}

export async function executeCommandHandlers({ msg, commandText, isCommand, isOwner, client, handlers }) {
    if (!isCommand) return;
    if (['start', 'help'].includes(commandText.toLowerCase())) return;

    console.log("→ Procesando comando con handlers:", commandText);

    // client.ma
    
    for (const handler of handlers) {
        try {
            if (handler.role === 'owner' && !isOwner) continue;
            await handler.run({ msg, text: commandText, client });
        } catch (err) {
            console.error(`❌ Error en handler ${handler.constructor.name}:`, err);
        }
    }
}