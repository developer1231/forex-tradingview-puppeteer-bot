"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshotReviews = screenshotReviews;
exports.singlePreload = singlePreload;
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
var puppeteer_1 = require("puppeteer");
var discord_js_1 = require("discord.js");
dotenv_1.config();
var url = process.env.PROFILE_LINK;
var data = JSON.parse(fs_1.readFileSync("data.json", "utf8"));
function screenshotReviews(client) {
  return __awaiter(this, void 0, void 0, function () {
    var browser,
      page,
      reviewElements,
      element,
      starImg,
      boundingBox,
      attachment,
      channel,
      embed;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          return [4 /*yield*/, puppeteer_1.launch({ headless: true })];
        case 1:
          browser = _e.sent();
          return [4 /*yield*/, browser.newPage()];
        case 2:
          page = _e.sent();
          return [4 /*yield*/, page.goto(url, { waitUntil: "networkidle2" })];
        case 3:
          _e.sent();
          return [
            4 /*yield*/,
            page.waitForSelector(".styles_cardWrapper__g8amG"),
          ];
        case 4:
          _e.sent();
          return [4 /*yield*/, page.$$(".styles_cardWrapper__g8amG")];
        case 5:
          reviewElements = _e.sent();
          console.log("Found ".concat(reviewElements.length, " reviews."));
          if (!(reviewElements.length === data.last_length))
            return [3 /*break*/, 7];
          return [4 /*yield*/, browser.close()];
        case 6:
          _e.sent();
          return [2 /*return*/, false];
        case 7:
          element = reviewElements[reviewElements.length - 1];
          return [4 /*yield*/, element.$('img[alt="Rated 5 out of 5 stars"]')];
        case 8:
          starImg = _e.sent();
          if (!!starImg) return [3 /*break*/, 10];
          console.log("Latest review is not 5 stars. Skipping screenshot.");
          return [4 /*yield*/, browser.close()];
        case 9:
          _e.sent();
          return [2 /*return*/, false];
        case 10:
          data.last_length = reviewElements.length;
          fs_1.writeFile("./data.json", JSON.stringify(data), function (err) {
            if (err) {
              console.error(err);
            }
          });
          return [4 /*yield*/, element.boundingBox()];
        case 11:
          boundingBox = _e.sent();
          if (!boundingBox) return [3 /*break*/, 13];
          return [
            4 /*yield*/,
            page.screenshot({
              path: "./images/review-".concat(reviewElements.length, ".png"),
              clip: {
                x: boundingBox.x - 10,
                y: boundingBox.y - 10,
                width: boundingBox.width + 20,
                height: boundingBox.height + 20,
              },
            }),
          ];
        case 12:
          _e.sent();
          _e.label = 13;
        case 13:
          return [4 /*yield*/, browser.close()];
        case 14:
          _e.sent();
          attachment = new discord_js_1.AttachmentBuilder(
            "./images/review-".concat(reviewElements.length, ".png"),
            {
              name: "review-".concat(reviewElements.length, ".png"),
            }
          );
          channel = client.channels.cache.get(process.env.CHANNEL1_ID);
          if (!channel) return [3 /*break*/, 16];
          embed = new discord_js_1.EmbedBuilder()
            .setTitle("\u2B50\uFE0F Review #".concat(reviewElements.length))
            .setAuthor({
              name:
                ((_a =
                  client === null || client === void 0
                    ? void 0
                    : client.user) === null || _a === void 0
                  ? void 0
                  : _a.username) || "Screenshot bot",
              iconURL:
                (_b = client.user) === null || _b === void 0
                  ? void 0
                  : _b.displayAvatarURL(),
            })
            .setDescription(
              "> \u2B50\uFE0F New **5-star** review detected!\n> \uD83D\uDE80 Review number: "
                .concat(
                  reviewElements.length,
                  "\n> \uD83C\uDFC5 Total reviews: "
                )
                .concat(reviewElements.length)
            )
            .setThumbnail(
              ((_c =
                client === null || client === void 0 ? void 0 : client.user) ===
                null || _c === void 0
                ? void 0
                : _c.displayAvatarURL()) || null
            )
            .setFooter({
              text: "Student Review • Automated Review Notifications",
              iconURL:
                (_d = client.user) === null || _d === void 0
                  ? void 0
                  : _d.displayAvatarURL(),
            })
            .setColor("#39FF14")
            .setImage(
              "attachment://review-".concat(reviewElements.length, ".png")
            );
          return [
            4 /*yield*/,
            channel.send({
              embeds: [embed],
              files: [attachment],
            }),
          ];
        case 15:
          _e.sent();
          _e.label = 16;
        case 16:
          return [2 /*return*/, true];
      }
    });
  });
}
function singlePreload(client) {
  return __awaiter(this, void 0, void 0, function () {
    var browser,
      page,
      reviewElements,
      i,
      element,
      starImg,
      boundingBox,
      attachment,
      channel,
      embed;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          return [4 /*yield*/, puppeteer_1.launch({ headless: true })];
        case 1:
          browser = _e.sent();
          return [4 /*yield*/, browser.newPage()];
        case 2:
          page = _e.sent();
          return [4 /*yield*/, page.goto(url, { waitUntil: "networkidle2" })];
        case 3:
          _e.sent();
          return [
            4 /*yield*/,
            page.waitForSelector(".styles_cardWrapper__g8amG"),
          ];
        case 4:
          _e.sent();
          return [4 /*yield*/, page.$$(".styles_cardWrapper__g8amG")];
        case 5:
          reviewElements = _e.sent();
          console.log("Found ".concat(reviewElements.length, " reviews."));
          data.last_length = reviewElements.length;
          fs_1.writeFile("./data.json", JSON.stringify(data), function (err) {
            if (err) {
              console.error(err);
            }
          });
          i = 0;
          _e.label = 6;
        case 6:
          if (!(i < reviewElements.length)) return [3 /*break*/, 13];
          element = reviewElements[i];
          return [4 /*yield*/, element.$('img[alt="Rated 5 out of 5 stars"]')];
        case 7:
          starImg = _e.sent();
          console.log(starImg);
          if (!starImg) {
            console.log(
              "Skipping review ".concat(i + 1, " \u2014 not 5 stars.")
            );
            return [3 /*break*/, 12];
          }
          return [4 /*yield*/, element.boundingBox()];
        case 8:
          boundingBox = _e.sent();
          if (!boundingBox) return [3 /*break*/, 10];
          return [
            4 /*yield*/,
            page.screenshot({
              path: "./images/review-".concat(i + 1, ".png"),
              clip: {
                x: boundingBox.x - 10,
                y: boundingBox.y - 10,
                width: boundingBox.width + 20,
                height: boundingBox.height + 20,
              },
            }),
          ];
        case 9:
          _e.sent();
          console.log("Saved screenshot: review-".concat(i + 1, ".png"));
          _e.label = 10;
        case 10:
          attachment = new discord_js_1.AttachmentBuilder(
            "./images/review-".concat(i + 1, ".png"),
            {
              name: "review-".concat(i + 1, ".png"),
            }
          );
          channel = client.channels.cache.get(process.env.CHANNEL1_ID);
          if (!channel) return [3 /*break*/, 12];
          embed = new discord_js_1.EmbedBuilder()
            .setTitle("\u2B50\uFE0F Review #".concat(i + 1))
            .setAuthor({
              name:
                ((_a =
                  client === null || client === void 0
                    ? void 0
                    : client.user) === null || _a === void 0
                  ? void 0
                  : _a.username) || "Screenshot bot",
              iconURL:
                (_b = client.user) === null || _b === void 0
                  ? void 0
                  : _b.displayAvatarURL(),
            })
            .setDescription(
              "> \u2B50\uFE0F New review detected!\n> \uD83D\uDE80 Review number: "
                .concat(i + 1, "\n> \uD83C\uDFC5 Total reviews: ")
                .concat(reviewElements.length)
            )
            .setThumbnail(
              ((_c =
                client === null || client === void 0 ? void 0 : client.user) ===
                null || _c === void 0
                ? void 0
                : _c.displayAvatarURL()) || null
            )
            .setFooter({
              text: "Student Review • Automated Review Notifications",
              iconURL:
                (_d = client.user) === null || _d === void 0
                  ? void 0
                  : _d.displayAvatarURL(),
            })
            .setColor("#39FF14")
            .setImage("attachment://review-".concat(i + 1, ".png"));
          return [
            4 /*yield*/,
            channel.send({
              embeds: [embed],
              files: [attachment],
            }),
          ];
        case 11:
          _e.sent();
          _e.label = 12;
        case 12:
          i++;
          return [3 /*break*/, 6];
        case 13:
          return [4 /*yield*/, browser.close()];
        case 14:
          _e.sent();
          return [2 /*return*/, true];
      }
    });
  });
}
