#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const FONT_PROPS = new Set(['fontSize', 'lineHeight']);
const VERTICAL_PROPS = new Set([
  'paddingVertical',
  'marginVertical',
  'height',
  'minHeight',
  'maxHeight',
  'top',
  'bottom',
]);
const SPACING_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'gap',
  'rowGap',
  'columnGap',
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'letterSpacing',
  'top',
  'left',
  'right',
  'bottom',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function scaleFn(prop, value) {
  if (FONT_PROPS.has(prop)) return `fs(${value})`;
  if (VERTICAL_PROPS.has(prop)) return `vs(${value})`;
  if (SPACING_PROPS.has(prop)) return `s(${value})`;
  return String(value);
}

function transformStyleNumbers(source) {
  return source.replace(
    /(\s)([a-zA-Z]+):\s*(-?\d+(?:\.\d+)?)(\s*,?\s*)$/gm,
    (match, indent, prop, value, suffix) => {
      if (prop === 'flex' || prop === 'opacity' || prop === 'zIndex' || prop === 'borderWidth') {
        return match;
      }
      if (!FONT_PROPS.has(prop) && !SPACING_PROPS.has(prop) && !VERTICAL_PROPS.has(prop)) {
        return match;
      }
      if (match.includes('s(') || match.includes('fs(') || match.includes('vs(')) {
        return match;
      }
      return `${indent}${prop}: ${scaleFn(prop, value)}${suffix}`;
    },
  );
}

function transformJsxSizeProps(source) {
  return source.replace(/\bsize=\{(\d+(?:\.\d+)?)\}/g, (match, value) => {
    if (source.includes(`size={s(${value})}`)) return match;
    return `size={s(${value})}`;
  });
}

function ensureImport(source) {
  if (!source.includes('StyleSheet.create') && !source.includes('size={s(')) {
    return source;
  }
  if (source.includes("@/lib/scale'") || source.includes('@/lib/scale"')) {
    return source;
  }

  const needsFs = source.includes('fs(');
  const needsVs = source.includes('vs(');
  const needsS = source.includes('s(');

  const imports = [];
  if (needsS) imports.push('s');
  if (needsVs) imports.push('vs');
  if (needsFs) imports.push('fs');

  if (imports.length === 0) return source;

  const importLine = `import { ${imports.join(', ')} } from '@/lib/scale';\n`;

  const lastImport = source.lastIndexOf('\nimport ');
  if (lastImport === -1) {
    return `${importLine}${source}`;
  }

  const end = source.indexOf('\n', lastImport + 1);
  return `${source.slice(0, end + 1)}${importLine}${source.slice(end + 1)}`;
}

const files = walk(ROOT).filter(
  (file) =>
    !file.includes(`${path.sep}lib${path.sep}scale.ts`) &&
    !file.endsWith('scripts/apply-scale.mjs'),
);

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = transformStyleNumbers(original);
  next = transformJsxSizeProps(next);
  next = ensureImport(next);

  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(path.relative(ROOT, file));
  }
}

console.log(`Updated ${changed} files.`);
