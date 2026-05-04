#!/usr/bin/env node
/**
 * build.mjs — design plugin build script
 *
 * Modes:
 *   --html <file>   Validate HTML: no {{placeholders}}, well-formed structure
 *   --pdf  <file>   Convert HTML to PDF via WeasyPrint, stamp PDF metadata
 *   --check <file>  Scan inline <style> for palette anti-patterns
 */

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { exit } from 'node:process';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) { process.stdout.write(msg + '\n'); }
function err(msg) { process.stderr.write('ERROR: ' + msg + '\n'); }
function ok(msg)  { process.stdout.write('OK: ' + msg + '\n'); }

function readFile(filePath) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) {
    err(`File not found: ${abs}`);
    exit(1);
  }
  return readFileSync(abs, 'utf8');
}

function getAuthor() {
  if (process.env.DESIGN_AUTHOR) return process.env.DESIGN_AUTHOR;
  try {
    return execSync('git config user.name', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch {
    return 'Design Skill';
  }
}

// ---------------------------------------------------------------------------
// --html: placeholder and structure check
// ---------------------------------------------------------------------------

function checkHtml(filePath) {
  const html = readFile(filePath);
  const placeholders = [...html.matchAll(/\{\{[^}]+\}\}/g)].map(m => m[0]);

  if (placeholders.length > 0) {
    err(`Unfilled placeholders found in ${filePath}:`);
    placeholders.forEach(p => process.stderr.write('  ' + p + '\n'));
    exit(1);
  }

  if (!html.includes('<html') || !html.includes('</html>')) {
    err(`File does not appear to be a complete HTML document: ${filePath}`);
    exit(1);
  }

  ok(`HTML check passed — no placeholders, document structure valid.`);
}

// ---------------------------------------------------------------------------
// --pdf: WeasyPrint + PDF metadata stamping
// ---------------------------------------------------------------------------

function buildPdf(filePath) {
  const abs = resolve(filePath);
  const dir = dirname(abs);
  const base = basename(abs, '.html');
  const pdfPath = resolve(dir, base + '.pdf');

  // Check WeasyPrint availability
  const which = spawnSync('which', ['weasyprint'], { stdio: 'pipe' });
  if (which.status !== 0) {
    err('WeasyPrint is not installed. Install it with: pip install weasyprint');
    err('Fallback: open the HTML in Chrome → File → Print → Save as PDF (background graphics on, margins None)');
    exit(1);
  }

  log(`Building PDF: ${pdfPath}`);
  const result = spawnSync('weasyprint', [abs, pdfPath], { stdio: 'inherit' });
  if (result.status !== 0) {
    err('WeasyPrint failed. Check the HTML for syntax errors.');
    exit(1);
  }

  // Stamp PDF metadata using pdftk or qpdf if available
  const author = getAuthor();
  const metaResult = stampPdfMetadata(pdfPath, author);
  if (metaResult) {
    ok(`PDF built: ${pdfPath} (author: ${author})`);
  } else {
    ok(`PDF built: ${pdfPath} (metadata stamping skipped — pdftk/qpdf not found)`);
  }
}

function stampPdfMetadata(pdfPath, author) {
  // Try pdftk first
  const pdftk = spawnSync('which', ['pdftk'], { stdio: 'pipe' });
  if (pdftk.status === 0) {
    const meta = [
      'InfoKey: Author', `InfoValue: ${author}`,
      'InfoKey: Producer', 'InfoValue: Design Skill',
      'InfoKey: Creator',  'InfoValue: Design Skill',
    ].join('\n');

    const tmpMeta = pdfPath + '.meta.txt';
    import('node:fs').then(fs => fs.writeFileSync(tmpMeta, meta));
    const r = spawnSync('pdftk', [pdfPath, 'update_info', tmpMeta, 'output', pdfPath + '.tmp.pdf'], { stdio: 'pipe' });
    if (r.status === 0) {
      spawnSync('mv', [pdfPath + '.tmp.pdf', pdfPath], { stdio: 'pipe' });
      spawnSync('rm', [tmpMeta], { stdio: 'pipe' });
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// --check: inline <style> anti-pattern scan
// ---------------------------------------------------------------------------

function checkStyle(filePath) {
  const html = readFile(filePath);

  // Extract inline <style> block
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) {
    log('No inline <style> block found — skipping palette check.');
    return;
  }
  const css = styleMatch[1];

  const violations = [];

  // Anti-pattern 1: !important usage (except in UA resets)
  const importantMatches = [...css.matchAll(/!important/g)];
  if (importantMatches.length > 5) {
    violations.push(`Excessive !important usage (${importantMatches.length} occurrences). Prefer specificity.`);
  }

  // Anti-pattern 2: Pure black (#000 or #000000) as a non-border color
  if (/color\s*:\s*#000(000)?\b/.test(css) || /background\s*:\s*#000(000)?\b/.test(css)) {
    violations.push('Pure #000 used as color/background. Design systems prefer near-black values for warmth.');
  }

  // Anti-pattern 3: Pure white (#fff or #ffffff) as page background
  if (/@page[\s\S]*?background\s*:\s*#fff(fff)?\b/.test(css)) {
    violations.push('Pure #fff used as @page background. Consider the design system\'s surface color instead.');
  }

  // Anti-pattern 4: Hard-coded pixel values that should come from --unit
  const hardcodedPx = [...css.matchAll(/(?:margin|padding|gap)\s*:\s*(\d{2,3})px\b/g)]
    .filter(m => parseInt(m[1]) > 32 && !m[0].includes('var('));
  if (hardcodedPx.length > 0) {
    violations.push(`${hardcodedPx.length} large hard-coded px spacing values found. Prefer var(--unit) multiples.`);
  }

  if (violations.length > 0) {
    err(`Style check found ${violations.length} issue(s) in ${filePath}:`);
    violations.forEach(v => process.stderr.write('  - ' + v + '\n'));
    exit(1);
  }

  ok(`Style check passed — no anti-patterns detected.`);
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const mode = args[0];
const filePath = args[1];

if (!mode || !filePath) {
  process.stderr.write(
    'Usage:\n' +
    '  node scripts/build.mjs --html  <file>   Placeholder + structure check\n' +
    '  node scripts/build.mjs --pdf   <file>   WeasyPrint → PDF + metadata\n' +
    '  node scripts/build.mjs --check <file>   Style anti-pattern scan\n'
  );
  exit(1);
}

switch (mode) {
  case '--html':  checkHtml(filePath);  break;
  case '--pdf':   buildPdf(filePath);   break;
  case '--check': checkStyle(filePath); break;
  default:
    err(`Unknown mode: ${mode}`);
    exit(1);
}
