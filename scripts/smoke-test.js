import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');

console.log('🚀 Running build-time smoke test...');

const requiredFiles = [
    'index.html',
    'manifest.webmanifest',
    'sw.js',
    'gold-icon.svg',
    'robots.txt',
    'icon-192.png',
    'icon-512.png'
];

let failed = false;

if (!fs.existsSync(distPath)) {
    console.error('❌ dist/ directory does not exist. Did you run npm run build?');
    process.exit(1);
}

requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Required file missing: ${file}`);
        failed = true;
    } else {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            console.error(`❌ File is empty: ${file}`);
            failed = true;
        } else {
            console.log(`✅ ${file} is present and valid`);
        }
    }
});

// Check if assets folder exists and contains something
const assetsPath = path.join(distPath, 'assets');
if (!fs.existsSync(assetsPath) || fs.readdirSync(assetsPath).length === 0) {
    console.error('❌ No JS/CSS assets found in dist/assets');
    failed = true;
} else {
    console.log(`✅ dist/assets contains ${fs.readdirSync(assetsPath).length} files`);
}

if (failed) {
    console.error('💥 Smoke test FAILED!');
    process.exit(1);
} else {
    console.log('✨ Smoke test PASSED!');
}
