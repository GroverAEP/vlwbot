// src/client/index.js
import { makeWASocket } from '@whiskeysockets/baileys';
import { Sender } from '../models/sender.js';
import { Sessions} from '../models/session.js'
// import { Database } from '../database/index.js';


export async function createClient() {
    const sock = makeWASocket({ /* ... */ });

    return {
        sock,
        send: new Sender(sock),
        // db: new Database(),
        config: await import('../config/index.js'),
        sessions: new Map(),
        users: new Map(),
        queues: { ai: [], sticker: [] },
        stats: { startTime: Date.now(), messages: 0 }
    };
}