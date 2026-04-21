const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
const XLSX = require('xlsx');

// 自动使用脚本所在目录
const SCRIPT_DIR = path.dirname(process.argv[1]) || process.cwd();
const PDF_DIR = SCRIPT_DIR;
const OUTPUT_FILE = path.join(PDF_DIR, '发票汇总.xlsx');

// 发票号：从文件名头部提取 17 位数字
const INVOICE_REGEX = /^(\d{17})/;
// 订单号：从 PDF 文本中匹配 "备注" 附近的 "260106-389598451213376" 格式
const ORDER_REGEX = /备注[：:\s\S]*?(\d{3}\d{2}-\d{15})/;

async function extractTextFromPdf(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalEnabled: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const text = content.items.map(item => item.str).join('');
  await doc.destroy();
  return text;
}

async function main() {
  // 等待用户输入
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('==========================================');
  console.log('  PDF 发票信息提取工具');
  console.log('==========================================');
  console.log(`\n📂 扫描文件夹: ${PDF_DIR}`);
  console.log('');

  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.log('⚠️  该文件夹中没有找到 PDF 文件');
    rl.close();
    return;
  }

  console.log(`📄 找到 ${files.length} 个 PDF 文件，开始处理...\n`);

  const results = [];
  let processed = 0;
  let failed = 0;

  for (const file of files) {
    const fullPath = path.join(PDF_DIR, file);

    // 1. 从文件名提取发票号
    const invoiceMatch = file.match(INVOICE_REGEX);
    const invoiceNo = invoiceMatch ? invoiceMatch[1] : '';

    // 2. 读取 PDF 内容提取订单号
    let orderNo = '';
    try {
      const text = await extractTextFromPdf(fullPath);
      const orderMatch = text.match(ORDER_REGEX);
      orderNo = orderMatch ? orderMatch[1] : '';
    } catch (e) {
      failed++;
      process.stdout.write(`  ⚠️ 读取失败: ${file}\n`);
    }

    results.push({ 文件名: file, 发票号码: invoiceNo, 订单号: orderNo });

    if (invoiceNo) {
      process.stdout.write(`✓ ${invoiceNo}`);
      if (orderNo) process.stdout.write(` → 订单号: ${orderNo}`);
      process.stdout.write('\n');
    } else {
      process.stdout.write(`✗ ${file} [发票号未匹配]\n`);
    }
    processed++;
  }

  // 3. 写入 Excel
  const ws = XLSX.utils.json_to_sheet(results);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '发票汇总');
  XLSX.writeFile(wb, OUTPUT_FILE);

  console.log('\n==========================================');
  console.log(`  处理完成！`);
  console.log('==========================================');
  console.log(`✅ 成功: ${processed - failed} 个`);
  if (failed > 0) console.log(`❌ 失败: ${failed} 个`);
  console.log(`📊 Excel 已保存: ${OUTPUT_FILE}`);
  console.log('\n按回车键退出...');

  rl.question('', () => {
    rl.close();
  });
}

main().catch(e => {
  console.error('程序出错:', e.message);
  process.exit(1);
});
