import path from "path";

const ROOT = process.cwd();

const FILE_PATH = path.join(ROOT, "src");
const PATH_DATABASE = path.join(FILE_PATH,"infrastructure","database");
const PATH_MEDIA = path.join(FILE_PATH, "media");
const PATH_VIDEO = path.join(PATH_MEDIA, "video");
const PATH_IMG = path.join(PATH_MEDIA, "img");

const PATH_AUTH = path.join(FILE_PATH,"infrastructure","auth")
export const routes = {
    ROOT,
    FILE_PATH,
    PATH_DATABASE,
    PATH_MEDIA,
    PATH_VIDEO,
    PATH_IMG,
    PATH_AUTH
};