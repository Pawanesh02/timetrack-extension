#!/bin/bash

# Create a ZIP file of the TimeTrack extension

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set the output filename with version from manifest
VERSION=$(grep '"version"' "$DIR/manifest.json" | cut -d '"' -f 4)
ZIPFILE="$DIR/timetrack-v$VERSION.zip"

# Create the ZIP file
echo "Packaging TimeTrack Extension v$VERSION..."
cd "$DIR"

# Check if zip command is available
if command -v zip >/dev/null 2>&1; then
  # Create the ZIP file
  zip -r "$ZIPFILE" \
    manifest.json \
    background.js \
    content.js \
    popup.html \
    popup.js \
    options.html \
    options.js \
    focus-mode.html \
    icons/icon*.svg \
    README.md \
    INSTALL.md \
    LICENSE

  echo "Extension packaged successfully: $ZIPFILE"
  echo "ZIP file size: $(du -h "$ZIPFILE" | cut -f1)"
else
  echo "Error: 'zip' command not found. Please install it or use another method to create a ZIP file."
  exit 1
fi

echo -e "\nTo install the extension in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Drag and drop the ZIP file onto the page"
echo "   or click 'Load unpacked' and select the extension directory"