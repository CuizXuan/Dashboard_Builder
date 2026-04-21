const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

const pdfPath = process.argv[2];
console.log('PDF path:', pdfPath);

async function main() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalEnabled: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const text = content.items.map(item => item.str).join('');
  console.log('=== PDF TEXT ===');
  console.log(text);
  await doc.destroy();
}

main().catch(e => console.error('Error:', e));
