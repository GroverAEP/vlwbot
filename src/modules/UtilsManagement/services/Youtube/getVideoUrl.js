import { exec } from "child_process";
import path from "path";
import fs from "fs-extra";
import { cleanYoutubeUrl } from '../../../../infrastructure/utils/cleanUrl.js';

export async function downloadYoutubeVideo(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const isUrl = query.startsWith("http://") || query.startsWith("https://");
            const cleanQuery = query.replace(/"/g, '');

            const outputDir = path.join(process.cwd(), "src/media/video");
            await fs.ensureDir(outputDir);

            const fileBase = `video_${Date.now()}`;
            const outputTemplate = path.join(outputDir, `${fileBase}.%(ext)s`);

            // let cmd;
            const isYoutube = cleanQuery.includes("youtube.com") || cleanQuery.includes("youtu.be");
            const isXvideos = cleanQuery.includes("xvideos.com");
            const isErome = cleanQuery.includes("erome.com");
            const isX = cleanQuery.includes("x.com") || cleanQuery.includes("twitter.com");
            const isInstagram =cleanQuery.includes("instagram.com") ||cleanQuery.includes("instagr.am");
            const isTikTok =
                cleanQuery.includes("tiktok.com") ||
                cleanQuery.includes("vm.tiktok.com");
            console.log("En esta parte puedes comenzar a visualizr")
            console.log(query)
            console.log(cleanQuery)
            
let cmdInfo;   // para metadata
let cmdDownload;  // para descarga real

// Detectar plataforma y preparar comandos
if (isYoutube && isUrl) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;

} else if (isYoutube && !isUrl) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" ytsearch1:"${cleanQuery}"`;
    cmdInfo = `yt-dlp -J ytsearch1:"${cleanQuery}"`;

} else if (isXvideos) {
    cmdDownload = `yt-dlp -f "bv*+ba/b/best" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;

} else if (isX) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;

} else if (isErome) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;

} else if (isInstagram) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;  // <- quita -J del download

    // Si Instagram falla frecuentemente, usa cookies en ambos:
    // cmdInfo = `yt-dlp -J --cookies cookies.txt "${cleanQuery}"`;
    // cmdDownload = `yt-dlp --cookies cookies.txt -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;

} else if (isTikTok) {
    cmdDownload = `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${outputTemplate}" "${cleanQuery}"`;
    cmdInfo = `yt-dlp -J "${cleanQuery}"`;  // o con cookies si TikTok falla

} else {
    return reject("❌ Plataforma no soportada.");
}

// ────────────────────────────────────────────────
// Paso 1: Obtener metadata (sin descargar)
exec(cmdInfo, (infoErr, infoStdout, infoStderr) => {
    if (infoErr) {
        console.error("Error metadata:", infoStderr);
        // Puedes decidir si continuar o rechazar
        // reject("No se pudo obtener info del video");
        // o fallback: video_info sin metadata
    }

    let videoInfoExtra = {};
    try {
        
        
        const json = JSON.parse(infoStdout.trim());
        videoInfoExtra = {
            title: json.title || json.fulltitle || "Sin título",
            platform: json.extractor || "Desconocida",   // "TikTok", "Instagram", "Youtube", etc.
            uploader: json.uploader || json.channel || "N/A",
            duration: json.duration_string || "N/A",
            likes: json.like_count || "N/A",
            comments: json.comment_count || "N/A",
            reposts: json.repost_count || "N/A",
            thumbnail: json.thumbnail || null,
            // agrega más si quieres: like_count, description (corta si es muy larga), etc.
        };
        console.log("Metadata obtenida:", videoInfoExtra);
    } catch (e) {
        console.warn("JSON metadata inválido o vacío:", e);
        videoInfoExtra = { title: "Desconocido", platform: "Desconocida" };
    }

    // ────────────────────────────────────────────────
    // Paso 2: Descargar
    console.log("Ejecutando descarga:", cmdDownload);

    exec(cmdDownload, async (dlError, dlStdout, dlStderr) => {
        if (dlError) {
            console.error("yt-dlp ERROR:", dlStderr);
            return reject(dlStderr || dlError.message);
        }

        const files = await fs.readdir(outputDir);
        const finalFile = files.find(f => f.startsWith(fileBase));

        if (!finalFile) {
            return reject("No se encontró el archivo final.");
        }

        const finalPath = path.join(outputDir, finalFile);

        // ← Aquí calculamos el tamaño real
        const stats = await fs.stat(finalPath);
        const fileSizeBytes = stats.size;
        const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);  // en MB con 2 decimales
        const fileSizeGB = (fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2);  // en GB si es grande

        // Puedes elegir mostrar MB o GB según el tamaño
        const peso = fileSizeBytes > 1024 * 1024 * 1024 
            ? `${fileSizeGB} GB` 
            : `${fileSizeMB} MB`;

        console.log(`Archivo descargado: ${finalPath} | Peso: ${peso}`);

        // Lo que devuelves ahora
        const video_info = {
            finalPath,
            stdout: dlStdout,          // log de descarga (progreso, etc.)
            stderr: dlStderr,          // útil para depurar
            metadata: videoInfoExtra,   // ← título, plataforma, etc.
            peso: peso,                      // ← agregamos el peso aquí
            sizeBytes: fileSizeBytes         // opcional, el valor crudo
        };

        console.log("Descarga OK →", finalPath);
        resolve(video_info);
    });
});

        } catch (err) {
            reject(err);
        }
    });
}
