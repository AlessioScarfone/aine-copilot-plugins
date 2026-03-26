import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
    applyVariables,
    loadPluginConfig,
    substituteVariablesInDir,
    copyIfExists,
    copyRootFiles,
    copySharedAssetsToSkills,
    generatePluginManifest,
    processEmbeds,
    processEmbedsInDir,
} from "../build.mjs";

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "build-test-"));
}
function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── applyVariables ───────────────────────────────────────────────────────────

describe("applyVariables", () => {
  test("replaces a single variable", () => {
    assert.equal(applyVariables("Hello {NAME}!", { NAME: "World" }), "Hello World!");
  });

  test("replaces multiple occurrences of the same variable", () => {
    assert.equal(applyVariables("{A} and {A}", { A: "x" }), "x and x");
  });

  test("replaces multiple distinct variables", () => {
    assert.equal(applyVariables("{A}/{B}", { A: "foo", B: "bar" }), "foo/bar");
  });

  test("returns string unchanged when variables is empty", () => {
    assert.equal(applyVariables("no placeholders", {}), "no placeholders");
  });
});

// ─── loadPluginConfig ─────────────────────────────────────────────────────────

describe("loadPluginConfig", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("returns defaults when no config.json exists", () => {
    assert.deepEqual(loadPluginConfig(tmpDir), { variables: {}, sharedAssets: [] });
  });

  test("parses variables correctly", () => {
    fs.writeFileSync(path.join(tmpDir, "config.json"), JSON.stringify({ variables: { FOO: "bar" } }));
    const { variables } = loadPluginConfig(tmpDir);
    assert.deepEqual(variables, { FOO: "bar" });
  });

  test("parses sharedAssets correctly", () => {
    const assets = [{ asset: "assets/a.md", skills: ["skill-a"] }];
    fs.writeFileSync(path.join(tmpDir, "config.json"), JSON.stringify({ variables: {}, sharedAssets: assets }));
    const { sharedAssets } = loadPluginConfig(tmpDir);
    assert.deepEqual(sharedAssets, assets);
  });

  test("returns defaults on malformed JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "config.json"), "not json");
    assert.deepEqual(loadPluginConfig(tmpDir), { variables: {}, sharedAssets: [] });
  });
});

// ─── substituteVariablesInDir ─────────────────────────────────────────────────

describe("substituteVariablesInDir", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("replaces variables in a .md file", () => {
    fs.writeFileSync(path.join(tmpDir, "file.md"), "path: {FOLDER}/doc.md");
    substituteVariablesInDir(tmpDir, { FOLDER: "sdd-docs" });
    assert.equal(fs.readFileSync(path.join(tmpDir, "file.md"), "utf-8"), "path: sdd-docs/doc.md");
  });

  test("recurses into subdirectories", () => {
    const sub = path.join(tmpDir, "sub");
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, "file.yml"), "key: {VAR}");
    substituteVariablesInDir(tmpDir, { VAR: "value" });
    assert.equal(fs.readFileSync(path.join(sub, "file.yml"), "utf-8"), "key: value");
  });

  test("does not touch files with unsupported extensions", () => {
    fs.writeFileSync(path.join(tmpDir, "file.bin"), "{UNTOUCHED}");
    substituteVariablesInDir(tmpDir, { UNTOUCHED: "replaced" });
    assert.equal(fs.readFileSync(path.join(tmpDir, "file.bin"), "utf-8"), "{UNTOUCHED}");
  });

  test("does nothing when variables is empty", () => {
    fs.writeFileSync(path.join(tmpDir, "file.md"), "{UNTOUCHED}");
    substituteVariablesInDir(tmpDir, {});
    assert.equal(fs.readFileSync(path.join(tmpDir, "file.md"), "utf-8"), "{UNTOUCHED}");
  });
});

// ─── copyIfExists ─────────────────────────────────────────────────────────────

describe("copyIfExists", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("copies file when source exists", () => {
    const src = path.join(tmpDir, "src.txt");
    const dest = path.join(tmpDir, "dest.txt");
    fs.writeFileSync(src, "hello");
    copyIfExists(src, dest);
    assert.equal(fs.readFileSync(dest, "utf-8"), "hello");
  });

  test("does nothing when source does not exist", () => {
    const dest = path.join(tmpDir, "dest.txt");
    copyIfExists(path.join(tmpDir, "missing.txt"), dest);
    assert.ok(!fs.existsSync(dest));
  });

  test("copies a directory recursively", () => {
    const src = path.join(tmpDir, "srcdir");
    const dest = path.join(tmpDir, "destdir");
    fs.mkdirSync(path.join(src, "sub"), { recursive: true });
    fs.writeFileSync(path.join(src, "sub", "file.md"), "content");
    copyIfExists(src, dest);
    assert.ok(fs.existsSync(path.join(dest, "sub", "file.md")));
  });
});

