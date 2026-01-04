// src/classes/Sender.js
import { delay } from '@whiskeysockets/baileys';

export class Sender {
    constructor(sock, options = {}) {
        this.sock = sock;
        this.footer = options.footer || '';
        this.delayMs = options.delayMs || 800; // anti-ban
    }
   // Util: normaliza path o Buffer -> Buffer
    async _toBuffer(input) {
        if (!input) throw new Error("Archivo no provisto");
        // Si es Buffer, devolverlo
        if (Buffer.isBuffer(input)) return input;
        // Si es string y parece path, leer archivo
        if (typeof input === "string") {
        const resolved = path.resolve(input);
        if (!fs.existsSync(resolved)) throw new Error(`Archivo no existe: ${resolved}`);
        return fs.readFileSync(resolved);
        }
        // Si es stream, leer a buffer (opcional)
        if (input.readable === true && typeof input.on === "function") {
        return await new Promise((resolve, reject) => {
            const chunks = [];
            input.on("data", c => chunks.push(c));
            input.on("end", () => resolve(Buffer.concat(chunks)));
            input.on("error", reject);
        });
        }
        throw new Error("Formato de archivo no soportado");
    }



    async text(msg, text = "", quoted = null) {
        const jid =msg.key.remoteJid
        const safeText = (typeof text === "string") ? text : String(text ?? "");
    
        return await this.sock.sendMessage(jid, { 
            text: `${safeText}`
            // text: `${safeText}\n\n_${this.footer}_` 
        }, { quoted });
    }

    async reply(msg, text) {
        return await this.text(msg, text, msg);
    }
 
    async audio(msg, bufferOrUrl, options = {}) {
        const jid = msg.key.remoteJid;
        const {
                ptt = false,     // valor por defecto
                quoted = null,   // valor por defecto
                waveform = null,
                seconds = 0
            } = options;

        return await this.sock.sendMessage(jid, {
            audio: typeof bufferOrUrl === 'string' ? { url: bufferOrUrl } : bufferOrUrl,
            mimetype: 'audio/mp4', // o 'audio/mpeg' según el tipo de archivo
            ptt: ptt // si quieres que se envíe como nota de voz
        }, { quoted });
    }

    
    async image(msg, bufferOrUrl, options = {}) {
        const jid = msg.key.remoteJid;
        const {
                ptt = false,     // valor por defecto
                quoted = null,   // valor por defecto
                waveform = null,
                seconds = 0,
                caption = ""
            } = options;


            
        return await this.sock.sendMessage(jid, {
            image: typeof bufferOrUrl === 'string' ? { url: bufferOrUrl } : bufferOrUrl,
            caption: caption ? `${caption}\n\n_${this.footer}_` : this.footer
        }, { quoted });
    }

    async delete(msg, msgDelete, timer ) {
        const jid = msg.key.remoteJid;

         setTimeout(async () => {
                    await this.sock.sendMessage(jid, { delete: msgDelete.key });
            }, timer);
    }

    async video(msg, buffer, options = {}) {
        const jid = msg.key.remoteJid;
        const {
                ptt = false,     // valor por defecto
                quoted = null,   // valor por defecto
                waveform = null,
                seconds = 0,
                gif = false,
                caption = "",
            } = options;

        return await this.sock.sendMessage(jid, {
            video: buffer,
            caption: caption ? `${caption}` : this.footer,
            gifPlayback: gif
        });
    }

    async document(msg, buffer, options = {}){
        const jid = msg.key.remoteJid;
        const {
                ptt = false,     // valor por defecto
                quoted = null,   // valor por defecto
                waveform = null,
                seconds = 0,
                gif = false,
                mimetype = "",
                fileName = "default",
                caption = "",
            } = options;
        return await this.sock.sendMessage(jid, {
                document: buffer,
                mimetype: mimetype,
                fileName: fileName,
                caption: caption
            },{ quoted });
    }


    async sticker(jid, buffer, options ={}) {
        const {
                        ptt = false,     // valor por defecto
                        quoted = null,   // valor por defecto
                        waveform = null,
                        seconds = 0,
                        gif = false,
                        caption = "",
                    } = options;

        return await this.sock.sendMessage(jid, { sticker: buffer }, { quoted });
    }

    async react(msg, emoji) {
        return await this.sock.sendMessage(msg.key.remoteJid, {
            react: { text: emoji, key: msg.key }
        });
    }

    async buttons(jid, text, buttons, quoted = null) {
        const btns = buttons.map((txt, i) => ({
            buttonId: String(i + 1),
            buttonText: { displayText: txt },
            type: 1
        }));

        return await this.sock.sendMessage(jid, {
            text: `${text}\n\n_${this.footer}_`,
            buttons: btns,
            headerType: 1
        }, { quoted });
    }

    
    async buttonsEditable(msg, options = {}) {
    const jid = msg.key.remoteJid;

    const {
        text = "",
        footer = this.footer,
        buttons = [],   // [{ id, text }]
        quoted = null
    } = options;

    if (!Array.isArray(buttons) || buttons.length === 0) {
        throw new Error("Debes enviar al menos un botón");
    }

    const formattedButtons = buttons.map((btn, i) => ({
        buttonId: btn.id ?? String(i + 1),
        buttonText: { displayText: btn.text ?? `Botón ${i + 1}` },
        type: 1
    }));

    return await this.sock.sendMessage(jid, {
        text: `${text}\n\n_${footer}_`,
        buttons: formattedButtons,
        headerType: 1
    }, { quoted });
}


    // Delay anti-ban
    async wait() {
        await delay(this.delayMs);
    }
}