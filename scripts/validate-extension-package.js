const fs = require('fs');
const path = require('path');
const vm = require('vm');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fail(message) {
    throw new Error(message);
}

function stableJson(value) {
    if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
    if (value && typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value);
}

function readFallbackConfig(source) {
    const match = source.match(/const FALLBACK_CONFIG\s*=\s*({[\s\S]*?});\s*const DEFAULT_SETTINGS/);
    if (!match) fail('src/content.js must declare FALLBACK_CONFIG before DEFAULT_SETTINGS');
    return vm.runInNewContext(`(${match[1]})`, Object.create(null));
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
const manifest = readJson('dist/manifest.json');
const patterns = readJson('dist/config/patterns.json');
const contentSource = fs.readFileSync('src/content.js', 'utf8');
const fallbackConfig = readFallbackConfig(contentSource);

if (!pkg.version) fail('package.json must declare a version');
if (lock.version && lock.version !== pkg.version) {
    fail(`package-lock.json version ${lock.version} does not match package.json ${pkg.version}`);
}
if (lock.packages?.['']?.version && lock.packages[''].version !== pkg.version) {
    fail(`package-lock root package version ${lock.packages[''].version} does not match package.json ${pkg.version}`);
}
if (manifest.manifest_version !== 3) fail('dist/manifest.json manifest_version must be 3');
if (manifest.version !== pkg.version) {
    fail(`dist/manifest.json version ${manifest.version} does not match package.json ${pkg.version}`);
}
if (patterns.version !== pkg.version) {
    fail(`dist/config/patterns.json version ${patterns.version} does not match package.json ${pkg.version}`);
}
if (fallbackConfig.version !== pkg.version) {
    fail(`src/content.js fallback config version ${fallbackConfig.version || '<missing>'} does not match package.json ${pkg.version}`);
}
if (stableJson(fallbackConfig.killSwitch || []) !== stableJson(patterns.killSwitch || [])) {
    fail('src/content.js fallback killSwitch does not match dist/config/patterns.json');
}
if (stableJson(fallbackConfig.patterns || {}) !== stableJson(patterns.patterns || {})) {
    fail('src/content.js fallback patterns do not match dist/config/patterns.json');
}

const requiredFiles = new Set();

function addRequired(file, label) {
    if (!file || typeof file !== 'string') fail(`${label} must be a non-empty string`);
    requiredFiles.add(file.replace(/^\/+/, ''));
}

addRequired(manifest.background?.service_worker, 'background.service_worker');
addRequired(manifest.action?.default_popup, 'action.default_popup');
Object.entries(manifest.icons || {}).forEach(([size, file]) => addRequired(file, `icons.${size}`));

for (const [index, script] of (manifest.content_scripts || []).entries()) {
    if (!Array.isArray(script.js) || script.js.length === 0) {
        fail(`content_scripts[${index}].js must list at least one script`);
    }
    script.js.forEach(file => addRequired(file, `content_scripts[${index}].js`));
}

for (const [index, group] of (manifest.web_accessible_resources || []).entries()) {
    if (!Array.isArray(group.resources) || group.resources.length === 0) {
        fail(`web_accessible_resources[${index}].resources must list at least one resource`);
    }
    group.resources.forEach(file => addRequired(file, `web_accessible_resources[${index}].resources`));
}

for (const file of requiredFiles) {
    const fullPath = path.join('dist', file);
    if (!fs.existsSync(fullPath)) fail(`Missing manifest asset: ${fullPath}`);
}

console.log(`extension package metadata and fallback config are valid for ${pkg.version}`);
