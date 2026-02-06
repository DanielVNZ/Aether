# Auto-Generated Updater Manifest

This script automatically generates the `latest.json` file needed for Tauri's auto-updater.

## Usage

### With Build (Recommended)
```bash
npm run tauri:build:release
```
Builds the app and automatically generates the updater manifest.

### Standalone
```bash
npm run generate-updater-json
```
Generates the manifest from the last build (must run `npm run tauri build` first).

## What it Does

1. Reads the version from `tauri.conf.json`
2. Generates a `latest.json` file with:
   - Current version
   - Auto-generated release notes
   - Current timestamp
   - Correct GitHub download URL
3. Saves it to `src-tauri/target/release/bundle/nsis/latest.json`

## Output Location

The generated file is placed alongside your installer:
```
src-tauri/target/release/bundle/nsis/
├── Aether_3.0.3_x64-setup.exe
└── latest.json  ← Auto-generated
```

Both files should be uploaded to your GitHub release.

## Customization

If you need custom release notes, you can:
1. Run the script to generate the base file
2. Edit `latest.json` manually before uploading
3. Or modify `generate-updater-json.js` to customize the default notes
