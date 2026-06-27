/**
 * Postinstall patch: fixes the Windows platform trailing backslash bug
 * in @expo/metro-config's transform-worker.js.
 *
 * Bug: On Windows, options.platform arrives as "android\" (trailing backslash)
 * which creates an invalid regex: /^app/\+html(\.android\)?\.([tj]sx?|[cm]js)?$/
 * The \) is treated as a literal ) inside the group, leaving ( unterminated.
 *
 * Fix: Strip trailing backslashes/forward-slashes from platform before interpolation.
 */
const fs = require('fs');
const path = require('path');

// Check both local and hoisted (monorepo) node_modules
const candidates = [
  path.join(__dirname, '..', 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'transform-worker.js'),
  path.join(__dirname, '..', '..', '..', 'node_modules', '@expo', 'metro-config', 'build', 'transform-worker', 'transform-worker.js'),
];
const targetFile = candidates.find(f => fs.existsSync(f));

if (!targetFile) {
  console.log('[patch] transform-worker.js not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Check if already patched by looking for the sanitize call pattern
if (content.includes("options.platform || ''") && content.includes('.replace(')) {
  console.log('[patch] Metro transform-worker already patched');
  process.exit(0);
}

// The original buggy line in the file has this literal text:
//   (\\.${options.platform})
// We need to replace it with the sanitized version.
// We read the file as bytes, so the double-backslash is literal.
const original = '(\\.${options.platform})';
const replacement = "(\\.${(options.platform || '').replace(/[\\\\/]+$/, '')})";

if (content.includes(original)) {
  content = content.replace(original, replacement);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[patch] Fixed metro transform-worker Windows platform regex bug');
} else {
  console.log('[patch] Warning: original pattern not found in file. File may have been modified.');
}
