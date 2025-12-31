export const handlerSay= {
    name: "mp3",
    role: "all",
    run: Say,
};

export async function Say({msg,client,cmd}) {
    try {
        //Validacion de errors| caso query no exista
        if (!cmd) return await client.send.reply(msg, "❌ El comando necesita la informacion");
        
        await client.send.reply(msg, `${msg.pushName}: ${cmd}`);
        
          
    } catch (error) {
        
        await client.send.reply(msg, `❌ Error mandar el mensaje say ${error}`);
        console.log(error);
            
    }
}