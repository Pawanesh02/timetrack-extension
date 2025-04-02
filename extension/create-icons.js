// This script would convert the SVG icon to different PNG sizes
// In a real implementation, you would use a library like sharp or canvas
// to convert the SVG to different PNG sizes

// For this example, we'll just create separate SVGs for each size
// with the appropriate dimensions

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [16, 32, 48, 128];

// Read the base SVG
const svgContent = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'), 'utf8');

// Generate each size
iconSizes.forEach(size => {
  // Create a resized version by changing the SVG attributes
  const resizedSvg = svgContent
    .replace('width="128"', `width="${size}"`)
    .replace('height="128"', `height="${size}"`)
    .replace('viewBox="0 0 128 128"', `viewBox="0 0 128 128"`);
  
  // Write the file
  fs.writeFileSync(path.join(__dirname, 'icons', `icon${size}.svg`), resizedSvg);
  
  console.log(`Created icon${size}.svg`);
});

// In a real implementation, this would convert SVGs to PNGs
// For this example, instructions on how to convert:
console.log('\nTo convert SVGs to PNGs, you would need to:');
console.log('1. Use a library like sharp or canvas in Node.js');
console.log('2. Use a command line tool like ImageMagick');
console.log('3. Use an online converter');
console.log('4. Use a graphics editor like Inkscape or GIMP');