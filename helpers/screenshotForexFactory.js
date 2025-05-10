const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
async function makeWeeklyForexFactoryScreenshot() {
  const important = ["fomc", "speech", "speaks", "bank holiday"];

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: ["--window-size=1920,1080"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.forexfactory.com/calendar");

  await page.waitForSelector(".calendar__table");

  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
  }

  await autoScroll(page);

  const { kept, removed, results } = await page.evaluate(() => {
    const rows = document.querySelectorAll(".calendar__table tbody tr");
    let kept = 0;
    let removed = 0;
    const results = [];
    const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const pairs = ["EUR", "USD", "GBP", "AUD", "JPY", "CAD"];

    rows.forEach((row) => {
      const eventText = row.innerText.trim();
      const impactSpan = row.querySelector(".calendar__impact span");
      const isDateHeader = dates.some((day) => eventText.includes(day));
      const containsValidPair = pairs.some((pair) => eventText.includes(pair));

      if (isDateHeader) {
        if (
          !containsValidPair ||
          !impactSpan ||
          !(
            impactSpan.classList.contains("icon--ff-impact-red") ||
            impactSpan.classList.contains("icon--ff-impact-gra")
          )
        ) {
          const tds = row.querySelectorAll("td");
          tds.forEach((td) => {
            if (!td.classList.contains("calendar__date")) {
              td.innerHTML = "";
            }
          });
          results.push({ text: eventText, status: "date-header" });
          return;
        }
      }

      if (!containsValidPair) {
        removed++;
        results.push({ text: eventText, status: "invalid-currency" });
        row.remove();
        return;
      }

      if (
        !impactSpan ||
        !(
          impactSpan.classList.contains("icon--ff-impact-red") ||
          impactSpan.classList.contains("icon--ff-impact-gra")
        )
      ) {
        removed++;
        results.push({ text: eventText, status: "low-impact" });
        row.remove();
        return;
      }

      kept++;
      const impactClass = impactSpan.classList.contains("icon--ff-impact-red")
        ? "red"
        : impactSpan.classList.contains("icon--ff-impact-gra")
        ? "gray"
        : "none";

      results.push({ text: eventText, status: "kept", impact: impactClass });
    });

    return { kept, removed, results };
  });

  const impactCount = { red: 0, gray: 0 };
  const importantMentions = {
    fomc: 0,
    speaks: 0,
    speech: 0,
    "bank holiday": 0,
  };

  results.forEach((item) => {
    if (item.status === "kept") {
      const text = item.text.toLowerCase();
      if (item.impact === "red") impactCount.red++;
      if (item.impact === "gray") impactCount.gray++;
      important.forEach((word) => {
        if (text.includes(word)) {
          importantMentions[word]++;
        }
      });
    }
  });

  const calendarElement = await page.$(".calendar__table");
  if (calendarElement) {
    await calendarElement.screenshot({ path: "filtered_calendar.png" });
    console.log("Screenshot saved as filtered_calendar.png");
  } else {
    console.error("Could not find calendar element for screenshot.");
  }
  await browser.close();
  return [importantMentions, impactCount.red, impactCount.gray];
}
async function makeDailyForexScreenshot() {
  const important = ["fomc", "speech", "bank holiday"];

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 720 },
    args: ["--window-size=1280,720"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.forexfactory.com/calendar");

  await page.waitForSelector(".calendar__table");

  // Scroll to load all rows
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  const filteringResult = await page.evaluate(() => {
    const rows = document.querySelectorAll(".calendar__table tbody tr");
    const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const pairs = ["EUR", "USD", "GBP", "AUD", "JPY", "CAD"];
    let kept = 0;
    let removed = 0;
    const results = [];

    rows.forEach((row) => {
      const eventText = row.innerText.trim();
      const impactSpan = row.querySelector(".calendar__impact span");
      const isDateHeader = dates.some((day) => eventText.includes(day));
      const containsValidPair = pairs.some((pair) => eventText.includes(pair));

      if (isDateHeader) {
        if (
          !containsValidPair ||
          !impactSpan ||
          !(
            impactSpan.classList.contains("icon--ff-impact-red") ||
            impactSpan.classList.contains("icon--ff-impact-gra")
          )
        ) {
          const tds = row.querySelectorAll("td");
          tds.forEach((td) => {
            if (!td.classList.contains("calendar__date")) {
              td.innerHTML = "";
            }
          });
          results.push({ text: eventText, status: "date-header" });
          return;
        }
      }

      if (!containsValidPair) {
        removed++;
        row.remove();
        return;
      }

      if (
        !impactSpan ||
        !(
          impactSpan.classList.contains("icon--ff-impact-red") ||
          impactSpan.classList.contains("icon--ff-impact-gra")
        )
      ) {
        removed++;
        row.remove();
        return;
      }

      kept++;
    });

    return { kept, removed };
  });

  // Now isolate only today's filtered content
  const screenshotSuccess = await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll(".calendar__table tbody tr")
    );
    const dates = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const todayName = dates[today.getDay()];
    const todayDate =
      today.toLocaleString("default", { month: "short" }) +
      " " +
      today.getDate();

    let startIdx = -1;
    let endIdx = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const span = rows[i].querySelector(".date");
      if (
        span &&
        span.innerText.includes(todayName) &&
        span.innerText.includes(todayDate)
      ) {
        startIdx = i;
        break;
      }
    }

    if (startIdx === -1) return false;

    for (let i = startIdx + 1; i < rows.length; i++) {
      const span = rows[i].querySelector(".date");
      if (span) {
        endIdx = i;
        break;
      }
    }

    const container = document.createElement("div");
    container.setAttribute("id", "screenshot-container");
    container.style.border = "2px solid #000";
    container.style.background = "#fff";
    container.style.padding = "10px";
    container.style.width = "100%";

    for (let i = startIdx; i < endIdx; i++) {
      container.appendChild(rows[i].cloneNode(true));
    }

    document.body.innerHTML = "";
    document.body.appendChild(container);
    return true;
  });

  if (screenshotSuccess) {
    const container = await page.$("#screenshot-container");
    if (container) {
      await container.screenshot({ path: "daily_calendar.png" });
      console.log("Screenshot saved as daily_calendar.png");
    } else {
      console.error("Failed to capture daily section.");
    }
  } else {
    console.error("Could not find today’s section in the calendar.");
  }

  await browser.close();
}

module.exports = { makeWeeklyForexFactoryScreenshot, makeDailyForexScreenshot };
