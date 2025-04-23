import dotenv from "dotenv";
import fs from "fs";
import puppeteer, {
  BoundingBox,
  Browser,
  ElementHandle,
  Page,
} from "puppeteer";
import {
  AttachmentBuilder,
  Client,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
dotenv.config();
const url: string = process.env.PROFILE_LINK!;
const data: { last_length: number } = JSON.parse(
  fs.readFileSync("data.json", "utf8")
);

export async function screenshotReviews(client: Client): Promise<boolean> {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForSelector(".styles_cardWrapper__g8amG");
  const reviewElements: ElementHandle<Element>[] = await page.$$(
    ".styles_cardWrapper__g8amG"
  );

  console.log(`Found ${reviewElements.length} reviews.`);
  if (reviewElements.length === data.last_length) {
    await browser.close();
    return false;
  }

  // Get the newest review
  const element: ElementHandle = reviewElements[reviewElements.length - 1];

  // Check if it's a 5-star review
  const starImg: ElementHandle | null = await element.$(
    'img[alt="Rated 5 out of 5 stars"]'
  );
  if (!starImg) {
    console.log(`Latest review is not 5 stars. Skipping screenshot.`);
    await browser.close();
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

  const boundingBox: BoundingBox = (await element.boundingBox()) as BoundingBox;
  if (boundingBox) {
    await page.screenshot({
      path: `./images/review-${reviewElements.length}.png`,
      clip: {
        x: boundingBox.x - 10,
        y: boundingBox.y - 10,
        width: boundingBox.width + 20,
        height: boundingBox.height + 20,
      },
    });
  }

  await browser.close();

  const attachment = new AttachmentBuilder(
    `./images/review-${reviewElements.length}.png`,
    {
      name: `review-${reviewElements.length}.png`,
    }
  );
  const channel = client.channels.cache.get(
    process.env.CHANNEL1_ID!
  ) as TextChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setTitle(`⭐️ Review #${reviewElements.length}`)
      .setAuthor({
        name: client?.user?.username || "Screenshot bot",
        iconURL: client.user?.displayAvatarURL(),
      })
      .setDescription(
        `> ⭐️ New **5-star** review detected!\n> 🚀 Review number: ${reviewElements.length}\n> 🏅 Total reviews: ${reviewElements.length}`
      )
      .setThumbnail(client?.user?.displayAvatarURL() || null)
      .setFooter({
        text: "Student Review • Automated Review Notifications",
        iconURL: client.user?.displayAvatarURL(),
      })
      .setColor("#39FF14")
      .setImage(`attachment://review-${reviewElements.length}.png`);

    await channel.send({
      embeds: [embed],
      files: [attachment],
    });
  }

  return true;
}

export async function singlePreload(client: Client): Promise<boolean> {
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
    const starImg: ElementHandle | null = await element.$(
      'img[alt="Rated 5 out of 5 stars"]'
    );
    console.log(starImg);
    if (!starImg) {
      console.log(`Skipping review ${i + 1} — not 5 stars.`);
      continue;
    }
    const boundingBox: BoundingBox =
      (await element.boundingBox()) as BoundingBox;
    if (boundingBox) {
      await page.screenshot({
        path: `./images/review-${i + 1}.png`,
        clip: {
          x: boundingBox.x - 10,
          y: boundingBox.y - 10,
          width: boundingBox.width + 20,
          height: boundingBox.height + 20,
        },
      });
      console.log(`Saved screenshot: review-${i + 1}.png`);
    }
    const attachment = new AttachmentBuilder(`./images/review-${i + 1}.png`, {
      name: `review-${i + 1}.png`,
    });
    const channel = client.channels.cache.get(
      process.env.CHANNEL1_ID as string
    ) as TextChannel;
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle(`⭐️ Review #${i + 1}`)
        .setAuthor({
          name: client?.user?.username || "Screenshot bot",
          iconURL: client.user?.displayAvatarURL(),
        })
        .setDescription(
          `> ⭐️ New review detected!\n> 🚀 Review number: ${
            i + 1
          }\n> 🏅 Total reviews: ${reviewElements.length}`
        )
        .setThumbnail(client?.user?.displayAvatarURL() || null)
        .setFooter({
          text: "Student Review • Automated Review Notifications",
          iconURL: client.user?.displayAvatarURL(),
        })
        .setColor("#39FF14")
        .setImage(`attachment://review-${i + 1}.png`);

      await channel.send({
        embeds: [embed],
        files: [attachment],
      });
    }
  }

  await browser.close();
  return true;
}
