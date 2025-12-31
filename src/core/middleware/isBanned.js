// Recibe lista/set/array proveniente del db
export async function isBanned({ msg, client }) {
    const userId = msg.key.participant || msg.key.remoteJid;
    const userBaned = client.manager.users.equals(userId,"status","banned"); 

    console.log(userId)
    console.log(userBaned)
    if (userBaned) {
        await client.send.reply(msg,"Este usuario no puede utilizar los comandos, has sido baneado")
        return;
    }
    return;
}        