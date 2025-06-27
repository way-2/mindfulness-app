// scripts/inject-version.js
const { execSync } = require('child_process');
const fs = require('fs');
let tag = execSync('git describe --tags --abbrev=0').toString().trim();
tag = tag.replace(/^release\//, '');
fs.writeFileSync('./app/context/version.json', `"${tag}"\n`);