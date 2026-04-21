# -*- coding: utf-8 -*-
import os
import sys
import re
import io
import subprocess
from pypdf import PdfReader
from openpyxl import Workbook

# Windows UTF-8 mode
subprocess.run(['chcp', '65001'], shell=True)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 自动使用脚本所在目录
if getattr(sys, 'frozen', False):
    SCRIPT_DIR = os.path.dirname(sys.executable)
else:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    if not SCRIPT_DIR:
        SCRIPT_DIR = os.getcwd()

PDF_DIR = SCRIPT_DIR
OUTPUT_FILE = os.path.join(PDF_DIR, '发票汇总.xlsx')

# 发票号：从文件名头部提取 17 位数字
INVOICE_REGEX = re.compile(r'^(\d{17})')
# 订单号：从 PDF 文本中匹配 "260106-15位数字" 格式（备注在竖排版式中与订单号分行）
ORDER_REGEX = re.compile(r'(\d{6}-(?:\d{15}|\d{13,15}))')

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    page = reader.pages[0]
    return page.extract_text()

def main():
    print('=' * 45)
    print('  PDF 发票信息提取工具')
    print('=' * 45)
    print(f'\n📂 扫描文件夹: {PDF_DIR}')
    print('')

    files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]

    if not files:
        print('⚠️  该文件夹中没有找到 PDF 文件')
        input('\n按回车键退出...')
        return

    print(f'📄 找到 {len(files)} 个 PDF 文件，开始处理...\n')

    results = []
    processed = 0
    failed = 0

    for file in files:
        full_path = os.path.join(PDF_DIR, file)

        # 1. 从文件名提取发票号
        invoice_match = INVOICE_REGEX.match(file)
        invoice_no = invoice_match.group(1) if invoice_match else ''

        # 2. 读取 PDF 内容提取订单号
        order_no = ''
        try:
            text = extract_text_from_pdf(full_path)
            # 去掉所有空格（竖排PDF文本会拆散数字）
            text_clean = text.replace(' ', '')
            order_match = ORDER_REGEX.search(text_clean)
            if order_match:
                order_no = order_match.group(1)
        except Exception as e:
            failed += 1
            print(f'  ⚠️  读取失败: {file}')

        results.append({'文件名': file, '发票号码': invoice_no, '订单号': order_no})

        if invoice_no:
            print(f'✓ {invoice_no}', end='')
            if order_no:
                print(f' → 订单号: {order_no}', end='')
            print('')
        else:
            print(f'✗ {file} [发票号未匹配]')

        processed += 1

    # 3. 写入 Excel
    wb = Workbook()
    ws = wb.active
    ws.title = '发票汇总'
    ws.append(['文件名', '发票号码', '订单号'])

    for row in results:
        ws.append([row['文件名'], row['发票号码'], row['订单号']])

    wb.save(OUTPUT_FILE)

    print('\n' + '=' * 45)
    print('  处理完成！')
    print('=' * 45)
    print(f'✅ 成功: {processed - failed} 个')
    if failed > 0:
        print(f'❌ 失败: {failed} 个')
    print(f'📊 Excel 已保存: {OUTPUT_FILE}')
    print('\n按回车键退出...')
    try:
        input()
    except (EOFError, OSError):
        pass

if __name__ == '__main__':
    main()
