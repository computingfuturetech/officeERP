const puppeteer = require("puppeteer");

async function generatePdfFromHtml(html) {
  // Launch browser with specific arguments to handle PDF generation
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Create new page
  const page = await browser.newPage();

  // Set content with proper encoding
  await page.setContent(html, {
    waitUntil: "networkidle0",
    encoding: "utf-8",
  });

  // Generate PDF with buffer
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
    preferCSSPageSize: true,
  });

  // Close browser
  await browser.close();

  // returning the pdfBuffer
  return pdfBuffer;
}

module.exports = {
  generatePdfFromHtml,
};
