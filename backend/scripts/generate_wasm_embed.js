const fs = require('fs');
const path = require('path');

const wasmPath = path.resolve(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
const outPath = path.resolve(__dirname, '../src/config/wasmBinary.js');

if (!fs.existsSync(wasmPath)) {
  console.error('Cannot find sql-wasm.wasm at', wasmPath);
  process.exit(1);
}

const b64 = fs.readFileSync(wasmPath).toString('base64');
const code = `// Embedded WebAssembly binary for zero-filesystem serverless execution
const wasmBase64 = ${JSON.stringify(b64)};
module.exports = Buffer.from(wasmBase64, 'base64');
`;

fs.writeFileSync(outPath, code, 'utf-8');
console.log('wasmBinary.js generated! Size:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');
