#!/usr/bin/env node
/**
 * Excalidraw to PNG Export Script
 *
 * Converts Obsidian Excalidraw (.excalidraw.md) files to PNG images.
 * Handles LZ-String compressed JSON format used by Obsidian plugin.
 *
 * Usage: node excalidraw-to-png.js <input.excalidraw.md> [output.png]
 *
 * Sources:
 * - LZ-String compression: https://deepwiki.com/zsviczian/obsidian-excalidraw-plugin/3.1-file-formats-and-conversion
 */

const fs = require('fs');
const path = require('path');
const LZString = require('lz-string');

// Load Virgil font as base64 for embedding in SVG
let virgilFontBase64 = null;
function getVirgilFont() {
  if (virgilFontBase64) return virgilFontBase64;
  try {
    const fontPath = path.join(__dirname, 'Virgil.woff2');
    if (fs.existsSync(fontPath)) {
      virgilFontBase64 = fs.readFileSync(fontPath).toString('base64');
    }
  } catch (e) {
    // Font not available, will fall back to system fonts
  }
  return virgilFontBase64;
}

/**
 * Extract the compressed JSON from an Obsidian Excalidraw markdown file
 */
function extractCompressedJson(content) {
  // Look for the compressed-json code block
  const compressedMatch = content.match(/```compressed-json\n([\s\S]*?)```/);
  if (compressedMatch) {
    // Join lines (Obsidian chunks at 256 chars per line)
    return compressedMatch[1].replace(/\n/g, '');
  }

  // Fall back to regular JSON block
  const jsonMatch = content.match(/```json\n([\s\S]*?)```/);
  if (jsonMatch) {
    return { raw: jsonMatch[1] };
  }

  throw new Error('No compressed-json or json block found in file');
}

/**
 * Decompress LZ-String Base64 encoded data
 */
function decompressExcalidraw(compressed) {
  if (compressed.raw) {
    // Already raw JSON
    return JSON.parse(compressed.raw);
  }

  const decompressed = LZString.decompressFromBase64(compressed);
  if (!decompressed) {
    throw new Error('Failed to decompress LZ-String data');
  }

  return JSON.parse(decompressed);
}

/**
 * Calculate bounding box for elements
 */
function getBoundingBox(elements) {
  if (!elements || elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    if (el.isDeleted) return;
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + (el.width || 0));
    maxY = Math.max(maxY, el.y + (el.height || 0));

    // Handle arrow/line points
    if (el.points && Array.isArray(el.points)) {
      el.points.forEach(point => {
        if (Array.isArray(point)) {
          const [px, py] = point;
          minX = Math.min(minX, el.x + px);
          minY = Math.min(minY, el.y + py);
          maxX = Math.max(maxX, el.x + px);
          maxY = Math.max(maxY, el.y + py);
        }
      });
    }
  });

  // Add text bounds consideration
  elements.forEach(el => {
    if (el.type === 'text' && el.fontSize) {
      // Rough estimate for text bounds
      const textWidth = (el.text?.length || 10) * el.fontSize * 0.6;
      const textHeight = el.fontSize * 1.2;
      maxX = Math.max(maxX, el.x + textWidth);
      maxY = Math.max(maxY, el.y + textHeight);
    }
  });

  return {
    minX: isFinite(minX) ? minX : 0,
    minY: isFinite(minY) ? minY : 0,
    maxX: isFinite(maxX) ? maxX : 800,
    maxY: isFinite(maxY) ? maxY : 600,
    width: isFinite(maxX - minX) ? maxX - minX : 800,
    height: isFinite(maxY - minY) ? maxY - minY : 600
  };
}

/**
 * Filter out Obsidian Text Elements (used for search indexing)
 * These have ^id markers in their text content
 */
function filterObsidianIndexElements(elements) {
  return elements.filter(el => {
    // Keep non-text elements
    if (el.type !== 'text') return true;
    // Filter out text elements with ^id markers (Obsidian indexing)
    if (el.text && el.text.includes('^')) return false;
    return true;
  });
}

/**
 * Generate SVG from Excalidraw elements
 * Uses Virgil font for hand-drawn text style (the signature Excalidraw look)
 */
