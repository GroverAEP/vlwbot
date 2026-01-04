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

            //Plataformas disponibles para descargar:
            const isYoutube = cleanQuery.includes("youtube.com") || cleanQuery.includes("youtu.be");
            const isXvideos = cleanQuery.includes("xvideos.com");
            const isErome = cleanQuery.includes("erome.com");
            const isX = cleanQuery.includes("x.com") || cleanQuery.includes("twitter.com");
            const isInstagram =cleanQuery.includes("instagram.com") ||cleanQuery.includes("instagr.am");
            const isBilibili = cleanQuery.toLowerCase().includes('bilibili') || cleanQuery.includes('b23.tv');            
            const isTikTok =
                cleanQuery.includes("tiktok.com") ||
                cleanQuery.includes("vm.tiktok.com");
                console.log("En esta parte puedes comenzar a visualizr")
            const isFacebook = cleanQuery.includes('facebook.com') ||
                   cleanQuery.includes('fb.com') ||
                   cleanQuery.includes('fb.me') ||
                   cleanQuery.includes('m.facebook.com');

            
            
            const COOKIE_FLAG= `--cookies cookies.txt`;


            //    JavaScript// Configuración base común para yt-dlp
            const BASE_ARGS = [
                `${COOKIE_FLAG}`,                  // Cookies si están disponibles
                '-f', 'bv*+ba/b',                  // Mejor video + audio, fallback a mejor único
                '--merge-output-format', 'mp4',
                '-o', `${outputTemplate}`
            ];

            // Variaciones específicas por plataforma
            const PLATFORM_CONFIG = {
                youtube: {
                    needsUrl: true,                    // Distingue entre URL directa y búsqueda
                    format: 'bv*+ba/b',
                    searchPrefix: 'ytsearch1:'
                },
                xvideos: {
                    format: 'bv*+ba/b/best'            // xvideos suele tener menos opciones de audio separado
                },
                x: {},                                 // Twitter/X usa configuración base
                erome: {},
                instagram: {                       // Requiere cookies casi siempre (ya incluido en COOKIE_FLAG)
                },
                tiktok: {                          // Funciona mejor con cookies
                },
                instagram:{
                },
                facebook:{},
                bilibili:{}
                // Puedes añadir más plataformas fácilmente aquí
            };

            // Determinar si es búsqueda de YouTube (no URL)
            const isYoutubeSearch = isYoutube && !isUrl;

            // Construir argumentos base
            let downloadArgs = [...BASE_ARGS];

            // Aplicar variaciones por plataforma
            if (isYoutubeSearch) {
                // Búsqueda en YouTube
                downloadArgs = [
                    `${COOKIE_FLAG}`,
                    '-f', 'bv*+ba/b',
                    '--merge-output-format', 'mp4',
                    '-o', `${outputTemplate}`,
                    `ytsearch1:"${cleanQuery}"`
                ];
            } else if (isXvideos) {
                downloadArgs = [
                    `${COOKIE_FLAG}`,
                    '-f', 'bv*+ba/b/best',
                    '--merge-output-format', 'mp4',
                    '-o', `${outputTemplate}`,
                    `"${cleanQuery}"`
                ];
            } else if (isYoutube || isX || isErome || isInstagram || isTikTok || isFacebook || isBilibili) {
                // Plataformas que usan la config base (incluyendo YouTube con URL directa)
                downloadArgs = [
                    ...BASE_ARGS,
                    `"${cleanQuery}"`
                ];
            } else {
                return reject("❌ Plataforma no soportada.");
            }

            // Comando final de descarga (como string para exec)
            const cmdDownload = 'yt-dlp ' + downloadArgs.join(' ');

            // Comando para obtener info (JSON) - siempre igual salvo búsqueda de YouTube
            const infoQuery = isYoutubeSearch ? `ytsearch1:"${cleanQuery}"` : `"${cleanQuery}"`;

            const cmdInfo = `yt-dlp ${COOKIE_FLAG} -J ${infoQuery}`;

