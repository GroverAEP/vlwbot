// import { downloadBiliVideo } from "../../../../infrastructure/services/BilibiliServices/getVideo.js";
import pkg from 'baileys_helper';
const { sendInteractiveMessage,sendButtons } = pkg;
// import { sendButton } from 'baileys_helpers';
// Estado por usuario (puedes usar un Map o DB)
const userForms = new Map();

export const handlerBotones= {
    name: "mp3",
    role: "all",
    run: botones,
};

export async function botones({msg,client,cmd}) {
    try {
        const jid = msg.key.remoteJid;


    await sendInteractiveMessage(sock, jid, {
    text: 'Explore products or reply',
    interactiveButtons: [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Hello', id: 'hi' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Pricing', id: 'pricing' }) },
        { name: 'send_location', buttonParamsJson: JSON.stringify({ display_text: 'Share Location' }) },
            { name: 'single_select', buttonParamsJson: JSON.stringify({
        title: 'Menu',
        sections: [{
          title: 'Main',
          rows: [
            { id: 'it_1', title: 'First', description: 'First choice' },
            { id: 'it_2', title: 'Second', description: 'Second choice' }
          ]
        }]
    }) },
    
    // {
//   additionalNodes: [ { tag: 'biz', attrs: { experimental_flag: '1' } } ] // will be merged before auto interactive nodes
// }

        // { name: 'cta_catalog', buttonParamsJson: JSON.stringify({}) }
    ]
    });
    await sendButtons(sock, jid, {
  title: 'Header Title',            // optional header
  text: 'Pick one option below',    // body
  footer: 'Footer text',            // optional footer
  buttons: [
    { id: 'quick_1', text: 'Quick Reply' },       // legacy simple shape auto‑converted
    {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: 'Open Site',
        url: 'https://example.com'
      })
    }
  ]
});

    } catch (error) {
        
        await client.send.reply(msg, `❌ Error al testear los botonesli. ${error}`);
        console.error(error);
            
    }
}