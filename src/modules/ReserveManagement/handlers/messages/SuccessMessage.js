export class SaludoMSG {
    constructor() {
    }

    

    generateMessage() {
        return `💈 ¡Hola! Bienvenido al asistente virtual de Andrea Estilista - Make Up 💇‍♀️💇‍♂️\n\n` +
          `Estoy aquí para ayudarte de forma eficiente y rápida 😊\n\n` +
          `Elige una opción respondiendo con el número:\n\n` +
          `1️⃣ Ver nuestros servicios ✂️\n` +
          `2️⃣ Conocer precios 💰\n` +
          `3️⃣ Reservar una cita 📅\n` +
          `4️⃣ Ver ubicación y horarios 📍\n` +
          `5️⃣ Hablar con un humano 👩‍💼\n` +
          `0️⃣ Menú principal\n\n` +
          `¡Responde con el número que quieras!`
        ;
    }
}

export class SuccessMp3GetAudio {
    constructor(platform) {
        this.platform = platform?.toLowerCase() || "desconocida";
    }

    generateMessage(metadata,peso = "Desconocido"){


               // Valores seguros (evitamos undefined/null)
        // Aquí usas las keys que TÚ definiste en videoInfoExtra
            const title = metadata.title || "Sin título";
            const duration = metadata.duration_string || "N/A";
            const uploader = metadata.uploader || "N/A";
            const views = metadata.views ?? "N/A";           // ← metadata.views (no view_count)
            const likes = metadata.likes ?? "N/A";           // ← metadata.likes
            const comments = metadata.comments ?? "N/A";     // ← metadata.comments
            const reposts = metadata.reposts ?? "N/A";       // ← metadata.reposts
            const maxRes = metadata.max_resolution || "Desconocida";
            const estimatedSize = metadata.estimated_size_mb || "N/A";
            const coinCount = metadata.coin_count;
            const favoriteCount = metadata.favorite_count;
            const danmakuCount = metadata.danmaku_count;
            const shareCount = metadata.share_count;
            const bulletCount = metadata.bullet_count;
            let mensaje = "";

            // const platformName = this.capitalize(this.platform);
            mensaje += `🎥 *Audio de ${this.platform}* ✅\n\n`;
            mensaje += `📌 *Título:* ${title}\n`;
            mensaje += `⏱️ *Duración:* ${duration}\n`;


        switch (this.platform) {
    
            

        case "youtube":
        case "youtube_short":
            if (uploader !== "N/A") mensaje += `👤 *Canal:* ${uploader}\n`;
            if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
            if (likes !== "N/A") mensaje += `❤️ *Likes:* ${Number(likes).toLocaleString()}\n`;
            if (comments !== "N/A") mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
            mensaje += `💾 *Peso:* ${peso}\n`;
            break;
        default:
                // Plataforma genérica o no reconocida
                if (uploader !== "N/A") mensaje += `👤 *Subido por:* ${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;
            
        
        }
        mensaje += `\n📁 *Tamaño del archivo:* ${peso}`;
        mensaje += `\n\n✅ Descargado con éxito! 🚀`;

        return mensaje;
    }
}


export class SuccessStickerMessage {
    async SuccessSticker(params) {
        
    }

}


export class SuccessPokemonMessage {
    static default({resPokemon}) {
        return `✨ *${resPokemon.name.toUpperCase()}*\nAltura: ${resPokemon.height}\nPeso: ${resPokemon.weight}`
    }
}
