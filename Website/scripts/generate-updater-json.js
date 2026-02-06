import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
const version = tauriConf.version;

const signaturePath = path.join(
  __dirname,
  '..',
  'src-tauri',
  'target',
  'release',
  'bundle',
  'nsis',
  `Aether_${version}_x64-setup.exe.sig`
);
const signature = fs.existsSync(signaturePath)
  ? fs.readFileSync(signaturePath, 'utf8').trim()
  : null;

// Generate latest.json
const latestJson = {
  version: version,
  notes: `Aether v${version}\n\nCheck the GitHub release page for full release notes.`,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      url: `https://github.com/DanielVNZ/Aether/releases/download/v${version}/Aether_${version}_x64-setup.exe`,
      signature: signature || ''
    }
  }
};

// Write to the bundle directory
const outputDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle', 'nsis');
const outputPath = path.join(outputDir, 'latest.json');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  console.log('⚠️  Bundle directory not found. Run build first: npm run tauri build');
  process.exit(1);
}

if (!signature) {
  console.log('⚠️  Signature file not found. Ensure createUpdaterArtifacts is enabled and build completed.');
  process.exit(1);
}

// Write the file
fs.writeFileSync(outputPath, JSON.stringify(latestJson, null, 2), 'utf8');

console.log('✅ Generated latest.json');
console.log(`   Version: ${version}`);
console.log(`   Location: ${outputPath}`);
console.log('\n📦 Upload these files to your GitHub release:');
console.log(`   1. Aether_${version}_x64-setup.exe`);
console.log(`   2. latest.json`);
