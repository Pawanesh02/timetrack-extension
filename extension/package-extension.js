// This script would package the extension for distribution
// In a real implementation, you would use a library like archiver
// to create a zip file of the extension

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of files to include in the package
const filesToInclude = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'focus-mode.html',
  'icons/icon16.svg',
  'icons/icon32.svg',
  'icons/icon48.svg',
  'icons/icon128.svg',
  'README.md',
  'INSTALL.md',
  'LICENSE'
];

// Print packaging information
console.log('Packaging TimeTrack Extension');
console.log('----------------------------');
console.log('Files to be included:');

filesToInclude.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ✗ ${file} (missing)`);
  }
});

// Instructions for packaging
console.log('\nTo package the extension:');
console.log('1. Use a library like archiver in Node.js to create a zip file');
console.log('2. Use the command line: zip -r timetrack.zip manifest.json background.js ... ');
console.log('3. Use a browser\'s developer tools to load the unpacked extension for testing');
console.log('\nSteps to load the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the extension directory');
console.log('4. The extension should appear in your browser toolbar');