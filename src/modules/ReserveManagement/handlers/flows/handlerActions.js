import pkg from 'baileys_helper';
const { sendInteractiveMessage,sendButtons } = pkg;
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
export const handlerActions= {
    name: "mp3",       // Nombre del handler
    role: "all",       // Role del handler
    run: Actions, // Nombre de la funcion 
};

 async function Actions({client,text}) {
    try {
        console.log("Ejecutando las actiones")
        const jid = client.msg.key.remoteJid;
        
        const sock = client.sock;
        console.log(sock.sendMessage)
        const  perfil  =  await  sock.getBusinessProfile( jid); 
        console.log ( 'descripción del negocio: '  +  perfil . descripción  +  ', categoría: '  +  perfil.categoría )
        const msgA = await client.send.text(client.msg,"Este es un mensaje");

         await  sock.sendMessage( 
            jid , 
            { 
            react : { 
                text : '💖' ,  // usa una cadena vacía para eliminar la reacción 
                key : msgA.key 
            } 
            } 
        );
        console.log("lol");

            // Enviar mensaje con botones
        // const sendMessageWithButtons = async (jid, buttons) => {
        //     await sock.sendMessage(jid, {
        //         text: '¡Hola! Bienvenido al asistente virtual de Andrea Estilista - Make Up 💅',
        //         buttons: buttons,
        //         headerType: 1
        //     });
        // };

        // // Botones de respuesta
        // const buttons = [
        //     { buttonId: 'informacion', buttonText: { displayText: 'Ver información' }, type: 1 },
        //     { buttonId: 'servicios', buttonText: { displayText: '¿Qué ofrecemos?' }, type: 1 },
        //     { buttonId: 'ubicacion', buttonText: { displayText: 'Nos ubicamos' }, type: 1 }
        // ];

        // // Enviar a un número específico (usando el formato internacional con el prefijo)
        // await sendMessageWithButtons(jid, buttons);


        // await client.send.text("Hola Buenos dias");

        async function getLatestVersion() {
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log('Versión recomendada de WA:', version);  // ej: [2, 3000, 1015901237]
            console.log('¿Es la más reciente?', isLatest);
        }

        getLatestVersion();





        await sendInteractiveMessage(sock, jid, {
    title: 'Andrea Estilista 💇‍♀️',
    subtitle: 'Asistente virtual',
    text: '¡Hola! Bienvenido, ¿en qué te ayudo?',
    footer: '© 2026 Andrea Makeup',
    ai: false,  // Activa el header AI ⚡
    interactiveButtons: [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Hello 👋', id: 'hi' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Precios 💰', id: 'pricing' }) },
        { name: 'send_location', buttonParamsJson: JSON.stringify({ display_text: 'Enviar ubicación 📍' }) },
        { name: 'single_select', buttonParamsJson: JSON.stringify({
            title: 'Menú principal',
            sections: [{ title: 'Opciones', rows: [
                { id: 'serv1', title: 'Corte', description: 'Info corte' },
                { id: 'serv2', title: 'Maquillaje' }
            ]}]
        })}
    ]
});
    } catch (error) {
            console.log(error)
    }
}