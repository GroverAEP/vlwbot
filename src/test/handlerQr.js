// import { }

import { generateQR } from "../utils/generateQR.js"

export async  function handleQrCommand({sock,msg,sender,text}){
    
    if (text.startsWith('!GenerateQr') || text.startsWith('!GQr')) {
        
        const content = text.split(" ").slice(1).join(" ")

        if (!content) {
            
            return await sock.sendMessage(sender, {
                text:"⚠️ Debes usar: *!GenerateQr <texto>*"
            })
        } 

        const qr = await generateQR(content)

        await sock.sendMessage(sender,
            {
                image: {url:qr},
                caption: `📌 *Código QR generado*\nContenido: ${content}`
            }
         )

    }

}