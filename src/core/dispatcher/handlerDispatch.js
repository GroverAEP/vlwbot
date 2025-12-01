import { normalizeId } from '../../infrastructure/utils/normalize.js';
import { handlerPokemonApi, PokemonApi } from '../../modules/UtilsManagement/handlers/flows/handlerPokemonSearch.js';
import { handlerStickerCommand } from '../../modules/UtilsManagement/handlers/flows/handlerStickerCommand.js'
import { handlerTestCommand } from '../../modules/UtilsManagement/handlers/flows/handlerTestCommand.js';
import { handlerBan } from '../../modules/OwnerManagement/handlers/flows/handlerBan.js';
// import { handleQrCommand } from './handlerQr.js'
// import { handlerPokemonApi } from './handlerPokemonApi.js'
// import { handleRandomCommand } from './handlerRandomComand.js'
// import { handleAdminCommand } from './handlerAdminCommand.js'
// import { handlerGameCommand } from './handlerGameCommand.js'
// import { handlerTestCommand } from './handlerTestCommand.js'

// let client = globalThis.client

const handlers = [
    handlerStickerCommand,
    handlerBan,
    handlerTestCommand,
    handlerPokemonApi,
    // handleUserCommand,
    // handleGroupCommand
];

export const dispatchHandlers = async (msg,text,client) => {
    const owners = await client.manager.owners.load()
    const admins = await client.manager.admins.load()
    const users = await client.manager.users.load()

    const sender = msg.key.participant || msg.key.remoteJid;
    const normalizado = await normalizeId(sender)
    console.log(normalizado)
    console.log(sender)
    const userIsOwner = client.manager.owners.isOwner(normalizado);
    const userIsAdmin = client.manager.admins.isAdmin(normalizado);


    // const groupAdmins = msg.groupMetadata?.participants
    //     ?.filter(p => p.admin)
    //     .map(p => p.id) || [];
    
    //     client.middleware.isOwner


    for (const handler of handlers) {
        try {
                  // 1. Validar permisos
            if (handler.role === "owner" && !userIsOwner) {
                await client.send.reply(msg.key.remoteJid, "⛔ *Usted no puede usar este comando. Solo los dueños*");
            continue;
            }

            if (handler.role === "admin" && !userIsAdmin && !userIsOwner){
                await client.send.reply(msg, "⛔ *Usted no puede usar este comando. Solo los administradores del grupo*")
            continue;
            } 

            await handler.run({msg,text,client});
        } catch (err) {
            console.error("Error en handler:", handler.name, err);
        }
    }
};
