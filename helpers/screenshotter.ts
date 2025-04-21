import dotenv from "dotenv";
import fs from "fs";
import puppeteer, {
  BoundingBox,
  Browser,
  ElementHandle,
  Page,
} from "puppeteer";
dotenv.config();
const url: string = process.env.PROFILE_LINK as string;
const data: { last_length: number } = JSON.parse(
  fs.readFileSync("data.json", "utf8")
);

export async function screenshotReviews(): Promise<boolean> {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForSelector(".styles_cardWrapper__g8amG");
  const reviewElements: ElementHandle<Element>[] = await page.$$(
    ".styles_cardWrapper__g8amG"
  );

  console.log(`Found ${reviewElements.length} reviews.`);
  if (reviewElements.length === data.last_length) {
    return false;
  }
  data.last_length = reviewElements.length;
  fs.writeFile(
    "./data.json",
    JSON.stringify(data),
    (err: NodeJS.ErrnoException | null) => {
      if (err) {
        console.error(err);
      }
    }
  );

  const element: ElementHandle = reviewElements[reviewElements.length - 1];

  const boundingBox: BoundingBox = (await element.boundingBox()) as BoundingBox;
  if (boundingBox) {
    await page.screenshot({
      path: `review-${reviewElements.length}.png`,
      clip: {
        x: boundingBox.x - 10,
        y: boundingBox.y - 10,
        width: boundingBox.width + 20,
        height: boundingBox.height + 20,
      },
    });
  }

  await browser.close();
  return true;
}

export async function singlePreload(): Promise<boolean> {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector(".styles_cardWrapper__g8amG");

  const reviewElements: ElementHandle<Element>[] = await page.$$(
    ".styles_cardWrapper__g8amG"
  );

  console.log(`Found ${reviewElements.length} reviews.`);

  data.last_length = reviewElements.length;
  fs.writeFile(
    "./data.json",
    JSON.stringify(data),
    (err: NodeJS.ErrnoException | null) => {
      if (err) {
        console.error(err);
      }
    }
  );
  for (let i = 0; i < reviewElements.length; i++) {
    const element: ElementHandle = reviewElements[i];

    const boundingBox: BoundingBox =
      (await element.boundingBox()) as BoundingBox;
    if (boundingBox) {
      await page.screenshot({
        path: `review-${i + 1}.png`,
        clip: {
          x: boundingBox.x - 10,
          y: boundingBox.y - 10,
          width: boundingBox.width + 20,
          height: boundingBox.height + 20,
        },
      });
      console.log(`Saved screenshot: review-${i + 1}.png`);
    }
    // send all of these to discord.
  }

  await browser.close();
  return true;
}
