export class SuccessMp4GetVideo {
    constructor(platform) {
        this.platform = platform?.toLowerCase() || "desconocida";
    }

    /**
     * Genera el mensaje de éxito personalizado según la plataforma
     * @param {Object} metadata - Datos extraídos del JSON de yt-dlp
     * @param {string} peso - Tamaño del archivo descargado (ej: "45.2 MB")
     * @returns {string} Mensaje formateado listo para enviar
     */
    generateMessage(metadata, peso = "Desconocido") {
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
            mensaje += `🎥 *Video de ${this.platform}* ✅\n\n`;
            mensaje += `📌 *Título:* ${title}\n`;
            mensaje += `⏱️ *Duración:* ${duration}\n`;
        // Mensajes personalizados por plataforma
        switch (this.platform) {
            case "yourporn":
            case "pornhub":
            case "xvideos":
                mensaje += `🔞 *Contenido adulto*\n`;
                if (uploader !== "N/A") mensaje += `👤 *Subido por:* ${uploader}\n`;
                mensaje += `📺 *Calidad máxima:* ${maxRes}\n`;
                mensaje += `💾 *Tamaño aprox.:* ${estimatedSize !== "N/A" ? `~${estimatedSize} MB` : peso}\n`;
                break;

            case "youtube":
            case "youtube_short":
                if (uploader !== "N/A") mensaje += `👤 *Canal:* ${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
                if (likes !== "N/A") mensaje += `❤️ *Likes:* ${Number(likes).toLocaleString()}\n`;
                if (comments !== "N/A") mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;

            case "tiktok":
                if (uploader !== "N/A") mensaje += `👤 *Usuario:* @${uploader}\n`;
                if (likes !== "N/A") mensaje += `❤️ *Likes:* ${Number(likes).toLocaleString()}\n`;
                if (comments !== "N/A") mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
                if (reposts !== "N/A") mensaje += `🔁 *Compartidos:* ${Number(reposts).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;

            case "instagram":
                if (uploader !== "N/A") mensaje += `👤 *Usuario:* @${uploader}\n`;
                if (likes !== "N/A") mensaje += `❤️ *Likes:* ${Number(likes).toLocaleString()}\n`;
                if (comments !== "N/A") mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;

            case "facebook":
                if (uploader !== "N/A") mensaje += `👤 *Publicado por:* ${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;

            case "twitter":
            case "x":
                if (uploader !== "N/A") mensaje += `🐦 *Usuario:* @${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
                if (likes !== "N/A") mensaje += `❤️ *Likes:* ${Number(likes).toLocaleString()}\n`;
                if (reposts !== "N/A") mensaje += `🔁 *Retweets:* ${Number(reposts).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;

            case "facebook":
                if (uploader !== "N/A") mensaje += `👤 *Publicado por:* ${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Vistas:* ${Number(views).toLocaleString()}\n`;
                if (likes !== "N/A") mensaje += `❤️ *Reacciones:* ${Number(likes).toLocaleString()}\n`;
                if (comments !== "N/A") mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
                if (reposts !== "N/A") mensaje += `🔁 *Compartidos:* ${Number(reposts).toLocaleString()}\n`;
                mensaje += `💾 *Peso:* ${peso}\n`;
                break;
            

                case "bilibili":            
                case "BiliIntl": 
                if (uploader !== "N/A") mensaje += `👤 *UP主:* ${uploader}\n`;
                if (views !== "N/A") mensaje += `👀 *Reproducciones:* ${Number(views).toLocaleString()}\n`;
                if (likes !== "N/A") mensaje += `👍 *Me gusta:* ${Number(likes).toLocaleString()}\n`;
                if (coinCount !== "N/A") 
                    mensaje += `🪙 *Monedas:* ${Number(coinCount).toLocaleString()}\n`;
                if (favoriteCount !== "N/A") 
                    mensaje += `⭐ *Favoritos:* ${Number(favoriteCount).toLocaleString()}\n`;
                if (comments !== "N/A") 
                    mensaje += `💬 *Comentarios:* ${Number(comments).toLocaleString()}\n`;
                if (reposts !== "N/A") 
                    mensaje += `🔁 *Compartidos:* ${Number(reposts).toLocaleString()}\n`;
                if (danmakuCount !== "N/A")
                    mensaje += `💨 *Danmaku:* ${Number(danmaku_count).toLocaleString()}\n`;
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

    // Utilidad para capitalizar nombre de plataforma
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
