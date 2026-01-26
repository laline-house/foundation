const fs = require('fs');
const path = require('path');

// Read all token files
const primitives = JSON.parse(fs.readFileSync('./primitives.json', 'utf8'));
const semantics = JSON.parse(fs.readFileSync('./semantics.json', 'utf8'));
const themeDefault = JSON.parse(fs.readFileSync('./themes/default.json', 'utf8'));
const themeSoft = JSON.parse(fs.readFileSync('./themes/soft.json', 'utf8'));
const themeNoir = JSON.parse(fs.readFileSync('./themes/noir.json', 'utf8'));

// Helper: Convert token path to CSS variable name
function tokenToCSSVar(path) {
  return `--${path.replace(/\./g, '-')}`;
}

// Helper: Resolve token references like {space.4}
function resolveValue(value, allTokens) {
  if (typeof value !== 'string') return value;
  
  const match = value.match(/\{([^}]+)\}/);
  if (!match) return value;
  
  const path = match[1];
  const resolved = getTokenValue(path, allTokens);
  return resolved;
}

// Helper: Get token value by path (e.g., "space.4")
function getTokenValue(path, tokens) {
  const parts = path.split('.');
  let current = tokens;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current.value !== undefined ? current.value : current;
}

// Helper: Flatten nested token object into flat key-value pairs
function flattenTokens(obj, prefix = '', result = {}) {
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && value.value !== undefined) {
      result[newKey] = value.value;
    } else if (value && typeof value === 'object' && !value.value) {
      flattenTokens(value, newKey, result);
    }
  }
  return result;
}

// Combine all tokens for reference resolution
const allTokens = {
  ...primitives,
  ...semantics
};

// Flatten tokens
const flatPrimitives = flattenTokens(primitives);
const flatSemantics = flattenTokens(semantics);
const flatDefault = flattenTokens(themeDefault);
const flatSoft = flattenTokens(themeSoft);
const flatNoir = flattenTokens(themeNoir);

// Helper: Add unit to number values
function addUnit(value, path) {
  if (typeof value === 'number') {
    // Duration gets 'ms'
    if (path.includes('duration')) return `${value}ms`;
    // Everything else that's a number gets 'px'
    if (path.includes('space') || path.includes('size') || path.includes('breakpoint') || path.includes('border.radius')) {
      return `${value}px`;
    }
  }
  return value;
}

// Generate CSS for a token set
function generateCSS(tokens, selector = ':root') {
  let css = `${selector} {\n`;
  
  for (const [key, value] of Object.entries(tokens)) {
    const resolved = resolveValue(value, allTokens);
    const withUnit = addUnit(resolved, key);
    css += `  ${tokenToCSSVar(key)}: ${withUnit};\n`;
  }
  
  css += '}\n';
  return css;
}

// Build CSS output
let output = `/* Design Tokens - Auto-generated */\n\n`;

// Base tokens (primitives + semantics with default colors)
output += `/* Base Tokens */\n`;
output += generateCSS({ ...flatPrimitives, ...flatSemantics, ...flatDefault });

output += `\n/* Theme: Soft */\n`;
output += generateCSS(flatSoft, '[data-theme="soft"]');

output += `\n/* Theme: Noir */\n`;
output += generateCSS({ ...flatNoir }, '[data-theme="noir"]');

// Write output
const outputDir = './dist';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(path.join(outputDir, 'tokens.css'), output);
console.log('✅ Tokens compiled to dist/tokens.css');
