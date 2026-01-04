import { cleanYoutubeUrl } from "../../../../infrastructure/utils/cleanUrl.js";
import { exec } from "child_process";
import path from "path";
import fs from "fs-extra";

export async function downloadYoutubeMp3(query) {
    return new Promise(async (resolve, reject) => {
        try {
            // Detectar si es URL o búsqueda
            const isUrl = query.startsWith("http://") || query.startsWith("https://");
            const cleanQuery = query.replace(/"/g, '');

            const finalQuery = isUrl ? query : `ytsearch1:${query}`;
            const cleanUrl = isUrl ? cleanYoutubeUrl(finalQuery) : finalQuery;

            // Carpeta de descarga
            const outputDir = path.join(process.cwd(), "src/media/audio");
            await fs.ensureDir(outputDir);
            const isBilibili = cleanQuery.toLowerCase().includes('bilibili') || cleanQuery.includes('b23.tv');            
            const isYoutube = cleanQuery.includes("youtube.com") || cleanQuery.includes("youtu.be");

            // Nombre único
            const fileBase = `audio_${Date.now()}`;
            const outputTemplate = path.join(outputDir, `${fileBase}.%(ext)s`);

            const COOKIE_FLAG = `--cookies cookies.txt`;

            // Comando para metadata
            const infoQuery = isUrl ? `"${cleanUrl}"` : `ytsearch1:"${cleanQuery}"`;
            const cmdInfo = `yt-dlp ${COOKIE_FLAG} -J ${infoQuery}`;

            // Comando para descarga MP3
            const cmdDownload = `yt-dlp ${COOKIE_FLAG} -f bestaudio --extract-audio --audio-format mp3 -o "${outputTemplate}" "${cleanUrl}"`;

            console.log("Obteniendo metadata:", cmdInfo);

            // Paso 1: Obtener metadata
            exec(cmdInfo, (infoErr, infoStdout, infoStderr) => {
                console.log(infoErr)
                console.log(infoStdout)
                console.log(infoStderr)
                if (infoErr) {
                    console.error("Error al obtener metadata:", infoStderr);
                    return reject("No se pudo obtener información del audio");
                }

                let videoInfoExtra = {};

                try {
                    const json = JSON.parse(infoStdout.trim());

                    const durationSeconds = json.duration || 0;

                    // Rechazar si es muy largo (>30 min)
                    if (durationSeconds >= 1800) {
                        return reject("Audio demasiado largo (≥30 minutos)");
                    }

                    videoInfoExtra = {
                        title: json.title || json.fulltitle || "Sin título",
                        platform: json.extractor || json.extractor_key || "Desconocida",
                        display_id: json.display_id || json.id || "N/A",
                        webpage_url: json.webpage_url || json.original_url || null,
                        uploader: json.uploader || json.channel || json.creator || "N/A",
                        duration_string: json.duration_string || "N/A",
                        duration_seconds: durationSeconds,
                        thumbnail: json.thumbnail || null,
                        views: json.view_count || "N/A",
                        likes: json.like_count || "N/A",
                        comments: json.comment_count || "N/A",
                        reposts: json.repost_count || json.share_count || "N/A",
                        age_limit: json.age_limit || 0,
                        description: json.description || "Sin descripción",
                        upload_date: json.upload_date || "N/A",
                        channel_url: json.channel_url || null,
                    };

                    console.log("Metadata obtenida:", videoInfoExtra);

                    // Paso 2: Descargar MP3 (AHORA SÍ dentro del callback)
                    console.log("Descargando audio:", cmdDownload);

                    exec(cmdDownload, async (dlError, dlStdout, dlStderr) => {
                        if (dlError) {
                            console.error("Error en descarga yt-dlp:", dlStderr);
                            return reject("Error al descargar el audio");
                        }

                        try {
                            const files = await fs.readdir(outputDir);
                            const finalFile = files.find(f => f.startsWith(fileBase) && f.endsWith(".mp3"));

                            if (!finalFile) {
                                return reject("No se encontró el archivo MP3 descargado");
                            }

                            const finalPath = path.join(outputDir, finalFile);

                            const stats = await fs.stat(finalPath);
                            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                            const peso = `${fileSizeMB} MB`;

                            console.log(`Audio descargado: ${finalPath} | ${peso}`);

                            const audio_info = {
                                finalPath,
                                metadata: videoInfoExtra,
                                peso,
                                sizeBytes: stats.size
                            };

                            resolve(audio_info);

                        } catch (fsError) {
                            console.error("Error al leer archivo:", fsError);
                            reject("Error al procesar el archivo descargado");
                        }
                    });

                } catch (parseError) {
                    console.warn("Error parsing metadata JSON:", parseError);
                    reject("Error al procesar información del audio");
                }
            });

        } catch (setupError) {
            console.error("Error en configuración inicial:", setupError);
            reject(setupError);
        }
    });
}