# Installing the TimeTrack Extension

This guide provides instructions for installing the TimeTrack browser extension in different browsers.

## Chrome / Edge / Brave / Opera (Chromium-based browsers)

### Method 1: Using the unpacked extension (for development)

1. Download or clone the extension code
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Opera: `opera://extensions/`
3. Enable "Developer mode" (usually a toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension should appear in your browser's toolbar

### Method 2: Using the packaged extension (ZIP file)

1. Run the packaging script with `node package-extension.js` or use the provided ZIP file
2. Open your browser and navigate to the extensions page
3. Enable "Developer mode"
4. Drag and drop the ZIP file onto the extensions page (Chrome)
   - For Edge, you may need to extract the ZIP file and use "Load unpacked"

## Firefox

Firefox requires a different extension format (.xpi). To adapt this extension for Firefox:

1. Modify the manifest.json file to support Firefox (manifest format differences exist)
2. Replace chrome.* API calls with browser.* API calls
3. Add the appropriate Firefox-specific keys to manifest.json
4. Package as a .zip file, then rename to .xpi
5. In Firefox, open "about:debugging"
6. Click "This Firefox"
7. Click "Load Temporary Add-on" and select the .xpi file

## Safari

Safari requires extensions to be developed with Xcode and distributed through the App Store:

1. Create a new Safari App Extension project in Xcode
2. Port the extension code to Safari's extension format
3. Test using Xcode's Safari Extension debugging tools
4. Submit to the App Store for distribution

## Troubleshooting

If you encounter issues loading the extension:

1. Check the browser's console for error messages
2. Ensure all required permissions are correctly specified in manifest.json
3. Verify that all paths to resources are correct
4. Make sure you're using the correct manifest version for your browser
5. For cross-browser compatibility issues, refer to each browser's extension documentation

## Keeping the Extension Updated

When using an unpacked extension during development:

1. Make your changes to the extension code
2. In the extensions page, click the refresh icon on the extension card
3. The updated version will be loaded

For packaged extensions, you'll need to:

1. Remove the existing extension
2. Install the updated version using the methods described above