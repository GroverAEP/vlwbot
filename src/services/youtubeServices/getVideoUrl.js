import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { cleanYoutubeUrl } from '../../utils/cleanUrl.js';

const execAsync = promisify(exec);
export async function downloadYoutubeVideo(query) {

    const client = globalThis.client;
                // Detectar si es URL o búsqueda
    const isUrl = query.startsWith("http://") || query.startsWith("https://");

    // Si no es URL, convertir en búsqueda de YouTube
    const finalQuery = isUrl ? query : `"ytsearch1:${query} site:bilibili.com"`;

    const cleanUrl = isUrl ? cleanYoutubeUrl(finalQuery) : finalQuery;

    // const cleanUrl  =cleanYoutubeUrl(url)
    const output_dir= client.config.routes.PATH_VIDEO
    await fs.ensureDir(output_dir);

    // PASO 1: Obtener info LIMPIA y SIN NINGUNA ADVERTENCIA
    const infoCmd = `
    yt-dlp
    --dump-single-json
    --no-warnings
    --flat-playlist
    --socket-timeout 30
    --user-agent "Mozilla/5.0"
    --geo-bypass
    --no-progress
    "ytsearch1:${cleanUrl}"
`.replace(/\n/g, " ").trim();

    let info;
    try {
        const { stdout } = await execAsync(infoCmd, { maxBuffer: 10 * 1024 * 1024 });
        info = JSON.parse(stdout);
    } catch (err) {
        throw new Error("Error al obtener información del video (posiblemente bloqueado o privado)");
    }

    // Limpiar título para evitar errores de archivo (Windows/Linux)
    const safeTitle = info.title
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')  // Elimina caracteres prohibidos (incluye control)
        .replace(/\s+/g, '_')                    // ← ¡TODOS los espacios → _
        .replace(/_+/g, '_')                     // Evita ___ si hay varios espacios
        .replace(/^_+|_+$/g, '')                 // Quita _ al inicio y final
        .trim()
        .slice(0, 150)                           // Máximo 150 caracteres
        || 'video_sin_titulo';
    

    const output_path = path.join(process.cwd(),output_dir, `video_${Date.now()}.mp4`);
    console.log(output_path)
    console.log(safeTitle)

    console.log(cleanUrl)
// COMANDO PERFECTO (una sola línea, sin saltos raros)
const cmd = `yt-dlp -S ext:mp4:m4a --recode-video mp4 -f "bestvideo+bestaudio" -o "${output_path}" "${cleanUrl}"`;

console.log("COMANDO →", cmd); // quita esto después, es solo para debug
            // const cmd = `yt-dlp -f "bestvideo+bestaudio/best" -o "${outputPath}" ${cleanUrl}`;

try {
    const { stdout } = await execAsync(cmd);

    // const info = JSON.parse(stdout);

    // // Verificación final
    // if (!await fs.pathExists(output_path)) {
    //     throw new Error("yt-dlp dijo que sí, pero el archivo no existe");
    // }

    return {
        file: output_path,
        title: safeTitle,
        duration: 0,
        url: cleanUrl
    };

} catch (err) {
    // Si falló, borra el fantasma
    await fs.remove(output_path).catch(() => {});
    throw err;
}
// }
//     const { stdout } = await execAsync(downloadcmd, { maxBuffer: 10*1024*1024 });
//     // const info = JSON.parse(stdout);
    
//     // const file = `./temp/${info.title}.mp4`;
//     console.log(!await fs.pathExists(output_path))
    
//     if (!await fs.pathExists(output_path)) throw new Error("No se encontró el video");
    
//     return { success: true, file, title: info.title, url: info.webpage_url };

// import { exec } from "child_process";
// import path from "path";
// import fs from "fs-extra";

// import { cleanYoutubeUrl } from "../../utils/cleanUrl.js";

// export async function downloadYoutubeVideo(query) {
//     return new Promise(async (resolve, reject) => {
//         try {

//                         // Detectar si es URL o búsqueda
//             const isUrl = query.startsWith("http://") || query.startsWith("https://");

//             // Si no es URL, convertir en búsqueda de YouTube
//             const finalQuery = isUrl ? query : `"ytsearch1:${query}"`;
            
//             const cleanUrl = isUrl ? cleanYoutubeUrl(finalQuery) : finalQuery;

//             // Carpeta de descarga
//             const outputDir = path.join(process.cwd(), "./src/media/video");
//             await fs.ensureDir(outputDir);

//             // Nombre único
//             const outputPath = path.join(outputDir, `video_${Date.now()}.mp4`);

//             // Comando para descargar
//             const cmd = `yt-dlp --print-json -f "best[ext=mp4]/best" -o "${outputPath}" "${cleanUrl}"`,;

//             console.log("Ejecutando:", cmd);

//             exec(cmd, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error("Error al descargar:", error);
//                     return reject(error);
//                 }

//                 console.log("yt-dlp output:", stdout);

//                 // Validar que se descargó
//                 if (fs.existsSync(outputPath)) {
//                     // resolve(outputPath);

//                 const jsonInfo = JSON.parse(stdout);

//                 resolve(
//                     {
//                     outputPath,
//                     body: jsonInfo
//                     }                    
//                 );

//                 // // Buscar un formato MP4 con video y audio
//                 // const format = json.formats.find(f => 
//                 //     f.ext === "mp4" && 
//                 //     f.vcodec !== "none" && 
//                 //     f.acodec !== "none"
//                 // );

//                 // if (!format) {
//                 //     return reject("No se encontró un formato MP4 con audio y video.");
//                 // }

//                 // resolve(format.url);

//                 // json.add(format.url)

            

//                 } else {
//                     reject("No se encontró el archivo descargado.");
//                 }
//             });

//         } catch (err) {
//             reject(err);
//         }
//     });
// }
}