// ─── copyRootFiles ────────────────────────────────────────────────────────────

describe("copyRootFiles", () => {
  let tmpDir, src, dest;
  beforeEach(() => {
    tmpDir = makeTmpDir();
    src = path.join(tmpDir, "src");
    dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);
    fs.mkdirSync(dest);
  });
  afterEach(() => { cleanup(tmpDir); });

  test("copies regular files", () => {
    fs.writeFileSync(path.join(src, "README.md"), "# readme");
    copyRootFiles(src, dest);
    assert.ok(fs.existsSync(path.join(dest, "README.md")));
  });

  test("skips plugin.json", () => {
    fs.writeFileSync(path.join(src, "plugin.json"), "{}");
    copyRootFiles(src, dest);
    assert.ok(!fs.existsSync(path.join(dest, "plugin.json")));
  });

  test("skips config.json", () => {
    fs.writeFileSync(path.join(src, "config.json"), "{}");
    copyRootFiles(src, dest);
    assert.ok(!fs.existsSync(path.join(dest, "config.json")));
  });

  test("skips subdirectories", () => {
    fs.mkdirSync(path.join(src, "subdir"));
    copyRootFiles(src, dest);
    assert.ok(!fs.existsSync(path.join(dest, "subdir")));
  });
});

// ─── copySharedAssetsToSkills ─────────────────────────────────────────────────

describe("copySharedAssetsToSkills", () => {
  let tmpDir, pluginSrc, pluginDist, skillsDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
    pluginSrc = path.join(tmpDir, "src");
    pluginDist = path.join(tmpDir, "dist");
    skillsDir = path.join(pluginDist, "skills");
    // Implementation reads from pluginSrc/shared-assets/ (not pluginSrc/assets/)
    fs.mkdirSync(path.join(pluginSrc, "shared-assets"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "skill-a"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "skill-b"), { recursive: true });
  });
  afterEach(() => { cleanup(tmpDir); });

  test("copies asset to specified skills only", () => {
    fs.mkdirSync(path.join(pluginSrc, "shared-assets", "assets"), { recursive: true });
    fs.writeFileSync(path.join(pluginSrc, "shared-assets", "assets", "prd.md"), "# PRD");
    copySharedAssetsToSkills(pluginSrc, pluginDist, [
      { asset: "assets/prd.md", skills: ["skill-a"] },
    ]);
    assert.ok(fs.existsSync(path.join(skillsDir, "skill-a", "assets", "prd.md")));
    assert.ok(!fs.existsSync(path.join(skillsDir, "skill-b", "assets", "prd.md")));
  });

  test('copies asset to all skills with wildcard "*"', () => {
    fs.mkdirSync(path.join(pluginSrc, "shared-assets", "assets"), { recursive: true });
    fs.writeFileSync(path.join(pluginSrc, "shared-assets", "assets", "common.md"), "# Common");
    copySharedAssetsToSkills(pluginSrc, pluginDist, [
      { asset: "assets/common.md", skills: ["*"] },
    ]);
    assert.ok(fs.existsSync(path.join(skillsDir, "skill-a", "assets", "common.md")));
    assert.ok(fs.existsSync(path.join(skillsDir, "skill-b", "assets", "common.md")));
  });

  test("respects local wins — does not overwrite existing file", () => {
    fs.mkdirSync(path.join(skillsDir, "skill-a", "assets"), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, "skill-a", "assets", "prd.md"), "local");
    fs.mkdirSync(path.join(pluginSrc, "shared-assets", "assets"), { recursive: true });
    fs.writeFileSync(path.join(pluginSrc, "shared-assets", "assets", "prd.md"), "shared");
    copySharedAssetsToSkills(pluginSrc, pluginDist, [
      { asset: "assets/prd.md", skills: ["skill-a"] },
    ]);
    assert.equal(
      fs.readFileSync(path.join(skillsDir, "skill-a", "assets", "prd.md"), "utf-8"),
      "local"
    );
  });

  test("copies a directory asset recursively", () => {
    fs.mkdirSync(path.join(pluginSrc, "shared-assets", "scripts"), { recursive: true });
    fs.writeFileSync(path.join(pluginSrc, "shared-assets", "scripts", "run.sh"), "#!/bin/sh");
    copySharedAssetsToSkills(pluginSrc, pluginDist, [
      { asset: "scripts", skills: ["skill-a"] },
    ]);
    assert.ok(fs.existsSync(path.join(skillsDir, "skill-a", "scripts", "run.sh")));
  });

  test("does nothing when sharedAssets is empty", () => {
    copySharedAssetsToSkills(pluginSrc, pluginDist, []);
    assert.ok(true); // no error thrown
  });
});

// ─── generatePluginManifest ───────────────────────────────────────────────────

