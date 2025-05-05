const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function makeTradingViewScreenshots() {
  const urls = {
    DXY: "https://www.tradingview.com/symbols/TVC-DXY/seasonals/",
    EURUSD: "https://www.tradingview.com/symbols/EURUSD/seasonals/",
    GBPUSD: "https://www.tradingview.com/symbols/GBPUSD/seasonals/",
    USDCAD: "https://www.tradingview.com/symbols/USDCAD/seasonals/",
    USDJPY: "https://www.tradingview.com/symbols/USDJPY/seasonals/",
    AUDUSD: "https://www.tradingview.com/symbols/AUDUSD/seasonals/",
    NQ: "https://www.tradingview.com/symbols/CME_MINI-NQ1%21/seasonals/",
    ES: "https://www.tradingview.com/symbols/NYSE-ES/seasonals/",
    US30: "https://www.tradingview.com/symbols/FX-US30/seasonals/",
    GOLD: "https://www.tradingview.com/symbols/XAUUSD/seasonals/",
    BTCUSD: "https://www.tradingview.com/symbols/BTCUSD/seasonals/",
    ETHUSD: "https://www.tradingview.com/symbols/ETHUSD/seasonals/",
  };

  const imagesDir = path.resolve(__dirname, "images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ["--window-size=1920,1080"],
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "dark" },
  ]);

  for (const [symbol, url] of Object.entries(urls)) {
    try {
      console.log(`🧭 Navigating to ${symbol}...`);
      await page.goto(url, { waitUntil: "networkidle2" });

      const selector = "div.js-symbol-page-tab-seasonals";
      await page.waitForSelector(selector, { visible: true });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const targetElement = await page.$(selector);
      if (targetElement) {
        const filename = path.join(
          imagesDir,
          `${symbol.toLowerCase()}-seasonal.png`
        );
        await targetElement.screenshot({ path: filename });
        console.log(`✅ Screenshot saved: ${filename}`);
      } else {
        console.error(`❌ Could not find chart container for ${symbol}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${symbol}:`, err.message);
    }
  }

  await browser.close();
  console.log("🎉 All screenshots saved in ./images/");
}

module.exports = { makeTradingViewScreenshots };
