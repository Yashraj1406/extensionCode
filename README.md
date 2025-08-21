# Tab Group Snapshots - Chrome Extension

A lightweight session manager that works exclusively with Chrome's native Tab Groups. Save and restore tab group snapshots with ease.

## Features

### Core Features
- 📸 **Right-click to snapshot**: Right-click on any tab group and select "Take Snapshot"
- 💾 **Local storage**: All snapshots stored locally in your browser
- 🔄 **One-click restore**: Restore any snapshot to a new window with original grouping
- 🎨 **Preserves group colors**: Maintains original tab group colors and names
- 🔍 **Simple popup UI**: Clean interface to view and manage snapshots

### Monetization (Freemium Model)
- **Free Tier**: Save up to 5 snapshots
- **Pro Version ($5.99)**: 
  - Unlimited snapshots
  - Organize snapshots into folders
  - Auto-snapshot on window close

## Installation (Development)

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your toolbar

## Usage

1. **Create Tab Groups**: Group your tabs using Chrome's native tab grouping (right-click on tabs → "Add to new group")
2. **Take Snapshots**: Right-click anywhere on a page when you're in a tab group, select "📸 Take Snapshot"
3. **View Snapshots**: Click the extension icon to see all saved snapshots
4. **Restore Snapshots**: Click on any snapshot to restore it in a new window
5. **Delete Snapshots**: Hover over a snapshot and click the delete button

## Technical Architecture

- **Manifest V3** compliant
- **Service Worker** for background operations
- **Chrome APIs**: tabs, tabGroups, storage, contextMenus, notifications
- **Local Storage**: All data stored locally for privacy
- **No external dependencies**: Pure vanilla JavaScript

## File Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker for core functionality
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and UI interactions
├── styles.css            # Additional styling
├── icons/                # Extension icons
└── README.md             # This file
```

## Development Status

✅ **Completed**:
- Basic extension structure
- Context menu integration
- Snapshot creation and storage
- Popup UI with snapshot list
- Snapshot restoration
- Free tier limitations (5 snapshots)
- Pro upgrade simulation

🚧 **TODO**:
- Create actual extension icons
- Implement real payment processing
- Add folder organization for Pro users
- Auto-snapshot on window close feature
- Search functionality for snapshots
- Export/import snapshots
- Chrome Web Store optimization

## Chrome Web Store Preparation

1. **Icons**: Need to create proper 16x16, 32x32, 48x48, and 128x128 icons
2. **Screenshots**: Prepare promotional screenshots
3. **Description**: Optimize store description for discoverability
4. **Privacy Policy**: Required for extensions using storage
5. **Payment Integration**: Implement actual payment processing for Pro features

## Performance Optimizations

- Minimal permissions requested
- Efficient storage usage
- Lazy loading of snapshots
- Optimized popup rendering
- No unnecessary background processes

## Security Considerations

- All data stored locally
- No external API calls
- Minimal permissions
- XSS protection in popup
- Input sanitization