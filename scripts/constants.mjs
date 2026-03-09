import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = import.meta.dirname

const ROOT_FOLDER = path.join(__dirname, "..");
const DIST_DIR = path.join(ROOT_FOLDER, "dist");
const PLUGINS_DIST_DIR = path.join(DIST_DIR, "plugins");
const PLUGINS_SRC_DIR = path.join(ROOT_FOLDER, "src");
const SKILLS_DIR = path.join(ROOT_FOLDER, "skills");
// Agent Skills validation constants
const SKILL_NAME_MIN_LENGTH = 1;
const SKILL_NAME_MAX_LENGTH = 64;
const SKILL_DESCRIPTION_MIN_LENGTH = 10;
const SKILL_DESCRIPTION_MAX_LENGTH = 1024;

export {
  PLUGINS_SRC_DIR,
  PLUGINS_DIST_DIR,
  ROOT_FOLDER,
  SKILLS_DIR,
  SKILL_NAME_MIN_LENGTH,
  SKILL_NAME_MAX_LENGTH,
  SKILL_DESCRIPTION_MIN_LENGTH,
  SKILL_DESCRIPTION_MAX_LENGTH,
};