function generateBasicSvg(excalidrawData, options = {}) {
  const { background = '#ffffff', padding = 40 } = options;
  // Filter out Obsidian index elements before processing
  const elements = filterObsidianIndexElements(excalidrawData.elements || []);
  const bounds = getBoundingBox(elements);

  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;

  // Build font-face declaration if Virgil font is available
  const virgilFont = getVirgilFont();
  const fontFace = virgilFont ? `
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'Virgil';
        src: url('data:font/woff2;base64,${virgilFont}') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
    </style>
  </defs>` : '';

  // Use Virgil for hand-drawn look, with fallbacks
  const fontFamily = virgilFont ? "'Virgil', 'Segoe Print', 'Bradley Hand', cursive" : "Arial, sans-serif";

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${fontFace}
  <rect width="100%" height="100%" fill="${background}"/>
  <g transform="translate(${offsetX}, ${offsetY})">`;

  elements.forEach(el => {
    if (el.isDeleted) return;

    const stroke = el.strokeColor || '#000000';
    const fill = el.backgroundColor === 'transparent' ? 'none' : (el.backgroundColor || 'none');
    const strokeWidth = el.strokeWidth || 1;

    switch (el.type) {
      case 'rectangle':
        const rx = el.roundness?.type === 3 ? 8 : 0;
        svgContent += `\n    <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        break;

      case 'ellipse':
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        svgContent += `\n    <ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        break;

      case 'text':
        const fontSize = el.fontSize || 16;
        const textAnchor = el.textAlign === 'center' ? 'middle' : (el.textAlign === 'right' ? 'end' : 'start');
        const textX = el.textAlign === 'center' ? el.x + (el.width || 0) / 2 : el.x;
        // Split text by newlines and render each line
        const lines = (el.text || '').split('\n');
        lines.forEach((line, i) => {
          svgContent += `\n    <text x="${textX}" y="${el.y + fontSize + i * fontSize * 1.2}" font-family="${fontFamily}" font-size="${fontSize}" fill="${stroke}" text-anchor="${textAnchor}">${escapeXml(line)}</text>`;
        });
        break;

      case 'arrow':
      case 'line':
        if (el.points && el.points.length >= 2) {
          const points = el.points.map(([px, py]) => `${el.x + px},${el.y + py}`).join(' ');
          svgContent += `\n    <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

          // Add arrowhead if it's an arrow
          if (el.type === 'arrow' && el.endArrowhead) {
            const lastIdx = el.points.length - 1;
            const [endX, endY] = [el.x + el.points[lastIdx][0], el.y + el.points[lastIdx][1]];
            const [prevX, prevY] = [el.x + el.points[lastIdx - 1][0], el.y + el.points[lastIdx - 1][1]];
            const angle = Math.atan2(endY - prevY, endX - prevX);
            const arrowSize = 10;
            const a1x = endX - arrowSize * Math.cos(angle - Math.PI / 6);
            const a1y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
            const a2x = endX - arrowSize * Math.cos(angle + Math.PI / 6);
            const a2y = endY - arrowSize * Math.sin(angle + Math.PI / 6);
            svgContent += `\n    <polygon points="${endX},${endY} ${a1x},${a1y} ${a2x},${a2y}" fill="${stroke}"/>`;
          }
        }
        break;
    }
  });

  svgContent += '\n  </g>\n</svg>';
  return svgContent;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
}

/**
 * Main export function
 */
async function exportToPng(inputPath, outputPath, options = {}) {
  // Read the input file
  const content = fs.readFileSync(inputPath, 'utf8');

  // Extract and decompress the Excalidraw data
  const compressed = extractCompressedJson(content);
  const excalidrawData = decompressExcalidraw(compressed);

  // Filter out Obsidian index elements
  const filteredElements = filterObsidianIndexElements(excalidrawData.elements || []);
  excalidrawData.elements = filteredElements;

  console.log(`Found ${filteredElements.length} elements (after filtering)`);

  // Generate SVG
  const svgContent = generateBasicSvg(excalidrawData, options);

  // Optionally save SVG
  if (options.saveSvg) {
    const svgPath = outputPath.replace(/\.png$/, '.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(`SVG saved: ${svgPath}`);
  }

  // Convert SVG to PNG using sharp
  try {
    const sharp = require('sharp');
    await sharp(Buffer.from(svgContent), { density: 144 }) // 2x density for crisp output
      .png()
      .toFile(outputPath);
  } catch (sharpErr) {
    // Save SVG as fallback
    const svgPath = outputPath.replace(/\.png$/, '.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(`PNG conversion failed: ${sharpErr.message}`);
    console.log(`SVG saved as fallback: ${svgPath}`);
    return svgPath;
  }

  return outputPath;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Excalidraw to PNG Export

Converts Obsidian Excalidraw (.excalidraw.md) files to PNG images.
Handles LZ-String compressed JSON format used by Obsidian plugin.

Usage: node excalidraw-to-png.js <input.excalidraw.md> [output.png]

Options:
  --bg=COLOR     Background color (default: #ffffff)
  --padding=N    Padding around content (default: 40)
  --save-svg     Also save the intermediate SVG file
  --svg-only     Only generate SVG (skip PNG conversion)
  -h, --help     Show this help

If output path is not specified, uses input path with .png extension.
`);
    process.exit(0);
  }

  // Parse arguments
  const inputPath = args.find(a => !a.startsWith('-'));
  let outputPath = args.find((a, i) => !a.startsWith('-') && i > args.indexOf(inputPath));

  const options = {
    background: '#ffffff',
    padding: 40,
    svgOnly: args.includes('--svg-only'),
    saveSvg: args.includes('--save-svg')
  };

  // Parse options
  args.forEach(arg => {
    if (arg.startsWith('--bg=')) {
      options.background = arg.split('=')[1];
    }
    if (arg.startsWith('--padding=')) {
      options.padding = parseInt(arg.split('=')[1], 10);
    }
  });

  // Default output path
  if (!outputPath) {
    outputPath = inputPath.replace(/\.excalidraw\.md$/, '.png');
    if (outputPath === inputPath) {
      outputPath = inputPath + '.png';
    }
  }

  // Resolve paths
  const resolvedInput = path.resolve(inputPath);
  const resolvedOutput = path.resolve(outputPath);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`Error: Input file not found: ${resolvedInput}`);
    process.exit(1);
  }

  try {
    console.log(`Converting: ${resolvedInput}`);

    if (options.svgOnly) {
      // SVG-only mode
      const content = fs.readFileSync(resolvedInput, 'utf8');
      const compressed = extractCompressedJson(content);
      const excalidrawData = decompressExcalidraw(compressed);
      console.log(`Found ${excalidrawData.elements?.length || 0} elements`);

      const svgContent = generateBasicSvg(excalidrawData, options);
      const svgPath = resolvedOutput.replace(/\.png$/, '.svg');
      fs.writeFileSync(svgPath, svgContent);
      console.log(`SVG saved: ${svgPath}`);
    } else {
      await exportToPng(resolvedInput, resolvedOutput, options);
      console.log(`PNG saved: ${resolvedOutput}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { exportToPng, extractCompressedJson, decompressExcalidraw, generateBasicSvg };

// Run CLI if executed directly
if (require.main === module) {
  main();
}
