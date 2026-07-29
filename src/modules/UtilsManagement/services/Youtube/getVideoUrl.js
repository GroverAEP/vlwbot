import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";

export async function downloadYoutubeVideo(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const isUrl = query.startsWith("http://") || query.startsWith("https://");
            const cleanQuery = query.replace(/"/g, '');

            const outputDir = path.join(process.cwd(), "src/media/video");
            await fs.ensureDir(outputDir);

            const fileBase = `video_${Date.now()}`;
            const outputTemplate = path.join(outputDir, `${fileBase}.%(ext)s`);

            const isYoutube = cleanQuery.includes("youtube.com") || cleanQuery.includes("youtu.be");
            const isYoutubeSearch = isYoutube && !isUrl;

            const finalQuery = isYoutubeSearch
                ? `ytsearch1:${cleanQuery}`
                : cleanQuery;

            // =========================
            // 🔎 PASO 1: METADATA
            // =========================
            const infoProcess = spawn('yt-dlp', [
                '--cookies', 'cookies.txt',
                '-J',
                finalQuery
            ]);

            let infoData = '';
            let infoError = '';

            infoProcess.stdout.on('data', d => infoData += d.toString());
            infoProcess.stderr.on('data', d => infoError += d.toString());

            infoProcess.on('close', async (code) => {

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

                // ===== TU MISMA ESTRUCTURA =====
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
                const dlProcess = spawn('yt-dlp', [
                    '--cookies', 'cookies.txt',
                    '-f', 'bv*+ba/b',
                    '--merge-output-format', 'mp4',
                    '-o', outputTemplate,
                    finalQuery
                ]);

                let dlStdout = '';
                let dlStderr = '';

                dlProcess.stdout.on('data', d => dlStdout += d.toString());
                dlProcess.stderr.on('data', d => dlStderr += d.toString());

                dlProcess.on('close', async (dlCode) => {

                    if (dlCode !== 0) {
                        console.error("yt-dlp ERROR:", dlStderr);
                        return reject(dlStderr || "Error en descarga");
                    }

                    const files = await fs.readdir(outputDir);
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
                });
            });

        } catch (err) {
            reject(err);
        }
    });
}