describe("generatePluginManifest", () => {
  let tmpDir, pluginDist;
  beforeEach(() => {
    tmpDir = makeTmpDir();
    pluginDist = path.join(tmpDir, "my-plugin");
    fs.mkdirSync(path.join(pluginDist, ".github", "plugin"), { recursive: true });
    fs.writeFileSync(
      path.join(pluginDist, ".github", "plugin", "plugin.json"),
      JSON.stringify({ name: "my-plugin", version: "1.0.0" })
    );
  });
  afterEach(() => { cleanup(tmpDir); });

  function readManifest(dist) {
    return JSON.parse(
      fs.readFileSync(path.join(dist, ".github", "plugin", "plugin.json"), "utf-8")
    );
  }

  test("adds agents entry when agents dir exists", () => {
    fs.mkdirSync(path.join(pluginDist, "agents"));
    generatePluginManifest(pluginDist);
    assert.deepEqual(readManifest(pluginDist).agents, ["./agents"]);
  });

  test("removes agents entry when agents dir is absent", () => {
    generatePluginManifest(pluginDist);
    assert.ok(!("agents" in readManifest(pluginDist)));
  });

  test("lists skill folders in manifest", () => {
    const skillsDir = path.join(pluginDist, "skills");
    fs.mkdirSync(path.join(skillsDir, "skill-a"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "skill-b"));
    generatePluginManifest(pluginDist);
    assert.deepEqual(readManifest(pluginDist).skills.sort(), ["./skills/skill-a", "./skills/skill-b"]);
  });

  test("removes skills entry when skills dir has no subfolders", () => {
    fs.mkdirSync(path.join(pluginDist, "skills"));
    generatePluginManifest(pluginDist);
    assert.ok(!("skills" in readManifest(pluginDist)));
  });

  test("removes skills entry when skills dir is absent", () => {
    generatePluginManifest(pluginDist);
    assert.ok(!("skills" in readManifest(pluginDist)));
  });
});

// ─── processEmbeds ────────────────────────────────────────────────────────────

describe("processEmbeds", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("replaces embed directive with file contents", () => {
    fs.writeFileSync(path.join(tmpDir, "fragment.md"), "# Fragment");
    const result = processEmbeds("before\n<!-- @embed ./fragment.md -->\nafter", tmpDir);
    assert.equal(result, "before\n# Fragment\nafter");
  });

  test("leaves directive unchanged when target file does not exist", () => {
    const input = "<!-- @embed ./missing.md -->";
    const result = processEmbeds(input, tmpDir);
    assert.equal(result, input);
  });

  test("replaces multiple embed directives in the same file", () => {
    fs.writeFileSync(path.join(tmpDir, "a.md"), "AAA");
    fs.writeFileSync(path.join(tmpDir, "b.md"), "BBB");
    const result = processEmbeds("<!-- @embed ./a.md -->\n<!-- @embed ./b.md -->", tmpDir);
    assert.equal(result, "AAA\nBBB");
  });

  test("resolves path relative to fileDir, not cwd", () => {
    const sub = path.join(tmpDir, "sub");
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, "tpl.md"), "TEMPLATE");
    const result = processEmbeds("<!-- @embed ./tpl.md -->", sub);
    assert.equal(result, "TEMPLATE");
  });

  test("returns unchanged content when no directives present", () => {
    const input = "No directives here.";
    assert.equal(processEmbeds(input, tmpDir), input);
  });
});

// ─── processEmbedsInDir ───────────────────────────────────────────────────────

describe("processEmbedsInDir", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("expands embed in a .md file", () => {
    fs.writeFileSync(path.join(tmpDir, "fragment.md"), "CONTENT");
    fs.writeFileSync(path.join(tmpDir, "skill.md"), "<!-- @embed ./fragment.md -->");
    processEmbedsInDir(tmpDir);
    assert.equal(fs.readFileSync(path.join(tmpDir, "skill.md"), "utf-8"), "CONTENT");
  });

  test("recurses into subdirectories", () => {
    const sub = path.join(tmpDir, "sub");
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, "fragment.md"), "DEEP");
    fs.writeFileSync(path.join(sub, "skill.md"), "<!-- @embed ./fragment.md -->");
    processEmbedsInDir(tmpDir);
    assert.equal(fs.readFileSync(path.join(sub, "skill.md"), "utf-8"), "DEEP");
  });

  test("does not touch files with unsupported extensions", () => {
    fs.writeFileSync(path.join(tmpDir, "fragment.md"), "X");
    fs.writeFileSync(path.join(tmpDir, "file.bin"), "<!-- @embed ./fragment.md -->");
    processEmbedsInDir(tmpDir);
    assert.equal(fs.readFileSync(path.join(tmpDir, "file.bin"), "utf-8"), "<!-- @embed ./fragment.md -->");
  });

  test("does nothing when directory does not exist", () => {
    assert.doesNotThrow(() => processEmbedsInDir(path.join(tmpDir, "nonexistent")));
  });
});