// ────────────────────────────────────────────────
// Paso 1: Obtener metadata (sin descargar)
exec(cmdInfo, (infoErr, infoStdout, infoStderr) => {
    let videoInfoExtra = {};
    try {
    
    if (infoErr) {
        console.error("Error metadata:", infoStderr);
        // Puedes decidir si continuar o rechazar
        // reject("No se pudo obtener info del video");
        // o fallback: video_info sin metadata
    }
        const json = JSON.parse(infoStdout.trim());

    // Duración en segundos (yt-dlp siempre la da en segundos como número)
        const durationSeconds = json.duration; // ej: 1800 = 30 minutos

        // Convertir a minutos (puede ser float, ej: 29.5)
        const durationMinutes = durationSeconds ? durationSeconds / 60 : 0;

        // === RECHAZO SI ES ≥ 30 MINUTOS ===
        // if (durationSeconds !== null && durationSeconds >= 1800) { // 1800 segundos = 30 minutos
        //     return reject("Video con duración larga"); // Aquí rechazas la promesa o llamas al callback de error
        // }
        
        
        
        console.log('=========================================================',
            `Informacion del video: ${infoStdout}`,
            '================================================================='
            );

        
        


        videoInfoExtra = {
                    // Título (casi siempre disponible)
                title: json.title || json.fulltitle || "Sin título",

                // Plataforma (siempre disponible con -J)
                platform: json.extractor || json.extractor_key || "Desconocida",

                // ID del video en la plataforma (muy útil para nombres de archivo únicos)
                display_id: json.display_id || json.id || "N/A",

                // URL original del video
                webpage_url: json.webpage_url || json.original_url || null,

                // Uploader / Canal (muchas veces no existe en sitios adultos)
                uploader: json.uploader || json.channel || json.creator || "N/A",

                // Duración
                duration_string: json.duration_string || "N/A",          // "4:31"
                duration_seconds: json.duration || 0,                    // 271 (ideal para cálculos)

                // Thumbnail principal
                thumbnail: json.thumbnail || null,

                // Métricas de engagement (solo disponibles en algunas plataformas)
                views: json.view_count || "N/A",           // YouTube/TikTok sí, XVideos NO
                likes: json.like_count || "N/A",           // YouTube/TikTok sí, XVideos NO
                comments: json.comment_count || "N/A",     // YouTube sí, otros variable
                reposts: json.repost_count || json.share_count || "N/A",

                // Restricción de edad (útil para filtrar +18)
                age_limit: json.age_limit || 0,            // 0 = todos, 18 = adulto

                // Resolución máxima disponible (calculada)
                max_resolution: json.formats
                    ? json.formats
                        .filter(f => f.height) // solo los que tienen altura conocida
                        .sort((a, b) => (b.height || 0) - (a.height || 0))[0]?.resolution || "Desconocida"
                    : "Desconocida",

                // Estimación de tamaño (solo si hay tbr y duración)
                estimated_size_mb: (() => {
                    if (!json.duration || !json.formats) return "N/A";
                    
                    const bestFormat = json.formats
                        .filter(f => f.tbr)
                        .sort((a, b) => b.tbr - a.tbr)[0];
                    
                    if (!bestFormat || !bestFormat.tbr) return "N/A";
                    
                    const sizeBits = bestFormat.tbr * 1000 * json.duration; // bits totales
                    const sizeMB = Math.round(sizeBits / (8 * 1024 * 1024));
                    return sizeMB;
                })(),


                // === NUEVAS PROPIEDADES RECOMENDADAS ===
                
                // Fecha de publicación
                upload_date: json.upload_date || json.release_date || "N/A",                    // Formato YYYYMMDD
                upload_date_formatted: json.upload_date 
                    ? `${json.upload_date.slice(0,4)}-${json.upload_date.slice(4,6)}-${json.upload_date.slice(6,8)}`
                    : "N/A",

                // Descripción del video
                description: json.description || "Sin descripción",

                // Etiquetas y categorías
                tags: Array.isArray(json.tags) ? json.tags : [],
                categories: Array.isArray(json.categories) ? json.categories : [],

                // Información del canal
                channel_id: json.channel_id || "N/A",
                channel_url: json.channel_url || null,

                // Si es o fue un directo (útil en YouTube, Bilibili, Facebook Live)
                is_live: json.is_live || false,
                was_live: json.was_live || false,

                // Subtítulos disponibles
                subtitles: json.subtitles ? Object.keys(json.subtitles) : [],
                automatic_captions: json.automatic_captions ? Object.keys(json.automatic_captions) : [],

                // Serie / Playlist (común en Bilibili y YouTube)
                series: json.series || null,
                season_number: json.season_number || null,
                episode_number: json.episode_number || null,

                // Timestamp de publicación (Unix)
                release_timestamp: json.timestamp || json.release_timestamp || null,


                // === MÉTRICAS ESPECÍFICAS DE BILIBILI ===
                coin_count: json.coin_count || "N/A",                    // Monedas lanzadas
                favorite_count: json.favorite_count || "N/A",            // Favoritos / Colecciones
                danmaku_count: json.danmaku || json.danmu || json.danmaku_count || "N/A",  // Danmaku (comentarios flotantes)

                // Otras métricas útiles de Bilibili que a veces aparecen
                barrage_count: json.barrage_count || "N/A",             // Alternativo para danmaku
                share_count: json.share_count || "N/A",                 // Compartidos (por si repost_count no está)
                bullet_count: json.bullet_count || "N/A",               // Otro nombre posible para danmaku
        };
        console.log("Metadata obtenida:", videoInfoExtra);
    } catch (e) {
        console.warn("JSON metadata inválido o vacío:", e);
        reject(e)
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
        console.log(videoInfoExtra);
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
