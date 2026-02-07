import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
const version = tauriConf.version;
const productName = tauriConf.productName || 'Aether';

const bundleRoot = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
const nsisDir = path.join(bundleRoot, 'nsis');
const appImageDir = path.join(bundleRoot, 'appimage');

const exists = (p) => fs.existsSync(p);
const readSig = (p) => (exists(p) ? fs.readFileSync(p, 'utf8').trim() : null);

const findFirstMatch = (dir, regexList) => {
  if (!exists(dir)) return null;
  const entries = fs.readdirSync(dir);
  for (const regex of regexList) {
    const hit = entries.find((name) => regex.test(name));
    if (hit) return path.join(dir, hit);
  }
  return null;
};

const inferLinuxTarget = (fileName) => {
  const lower = fileName.toLowerCase();
  if (lower.includes('aarch64') || lower.includes('arm64')) return 'linux-aarch64';
  return 'linux-x86_64';
};

const windowsExePath =
  findFirstMatch(nsisDir, [
    new RegExp(`^${productName}[_-]${version}.*-setup\\.exe$`, 'i'),
    new RegExp(`^${productName}.*\\.exe$`, 'i')
  ]);
const windowsSigPath = windowsExePath ? `${windowsExePath}.sig` : null;
const windowsSignature = windowsSigPath ? readSig(windowsSigPath) : null;

const appImagePath =
  findFirstMatch(appImageDir, [
    new RegExp(`^${productName}[_-]${version}.*\\.AppImage$`, 'i'),
    new RegExp(`^${productName}.*\\.AppImage$`, 'i')
  ]);
const appImageSigPath = appImagePath ? `${appImagePath}.sig` : null;
const appImageSignature = appImageSigPath ? readSig(appImageSigPath) : null;

// Generate latest.json
const latestJson = {
  version: version,
  notes: `Aether v${version}\n\nCheck the GitHub release page for full release notes.`,
  pub_date: new Date().toISOString(),
  platforms: {}
};

if (windowsExePath && windowsSignature) {
  const winFile = path.basename(windowsExePath);
  latestJson.platforms['windows-x86_64'] = {
    url: `https://github.com/DanielVNZ/Aether/releases/download/v${version}/${winFile}`,
    signature: windowsSignature
  };
}

if (appImagePath && appImageSignature) {
  const linuxFile = path.basename(appImagePath);
  const linuxTarget = inferLinuxTarget(linuxFile);
  latestJson.platforms[linuxTarget] = {
    url: `https://github.com/DanielVNZ/Aether/releases/download/v${version}/${linuxFile}`,
    signature: appImageSignature
  };
}

// Write to the bundle directory
const outputDir = bundleRoot;
const outputPath = path.join(outputDir, 'latest.json');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  console.log('Bundle directory not found. Run build first: npm run tauri build');
  process.exit(1);
}

if (Object.keys(latestJson.platforms).length === 0) {
  console.log('No updater artifacts found. Ensure createUpdaterArtifacts is enabled and build completed.');
  process.exit(1);
}

// Write the file
fs.writeFileSync(outputPath, JSON.stringify(latestJson, null, 2), 'utf8');

console.log('Generated latest.json');
console.log(`   Version: ${version}`);
console.log(`   Location: ${outputPath}`);
console.log('\nUpload these files to your GitHub release:');
const uploads = [];
if (windowsExePath) uploads.push(path.basename(windowsExePath));
if (appImagePath) uploads.push(path.basename(appImagePath));
uploads.push('latest.json');
uploads.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));
