import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import fs from 'fs-extra'
import pino from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'

import { Sender } from './src/core/models/sender.js'
import { config } from './src/core/config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let client // referencia global al contexto del bot

// ==================== ARRANQUE DEL BOT ====================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.routes.PATH_AUTH)

    // Nota: fetchLatestBaileysVersion puede causar incompatibilidades
    // si la librería instalada no soporta esa versión de protocolo.
    // Si ves errores de conexión raros, comenta esta línea y el
    // "version," de abajo para usar el default de la librería.
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Bot', 'Chrome', '1.0.0'],
        logger: pino({ level: 'debug' }),
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
    })

    client = {
        sock,
        send: new Sender(sock),
        config,
    }

    setupConnectionEvents(client, saveCreds)
    setupMessageEvents(client)
}

startBot().catch(err => console.error('Error crítico:', err))

// ==================== CONEXIÓN ====================
function setupConnectionEvents(client, saveCreds) {
    client.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log('📱 Escanea este código QR:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('✅ Bot conectado correctamente a WhatsApp')
            console.log('Información del bot:', client.sock.user)
        }

        if (connection === 'close') {
            const boom = lastDisconnect?.error
            const statusCode = boom?.output?.statusCode
            const errorMessage = boom?.message || boom?.output?.payload?.error || 'desconocido'

            console.log(`Conexión cerrada → Código: ${statusCode || 'sin código'} | Mensaje: ${errorMessage}`)

            const shouldNotReconnect = [
                DisconnectReason.loggedOut,
                DisconnectReason.badSession,
                401,
                500,
            ].includes(statusCode)

            const isCryptoError = /Bad MAC|No matching sessions|decrypt/i.test(errorMessage)

            if (isCryptoError || shouldNotReconnect) {
                console.log('🚫 Sesión corrupta o inválida. Eliminando auth...')

                const sessionFolder = path.join(__dirname, 'src', 'infrastructure', 'auth')

                try {
                    await fs.rm(sessionFolder, { recursive: true, force: true })
                    console.log('🗑️ Carpeta de sesión eliminada:', sessionFolder)
                    console.log('♻️ Terminando proceso para que el gestor (nodemon/pm2) reinicie...')
                    // No relanzamos el proceso manualmente (execSync) para evitar
                    // procesos duplicados compitiendo por la misma carpeta de auth.
                    setTimeout(() => process.exit(1), 3000)
                } catch (err) {
                    console.error('❌ No se pudo eliminar la carpeta de sesión:', err)
                    process.exit(1)
                }
            } else {
                console.log('🔄 Intentando reconectar en 5 segundos...')
                setTimeout(() => startBot(), 5000)
            }
        }
    })

    client.sock.ev.on('creds.update', saveCreds)
}

// ==================== MENSAJES ====================
function setupMessageEvents(client) {
    client.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify') return // ignora historial/sincronización, solo mensajes nuevos

            const msg = messages[0]

            // Validar primero que el mensaje existe y viene desencriptado
            if (!msg || !msg.message) {
                return
            }

            // Ignorar mensajes propios del bot (otros dispositivos vinculados, etc.)
            if (msg.key.fromMe) {
                return
            }

            const chatId = msg.key.remoteJid

            // Ignorar chats no relevantes (difusión, canales, estados, lid sin resolver)
            if (
                chatId.endsWith('@broadcast') ||
                chatId.endsWith('@lid') ||
                chatId.endsWith('@newsletter') ||
                chatId === 'status@broadcast'
            ) {
                return
            }

            const text = getMessageText(msg)
            const prefix = client.config?.defaults?.prefix || '!'

            if (!text.startsWith(prefix)) return

            const args = text.slice(prefix.length).trim().split(/ +/)
            const command = (args.shift() || '').toLowerCase()

            await handleCommand({ command, msg, client, chatId })
        } catch (err) {
            console.error('❌ Error procesando mensaje:', err)
        }
    })
}

// ==================== COMANDOS ====================
async function handleCommand({ command, msg, client }) {
    switch (command) {
        case 'ping':
            await client.send.reply(msg, 'Pong! 🏓')
            break

        case 'hola':
            await client.send.reply(msg, `¡Hola, ${msg.pushName || 'usuario'}! 👋`)
            break

        case 'help':
        case 'menu':
            await client.send.reply(msg, [
                '*MI BOT*',
                '',
                '!ping → prueba de conexión',
                '!hola → saludo',
                '!help → este menú',
            ].join('\n'))
            break

        default:
            // comando no reconocido: no responder para evitar ruido en grupos
            break
    }
}

// ==================== UTILIDADES ====================
function getMessageText(msg) {
    return msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        ''
}