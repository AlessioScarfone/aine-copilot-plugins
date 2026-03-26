import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { isPassed, buildAggregateOutput, getPlugins, getSkills } from "../review-skill.mjs";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeResult(overrides = {}) {
  return {
    skillName: "my-skill",
    success: true,
    data: {
      review: { reviewScore: 80 },
      validation: { overallPassed: true, errorCount: 0, warningCount: 0 },
      descriptionJudge: { normalizedScore: 0.9 },
      contentJudge: { normalizedScore: 0.75 },
    },
    ...overrides,
  };
}

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "review-skill-test-"));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── isPassed ─────────────────────────────────────────────────────────────────

describe("isPassed", () => {
  test("returns true when overallPassed is true", () => {
    assert.equal(isPassed(makeResult()), true);
  });

  test("returns false when overallPassed is false", () => {
    const r = makeResult();
    r.data.validation.overallPassed = false;
    assert.equal(isPassed(r), false);
  });

  test("returns false when validation is missing", () => {
    const r = makeResult();
    delete r.data.validation;
    assert.equal(isPassed(r), false);
  });

  test("returns false when data is null", () => {
    assert.equal(isPassed({ skillName: "x", success: false, data: null }), false);
  });

  test("returns false when data is undefined", () => {
    assert.equal(isPassed({ skillName: "x", success: false }), false);
  });
});

// ─── buildAggregateOutput ─────────────────────────────────────────────────────

describe("buildAggregateOutput", () => {
  test("sets plugin name correctly", () => {
    const out = buildAggregateOutput("my-plugin", []);
    assert.equal(out.plugin, "my-plugin");
  });

  test("summary.total equals results length", () => {
    const out = buildAggregateOutput("p", [makeResult(), makeResult()]);
    assert.equal(out.summary.total, 2);
  });

  test("summary.passed counts passed results", () => {
    const failing = makeResult();
    failing.data.validation.overallPassed = false;
    const out = buildAggregateOutput("p", [makeResult(), failing]);
    assert.equal(out.summary.passed, 1);
    assert.equal(out.summary.failed, 1);
  });

  test("summary.failed = total - passed", () => {
    const out = buildAggregateOutput("p", [makeResult(), makeResult()]);
    assert.equal(out.summary.failed, out.summary.total - out.summary.passed);
  });

  test("averageReviewScore is computed correctly", () => {
    const r1 = makeResult(); r1.data.review.reviewScore = 80;
    const r2 = makeResult(); r2.data.review.reviewScore = 90;
    const out = buildAggregateOutput("p", [r1, r2]);
    assert.equal(out.summary.averageReviewScore, 85);
  });

  test("averageReviewScore is rounded to one decimal", () => {
    const r1 = makeResult(); r1.data.review.reviewScore = 80;
    const r2 = makeResult(); r2.data.review.reviewScore = 81;
    const r3 = makeResult(); r3.data.review.reviewScore = 82;
    const out = buildAggregateOutput("p", [r1, r2, r3]);
    // (80+81+82)/3 = 81.0
    assert.equal(out.summary.averageReviewScore, 81);
  });

  test("averageReviewScore is null when no numeric scores", () => {
    const r = makeResult();
    r.data = null;
    const out = buildAggregateOutput("p", [r]);
    assert.equal(out.summary.averageReviewScore, null);
  });

  test("averageReviewScore is null for empty results", () => {
    const out = buildAggregateOutput("p", []);
    assert.equal(out.summary.averageReviewScore, null);
  });

  test("per-skill entry has correct fields", () => {
    const r = makeResult();
    const out = buildAggregateOutput("p", [r]);
    const s = out.skills[0];
    assert.equal(s.skillName, "my-skill");
    assert.equal(s.success, true);
    assert.equal(s.reviewScore, 80);
    assert.equal(s.validationPassed, true);
    assert.equal(s.errorCount, 0);
    assert.equal(s.warningCount, 0);
    assert.equal(s.descriptionScore, 0.9);
    assert.equal(s.contentScore, 0.75);
    assert.deepEqual(s.full, r.data);
  });

  test("per-skill fields are null when data is null", () => {
    const r = { skillName: "x", success: false, data: null };
    const out = buildAggregateOutput("p", [r]);
    const s = out.skills[0];
    assert.equal(s.reviewScore, null);
    assert.equal(s.validationPassed, null);
    assert.equal(s.errorCount, null);
    assert.equal(s.warningCount, null);
    assert.equal(s.descriptionScore, null);
    assert.equal(s.contentScore, null);
    assert.equal(s.full, null);
  });

  test("skills array length matches results", () => {
    const out = buildAggregateOutput("p", [makeResult(), makeResult(), makeResult()]);
    assert.equal(out.skills.length, 3);
  });
});

// ─── getPlugins ───────────────────────────────────────────────────────────────

describe("getPlugins", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("returns directory names", () => {
    fs.mkdirSync(path.join(tmpDir, "plugin-a"));
    fs.mkdirSync(path.join(tmpDir, "plugin-b"));
    const result = getPlugins(tmpDir);
    assert.deepEqual(result.sort(), ["plugin-a", "plugin-b"]);
  });

  test("returns empty array when dir is empty", () => {
    assert.deepEqual(getPlugins(tmpDir), []);
  });

  test("ignores files, returns only directories", () => {
    fs.mkdirSync(path.join(tmpDir, "plugin-a"));
    fs.writeFileSync(path.join(tmpDir, "not-a-plugin.json"), "{}");
    assert.deepEqual(getPlugins(tmpDir), ["plugin-a"]);
  });
});

// ─── getSkills ────────────────────────────────────────────────────────────────

describe("getSkills", () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { cleanup(tmpDir); });

  test("returns skill directory names", () => {
    const skillsDir = path.join(tmpDir, "my-plugin", "skills");
    fs.mkdirSync(path.join(skillsDir, "skill-a"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "skill-b"), { recursive: true });
    const result = getSkills("my-plugin", tmpDir);
    assert.deepEqual(result.sort(), ["skill-a", "skill-b"]);
  });

  test("returns empty array when skills dir does not exist", () => {
    fs.mkdirSync(path.join(tmpDir, "my-plugin"), { recursive: true });
    assert.deepEqual(getSkills("my-plugin", tmpDir), []);
  });

  test("returns empty array when plugin dir does not exist", () => {
    assert.deepEqual(getSkills("ghost-plugin", tmpDir), []);
  });

  test("ignores files inside skills dir", () => {
    const skillsDir = path.join(tmpDir, "my-plugin", "skills");
    fs.mkdirSync(path.join(skillsDir, "real-skill"), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, "README.md"), "# Skills");
    const result = getSkills("my-plugin", tmpDir);
    assert.deepEqual(result, ["real-skill"]);
  });
});
