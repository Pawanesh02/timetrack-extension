# TimeTrack Browser Extension

TimeTrack is a privacy-focused browser extension that helps you track your website usage time, provides analytics and projections, and includes a focus mode to block distracting websites.

## Features

- **Website Tracking**: Automatically tracks time spent on websites
- **Usage Analytics**: View your browsing habits with detailed visualizations
- **Focus Mode**: Block distracting websites for customizable time periods
- **Projections**: See future usage projections based on your browsing habits
- **Privacy-Focused**: All data is stored locally on your device, no external servers

## Installation

### Chrome, Edge, Brave, and other Chromium-based browsers

#### From the Web Store (coming soon)
1. Visit the Chrome Web Store
2. Search for "TimeTrack" or follow the direct link (TBD)
3. Click "Add to Chrome"

#### Manual Installation (Developer Mode)
1. Download the latest release from the Releases page
2. Extract the ZIP file to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the folder where you extracted the files
6. The extension should appear in your browser's toolbar

### Firefox (coming soon)
1. Visit the Firefox Add-ons page
2. Search for "TimeTrack" or follow the direct link (TBD)
3. Click "Add to Firefox"

## Usage

### Tracking Your Time

The extension automatically starts tracking your website usage when installed. You can:

- **View Current Stats**: Click the extension icon to see today's usage
- **Toggle Tracking**: Use the toggle in the popup to enable/disable tracking
- **View Full Dashboard**: Click "View full dashboard" to see detailed analytics

### Focus Mode

To use Focus Mode:

1. Click the extension icon in your toolbar
2. Select a duration from the dropdown (default: 25 minutes)
3. Click "Start Focus Mode"
4. Any websites you've added to your blocked list will be inaccessible during focus mode
5. You can end the session early by clicking "End Session"

### Managing Blocked Websites

1. Go to the extension options page by clicking the settings icon in the popup
2. Under "Blocked Websites," enter domain names (e.g., facebook.com)
3. Click "Add" to add them to your blocked list
4. These sites will be blocked during focus mode sessions

### Customizing Settings

Access settings by:
1. Clicking the extension icon
2. Clicking the settings icon in the bottom bar
3. Or right-clicking the extension icon and selecting "Options"

Settings you can customize:
- Focus duration
- Break duration
- Auto-start breaks
- Auto-start focus sessions after breaks
- Data export format

## Privacy

TimeTrack is designed with privacy in mind:
- All your data is stored locally on your device
- No data is sent to external servers
- No user accounts or registration required
- You can export or clear your data at any time

## Development

This extension is built using vanilla JavaScript, HTML, and CSS. No frameworks or libraries are used to keep it lightweight and fast.

To build the extension from source:

1. Clone the repository
2. Make your changes
3. Run `node package-extension.js` to package the extension
4. Load the unpacked extension in your browser

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.