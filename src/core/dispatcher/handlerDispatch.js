import { normalizeId } from '../../infrastructure/utils/normalize.js';
import LogisticHandler from '../../modules/LogisticManagement/LogisticHandler.js';
import OwnerHandler from '../../modules/OwnerManagement/OwnerHandler.js';
// import { handlerTestCommand } from '../../modules/UtilsManagement/handlers/flows/handlerTestCommand.js';
// import { handlerBan } from '../../modules/OwnerManagement/handlers/flows/handlerBan.js';
import UtilsHandler from '../../modules/UtilsManagement/utilsHandler.js';
// import { handleQrCommand } from './handlerQr.js'
// import { handlerPokemonApi } from './handlerPokemonApi.js'
// import { handleRandomCommand } from './handlerRandomComand.js'
// import { handleAdminCommand } from './handlerAdminCommand.js'
// import { handlerGameCommand } from './handlerGameCommand.js'
// import { handlerTestCommand } from './handlerTestCommand.js'

let client = globalThis.client
const type_bot = "";
const handlers = [
    new UtilsHandler(client),
    new OwnerHandler(client),
    new LogisticHandler(client)
    // handlerBan,
    // handlerTestCommand,
    // handlerPokemonApi,
    // handleUserCommand,
    // handleGroupCommand
];

//Este es el dispatchPrincipal
//El dispatch determina 
//Si son admins de un grupo
//Si es owner


export const dispatchHandlers = async (msg,text,client) => {
    //Cargan los owners, admins , users
    const owners = await client.manager.owners.load()
    const admins = await client.manager.admins.load()
    const users = await client.manager.users.load()

    //Define las ID - Normaliza la id
    const chatId = msg.key.remoteJid;
    const userId = msg.key.participant || msg.key.senderPn || msg.key.remoteJid;


    const normalizado = await normalizeId(userId)
    console.log(normalizado)
    console.log(chatId)

    const allowedChats = await client.manager.chats.load()
    const allowedUsers = await client.manager.users.load()
    console.log(allowedChats)
    console.log(allowedUsers)
    
    // ---------- Identificar Es un grupo o un usuario midleware -------------------------
    const isGroup = await client.middleware.isGroup({msg,chatId})
    const isUser =  await client.middleware.isUser({msg,userId})
    
    console.log(isGroup)
    console.log(isUser)

    //Valida el grupo o el usuario permitido
    let chat = await isGroup ? allowedChats.find(c => c.id === chatId) : null;
    let user = await isUser ? allowedUsers.find(u => u.id === userId) : null;
    
    //Verifica que si el usuario es el Owner o un admin o un User
    const userIsOwner = client.manager.owners.isOwner(normalizado);
    const userIsAdmin = client.manager.admins.isAdmin(normalizado);
    
    // Verificar si es owner
    const isOne = owners.some(o => normalizeId(o.id) === normalizeId(userId));
    
    console.log(
        `
        ################################################
        ## Id: ${userId},                             ##
        ## Usuario: ${msg.pushName},                  ##
        ## Chat: ${chatId}
        ## Msg: ${text}                               ##
        ################################################
        `
    )


    console.log(`
        #######################################################
        ##  El usuario es el owner: ${isOne} - ${userId}     ##
        #######################################################`)        

 
    // ------------------ ACTIVACIÓN ------------------

    if (!isOne) {
     
            console.log(isGroup && !chat && text.toLowerCase() === "start")
            console.log(isUser && !user && text.toLowerCase() === "start")
            console.log(text === "help")
            console.log(text != "start" && text != "help")


            if (isGroup && !chat && text.toLowerCase() === "start") {                
                const meta = await client.sock.groupMetadata(chatId);
                const groupName = meta.subject;
                const admins = meta.participants
                    .filter(p => p.admin)
                    .map(p => ({
                        id: p.id,
                        role: p.admin // admin | superadmin
                    }));

                const newChat = {
                    id: chatId,
                    nombre: groupName || "grupo",
                    status: "allowed",
                    showDelete: false,
                    admins: admins 
                };
    
                allowedChats.push(newChat);
                await client.db.local.save("chats", allowedChats);
                await client.send.reply(msg, `✅ Bot activado en el ${groupName}`);
                return;
            }
    
            if (isUser && !user && text.toLowerCase() === "start") {
                const newUser = {
                    id: userId,
                    name: msg.pushName || "",
                    chats: [chatId],
                    status: "allow",
                    role: "user"
                };
    
                allowedUsers.push(newUser);
                await client.db.local.save("users", allowedUsers);
                await client.send.reply(msg, `✅ Bot activado para el usuario`);
                return;
            } 


            // ⛔ Solo bloquea si NO está activado Y NO es !start
            // if (!chat || !user) {
            //     if (text.toLowerCase() !== "!start") {
            //         return;
            //     }
            // }
            }
    

    // ======================
    // HELP GLOBAL
    // ======================
        if (text === "help") {
        let fullMenu = `📜 *Lista de comandos disponibles:*\n ${msg.pushName} \n`;

            for (const h of handlers) {
                // validar rol del handler
                if (h.role === "owner" && !userIsOwner) continue;
                if (h.role === "admin" && !userIsAdmin && !userIsOwner) continue;

                if (typeof h.help === "function") {
                    try {
                        const menu = await h.help();
                        if (menu) {
                            fullMenu += menu + "\n";
                        }
                    } catch (e) {
                        console.error(`Error en help de ${h.constructor.name}`, e);
                    }
                }
            }
            // console.log(fullMenu)
            await client.send.reply(msg, fullMenu);
            return;
      }

    // ------------------ HANDLERS ------------------

        console.log("✅ ENTRANDO AL FOR DE HANDLERS");

    if (text != "start" && text != "help") {
        console.log("Ejecutandose comandos")
        for (const handler of handlers) {
            try {
                console.log("Handler:", handler.constructor.name);
                console.log(`role del handler: ${handler.role} - role del usuario: ${userIsOwner} `)
                
                //Si user no tiene el rol de owner y el comando si,
                if (handler.role === "owner" && !userIsOwner ) {
                    // await client.send.reply(msg, "⛔ Solo los owners pueden usar este comando");
                    continue;
                }

                //Si user no  tiene el rol de admin y el comando si,
                if (handler.role === "admin" && !userIsAdmin && !userIsOwner) {
                    // await client.send.reply(msg, "⛔ Solo los administradores pueden usar este comando");
                    continue;
                }
                
                
                
                //Menu general para todos
                console.log(typeof handler.help)
                console.log(text)
                // if (text === "help") {
                    //     let fullMenu = ""
                    //     console.log(`El comando Help fue llamaod: ${text}`)
                    //     console.log(`handler obtenido: ${handler.constructor.name}`)
                    //     const menu = await handler.help();
                    //     if (menu) {
                        //         fullMenu += menu + "\n";
                        //     }
                        
                        //     console.log(fullMenu)
                        //     return;
                        // }
                        
                        
                        await handler.run({ msg, text, client });
                        
                    } catch (err) {
                        console.error("❌ Error en handler:", handler.constructor.name, err);
                    }
                }
            }
    };
