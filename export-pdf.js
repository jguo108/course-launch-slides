/**
 * 导出幻灯片为 PDF
 * 使用 Puppeteer 渲染每张幻灯片并生成一份完整 PDF
 *
 * 使用方法：
 *   1. 先安装依赖: npm install puppeteer
 *   2. 运行: node export-pdf.js
 *   3. 输出: index.pdf
 */

const puppeteer = require('puppeteer');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, 'index.html');
const OUTPUT_PDF = path.resolve(__dirname, 'index.pdf');

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 设置视口为 1920×1080 以匹配幻灯片设计尺寸
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('加载幻灯片...');
  await page.goto('file://' + HTML_PATH, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // 获取总幻灯片数
  const totalSlides = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length;
  });
  console.log(`共 ${totalSlides} 张幻灯片`);

  // 等待所有 reveal 动画完成（如果有计时器延迟）
  await page.evaluate(() => {
    // 强制显示所有幻灯片及其内容
    document.querySelectorAll('.slide').forEach(s => {
      s.classList.add('active', 'visible');
    });
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('生成 PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    width: 1920,
    height: 1080,
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    displayHeaderFooter: false,
  });

  console.log(`PDF 已生成: ${OUTPUT_PDF}`);
  await browser.close();
})();
