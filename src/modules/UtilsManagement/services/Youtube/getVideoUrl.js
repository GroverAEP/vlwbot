import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";

const COOKIES_PATH = path.join(process.cwd(), "cookies.txt");

export async function downloadYoutubeVideo(query) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log("reproducioendo")

            if (!query || typeof query !== "string" || !query.trim()) {
                return reject("Debes indicar un enlace o un término de búsqueda");
            }

            const isUrl = query.startsWith("http://") || query.startsWith("https://");
            const cleanQuery = query.replace(/"/g, '').trim();

            const outputDir = path.join(process.cwd(), "src/media/video");
            await fs.ensureDir(outputDir);

            const fileBase = `video_${Date.now()}`;
            const outputTemplate = path.join(outputDir, `${fileBase}.%(ext)s`);

            const isYoutube = cleanQuery.includes("youtube.com") || cleanQuery.includes("youtu.be");
            const isYoutubeSearch = !isUrl; // cualquier texto que no sea URL directa se trata como búsqueda

            const finalQuery = isYoutubeSearch
                ? `ytsearch1:${cleanQuery}`
                : cleanQuery;

            // =========================
            // 🍪 COOKIES OPCIONALES
            // =========================
            // Solo se agregan los flags --cookies si el archivo existe.
            // Así yt-dlp funciona igual sin necesidad de tener cookies.txt.
            const cookiesExist = await fs.pathExists(COOKIES_PATH);
            const cookiesArgs = cookiesExist ? ['--cookies', COOKIES_PATH] : [];

            if (!cookiesExist) {
                console.log("cookies.txt no encontrado, continuando sin cookies (puede fallar en videos restringidos).");
            }

            // =========================
            // 🔎 PASO 1: METADATA
            // =========================
            const infoProcess = spawn('yt-dlp', [
                ...cookiesArgs,
                '-J',
                finalQuery
            ]);

            let infoData = '';
            let infoError = '';

            infoProcess.stdout.on('data', d => infoData += d.toString());
            infoProcess.stderr.on('data', d => infoError += d.toString());

            console.log(infoProcess)

            // Si yt-dlp no está instalado o no se puede ejecutar, 'close' nunca
            // se dispara con un código útil — hay que capturar 'error' aparte.
            infoProcess.on('error', (err) => {
                console.error("No se pudo ejecutar yt-dlp (metadata):", err);
                reject("yt-dlp no está disponible en el sistema");
            });


              infoProcess.on('close', async (code) => {
              try {
                console.log("[yt-dlp] Metadata finalizada con código:", code);
                let videoInfoExtra = {};

                if (code !== 0 || !infoData) {
                    console.error("Error metadata:", infoError);
                    return reject("No se pudo obtener metadata");
                }

                let json;
                try {
                    json = JSON.parse(infoData.trim());
                } catch (e) {
                    console.warn("JSON metadata inválido:", e);
                    return reject("JSON inválido");
                }

                if (!json) {
                    return reject("Metadata vacía");
                }

                videoInfoExtra = {
                    title: json.title || json.fulltitle || "Sin título",
                    platform: json.extractor || "Desconocida",
                    display_id: json.display_id || json.id || "N/A",
                    webpage_url: json.webpage_url || null,
                    uploader: json.uploader || "N/A",
                    duration_string: json.duration_string || "N/A",
                    duration_seconds: json.duration || 0,
                    thumbnail: json.thumbnail || null,
                    views: json.view_count || "N/A",
                    likes: json.like_count || "N/A",
                    comments: json.comment_count || "N/A",
                    reposts: json.repost_count || "N/A",
                    age_limit: json.age_limit || 0,
                    description: json.description || "Sin descripción",
                };

                // =========================
                // 📥 PASO 2: DESCARGA
                // =========================
                console.log("[yt-dlp] Iniciando descarga...");

                const dlProcess = spawn('yt-dlp', [
                    ...cookiesArgs,
                    '-f', 'bv*+ba/b',
                    '--merge-output-format', 'mp4',
                    '-o', outputTemplate,
                    finalQuery
                ]);

                let dlStdout = '';
                let dlStderr = '';

                dlProcess.stdout.on('data', d => dlStdout += d.toString());
                dlProcess.stderr.on('data', d => dlStderr += d.toString());

                dlProcess.on('error', (err) => {
                    console.error("No se pudo ejecutar yt-dlp (descarga):", err);
                    reject("yt-dlp no está disponible en el sistema");
                });

                dlProcess.on('close', async (dlCode) => {
                  try {
                    console.log("[yt-dlp] Descarga finalizada con código:", dlCode);
                    if (dlCode !== 0) {
                        console.error("yt-dlp ERROR:", dlStderr);
                        return reject(dlStderr || "Error en descarga");
                    }

                    let files;
                    try {
                        files = await fs.readdir(outputDir);
                    } catch (e) {
                        console.error("No se pudo leer la carpeta de salida:", e);
                        return reject("Error al acceder a la carpeta de descargas");
                    }

                    const finalFile = files.find(f => f.startsWith(fileBase));

                    if (!finalFile) {
                        return reject("No se encontró el archivo final.");
                    }

                    const finalPath = path.join(outputDir, finalFile);

                    const stats = await fs.stat(finalPath);
                    const fileSizeBytes = stats.size;

                    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
                    const fileSizeGB = (fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

                    const peso = fileSizeBytes > 1024 * 1024 * 1024
                        ? `${fileSizeGB} GB`
                        : `${fileSizeMB} MB`;

                    const video_info = {
                        finalPath,
                        stdout: dlStdout,
                        stderr: dlStderr,
                        metadata: videoInfoExtra,
                        peso: peso,
                        sizeBytes: fileSizeBytes
                    };

                    resolve(video_info);
                  } catch (e) {
                    console.error("Error inesperado procesando la descarga:", e);
                    reject(e);
                  }
                });
              } catch (e) {
                console.error("Error inesperado procesando la metadata:", e);
                reject(e);
              }
            });

        } catch (err) {
            console.log("error en el downloadyoutube")
            reject(err);
        }
    });
}