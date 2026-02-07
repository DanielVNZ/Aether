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
   - Correct GitHub download URL(s)
3. Saves it to `src-tauri/target/release/bundle/latest.json`

## Output Location

The generated file is placed in the bundle root:
```
src-tauri/target/release/bundle/
├── nsis/
│   └── Aether_3.0.3_x64-setup.exe
├── appimage/
│   └── Aether_3.0.3_x86_64.AppImage
└── latest.json  ← Auto-generated
```

Both the installer(s) and `latest.json` should be uploaded to your GitHub release.

## Platforms Supported

- Windows (NSIS `.exe` + `.sig`)
- Linux (AppImage `.AppImage` + `.sig`)

The script only includes platforms whose artifacts and `.sig` files are present in the bundle folders.

## Customization

If you need custom release notes, you can:
1. Run the script to generate the base file
2. Edit `latest.json` manually before uploading
3. Or modify `generate-updater-json.js` to customize the default notes
