// YAML parser for frontmatter parsing using vfile-matter
import fs from "fs";
import path from "path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

function safeFileOperation(operation, filePath, defaultValue = null) {
  try {
    return operation();
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Parse frontmatter from a markdown file using vfile-matter
 * Works with any markdown file that has YAML frontmatter (agents, prompts, instructions)
 * @param {string} filePath - Path to the markdown file
 * @returns {object|null} Parsed frontmatter object or null on error
 */
function parseFrontmatter(filePath) {
  return safeFileOperation(
    () => {
      const content = fs.readFileSync(filePath, "utf8");
      const file = new VFile({ path: filePath, value: content });

      // Parse the frontmatter using vfile-matter
      matter(file);

      // The frontmatter is now available in file.data.matter
      const frontmatter = file.data.matter;

      // Normalize string fields that can accumulate trailing newlines/spaces
      if (frontmatter) {
        if (typeof frontmatter.name === "string") {
          frontmatter.name = frontmatter.name.replace(/[\r\n]+$/g, "").trim();
        }
        if (typeof frontmatter.title === "string") {
          frontmatter.title = frontmatter.title.replace(/[\r\n]+$/g, "").trim();
        }
        if (typeof frontmatter.description === "string") {
          // Remove only trailing whitespace/newlines; preserve internal formatting
          frontmatter.description = frontmatter.description.replace(
            /[\s\r\n]+$/g,
            ""
          );
        }
      }

      return frontmatter;
    },
    filePath,
    null
  );
}

/**
 * Parse SKILL.md frontmatter and list bundled assets in a skill folder
 * @param {string} skillPath - Path to skill folder
 * @returns {object|null} Skill metadata with name, description, and assets array
 */
function parseSkillMetadata(skillPath) {
  return safeFileOperation(
    () => {
      const skillFile = path.join(skillPath, "SKILL.md");
      if (!fs.existsSync(skillFile)) {
        return null;
      }

      const frontmatter = parseFrontmatter(skillFile);

      // Validate required fields
      if (!frontmatter?.name || !frontmatter?.description) {
        console.warn(
          `Invalid skill at ${skillPath}: missing name or description in frontmatter`
        );
        return null;
      }

      // List bundled assets (all files except SKILL.md), recursing through subdirectories
      const getAllFiles = (dirPath, arrayOfFiles = []) => {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
          } else {
            const relativePath = path.relative(skillPath, filePath);
            if (relativePath !== "SKILL.md") {
              // Normalize path separators to forward slashes for cross-platform consistency
              arrayOfFiles.push(relativePath.replace(/\\/g, "/"));
            }
          }
        });

        return arrayOfFiles;
      };

      const assets = getAllFiles(skillPath).sort();

      return {
        name: frontmatter.name,
        description: frontmatter.description,
        assets,
        path: skillPath,
      };
    },
    skillPath,
    null
  );
}

export {
  parseFrontmatter,
  parseSkillMetadata,
  safeFileOperation,
};
