import path from "path";
import fs from "fs";
import zlib from "zlib";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import sharp from "sharp";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.join(__dirname, "db.json");
const DEFAULT_BANNER_REL_PATH = "/assets/osint_bot_banner_1791447498565.jpg";
const DEFAULT_BANNER_DISK_PATH = path.join(__dirname, "assets/osint_bot_banner_1791447498565.jpg");
const CUSTOM_BANNER_REL_PATH = "/assets/custom_start_banner.jpg";
const CUSTOM_BANNER_DISK_PATH = path.join(__dirname, "assets/custom_start_banner.jpg");
const DEFAULT_QR_REL_PATH = "/assets/premium_upi_qr_1791448449822.jpg";
const DEFAULT_QR_DISK_PATH = path.join(__dirname, "assets/premium_upi_qr_1791448449822.jpg");
const CUSTOM_QR_REL_PATH = "/assets/custom_premium_qr.jpg";
const CUSTOM_QR_DISK_PATH = path.join(__dirname, "assets/custom_premium_qr.jpg");
const BANNER_WIDTH = 1376;
const BANNER_HEIGHT = 768;
const QR_SIZE = 1024;
const DEFAULT_BOT_TOKEN = "8832808711:AAEhkaxlliKaZLk9dUmtDmSVOG6SaojGvxI";
const DEFAULT_OWNER_USERNAME = "";
const DEFAULT_ADMIN_IDS = ["6672896116", "7247666284"];
const DEFAULT_NUMBER_API_URL = "https://sized-reviewed-across-nerve.trycloudflare.com/num/{query}?key=napi_9jgctjUU042SKuzhsiFrb9ha3pzwufCHzwqZsw";
const FALLBACK_NUMBER_API_URL = "http://rajfflivebot.onrender.com/pub/rajfflive/api?num={query}&key=RAJBOTSOFC";
const DEFAULT_AADHAAR_API_URL = "http://rajfflivebot.onrender.com/pub/rajfflive/adhar?adhar={query}&key=RAJBOTSOFC";
const DEFAULT_CUSTOM_EMOJIS = {
  num: "5409357944619802453",
  // 📱 Mobile
  aadhaar: "5418115271267197333",
  // 🪪 ID Card
  premium: "5357107601584693888",
  // 👑 Crown
  refer: "5309958691854754293",
  // 💎 Gem / Gift
  channel: "5309984423003823246",
  // 📣 Megaphone
  help: "5417915203100613993",
  // 💬 Chat / Guide
  close: "5379748062124056162",
  // ❗️ Close / Back
  verify: "5237699328843200968",
  // ✅ Verify
  bolt: "5312016608254762256",
  // ⚡️ Lightning
  bot: "5309832892262654231",
  // 🤖 Bot
  search: "5309965701241379366",
  // 🔎 Search
  fire: "5312241539987020022",
  // 🔥 Fire
  money: "5350452584119279096",
  // 💰 Money
  coin: "5377690785674175481"
  // 🪙 Coin
};
const DEFAULT_PAYMENT_API_KEY = "PAY7E2B0B6556E10671E2F47212";
const DEFAULT_PAYMENT_UPI_ID = "paytm.s1dw5n0@pty";
const DEFAULT_PAYMENT_MERCHANT = "VC GATEWAY";
function getTodayDateString() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function normalizeApiTemplateUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_NUMBER_API_URL;
  if (trimmed.includes("{query}")) return trimmed;
  const replacedPath = trimmed.replace(/\/(\d{10,12})(\?|$)/, "/{query}$2");
  if (replacedPath !== trimmed) return replacedPath;
  const replacedParam = trimmed.replace(
    /([?&](?:num|number|phone|mobile|adhar|aadhar|aadhaar|query)=)(\d{10,12})/i,
    "$1{query}"
  );
  if (replacedParam !== trimmed) return replacedParam;
  return trimmed;
}
function loadStore() {
  const defaultStore = {
    config: {
      botToken: DEFAULT_BOT_TOKEN,
      ownerUsername: DEFAULT_OWNER_USERNAME,
      adminIds: [...DEFAULT_ADMIN_IDS],
      numberApiUrl: DEFAULT_NUMBER_API_URL,
      aadhaarApiUrl: DEFAULT_AADHAAR_API_URL,
      aadhaarComingSoon: true,
      forceJoinEnabled: true,
      channelUsername: "@Toxicexploit",
      channelUrl: "https://t.me/Toxicexploit",
      secondChannelUsername: "@followxpresss",
      secondChannelUrl: "https://t.me/followxpresss",
      dailyFreeLimit: 3,
      referralBonusCredits: 2,
      premiumWeeklyPrice: "\u20B949 / 7 Days",
      premiumMonthlyPrice: "\u20B9149 / 30 Days",
      premiumLifetimePrice: "\u20B9499 / Lifetime",
      premiumPaymentNote: "Auto-Generate QR & Instant Auto-Verify via UPI",
      paymentApiKey: DEFAULT_PAYMENT_API_KEY,
      paymentUpiId: DEFAULT_PAYMENT_UPI_ID,
      paymentMerchantName: DEFAULT_PAYMENT_MERCHANT,
      verifiedOrderIds: [],
      cachedBannerFileId: "",
      customBannerImageUrl: "",
      cachedQrFileId: "",
      customQrImageUrl: "",
      buttonCustomEmojis: { ...DEFAULT_CUSTOM_EMOJIS }
    },
    users: {},
    history: []
  };
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
      const rawNumUrl = raw.config?.numberApiUrl || "";
      const resolvedNumApi = !rawNumUrl || rawNumUrl.includes("rajfflivebot.onrender.com") ? DEFAULT_NUMBER_API_URL : normalizeApiTemplateUrl(rawNumUrl);
      const mergedConfig = {
        ...defaultStore.config,
        ...raw.config || {},
        botToken: DEFAULT_BOT_TOKEN,
        ownerUsername: "",
        numberApiUrl: resolvedNumApi,
        aadhaarComingSoon: typeof raw.config?.aadhaarComingSoon === "boolean" ? raw.config.aadhaarComingSoon : true,
        secondChannelUsername: raw.config?.secondChannelUsername || "@followxpresss",
        secondChannelUrl: raw.config?.secondChannelUrl || "https://t.me/followxpresss",
        premiumWeeklyPrice: raw.config?.premiumWeeklyPrice || "\u20B949 / 7 Days",
        premiumMonthlyPrice: raw.config?.premiumMonthlyPrice || "\u20B9149 / 30 Days",
        premiumLifetimePrice: raw.config?.premiumLifetimePrice || "\u20B9499 / Lifetime",
        premiumPaymentNote: raw.config?.premiumPaymentNote || "Auto-Generate QR & Instant Auto-Verify via UPI",
        paymentApiKey: !raw.config?.paymentApiKey || raw.config?.paymentApiKey === "PAY17EC7874F4DB180383022246" ? DEFAULT_PAYMENT_API_KEY : raw.config.paymentApiKey,
        paymentUpiId: !raw.config?.paymentUpiId || raw.config?.paymentUpiId === "mrskumari8593@naviaxis" ? DEFAULT_PAYMENT_UPI_ID : raw.config.paymentUpiId,
        paymentMerchantName: raw.config?.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT,
        verifiedOrderIds: Array.isArray(raw.config?.verifiedOrderIds) ? raw.config.verifiedOrderIds : [],
        buttonCustomEmojis: raw.config?.buttonCustomEmojis?.aadhaar === "5373141891321699086" ? { ...DEFAULT_CUSTOM_EMOJIS } : {
          ...DEFAULT_CUSTOM_EMOJIS,
          ...raw.config?.buttonCustomEmojis || {}
        }
      };
      if (!Array.isArray(mergedConfig.adminIds)) {
        mergedConfig.adminIds = [...DEFAULT_ADMIN_IDS];
      }
      for (const id of DEFAULT_ADMIN_IDS) {
        if (!mergedConfig.adminIds.includes(id)) {
          mergedConfig.adminIds.push(id);
        }
      }
      const users = {};
      if (raw.users && typeof raw.users === "object") {
        for (const [id, u] of Object.entries(raw.users)) {
          users[id] = {
            telegramId: String(u.telegramId || id),
            username: String(u.username || ""),
            firstName: String(u.firstName || "User"),
            joinedAt: String(u.joinedAt || (/* @__PURE__ */ new Date()).toISOString()),
            lastActiveAt: String(u.lastActiveAt || (/* @__PURE__ */ new Date()).toISOString()),
            joinedChannel: Boolean(u.joinedChannel),
            credits: typeof u.credits === "number" ? u.credits : 0,
            dailySearchDate: String(u.dailySearchDate || getTodayDateString()),
            dailySearchCount: typeof u.dailySearchCount === "number" ? u.dailySearchCount : 0,
            totalLookups: typeof u.totalLookups === "number" ? u.totalLookups : 0,
            referredBy: u.referredBy ? String(u.referredBy) : null,
            referralCount: typeof u.referralCount === "number" ? u.referralCount : 0,
            isBanned: Boolean(u.isBanned),
            premiumUntil: u.premiumUntil || null,
            awaitingInput: null,
            lastBotMessageId: u.lastBotMessageId || null,
            lastBotMessageIsPhoto: Boolean(u.lastBotMessageIsPhoto),
            lastBotPhotoKind: u.lastBotPhotoKind || "banner",
            lastLookupSession: u.lastLookupSession || null,
            activePaymentOrder: u.activePaymentOrder || null,
            keyboardCleared: false
          };
        }
      }
      return {
        config: mergedConfig,
        users,
        history: Array.isArray(raw.history) ? raw.history.slice(0, 200) : []
      };
    }
  } catch (err) {
    console.warn("Failed to load store, using defaults:", err);
  }
  return defaultStore;
}
const store = loadStore();
function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save store:", err);
  }
}
saveStore();
const SANS_BOLD_MAP = {
  A: "\u{1D5D4}",
  B: "\u{1D5D5}",
  C: "\u{1D5D6}",
  D: "\u{1D5D7}",
  E: "\u{1D5D8}",
  F: "\u{1D5D9}",
  G: "\u{1D5DA}",
  H: "\u{1D5DB}",
  I: "\u{1D5DC}",
  J: "\u{1D5DD}",
  K: "\u{1D5DE}",
  L: "\u{1D5DF}",
  M: "\u{1D5E0}",
  N: "\u{1D5E1}",
  O: "\u{1D5E2}",
  P: "\u{1D5E3}",
  Q: "\u{1D5E4}",
  R: "\u{1D5E5}",
  S: "\u{1D5E6}",
  T: "\u{1D5E7}",
  U: "\u{1D5E8}",
  V: "\u{1D5E9}",
  W: "\u{1D5EA}",
  X: "\u{1D5EB}",
  Y: "\u{1D5EC}",
  Z: "\u{1D5ED}",
  a: "\u{1D5EE}",
  b: "\u{1D5EF}",
  c: "\u{1D5F0}",
  d: "\u{1D5F1}",
  e: "\u{1D5F2}",
  f: "\u{1D5F3}",
  g: "\u{1D5F4}",
  h: "\u{1D5F5}",
  i: "\u{1D5F6}",
  j: "\u{1D5F7}",
  k: "\u{1D5F8}",
  l: "\u{1D5F9}",
  m: "\u{1D5FA}",
  n: "\u{1D5FB}",
  o: "\u{1D5FC}",
  p: "\u{1D5FD}",
  q: "\u{1D5FE}",
  r: "\u{1D5FF}",
  s: "\u{1D600}",
  t: "\u{1D601}",
  u: "\u{1D602}",
  v: "\u{1D603}",
  w: "\u{1D604}",
  x: "\u{1D605}",
  y: "\u{1D606}",
  z: "\u{1D607}",
  "0": "\u{1D7EC}",
  "1": "\u{1D7ED}",
  "2": "\u{1D7EE}",
  "3": "\u{1D7EF}",
  "4": "\u{1D7F0}",
  "5": "\u{1D7F1}",
  "6": "\u{1D7F2}",
  "7": "\u{1D7F3}",
  "8": "\u{1D7F4}",
  "9": "\u{1D7F5}"
};
const SANS_THIN_MAP = {
  A: "\u{1D5A0}",
  B: "\u{1D5A1}",
  C: "\u{1D5A2}",
  D: "\u{1D5A3}",
  E: "\u{1D5A4}",
  F: "\u{1D5A5}",
  G: "\u{1D5A6}",
  H: "\u{1D5A7}",
  I: "\u{1D5A8}",
  J: "\u{1D5A9}",
  K: "\u{1D5AA}",
  L: "\u{1D5AB}",
  M: "\u{1D5AC}",
  N: "\u{1D5AD}",
  O: "\u{1D5AE}",
  P: "\u{1D5AF}",
  Q: "\u{1D5B0}",
  R: "\u{1D5B1}",
  S: "\u{1D5B2}",
  T: "\u{1D5B3}",
  U: "\u{1D5B4}",
  V: "\u{1D5B5}",
  W: "\u{1D5B6}",
  X: "\u{1D5B7}",
  Y: "\u{1D5B8}",
  Z: "\u{1D5B9}",
  a: "\u{1D5BA}",
  b: "\u{1D5BB}",
  c: "\u{1D5BC}",
  d: "\u{1D5BD}",
  e: "\u{1D5BE}",
  f: "\u{1D5BF}",
  g: "\u{1D5C0}",
  h: "\u{1D5C1}",
  i: "\u{1D5C2}",
  j: "\u{1D5C3}",
  k: "\u{1D5C4}",
  l: "\u{1D5C5}",
  m: "\u{1D5C6}",
  n: "\u{1D5C7}",
  o: "\u{1D5C8}",
  p: "\u{1D5C9}",
  q: "\u{1D5CA}",
  r: "\u{1D5CB}",
  s: "\u{1D5CC}",
  t: "\u{1D601}",
  u: "\u{1D5CE}",
  v: "\u{1D5CF}",
  w: "\u{1D5D0}",
  x: "\u{1D5D1}",
  y: "\u{1D5D2}",
  z: "\u{1D5D3}"
};
function toBoldSans(text) {
  return String(text || "").split("").map((ch) => SANS_BOLD_MAP[ch] || ch).join("");
}
function toThinSans(text) {
  return String(text || "").split("").map((ch) => SANS_THIN_MAP[ch] || ch).join("");
}
function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function isAdminUser(telegramId, _username) {
  const idStr = String(telegramId);
  return store.config.adminIds.includes(idStr);
}
function isUserPremium(user) {
  if (isAdminUser(user.telegramId, user.username)) return true;
  if (!user.premiumUntil) return false;
  return new Date(user.premiumUntil).getTime() > Date.now();
}
function refreshDailyQuota(user) {
  const today = getTodayDateString();
  if (user.dailySearchDate !== today) {
    user.dailySearchDate = today;
    user.dailySearchCount = 0;
  }
}
function getRemainingDailyFree(user) {
  refreshDailyQuota(user);
  return Math.max(0, store.config.dailyFreeLimit - user.dailySearchCount);
}
function getOrCreateUser(from, startPayload) {
  const id = String(from.id);
  const username = from.username ? String(from.username) : "";
  const firstName = from.first_name ? String(from.first_name) : "User";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let isNew = false;
  let referrerId = null;
  if (!store.users[id]) {
    isNew = true;
    if (startPayload && startPayload.startsWith("ref_")) {
      const candidateId = startPayload.replace("ref_", "").trim();
      if (candidateId && candidateId !== id && store.users[candidateId]) {
        referrerId = candidateId;
      }
    }
    store.users[id] = {
      telegramId: id,
      username,
      firstName,
      joinedAt: now,
      lastActiveAt: now,
      joinedChannel: false,
      credits: 0,
      dailySearchDate: getTodayDateString(),
      dailySearchCount: 0,
      totalLookups: 0,
      referredBy: referrerId,
      referralCount: 0,
      isBanned: false,
      premiumUntil: null,
      awaitingInput: null,
      lastBotMessageId: null,
      lastBotMessageIsPhoto: false,
      lastBotPhotoKind: "banner",
      lastLookupSession: null,
      keyboardCleared: false
    };
    if (referrerId && store.users[referrerId]) {
      store.users[referrerId].referralCount += 1;
      store.users[referrerId].credits += store.config.referralBonusCredits;
    }
  } else {
    store.users[id].username = username || store.users[id].username;
    store.users[id].firstName = firstName || store.users[id].firstName;
    store.users[id].lastActiveAt = now;
    refreshDailyQuota(store.users[id]);
  }
  saveStore();
  return { user: store.users[id], isNew, referrerId };
}
function findUserByIdentifier(identifier) {
  const clean = identifier.trim().replace(/^@/, "").toLowerCase();
  if (store.users[clean]) return store.users[clean];
  for (const u of Object.values(store.users)) {
    if (u.telegramId === clean || u.username && u.username.toLowerCase() === clean) {
      return u;
    }
  }
  return null;
}
const IGNORED_KEYS = /* @__PURE__ */ new Set([
  "credit",
  "credits",
  "developer",
  "dev",
  "owner",
  "channel",
  "telegram",
  "join",
  "support",
  "api_owner",
  "powered_by",
  "author",
  "bot",
  "status",
  "success",
  "code",
  "message",
  "msg",
  "response_time",
  "time",
  "count",
  "total",
  "search_time",
  "server",
  "version",
  "copyright",
  "By",
  "by",
  "record",
  "result",
  "index",
  "result_count"
]);
function cleanAddress(raw) {
  if (!raw) return "";
  return raw.replace(/!+/g, ", ").replace(/\s*,\s*,+/g, ", ").replace(/,\s*$/g, "").replace(/^\s*,/g, "").replace(/\s{2,}/g, " ").trim();
}
function extractRecordsFromPayload(payload, fallbackQuery) {
  if (!payload) return [];
  let candidates = [];
  if (Array.isArray(payload)) {
    candidates = payload;
  } else if (typeof payload === "object") {
    const arrayKeys = ["data", "result", "results", "records", "info", "details", "response", "items"];
    for (const k of arrayKeys) {
      if (Array.isArray(payload[k])) {
        candidates = payload[k];
        break;
      } else if (payload[k] && typeof payload[k] === "object" && !Array.isArray(payload[k])) {
        let foundNestedArray = false;
        for (const nk of arrayKeys) {
          if (Array.isArray(payload[k][nk])) {
            candidates = payload[k][nk];
            foundNestedArray = true;
            break;
          }
        }
        if (!foundNestedArray) {
          candidates = [payload[k]];
        }
        break;
      }
    }
    if (candidates.length === 0) {
      candidates = [payload];
    }
  }
  const parsed = [];
  const seenSignatures = /* @__PURE__ */ new Set();
  for (const item of candidates) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const getField = (keys) => {
      for (const k of keys) {
        for (const [objKey, val] of Object.entries(item)) {
          if (objKey.toLowerCase() === k.toLowerCase() && val !== null && val !== void 0) {
            const s = String(val).trim();
            if (s && !["n/a", "na", "null", "undefined", "none"].includes(s.toLowerCase())) {
              return s;
            }
          }
        }
      }
      return "";
    };
    const name = getField(["name", "full_name", "fullname", "user_name", "username", "customer_name", "cname", "subscriber"]);
    const fatherName = getField(["fname", "father_name", "father", "fathername", "f_name", "care_of", "co", "guardian"]);
    const phone = getField(["mobile", "phone", "number", "num", "msisdn", "contact", "mob", "telephone"]) || fallbackQuery;
    const altPhone = getField(["alt", "alt_mobile", "alternate_mobile", "alt_num", "alt_phone", "other_phone", "secondary_phone"]);
    const carrier = getField(["circle", "operator", "carrier", "network", "telecom", "provider", "state", "sim"]);
    const email = getField(["email", "mail", "email_id", "e_mail"]);
    const rawAddr = getField(["address", "addr", "full_address", "local_address", "permanent_address", "location_address", "city"]);
    const address = cleanAddress(rawAddr);
    const aadhaarId = getField(["id", "aadhar", "aadhaar", "uid", "aadhar_no", "aadhaar_no", "doc_id", "id_number"]);
    const additionalFields = {};
    const mappedKeys = /* @__PURE__ */ new Set([
      "name",
      "full_name",
      "fullname",
      "user_name",
      "username",
      "customer_name",
      "cname",
      "subscriber",
      "fname",
      "father_name",
      "father",
      "fathername",
      "f_name",
      "care_of",
      "co",
      "guardian",
      "mobile",
      "phone",
      "number",
      "num",
      "msisdn",
      "contact",
      "mob",
      "telephone",
      "alt",
      "alt_mobile",
      "alternate_mobile",
      "alt_num",
      "alt_phone",
      "other_phone",
      "secondary_phone",
      "circle",
      "operator",
      "carrier",
      "network",
      "telecom",
      "provider",
      "state",
      "sim",
      "email",
      "mail",
      "email_id",
      "e_mail",
      "address",
      "addr",
      "full_address",
      "local_address",
      "permanent_address",
      "location_address",
      "city",
      "id",
      "aadhar",
      "aadhaar",
      "uid",
      "aadhar_no",
      "aadhaar_no",
      "doc_id",
      "id_number"
    ]);
    for (const [k, v] of Object.entries(item)) {
      const lower = k.toLowerCase();
      if (mappedKeys.has(lower) || IGNORED_KEYS.has(lower) || IGNORED_KEYS.has(k)) continue;
      if (v !== null && v !== void 0 && typeof v !== "object") {
        const strVal = String(v).trim();
        if (strVal && !strVal.toLowerCase().includes("t.me/") && !strVal.toLowerCase().includes("@")) {
          additionalFields[k] = strVal;
        }
      }
    }
    if (!name && !fatherName && !address && !carrier && !aadhaarId && Object.keys(additionalFields).length === 0) {
      continue;
    }
    const sig = `${name.toLowerCase()}|${phone}|${fatherName.toLowerCase()}|${address.toLowerCase()}`;
    if (seenSignatures.has(sig)) continue;
    seenSignatures.add(sig);
    parsed.push({
      name: name || "Unknown",
      fatherName: fatherName || "None",
      phone: phone || fallbackQuery,
      altPhone: altPhone || "None",
      carrier: carrier || "None",
      email: email || "None",
      address: address || "None",
      aadhaarId: aadhaarId || (fallbackQuery.length === 12 ? fallbackQuery : "None"),
      location: carrier || address || "India",
      lineType: "Mobile / GSM",
      spamStatus: "Verified Clean",
      additionalFields
    });
  }
  return parsed;
}
const WIDE_TOP_BORDER = `\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E`;
const WIDE_BOT_BORDER = `\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F`;
function formatPaginatedRecordCaption(serviceType, query, records, pageIndex) {
  const header = serviceType === "num_aadhaar" ? `\u2261 \u{1F4A0} ${toBoldSans("AADHAAR TO INFO")} \u{1F50D}` : `\u2261 \u{1F4DE} ${toBoldSans("NUMBER TO INFO")} \u26A1`;
  if (records.length === 0) {
    return [
      header,
      WIDE_TOP_BORDER,
      `\u{1F440} ${toBoldSans("Query")} \u27A9 <code>${escapeHtml(query)}</code>`,
      `\u26A0\uFE0F ${toBoldSans("Status")} \u27A9 ${toThinSans("No matching records found in database")}`,
      WIDE_BOT_BORDER
    ].join("\n");
  }
  const safeIndex = Math.max(0, Math.min(pageIndex, records.length - 1));
  const rec = records[safeIndex];
  const recLines = [header];
  recLines.push(WIDE_TOP_BORDER);
  if (records.length > 1) {
    recLines.push(`\u{1F4C2} ${toBoldSans(`Record #${safeIndex + 1} of ${records.length}`)}`);
  }
  recLines.push(`\u{1F947} ${toBoldSans("Name")} \u27A9 ${escapeHtml(toThinSans(rec.name || "None"))}`);
  recLines.push(`\u{1F44D} ${toBoldSans("Father's Name")} \u27A9 ${escapeHtml(toThinSans(rec.fatherName || "None"))}`);
  recLines.push(`\u{1F440} ${toBoldSans("Mobile")} \u27A9 <code>${escapeHtml(rec.phone || query)}</code>`);
  recLines.push(`\u260E\uFE0F ${toBoldSans("Alt Mob")} \u27A9 ${escapeHtml(rec.altPhone === "None" ? toThinSans("None") : rec.altPhone)}`);
  recLines.push(`\u{1F6A8} ${toBoldSans("Circle")} \u27A9 ${escapeHtml(toThinSans(rec.carrier || "None"))}`);
  recLines.push(`\u{1F4AC} ${toBoldSans("Email")} \u27A9 ${escapeHtml(toThinSans(rec.email || "None"))}`);
  if (rec.aadhaarId && rec.aadhaarId !== "None") {
    recLines.push(`\u{1F194} ${toBoldSans("Aadhaar ID")} \u27A9 <code>${escapeHtml(rec.aadhaarId)}</code>`);
  }
  recLines.push(`\u{1F3E0} ${toBoldSans("Address")} \u27A9 ${escapeHtml(toThinSans(rec.address || "None"))}`);
  for (const [extraKey, extraVal] of Object.entries(rec.additionalFields)) {
    const niceLabel = extraKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    recLines.push(`\u{1F539} ${toBoldSans(niceLabel)} \u27A9 ${escapeHtml(toThinSans(extraVal))}`);
  }
  recLines.push(WIDE_BOT_BORDER);
  const joined = recLines.join("\n");
  return joined.length > 1020 ? joined.slice(0, 1015) + "..." : joined;
}
function formatOsintResultCard(serviceType, query, records) {
  return formatPaginatedRecordCaption(serviceType, query, records, 0);
}
async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (compatible; OSINTBot/2.0)"
      }
    });
    const rawText = await resp.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
    return { ok: resp.ok, status: resp.status, data, rawText };
  } finally {
    clearTimeout(timer);
  }
}
async function performOsintLookup(serviceType, rawQuery) {
  const digits = rawQuery.replace(/\D/g, "");
  let cleanQuery = digits;
  if (serviceType === "number_info") {
    if (digits.length === 12 && digits.startsWith("91")) {
      cleanQuery = digits.slice(2);
    } else if (digits.length > 10) {
      cleanQuery = digits.slice(-10);
    }
  }
  let records = [];
  let rawSanitized = {};
  let upstreamStatus = "200 OK";
  if (serviceType === "num_aadhaar") {
    const template = normalizeApiTemplateUrl(store.config.aadhaarApiUrl);
    const targetUrl = template.replace("{query}", encodeURIComponent(cleanQuery));
    try {
      const res = await fetchJsonWithTimeout(targetUrl, 25e3);
      upstreamStatus = `${res.status}`;
      if (res.data) {
        records = extractRecordsFromPayload(res.data, cleanQuery);
        rawSanitized = res.data;
      }
    } catch (err) {
      upstreamStatus = err?.name === "AbortError" ? "Upstream Timeout" : "Fetch Error";
    }
  } else {
    const template = normalizeApiTemplateUrl(store.config.numberApiUrl);
    const primaryUrl = template.replace("{query}", encodeURIComponent(cleanQuery));
    try {
      const primaryRes = await fetchJsonWithTimeout(primaryUrl, 22e3).catch(() => null);
      if (primaryRes && primaryRes.data) {
        records = extractRecordsFromPayload(primaryRes.data, cleanQuery);
        rawSanitized = primaryRes.data;
        upstreamStatus = `${primaryRes.status} (Primary)`;
      }
      if (records.length === 0 && !primaryUrl.includes("rajfflivebot.onrender.com")) {
        const fallbackUrl = FALLBACK_NUMBER_API_URL.replace("{query}", encodeURIComponent(cleanQuery));
        const fallbackRes = await fetchJsonWithTimeout(fallbackUrl, 18e3).catch(() => null);
        if (fallbackRes && fallbackRes.data) {
          records = extractRecordsFromPayload(fallbackRes.data, cleanQuery);
          rawSanitized = fallbackRes.data;
          upstreamStatus = `${fallbackRes.status} (Fallback)`;
        }
      }
    } catch (err) {
      upstreamStatus = "Upstream Error";
    }
  }
  const sanitizeObj = (obj) => {
    if (Array.isArray(obj)) return obj.map(sanitizeObj);
    if (obj && typeof obj === "object") {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (IGNORED_KEYS.has(k.toLowerCase()) || IGNORED_KEYS.has(k)) continue;
        out[k] = sanitizeObj(v);
      }
      return out;
    }
    return obj;
  };
  const cleanJsonStr = JSON.stringify(sanitizeObj(rawSanitized), null, 2);
  const formattedHtml = formatOsintResultCard(serviceType, cleanQuery, records);
  const status = records.length > 0 ? "success" : "not_found";
  return {
    status,
    cleanQuery,
    records,
    formattedHtml,
    rawSanitizedJson: cleanJsonStr,
    upstreamStatus
  };
}
let botUsernameCache = "HexxOsint_bot";
let botFirstNameCache = "HEX OSINT Bot";
let pollingActive = false;
let pollOffset = 0;
function stripCustomEmojiIdsFromMarkup(replyMarkup) {
  if (!replyMarkup || !Array.isArray(replyMarkup.inline_keyboard)) return replyMarkup;
  return {
    ...replyMarkup,
    inline_keyboard: replyMarkup.inline_keyboard.map(
      (row) => row.map((btn) => {
        const { icon_custom_emoji_id, ...rest } = btn;
        return rest;
      })
    )
  };
}
function stripCustomEmojiTags(html) {
  if (!html) return html;
  return html.replace(/<tg-emoji[^>]*>([\s\S]*?)<\/tg-emoji>/gi, "$1");
}
async function tgApi(method, body = {}) {
  const token = store.config.botToken.trim();
  if (!token) return { ok: false, description: "No bot token configured" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const rawText = await res.text();
    if (!rawText || rawText.trim().startsWith("<")) {
      return { ok: false, description: "Non-JSON response from Telegram API" };
    }
    const data = JSON.parse(rawText);
    if (!data?.ok && typeof data?.description === "string" && (data.description.includes("CUSTOM_EMOJI") || data.description.includes("DOCUMENT_INVALID"))) {
      const fallbackBody = { ...body };
      if (fallbackBody.reply_markup) {
        fallbackBody.reply_markup = stripCustomEmojiIdsFromMarkup(fallbackBody.reply_markup);
      }
      if (typeof fallbackBody.caption === "string") {
        fallbackBody.caption = stripCustomEmojiTags(fallbackBody.caption);
      }
      if (typeof fallbackBody.text === "string") {
        fallbackBody.text = stripCustomEmojiTags(fallbackBody.text);
      }
      if (fallbackBody.media && typeof fallbackBody.media.caption === "string") {
        fallbackBody.media = {
          ...fallbackBody.media,
          caption: stripCustomEmojiTags(fallbackBody.media.caption)
        };
      }
      const retryRes = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackBody)
      });
      const retryRaw = await retryRes.text();
      if (!retryRaw || retryRaw.trim().startsWith("<")) {
        return { ok: false, description: "Non-JSON retry response" };
      }
      return JSON.parse(retryRaw);
    }
    return data;
  } catch (err) {
    return { ok: false, description: err?.message || "Network error" };
  }
}
function getActiveMediaDiskPath(photoKind) {
  if (photoKind === "qr") {
    if (fs.existsSync(CUSTOM_QR_DISK_PATH)) return CUSTOM_QR_DISK_PATH;
    return DEFAULT_QR_DISK_PATH;
  }
  if (fs.existsSync(CUSTOM_BANNER_DISK_PATH)) return CUSTOM_BANNER_DISK_PATH;
  return DEFAULT_BANNER_DISK_PATH;
}
function normalizeImageShareUrl(rawInput) {
  const urlMatch = rawInput.match(/https?:\/\/[^\s"'<>]+/i);
  const cleanUrl = (urlMatch ? urlMatch[0] : rawInput).trim();
  const gdriveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`;
  }
  if (cleanUrl.includes("dropbox.com") && cleanUrl.includes("?dl=0")) {
    return cleanUrl.replace("?dl=0", "?raw=1");
  }
  return cleanUrl;
}
async function processAndSaveCustomImage(source, kind) {
  try {
    let rawBuffer = null;
    const token = store.config.botToken.trim();
    if (source.telegramFileId && token) {
      const fileInfo = await tgApi("getFile", { file_id: source.telegramFileId });
      const filePath = fileInfo?.result?.file_path;
      if (filePath) {
        const dlRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
        if (dlRes.ok) {
          rawBuffer = Buffer.from(await dlRes.arrayBuffer());
        }
      }
    } else if (source.url) {
      const targetUrl = normalizeImageShareUrl(source.url);
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,text/html;q=0.9,*/*;q=0.8"
      };
      const res = await fetch(targetUrl, { headers, redirect: "follow" });
      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status} when fetching image link` };
      }
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("text/html")) {
        const html = await res.text();
        const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
        if (ogMatch && ogMatch[1]) {
          const resolvedImgUrl = new URL(ogMatch[1], targetUrl).toString();
          const imgRes = await fetch(resolvedImgUrl, { headers, redirect: "follow" });
          if (imgRes.ok) {
            rawBuffer = Buffer.from(await imgRes.arrayBuffer());
          }
        }
      } else {
        rawBuffer = Buffer.from(await res.arrayBuffer());
      }
    }
    if (!rawBuffer || rawBuffer.length < 100) {
      return { ok: false, error: "Could not download valid image bytes from link" };
    }
    const targetDiskPath = kind === "qr" ? CUSTOM_QR_DISK_PATH : CUSTOM_BANNER_DISK_PATH;
    fs.mkdirSync(path.dirname(targetDiskPath), { recursive: true });
    if (kind === "banner") {
      const normalized = await sharp(rawBuffer).resize(BANNER_WIDTH, BANNER_HEIGHT, {
        fit: "cover",
        position: "attention"
      }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
      fs.writeFileSync(targetDiskPath, normalized);
      store.config.cachedBannerFileId = "";
    } else {
      const normalized = await sharp(rawBuffer).resize(QR_SIZE, QR_SIZE, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
      fs.writeFileSync(targetDiskPath, normalized);
      store.config.cachedQrFileId = "";
    }
    for (const u of Object.values(store.users)) {
      u.lastBotPhotoKind = void 0;
    }
    saveStore();
    return { ok: true };
  } catch (err) {
    console.warn(`processAndSaveCustomImage failed for ${kind}:`, err);
    return { ok: false, error: err?.message || "Image processing error" };
  }
}
async function sendTypedPhotoMessage(chatId, caption, replyMarkup, photoKind = "banner", customPhotoUrl) {
  const token = store.config.botToken.trim();
  if (!token) return { ok: false };
  if (customPhotoUrl) {
    const directRes = await tgApi("sendPhoto", {
      chat_id: chatId,
      photo: customPhotoUrl,
      caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup
    });
    if (directRes?.ok) {
      return directRes;
    }
    try {
      const imgFetch = await fetch(customPhotoUrl);
      if (imgFetch.ok) {
        const arrBuf = await imgFetch.arrayBuffer();
        const attemptDynamicUpload = async (markupToUse) => {
          const form = new FormData();
          form.append("chat_id", String(chatId));
          form.append("caption", caption);
          form.append("parse_mode", "HTML");
          if (markupToUse) {
            form.append("reply_markup", JSON.stringify(markupToUse));
          }
          const blob = new Blob([arrBuf], { type: "image/png" });
          form.append("photo", blob, "dynamic_upi_qr.png");
          const upRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: form
          });
          return await upRes.json();
        };
        let upData = await attemptDynamicUpload(replyMarkup);
        if (!upData?.ok && typeof upData?.description === "string" && upData.description.includes("CUSTOM_EMOJI")) {
          upData = await attemptDynamicUpload(stripCustomEmojiIdsFromMarkup(replyMarkup));
        }
        if (upData?.ok) {
          return upData;
        }
      }
    } catch (err) {
      console.warn("Dynamic QR upload fallback failed:", err);
    }
  }
  const cachedId = photoKind === "qr" ? store.config.cachedQrFileId : store.config.cachedBannerFileId;
  const customUrl = photoKind === "qr" ? store.config.customQrImageUrl : store.config.customBannerImageUrl;
  if (cachedId) {
    const cachedRes = await tgApi("sendPhoto", {
      chat_id: chatId,
      photo: cachedId,
      caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup
    });
    if (cachedRes?.ok) {
      if (Array.isArray(cachedRes.result?.photo) && cachedRes.result.photo.length > 0) {
        const best = cachedRes.result.photo[cachedRes.result.photo.length - 1];
        if (best?.file_id) {
          if (photoKind === "qr") store.config.cachedQrFileId = best.file_id;
          else if (photoKind === "banner") store.config.cachedBannerFileId = best.file_id;
          saveStore();
        }
      }
      return cachedRes;
    }
    if (photoKind === "qr") store.config.cachedQrFileId = "";
    else if (photoKind === "banner") store.config.cachedBannerFileId = "";
  }
  if (customUrl && !fs.existsSync(photoKind === "qr" ? CUSTOM_QR_DISK_PATH : CUSTOM_BANNER_DISK_PATH)) {
    await processAndSaveCustomImage({ url: customUrl }, photoKind === "qr" ? "qr" : "banner");
  }
  const resolvedDiskPath = getActiveMediaDiskPath(photoKind === "qr" ? "qr" : "banner");
  if (fs.existsSync(resolvedDiskPath)) {
    const attemptUpload = async (markupToUse) => {
      const fileBuffer = fs.readFileSync(resolvedDiskPath);
      const form = new FormData();
      form.append("chat_id", String(chatId));
      form.append("caption", caption);
      form.append("parse_mode", "HTML");
      if (markupToUse) {
        form.append("reply_markup", JSON.stringify(markupToUse));
      }
      const blob = new Blob([fileBuffer], { type: "image/jpeg" });
      form.append("photo", blob, photoKind === "qr" ? "premium_qr.jpg" : "osint_banner.jpg");
      const uploadRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: form
      });
      return await uploadRes.json();
    };
    try {
      let data = await attemptUpload(replyMarkup);
      if (!data?.ok && typeof data?.description === "string" && data.description.includes("CUSTOM_EMOJI")) {
        data = await attemptUpload(stripCustomEmojiIdsFromMarkup(replyMarkup));
      }
      if (data?.ok && Array.isArray(data.result?.photo) && data.result.photo.length > 0) {
        const bestPhoto = data.result.photo[data.result.photo.length - 1];
        if (bestPhoto?.file_id) {
          if (photoKind === "qr") store.config.cachedQrFileId = bestPhoto.file_id;
          else if (photoKind === "banner") store.config.cachedBannerFileId = bestPhoto.file_id;
          saveStore();
        }
        return data;
      }
    } catch (err) {
      console.warn(`Multipart upload failed for ${photoKind}:`, err);
    }
  }
  return tgApi("sendMessage", {
    chat_id: chatId,
    text: caption,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup
  });
}
async function editPhotoMediaInPlace(chatId, messageId, caption, replyMarkup, photoKind, customPhotoUrl) {
  const token = store.config.botToken.trim();
  if (!token) return false;
  if (customPhotoUrl) {
    const directRes = await tgApi("editMessageMedia", {
      chat_id: chatId,
      message_id: messageId,
      media: {
        type: "photo",
        media: customPhotoUrl,
        caption,
        parse_mode: "HTML"
      },
      reply_markup: replyMarkup
    });
    if (directRes?.ok || directRes?.description && directRes.description.includes("message is not modified")) {
      return true;
    }
    try {
      const imgFetch = await fetch(customPhotoUrl);
      if (imgFetch.ok) {
        const arrBuf = await imgFetch.arrayBuffer();
        const attemptDynamicMediaEdit = async (markupToUse) => {
          const form = new FormData();
          form.append("chat_id", String(chatId));
          form.append("message_id", String(messageId));
          form.append(
            "media",
            JSON.stringify({
              type: "photo",
              media: "attach://photo_asset",
              caption,
              parse_mode: "HTML"
            })
          );
          if (markupToUse) {
            form.append("reply_markup", JSON.stringify(markupToUse));
          }
          const blob = new Blob([arrBuf], { type: "image/png" });
          form.append("photo_asset", blob, "dynamic_upi_qr.png");
          const upRes = await fetch(`https://api.telegram.org/bot${token}/editMessageMedia`, {
            method: "POST",
            body: form
          });
          return await upRes.json();
        };
        let upData = await attemptDynamicMediaEdit(replyMarkup);
        if (!upData?.ok && typeof upData?.description === "string" && upData.description.includes("CUSTOM_EMOJI")) {
          upData = await attemptDynamicMediaEdit(stripCustomEmojiIdsFromMarkup(replyMarkup));
        }
        if (upData?.ok) {
          return true;
        }
      }
    } catch (err) {
      console.warn("Dynamic QR editMessageMedia fallback failed:", err);
    }
    return false;
  }
  const cachedId = photoKind === "qr" ? store.config.cachedQrFileId : store.config.cachedBannerFileId;
  const customUrl = photoKind === "qr" ? store.config.customQrImageUrl : store.config.customBannerImageUrl;
  if (cachedId) {
    const res = await tgApi("editMessageMedia", {
      chat_id: chatId,
      message_id: messageId,
      media: {
        type: "photo",
        media: cachedId,
        caption,
        parse_mode: "HTML"
      },
      reply_markup: replyMarkup
    });
    if (res?.ok || res?.description && res.description.includes("message is not modified")) {
      return true;
    }
    if (photoKind === "qr") store.config.cachedQrFileId = "";
    else if (photoKind === "banner") store.config.cachedBannerFileId = "";
  }
  if (customUrl && !fs.existsSync(photoKind === "qr" ? CUSTOM_QR_DISK_PATH : CUSTOM_BANNER_DISK_PATH)) {
    await processAndSaveCustomImage({ url: customUrl }, photoKind === "qr" ? "qr" : "banner");
  }
  const diskPath = getActiveMediaDiskPath(photoKind === "qr" ? "qr" : "banner");
  if (fs.existsSync(diskPath)) {
    const attemptMediaEdit = async (markupToUse) => {
      const fileBuffer = fs.readFileSync(diskPath);
      const form = new FormData();
      form.append("chat_id", String(chatId));
      form.append("message_id", String(messageId));
      form.append(
        "media",
        JSON.stringify({
          type: "photo",
          media: "attach://photo_asset",
          caption,
          parse_mode: "HTML"
        })
      );
      if (markupToUse) {
        form.append("reply_markup", JSON.stringify(markupToUse));
      }
      const blob = new Blob([fileBuffer], { type: "image/jpeg" });
      form.append("photo_asset", blob, photoKind === "qr" ? "premium_qr.jpg" : "osint_banner.jpg");
      const uploadRes = await fetch(`https://api.telegram.org/bot${token}/editMessageMedia`, {
        method: "POST",
        body: form
      });
      return await uploadRes.json();
    };
    try {
      let data = await attemptMediaEdit(replyMarkup);
      if (!data?.ok && typeof data?.description === "string" && data.description.includes("CUSTOM_EMOJI")) {
        data = await attemptMediaEdit(stripCustomEmojiIdsFromMarkup(replyMarkup));
      }
      if (data?.ok) {
        if (Array.isArray(data.result?.photo) && data.result.photo.length > 0) {
          const bestPhoto = data.result.photo[data.result.photo.length - 1];
          if (bestPhoto?.file_id) {
            if (photoKind === "qr") store.config.cachedQrFileId = bestPhoto.file_id;
            else if (photoKind === "banner") store.config.cachedBannerFileId = bestPhoto.file_id;
            saveStore();
          }
        }
        return true;
      }
    } catch (err) {
      console.warn(`editMessageMedia multipart failed for ${photoKind}:`, err);
    }
  }
  return false;
}
async function safeDeleteMessage(chatId, messageId) {
  if (!messageId) return;
  await tgApi("deleteMessage", {
    chat_id: chatId,
    message_id: messageId
  }).catch(() => {
  });
}
async function clearFourDotsReplyKeyboardOnce(chatId, user) {
  if (user.keyboardCleared) return;
  user.keyboardCleared = true;
  saveStore();
  const temp = await tgApi("sendMessage", {
    chat_id: chatId,
    text: "\u26A1",
    reply_markup: { remove_keyboard: true }
  });
  if (temp?.ok && temp.result?.message_id) {
    await safeDeleteMessage(chatId, temp.result.message_id);
  }
}
async function renderBotScreen(chatId, user, caption, replyMarkup, options = {}) {
  const desiredPhotoKind = options.customPhotoUrl ? "dynamic_qr" : options.photoKind || "banner";
  const editMsgId = options.targetMessageId || user.lastBotMessageId;
  if (!options.forceNew && editMsgId) {
    if (user.lastBotMessageIsPhoto !== false) {
      if (options.forceMediaSwap || options.customPhotoUrl || !user.lastBotPhotoKind || user.lastBotPhotoKind !== desiredPhotoKind) {
        const mediaSwapped = await editPhotoMediaInPlace(
          chatId,
          editMsgId,
          caption,
          replyMarkup,
          desiredPhotoKind,
          options.customPhotoUrl
        );
        if (mediaSwapped) {
          user.lastBotMessageId = editMsgId;
          user.lastBotMessageIsPhoto = true;
          user.lastBotPhotoKind = desiredPhotoKind;
          saveStore();
          return;
        }
      }
      const editCap = await tgApi("editMessageCaption", {
        chat_id: chatId,
        message_id: editMsgId,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      });
      if (editCap?.ok || editCap?.description && editCap.description.includes("message is not modified")) {
        user.lastBotMessageId = editMsgId;
        user.lastBotMessageIsPhoto = true;
        user.lastBotPhotoKind = desiredPhotoKind;
        saveStore();
        return;
      }
    }
    const editTxt = await tgApi("editMessageText", {
      chat_id: chatId,
      message_id: editMsgId,
      text: caption,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: replyMarkup
    });
    if (editTxt?.ok || editTxt?.description && editTxt.description.includes("message is not modified")) {
      user.lastBotMessageId = editMsgId;
      user.lastBotMessageIsPhoto = false;
      saveStore();
      return;
    }
    await safeDeleteMessage(chatId, editMsgId);
  } else if (options.forceNew && user.lastBotMessageId) {
    await safeDeleteMessage(chatId, user.lastBotMessageId);
  }
  const sent = await sendTypedPhotoMessage(
    chatId,
    caption,
    replyMarkup,
    desiredPhotoKind,
    options.customPhotoUrl
  );
  if (sent?.ok && sent.result?.message_id) {
    user.lastBotMessageId = sent.result.message_id;
    user.lastBotMessageIsPhoto = Boolean(sent.result?.photo);
    user.lastBotPhotoKind = desiredPhotoKind;
    saveStore();
  }
}
async function checkSingleChannelMember(channelUsername, telegramId) {
  const clean = channelUsername.trim();
  if (!clean) return "unverifiable";
  const chatIdentifier = clean.startsWith("@") || clean.startsWith("-100") ? clean : `@${clean}`;
  const res = await tgApi("getChatMember", {
    chat_id: chatIdentifier,
    user_id: Number(telegramId)
  });
  if (res?.ok && res.result?.status) {
    const st = String(res.result.status);
    if (["creator", "administrator", "member", "restricted"].includes(st)) {
      return "joined";
    }
    if (st === "left" || st === "kicked") {
      return "not_joined";
    }
  }
  return "unverifiable";
}
async function checkChannelMembership(user) {
  if (!store.config.forceJoinEnabled) return true;
  if (isAdminUser(user.telegramId, user.username)) return true;
  const ch1 = await checkSingleChannelMember(store.config.channelUsername, user.telegramId);
  const ch2 = await checkSingleChannelMember(store.config.secondChannelUsername, user.telegramId);
  if (ch1 === "not_joined" || ch2 === "not_joined") {
    user.joinedChannel = false;
    saveStore();
    return false;
  }
  if (ch1 === "joined" || ch2 === "joined") {
    user.joinedChannel = true;
    saveStore();
    return true;
  }
  return Boolean(user.joinedChannel);
}
function withEmojiId(btn, key) {
  const map = store.config.buttonCustomEmojis || DEFAULT_CUSTOM_EMOJIS;
  const emojiId = map[key] || DEFAULT_CUSTOM_EMOJIS[key];
  if (emojiId && /^\d{15,22}$/.test(emojiId)) {
    return { ...btn, icon_custom_emoji_id: emojiId };
  }
  return btn;
}
function tgEmoji(key, fallback) {
  const map = store.config.buttonCustomEmojis || DEFAULT_CUSTOM_EMOJIS;
  const emojiId = map[key] || DEFAULT_CUSTOM_EMOJIS[key];
  if (emojiId && /^\d{15,22}$/.test(emojiId)) {
    return `<tg-emoji emoji-id="${emojiId}">${fallback}</tg-emoji>`;
  }
  return fallback;
}
function getChannelGateKeyboard() {
  const ch1Url = store.config.channelUrl || `https://t.me/${store.config.channelUsername.replace(/^@/, "")}`;
  const ch2Url = store.config.secondChannelUrl || `https://t.me/${(store.config.secondChannelUsername || "@followxpresss").replace(/^@/, "")}`;
  return {
    inline_keyboard: [
      [
        withEmojiId(
          {
            text: "\u{1F4E2} \u1D0A\u1D0F\u026A\u0274 \u1D04\u029C\u1D00\u0274\u0274\u1D07\u029F 1",
            url: ch1Url,
            style: "primary"
          },
          "channel"
        ),
        withEmojiId(
          {
            text: "\u{1F4E2} \u1D0A\u1D0F\u026A\u0274 \u1D04\u029C\u1D00\u0274\u0274\u1D07\u029F 2",
            url: ch2Url,
            style: "primary"
          },
          "channel"
        )
      ],
      [
        withEmojiId(
          {
            text: "\u2705 \u1D20\u1D07\u0280\u026A\u0493\u028F & \u1D04\u1D0F\u0274\u1D1B\u026A\u0274\u1D1C\u1D07 \u{1F680}",
            callback_data: "verify_join",
            style: "success"
          },
          "verify"
        )
      ]
    ]
  };
}
function getMainMenuKeyboard() {
  const ch2Url = store.config.secondChannelUrl || `https://t.me/${(store.config.secondChannelUsername || "@followxpresss").replace(/^@/, "")}`;
  return {
    inline_keyboard: [
      [
        withEmojiId(
          { text: "\u{1F4DE} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u026A\u0274\u0493\u1D0F", callback_data: "menu_num", style: "primary" },
          "num"
        ),
        withEmojiId(
          { text: "\u{1F4A0} \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u026A\u0274\u0493\u1D0F", callback_data: "menu_aadhar", style: "primary" },
          "aadhaar"
        )
      ],
      [
        withEmojiId(
          { text: "\u{1F451} \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "menu_premium", style: "success" },
          "premium"
        ),
        withEmojiId(
          { text: "\u{1F381} \u0280\u1D07\u0493\u1D07\u0280 & \u1D07\u1D00\u0280\u0274", callback_data: "menu_refer", style: "success" },
          "refer"
        )
      ],
      [
        withEmojiId(
          { text: "\u{1F4E2} \u1D1C\u1D18\u1D05\u1D00\u1D1B\u1D07s", url: ch2Url, style: "primary" },
          "channel"
        ),
        withEmojiId(
          { text: "\u{1F4AC} \u029C\u1D07\u029F\u1D18 & \u0262\u1D1C\u026A\u1D05\u1D07", callback_data: "menu_help", style: "primary" },
          "help"
        )
      ],
      [
        withEmojiId(
          { text: "\u2718 \u1D04\u029F\u1D0Fs\u1D07", callback_data: "close_card", style: "danger" },
          "close"
        )
      ]
    ]
  };
}
function getCancelToMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        withEmojiId(
          { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "danger" },
          "close"
        )
      ]
    ]
  };
}
function getLookupResultKeyboard(serviceType, currentPage = 0, totalRecords = 1, shareUrl) {
  const searchAgainCallback = serviceType === "num_aadhaar" ? "menu_aadhar" : "menu_num";
  const rows = [];
  if (totalRecords > 1) {
    const prevPage = currentPage > 0 ? currentPage - 1 : totalRecords - 1;
    const nextPage = currentPage < totalRecords - 1 ? currentPage + 1 : 0;
    rows.push([
      { text: "\u2B05\uFE0F \u1D18\u0280\u1D07\u1D20", callback_data: `page_${prevPage}`, style: "primary" },
      { text: `\u{1F4C4} ${currentPage + 1}/${totalRecords}`, callback_data: "page_noop", style: "success" },
      { text: "\u0274\u1D07x\u1D1B \u27A1\uFE0F", callback_data: `page_${nextPage}`, style: "primary" }
    ]);
  }
  if (shareUrl) {
    rows.push([
      withEmojiId(
        {
          text: `\u{1F4E4} s\u029C\u1D00\u0280\u1D07 \u029F\u026A\u0274\u1D0B (+${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s)`,
          url: shareUrl,
          style: "success"
        },
        "refer"
      )
    ]);
  }
  rows.push([
    withEmojiId(
      { text: "\u{1F504} s\u1D07\u1D00\u0280\u1D04\u029C \u1D00\u0262\u1D00\u026A\u0274", callback_data: searchAgainCallback, style: "primary" },
      "num"
    ),
    withEmojiId(
      { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "danger" },
      "close"
    )
  ]);
  return { inline_keyboard: rows };
}
function getAdminPanelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "\u{1F465} \u1D1Cs\u1D07\u0280s & \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "adm_sec_users", style: "success" },
        {
          text: `\u{1F3AF} \u029F\u026A\u1D0D\u026A\u1D1Bs (${store.config.dailyFreeLimit}/\u1D05)`,
          callback_data: "adm_sec_limits",
          style: "primary"
        }
      ],
      [
        { text: "\u{1F4B3} \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B & \u1D18\u029F\u1D00\u0274s", callback_data: "adm_sec_payment", style: "success" },
        { text: "\u{1F5BC}\uFE0F \u1D0D\u1D07\u1D05\u026A\u1D00 & \u1D07\u1D0D\u1D0F\u1D0A\u026As", callback_data: "adm_sec_media", style: "primary" }
      ],
      [
        { text: "\u2699\uFE0F \u1D04\u029C\u1D00\u0274\u0274\u1D07\u029Fs & \u1D00\u1D18\u026A", callback_data: "adm_sec_config", style: "primary" },
        { text: "\u{1F4E2} \u0299\u0280\u1D0F\u1D00\u1D05\u1D04\u1D00s\u1D1B", callback_data: "adm_broadcast", style: "success" }
      ],
      [
        { text: "\u{1F4E6} \u0262\u026A\u1D1B\u029C\u1D1C\u0299 24/7 \u1D22\u026A\u1D18", callback_data: "adm_sec_github", style: "primary" },
        { text: "\u2718 \u1D04\u029F\u1D0Fs\u1D07 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "back_menu", style: "danger" }
      ]
    ]
  };
}
function buildMainMenuText(user) {
  let quotaLine = `\u2502 \u{1F3AF} <b>\u1D05\u1D00\u026A\u029F\u028F \u0493\u0280\u1D07\u1D07 \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${store.config.dailyFreeLimit} s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s/\u1D05\u1D00\u028F`;
  if (user) {
    if (isUserPremium(user)) {
      quotaLine = `\u2502 \u{1F451} <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D (\u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u267E\uFE0F)`;
    } else {
      const rem = getRemainingDailyFree(user);
      quotaLine = `\u2502 \u{1F3AF} <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${rem}/${store.config.dailyFreeLimit} \u0493\u0280\u1D07\u1D07 | \u{1FA99} <b>\u0299\u1D0F\u0274\u1D1Cs:</b> ${user.credits}`;
    }
  }
  return [
    `\u26A1\uFE0F <b>${toBoldSans("HEX OSINT INTELLIGENCE")}</b> \u{1F6E1}\uFE0F`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F916} <b>\u026A \u1D00\u1D0D \u1D00\u0274 \u1D00\u1D05\u1D20\u1D00\u0274\u1D04\u1D07\u1D05 \u1D0Fs\u026A\u0274\u1D1B \u0299\u1D0F\u1D1B</b>`,
    quotaLine,
    `\u2502 \u{1F50E} <b>\u026A \u1D04\u1D00\u0274 \u0493\u1D07\u1D1B\u1D04\u029C \u029F\u026A\u1D20\u1D07 \u1D05\u1D07\u1D1B\u1D00\u026A\u029Fs:</b>`,
    `\u2502 \u251C \u{1F4DE} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D1B\u1D0F \u026A\u0274\u0493\u1D0F (\u029F\u026A\u1D20\u1D07 \u26A1)`,
    `\u2502 \u251C \u{1F4A0} \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u1D1B\u1D0F \u026A\u0274\u0493\u1D0F (s\u1D0F\u1D0F\u0274 \u{1F6A7})`,
    `\u2502 \u2570 \u{1F6E1}\uFE0F \u1D20\u1D07\u0280\u026A\u0493\u026A\u1D07\u1D05 \u026A\u1D05\u1D07\u0274\u1D1B\u026A\u1D1B\u028F & \u1D00\u1D05\u1D05\u0280\u1D07ss`,
    WIDE_BOT_BORDER,
    `\u2728 <b>\u1D04\u029C\u1D0F\u1D0Fs\u1D07 \u1D00\u0274\u028F \u1D0F\u1D18\u1D1B\u026A\u1D0F\u0274 \u0493\u0280\u1D0F\u1D0D \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
}
async function sendChannelJoinGate(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const text = [
    `\u{1F512} <b>${toBoldSans("CHANNEL VERIFICATION")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F44B} \u1D21\u1D07\u029F\u1D04\u1D0F\u1D0D\u1D07 <b>${escapeHtml(user.firstName)}</b>!`,
    `\u2502 \u{1F4E2} \u1D0A\u1D0F\u026A\u0274 \u1D0F\u1D1C\u0280 \u1D0F\u0493\u0493\u026A\u1D04\u026A\u1D00\u029F \u1D04\u029C\u1D00\u0274\u0274\u1D07\u029Fs`,
    `\u2502 \u251C 1\uFE0F\u20E3 <b>${escapeHtml(store.config.channelUsername)}</b>`,
    `\u2502 \u2570 2\uFE0F\u20E3 <b>${escapeHtml(store.config.secondChannelUsername || "@followxpresss")}</b>`,
    WIDE_BOT_BORDER,
    `\u2728 <b>\u1D0A\u1D0F\u026A\u0274 \u0299\u1D0F\u1D1B\u029C & \u1D1B\u1D00\u1D18 \u1D20\u1D07\u0280\u026A\u0493\u028F \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  await renderBotScreen(chatId, user, text, getChannelGateKeyboard(), {
    ...options,
    photoKind: "banner"
  });
}
async function sendMainMenu(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  await renderBotScreen(chatId, user, buildMainMenuText(user), getMainMenuKeyboard(), {
    ...options,
    photoKind: "banner"
  });
}
async function sendNumberPrompt(chatId, user, options = {}) {
  const unlimited = isUserPremium(user);
  refreshDailyQuota(user);
  const freeLeft = getRemainingDailyFree(user);
  if (!unlimited && freeLeft <= 0 && user.credits <= 0) {
    await sendReferScreen(chatId, user, { ...options, limitReached: true });
    return;
  }
  user.awaitingInput = "number";
  saveStore();
  const quotaLine = unlimited ? `\u2502 \u{1F451} <b>\u01EB\u1D1C\u1D0F\u1D1B\u1D00:</b> \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u267E\uFE0F` : `\u2502 \u{1F3AF} <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${freeLeft}/${store.config.dailyFreeLimit} \u0493\u0280\u1D07\u1D07 | \u{1FA99} <b>\u0299\u1D0F\u0274\u1D1Cs:</b> ${user.credits}`;
  const text = [
    `\u{1F4DE} <b>${toBoldSans("NUMBER TO INFO")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F4F2} s\u1D07\u0274\u1D05 \u1D00\u0274\u028F <b>10-\u1D05\u026A\u0262\u026A\u1D1B \u1D0D\u1D0F\u0299\u026A\u029F\u1D07</b>`,
    `\u2502 <b>\u0274\u1D1C\u1D0D\u0299\u1D07\u0280</b> \u1D1B\u1D0F \u0493\u1D07\u1D1B\u1D04\u029C \u029F\u026A\u1D20\u1D07 \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s.`,
    quotaLine,
    `\u2502`,
    `\u2502 \u{1F4CC} \u1D07x\u1D00\u1D0D\u1D18\u029F\u1D07: <code>9835216800</code>`,
    WIDE_BOT_BORDER,
    `\u{1F447}\u{1F3FB} <i>\u1D1B\u028F\u1D18\u1D07 & s\u1D07\u0274\u1D05 \u1D1B\u029C\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u0274\u1D0F\u1D21:</i>`
  ].join("\n");
  await renderBotScreen(chatId, user, text, getCancelToMenuKeyboard(), {
    ...options,
    photoKind: "banner"
  });
}
async function sendAadhaarPrompt(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  if (store.config.aadhaarComingSoon) {
    const comingSoonText = [
      `\u{1F4A0} <b>${toBoldSans("AADHAAR TO INFO")}</b> \u{1F50D}`,
      WIDE_TOP_BORDER,
      `\u2502 \u{1F6A7} <b>${toBoldSans("COMING SOON")}</b> \u23F3`,
      `\u2502`,
      `\u2502 \u2699\uFE0F \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u026A\u0274\u0493\u1D0F s\u1D07\u0280\u1D20\u1D07\u0280 \u026As`,
      `\u2502 \u1D04\u1D1C\u0280\u0280\u1D07\u0274\u1D1B\u029F\u028F \u1D1C\u0274\u1D05\u1D07\u0280 \u1D1C\u1D18\u0262\u0280\u1D00\u1D05\u1D07.`,
      `\u2502 \u{1F525} \u1D1Cs\u1D07 <b>\u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u026A\u0274\u0493\u1D0F</b> \u0493\u1D0F\u0280 \u026A\u0274s\u1D1B\u1D00\u0274\u1D1B`,
      `\u2502 \u029F\u026A\u1D20\u1D07 \u1D05\u1D00\u1D1B\u1D00\u0299\u1D00s\u1D07 \u0280\u1D07s\u1D1C\u029F\u1D1Bs!`,
      WIDE_BOT_BORDER,
      `\u2728 <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00\u0274 \u1D0F\u1D18\u1D1B\u026A\u1D0F\u0274 \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
    ].join("\n");
    const comingSoonMarkup = {
      inline_keyboard: [
        [
          withEmojiId(
            { text: "\u{1F4DE} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u026A\u0274\u0493\u1D0F", callback_data: "menu_num", style: "primary" },
            "num"
          ),
          withEmojiId(
            { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "danger" },
            "close"
          )
        ]
      ]
    };
    await renderBotScreen(chatId, user, comingSoonText, comingSoonMarkup, {
      ...options,
      photoKind: "banner"
    });
    return;
  }
  const unlimited = isUserPremium(user);
  refreshDailyQuota(user);
  const freeLeft = getRemainingDailyFree(user);
  if (!unlimited && freeLeft <= 0 && user.credits <= 0) {
    await sendReferScreen(chatId, user, { ...options, limitReached: true });
    return;
  }
  user.awaitingInput = "aadhaar";
  saveStore();
  const text = [
    `\u{1F4A0} <b>${toBoldSans("AADHAAR TO INFO")}</b> \u{1F50D}`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1FAAA} s\u1D07\u0274\u1D05 \u1D00\u0274\u028F <b>12-\u1D05\u026A\u0262\u026A\u1D1B \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280</b>`,
    `\u2502 <b>\u0274\u1D1C\u1D0D\u0299\u1D07\u0280</b> \u1D1B\u1D0F \u0493\u1D07\u1D1B\u1D04\u029C \u029F\u026A\u1D20\u1D07 \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s.`,
    `\u2502`,
    `\u2502 \u{1F4CC} \u1D07x\u1D00\u1D0D\u1D18\u029F\u1D07: <code>123456789012</code>`,
    WIDE_BOT_BORDER,
    `\u{1F447}\u{1F3FB} <i>\u1D1B\u028F\u1D18\u1D07 & s\u1D07\u0274\u1D05 \u1D1B\u029C\u1D07 \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u0274\u1D0F\u1D21:</i>`
  ].join("\n");
  await renderBotScreen(chatId, user, text, getCancelToMenuKeyboard(), {
    ...options,
    photoKind: "banner"
  });
}
function extractPriceAmount(priceStr, fallback) {
  if (!priceStr) return fallback;
  const rupeeMatch = priceStr.match(/₹\s*(\d+)/);
  if (rupeeMatch && rupeeMatch[1]) {
    const val = parseInt(rupeeMatch[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  const firstNum = priceStr.match(/(\d+)/);
  if (firstNum && firstNum[1]) {
    const val = parseInt(firstNum[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return fallback;
}
function getPlanDetails(planKey) {
  const weeklyAmt = extractPriceAmount(store.config.premiumWeeklyPrice, 49);
  const monthlyAmt = extractPriceAmount(store.config.premiumMonthlyPrice, 149);
  const lifetimeAmt = extractPriceAmount(store.config.premiumLifetimePrice, 499);
  if (planKey === "weekly") {
    return {
      planKey: "weekly",
      planLabel: "\u1D21\u1D07\u1D07\u1D0B\u029F\u028F \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D (7 \u1D05\u1D00\u028Fs)",
      amount: weeklyAmt,
      days: 7
    };
  }
  if (planKey === "monthly") {
    return {
      planKey: "monthly",
      planLabel: "\u1D0D\u1D0F\u0274\u1D1B\u029C\u029F\u028F \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D (30 \u1D05\u1D00\u028Fs)",
      amount: monthlyAmt,
      days: 30
    };
  }
  return {
    planKey: "lifetime",
    planLabel: "\u029F\u026A\u0493\u1D07\u1D1B\u026A\u1D0D\u1D07 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D (3650 \u1D05\u1D00\u028Fs)",
    amount: lifetimeAmt,
    days: 3650
  };
}
async function sendPremiumScreen(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const prem = isUserPremium(user);
  const statusLine = prem ? `\u2705 <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u1D1C\u0274\u029F\u1D0F\u1D04\u1D0B\u1D07\u1D05 \u{1F451}` : `\u26A1 <b>\u0493\u0280\u1D07\u1D07 \u01EB\u1D1C\u1D0F\u1D1B\u1D00:</b> ${getRemainingDailyFree(user)}/${store.config.dailyFreeLimit} \u1D05\u1D00\u026A\u029F\u028F s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`;
  const weeklyAmt = extractPriceAmount(store.config.premiumWeeklyPrice, 49);
  const monthlyAmt = extractPriceAmount(store.config.premiumMonthlyPrice, 149);
  const lifetimeAmt = extractPriceAmount(store.config.premiumLifetimePrice, 499);
  const text = [
    `\u{1F451} <b>${toBoldSans("OSINT PREMIUM PLANS")}</b> \u{1F48E}`,
    WIDE_TOP_BORDER,
    `\u2502 ${statusLine}`,
    `\u2502`,
    `\u2502 \u{1F4B0} <b>${toBoldSans("AUTO-VERIFY UPI PLANS")}:</b>`,
    `\u2502 \u251C \u26A1 <b>\u1D21\u1D07\u1D07\u1D0B\u029F\u028F:</b> ${escapeHtml(store.config.premiumWeeklyPrice)}`,
    `\u2502 \u251C \u{1F48E} <b>\u1D0D\u1D0F\u0274\u1D1B\u029C\u029F\u028F:</b> ${escapeHtml(store.config.premiumMonthlyPrice)}`,
    `\u2502 \u2570 \u{1F451} <b>\u029F\u026A\u0493\u1D07\u1D1B\u026A\u1D0D\u1D07:</b> ${escapeHtml(store.config.premiumLifetimePrice)}`,
    `\u2502`,
    `\u2502 \u{1F4F2} <b>${escapeHtml(store.config.premiumPaymentNote)}</b>`,
    `\u2502 \u267E\uFE0F \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s & \u0493\u1D1C\u029F\u029F \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s`,
    WIDE_BOT_BORDER,
    `\u2728 <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00 \u1D18\u029F\u1D00\u0274 \u0299\u1D07\u029F\u1D0F\u1D21 \u1D1B\u1D0F \u1D00\u1D1C\u1D1B\u1D0F-\u0262\u1D07\u0274\u1D07\u0280\u1D00\u1D1B\u1D07 \u01EB\u0280 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        withEmojiId(
          {
            text: `\u26A1 \u1D21\u1D07\u1D07\u1D0B\u029F\u028F (\u20B9${weeklyAmt})`,
            callback_data: "buy_plan_weekly",
            style: "primary"
          },
          "bolt"
        ),
        withEmojiId(
          {
            text: `\u{1F48E} \u1D0D\u1D0F\u0274\u1D1B\u029C\u029F\u028F (\u20B9${monthlyAmt})`,
            callback_data: "buy_plan_monthly",
            style: "primary"
          },
          "refer"
        )
      ],
      [
        withEmojiId(
          {
            text: `\u{1F451} \u029F\u026A\u0493\u1D07\u1D1B\u026A\u1D0D\u1D07 (\u20B9${lifetimeAmt})`,
            callback_data: "buy_plan_lifetime",
            style: "success"
          },
          "premium"
        )
      ],
      [
        withEmojiId(
          {
            text: "\u{1F381} \u0280\u1D07\u0493\u1D07\u0280 & \u1D07\u1D00\u0280\u0274",
            callback_data: "menu_refer",
            style: "success"
          },
          "refer"
        ),
        withEmojiId(
          {
            text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C",
            callback_data: "back_menu",
            style: "danger"
          },
          "close"
        )
      ]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "qr"
  });
}
function buildDynamicQrCaption(planLabel, amount, orderId, merchantName, statusNote) {
  const upiId = (store.config.paymentUpiId || DEFAULT_PAYMENT_UPI_ID).trim();
  const lines = [
    `\u{1F4F2} <b>${toBoldSans("AUTO UPI QR PAYMENT")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${planLabel}`,
    `\u2502 \u{1F4B0} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B:</b> \u20B9${amount}`,
    `\u2502 \u{1F194} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(orderId)}</code>`,
    `\u2502 \u{1F3E6} <b>\u1D1C\u1D18\u026A \u026A\u1D05:</b> <code>${escapeHtml(upiId)}</code>`,
    `\u2502 \u{1F3E2} <b>\u1D0D\u1D07\u0280\u1D04\u029C\u1D00\u0274\u1D1B:</b> ${escapeHtml(merchantName)}`,
    `\u2502 \u{1F4E1} <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> ${statusNote || "\u{1F7E2} \u1D00\u1D1C\u1D1B\u1D0F-\u1D20\u1D07\u0280\u026A\u0493\u028F \u1D00\u1D04\u1D1B\u026A\u1D20\u1D07"}`,
    WIDE_BOT_BORDER,
    `1\uFE0F\u20E3 <i>s\u1D04\u1D00\u0274 \u01EB\u0280 & \u1D18\u1D00\u028F <b>\u20B9${amount}</b> \u1D0F\u0274 \u1D00\u0274\u028F \u1D1C\u1D18\u026A \u1D00\u1D18\u1D18 (\u0262\u1D18\u1D00\u028F, \u1D18\u029C\u1D0F\u0274\u1D07\u1D18\u1D07, \u1D18\u1D00\u028F\u1D1B\u1D0D, \u0274\u1D00\u1D20\u026A).</i>`,
    `2\uFE0F\u20E3 <i>\u1D00\u0493\u1D1B\u1D07\u0280 \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B, \u1D1B\u1D00\u1D18 <b>"\u2705 \u1D20\u1D07\u0280\u026A\u0493\u028F \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B"</b> \u0299\u1D07\u029F\u1D0F\u1D21 \u0493\u1D0F\u0280 \u026A\u0274s\u1D1B\u1D00\u0274\u1D1B \u1D00\u1D1C\u1D1B\u1D0F-\u1D20\u1D07\u0280\u026A\u0493\u028F \u{1F447}\u{1F3FB}</i>`
  ];
  return lines.join("\n");
}
function buildDynamicQrMarkup(planKey, amount, orderId) {
  return {
    inline_keyboard: [
      [
        withEmojiId(
          {
            text: `\u2705 \u1D20\u1D07\u0280\u026A\u0493\u028F \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B (\u20B9${amount})`,
            callback_data: `verify_pay_${orderId}`,
            style: "success"
          },
          "verify"
        )
      ],
      [
        withEmojiId(
          {
            text: "\u{1F504} \u0262\u1D07\u0274\u1D07\u0280\u1D00\u1D1B\u1D07 \u0274\u1D07\u1D21 \u01EB\u0280",
            callback_data: `buy_plan_${planKey}`,
            style: "primary"
          },
          "bolt"
        ),
        withEmojiId(
          {
            text: "\u{1F4CB} \u1D04\u029C\u1D00\u0274\u0262\u1D07 \u1D18\u029F\u1D00\u0274",
            callback_data: "menu_premium",
            style: "primary"
          },
          "premium"
        )
      ],
      [
        withEmojiId(
          {
            text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C",
            callback_data: "back_menu",
            style: "danger"
          },
          "close"
        )
      ]
    ]
  };
}
function isValidUpiUtr(utrDigits) {
  if (!/^\d{12}$/.test(utrDigits)) return false;
  if (/^(\d)\1{11}$/.test(utrDigits)) return false;
  if (/^(\d{2})\1{5}$/.test(utrDigits) || /^(\d{3})\1{3}$/.test(utrDigits)) return false;
  if ("01234567890123456789".includes(utrDigits) || "98765432109876543210".includes(utrDigits)) {
    return false;
  }
  if (utrDigits.startsWith("00")) return false;
  return true;
}
async function verifyPaymentByUtr(user, chatId, rawText) {
  const digits = rawText.replace(/\D/g, "");
  const fallbackPlan = getPlanDetails("weekly");
  const order = user.activePaymentOrder || {
    orderId: "VC" + Date.now(),
    planKey: fallbackPlan.planKey,
    planLabel: fallbackPlan.planLabel,
    amount: fallbackPlan.amount,
    days: fallbackPlan.days,
    upiString: "",
    qrImageUrl: "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
  if (!isValidUpiUtr(digits)) {
    const errCaption = buildDynamicQrCaption(
      order.planLabel,
      order.amount,
      order.orderId,
      merchantName,
      `\u274C Invalid UTR! Send valid 12-Digit UPI Ref/UTR No.`
    );
    await renderBotScreen(
      chatId,
      user,
      errCaption,
      buildDynamicQrMarkup(order.planKey, order.amount, order.orderId),
      {
        photoKind: "dynamic_qr",
        customPhotoUrl: order.qrImageUrl || void 0
      }
    );
    return true;
  }
  if (!Array.isArray(store.config.verifiedOrderIds)) {
    store.config.verifiedOrderIds = [];
  }
  const utrKey = `UTR:${digits}`;
  if (store.config.verifiedOrderIds.includes(utrKey)) {
    const usedCaption = buildDynamicQrCaption(
      order.planLabel,
      order.amount,
      order.orderId,
      merchantName,
      `\u26A0\uFE0F UTR ${digits} has already been used!`
    );
    await renderBotScreen(
      chatId,
      user,
      usedCaption,
      buildDynamicQrMarkup(order.planKey, order.amount, order.orderId),
      {
        photoKind: "dynamic_qr",
        customPhotoUrl: order.qrImageUrl || void 0
      }
    );
    return true;
  }
  store.config.verifiedOrderIds.push(utrKey);
  if (!store.config.verifiedOrderIds.includes(order.orderId)) {
    store.config.verifiedOrderIds.push(order.orderId);
  }
  const nowMs = Date.now();
  const maxReasonableMs = nowMs + 36500 * 864e5;
  let baseMs = nowMs;
  if (user.premiumUntil) {
    const parsed = new Date(user.premiumUntil).getTime();
    if (!isNaN(parsed) && parsed > nowMs && parsed < maxReasonableMs) {
      baseMs = parsed;
    }
  }
  const newExpiry = new Date(baseMs + order.days * 864e5).toISOString();
  user.premiumUntil = newExpiry;
  user.activePaymentOrder = null;
  user.awaitingInput = null;
  saveStore();
  const expDateStr = new Date(newExpiry).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const successCaption = [
    `\u{1F389} <b>${toBoldSans("PAYMENT VERIFIED")}</b> \u2705`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F451} <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u1D00\u1D04\u1D1B\u026A\u1D20\u1D00\u1D1B\u1D07\u1D05!`,
    `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${order.planLabel}`,
    `\u2502 \u{1F4B0} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B \u1D18\u1D00\u026A\u1D05:</b> \u20B9${order.amount}`,
    `\u2502 \u{1F522} <b>\u1D1C\u1D1B\u0280 / \u0280\u1D07\u0493 \u0274\u1D0F:</b> <code>${escapeHtml(digits)}</code>`,
    `\u2502 \u{1F194} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(order.orderId)}</code>`,
    `\u2502 \u{1F4C5} <b>\u1D20\u1D00\u029F\u026A\u1D05 \u1D1C\u0274\u1D1B\u026A\u029F:</b> ${escapeHtml(expDateStr)}`,
    `\u2502 \u267E\uFE0F <b>\u1D00\u1D04\u1D04\u1D07ss:</b> \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u1D0Fs\u026A\u0274\u1D1B s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`,
    WIDE_BOT_BORDER,
    `\u2728 <b>\u1D1B\u029C\u1D00\u0274\u1D0B \u028F\u1D0F\u1D1C! \u028F\u1D0F\u1D1C\u0280 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u026As \u0274\u1D0F\u1D21 \u029F\u026A\u1D20\u1D07 \u{1F680}</b>`
  ].join("\n");
  const successMarkup = {
    inline_keyboard: [
      [
        withEmojiId(
          { text: "\u{1F4DE} s\u1D1B\u1D00\u0280\u1D1B \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 s\u1D07\u1D00\u0280\u1D04\u029C", callback_data: "menu_num", style: "success" },
          "num"
        )
      ],
      [
        withEmojiId(
          { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "primary" },
          "close"
        )
      ]
    ]
  };
  await renderBotScreen(chatId, user, successCaption, successMarkup, {
    photoKind: "banner"
  });
  for (const adminId of store.config.adminIds) {
    await tgApi("sendMessage", {
      chat_id: adminId,
      text: [
        `\u{1F4B0} <b>${toBoldSans("NEW DIRECT UPI PAYMENT (UTR VERIFIED)")}</b> \u2705`,
        WIDE_TOP_BORDER,
        `\u2502 \u{1F464} <b>\u1D1Cs\u1D07\u0280:</b> ${escapeHtml(user.firstName)} (${user.username ? "@" + escapeHtml(user.username) : "No Username"})`,
        `\u2502 \u{1F194} <b>\u1D1Cs\u1D07\u0280 \u026A\u1D05:</b> <code>${user.telegramId}</code>`,
        `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${order.planLabel}`,
        `\u2502 \u{1F4B5} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B:</b> \u20B9${order.amount}`,
        `\u2502 \u{1F522} <b>12-\u1D05\u026A\u0262\u026A\u1D1B \u1D1C\u1D1B\u0280:</b> <code>${escapeHtml(digits)}</code>`,
        `\u2502 \u{1F3E6} <b>\u1D1C\u1D18\u026A \u026A\u1D05:</b> <code>${escapeHtml(store.config.paymentUpiId)}</code>`,
        `\u2502 \u{1F9FE} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(order.orderId)}</code>`,
        WIDE_BOT_BORDER
      ].join("\n"),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "\u{1F6AB} \u0280\u1D07\u1D20\u1D0F\u1D0B\u1D07 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D (\u026A\u0493 \u0493\u1D00\u1D0B\u1D07 \u1D1C\u1D1B\u0280)",
              callback_data: `adm_revoke_utr_${user.telegramId}`,
              style: "danger"
            }
          ]
        ]
      }
    }).catch(() => {
    });
  }
  return true;
}
async function verifyOrderWithVcGateway(user, chatId, orderId, options = {}) {
  const fallbackPlan = getPlanDetails("weekly");
  const order = user.activePaymentOrder && user.activePaymentOrder.orderId === orderId ? user.activePaymentOrder : user.activePaymentOrder || {
    orderId,
    planKey: fallbackPlan.planKey,
    planLabel: fallbackPlan.planLabel,
    amount: fallbackPlan.amount,
    days: fallbackPlan.days,
    upiString: "",
    qrImageUrl: "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!Array.isArray(store.config.verifiedOrderIds)) {
    store.config.verifiedOrderIds = [];
  }
  if (store.config.verifiedOrderIds.includes(orderId)) {
    return {
      verified: true,
      alreadyProcessed: true,
      gatewayStatus: "success",
      message: "Payment already verified & Premium activated!",
      amount: order.amount
    };
  }
  const apiKey = (store.config.paymentApiKey || DEFAULT_PAYMENT_API_KEY).trim();
  const apiUrl = `https://vcapi.vcstore.site/payment_api.php?api_key=${encodeURIComponent(
    apiKey
  )}&order_id=${encodeURIComponent(orderId)}`;
  try {
    const res = await fetch(apiUrl);
    const rawText = await res.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        verified: false,
        gatewayStatus: "invalid_json",
        message: "Gateway returned non-JSON response."
      };
    }
    const isSuccess = data && (String(data.status).toLowerCase() === "success" || String(data.TXNSTATUS || "").toUpperCase() === "TXN_SUCCESS" || data.verified === true);
    if (isSuccess) {
      const paidAmount = Number(data.amount ?? data.TXNAMOUNT ?? order.amount);
      if (paidAmount > 0 && paidAmount < order.amount) {
        return {
          verified: false,
          gatewayStatus: "amount_mismatch",
          message: `Paid amount (\u20B9${paidAmount}) is less than plan amount (\u20B9${order.amount}).`,
          amount: paidAmount
        };
      }
      store.config.verifiedOrderIds.push(orderId);
      const nowMs = Date.now();
      const maxReasonableMs = nowMs + 36500 * 864e5;
      let baseMs = nowMs;
      if (user.premiumUntil) {
        const parsed = new Date(user.premiumUntil).getTime();
        if (!isNaN(parsed) && parsed > nowMs && parsed < maxReasonableMs) {
          baseMs = parsed;
        }
      }
      const newExpiry = new Date(baseMs + order.days * 864e5).toISOString();
      user.premiumUntil = newExpiry;
      user.activePaymentOrder = null;
      saveStore();
      if (chatId) {
        const expDateStr = new Date(newExpiry).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
        const successCaption = [
          `\u{1F389} <b>${toBoldSans("PAYMENT VERIFIED")}</b> \u2705`,
          WIDE_TOP_BORDER,
          `\u2502 \u{1F451} <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u1D00\u1D04\u1D1B\u026A\u1D20\u1D00\u1D1B\u1D07\u1D05!`,
          `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${order.planLabel}`,
          `\u2502 \u{1F4B0} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B \u1D18\u1D00\u026A\u1D05:</b> \u20B9${paidAmount}`,
          `\u2502 \u{1F194} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(orderId)}</code>`,
          `\u2502 \u{1F4C5} <b>\u1D20\u1D00\u029F\u026A\u1D05 \u1D1C\u0274\u1D1B\u026A\u029F:</b> ${escapeHtml(expDateStr)}`,
          `\u2502 \u267E\uFE0F <b>\u1D00\u1D04\u1D04\u1D07ss:</b> \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u1D0Fs\u026A\u0274\u1D1B s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`,
          WIDE_BOT_BORDER,
          `\u2728 <b>\u1D1B\u029C\u1D00\u0274\u1D0B \u028F\u1D0F\u1D1C! \u028F\u1D0F\u1D1C\u0280 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u026As \u0274\u1D0F\u1D21 \u029F\u026A\u1D20\u1D07 \u{1F680}</b>`
        ].join("\n");
        const successMarkup = {
          inline_keyboard: [
            [
              withEmojiId(
                { text: "\u{1F4DE} s\u1D1B\u1D00\u0280\u1D1B \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 s\u1D07\u1D00\u0280\u1D04\u029C", callback_data: "menu_num", style: "success" },
                "num"
              )
            ],
            [
              withEmojiId(
                { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "primary" },
                "close"
              )
            ]
          ]
        };
        await renderBotScreen(chatId, user, successCaption, successMarkup, {
          targetMessageId: options.targetMessageId || user.lastBotMessageId,
          photoKind: "banner"
        });
        for (const adminId of store.config.adminIds) {
          await tgApi("sendMessage", {
            chat_id: adminId,
            text: [
              `\u{1F4B0} <b>${toBoldSans("NEW AUTO-VERIFIED PAYMENT")}</b> \u2705`,
              WIDE_TOP_BORDER,
              `\u2502 \u{1F464} <b>\u1D1Cs\u1D07\u0280:</b> ${escapeHtml(user.firstName)} (${user.username ? "@" + escapeHtml(user.username) : "No Username"})`,
              `\u2502 \u{1F194} <b>\u1D1Cs\u1D07\u0280 \u026A\u1D05:</b> <code>${user.telegramId}</code>`,
              `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${order.planLabel}`,
              `\u2502 \u{1F4B5} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B:</b> \u20B9${paidAmount}`,
              `\u2502 \u{1F9FE} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(orderId)}</code>`,
              WIDE_BOT_BORDER
            ].join("\n"),
            parse_mode: "HTML"
          }).catch(() => {
          });
        }
      }
      return {
        verified: true,
        gatewayStatus: "success",
        message: "Payment Verified & Premium Activated!",
        amount: paidAmount
      };
    }
    const baseMsg = String(data?.message || "Payment not received yet");
    const gwDetail = data?.gateway_message ? ` (${data.gateway_message})` : "";
    return {
      verified: false,
      gatewayStatus: String(data?.status || "pending"),
      message: `${baseMsg}${gwDetail}`
    };
  } catch (err) {
    return {
      verified: false,
      gatewayStatus: "network_error",
      message: err?.message || "Failed to contact VC Gateway."
    };
  }
}
async function sendDynamicPaymentQrScreen(chatId, user, planKey, options = {}) {
  user.awaitingInput = null;
  const plan = getPlanDetails(planKey);
  const orderId = "VC" + Date.now() + Math.floor(Math.random() * 1e3);
  const upiId = (store.config.paymentUpiId || DEFAULT_PAYMENT_UPI_ID).trim();
  const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${plan.amount}&tr=${orderId}&tn=${orderId}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(
    upiString
  )}`;
  user.activePaymentOrder = {
    orderId,
    planKey: plan.planKey,
    planLabel: plan.planLabel,
    amount: plan.amount,
    days: plan.days,
    upiString,
    qrImageUrl,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  saveStore();
  const caption = buildDynamicQrCaption(
    plan.planLabel,
    plan.amount,
    orderId,
    merchantName,
    options.statusNote
  );
  const markup = buildDynamicQrMarkup(planKey, plan.amount, orderId);
  await renderBotScreen(chatId, user, caption, markup, {
    targetMessageId: options.targetMessageId,
    photoKind: "dynamic_qr",
    customPhotoUrl: qrImageUrl
  });
}
async function sendReferScreen(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const refLink = `https://t.me/${botUsernameCache}?start=ref_${user.telegramId}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("\u26A1 Fast OSINT Number Lookup Bot on Telegram! Get Free Searches:")}`;
  const text = options.limitReached ? [
    `\u26A0\uFE0F <b>${toBoldSans("DAILY LIMIT OVER \u2022 REFER & EARN")}</b> \u{1F381}`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F6D1} <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${store.config.dailyFreeLimit}/${store.config.dailyFreeLimit} \u1D1Cs\u1D07\u1D05 (0 \u029F\u1D07\u0493\u1D1B)`,
    `\u2502 \u{1FA99} <b>\u0299\u1D0F\u0274\u1D1Cs \u1D04\u0280\u1D07\u1D05\u026A\u1D1Bs:</b> ${user.credits} s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`,
    `\u2502 \u{1F465} <b>\u1D1B\u1D0F\u1D1B\u1D00\u029F \u0280\u1D07\u0493\u1D07\u0280\u0280\u1D00\u029Fs:</b> ${user.referralCount}`,
    `\u2502 \u{1F3AF} <b>\u0280\u1D07\u1D21\u1D00\u0280\u1D05:</b> +${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s / \u026A\u0274\u1D20\u026A\u1D1B\u1D07`,
    WIDE_BOT_BORDER,
    `\u{1F517} <b>\u028F\u1D0F\u1D1C\u0280 \u026A\u0274\u1D20\u026A\u1D1B\u1D07 \u029F\u026A\u0274\u1D0B (\u1D1B\u1D00\u1D18 \u1D1B\u1D0F \u1D04\u1D0F\u1D18\u028F):</b>`,
    `<code>${escapeHtml(refLink)}</code>`,
    ``,
    `\u{1F447}\u{1F3FB} <i>s\u029C\u1D00\u0280\u1D07 \u028F\u1D0F\u1D1C\u0280 \u029F\u026A\u0274\u1D0B \u1D21\u026A\u1D1B\u029C \u0493\u0280\u026A\u1D07\u0274\u1D05s \u1D1B\u1D0F \u0262\u1D07\u1D1B <b>+${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s</b> \u026A\u0274s\u1D1B\u1D00\u0274\u1D1B\u029F\u028F \u1D0F\u0280 \u1D1C\u0274\u029F\u1D0F\u1D04\u1D0B <b>\u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D</b>!</i>`
  ].join("\n") : [
    `\u{1F381} <b>${toBoldSans("REFER & EARN CREDITS")}</b> \u2728`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F3AF} <b>\u1D05\u1D00\u026A\u029F\u028F \u0493\u0280\u1D07\u1D07 \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${getRemainingDailyFree(user)}/${store.config.dailyFreeLimit} \u029F\u1D07\u0493\u1D1B`,
    `\u2502 \u{1F465} <b>\u1D1B\u1D0F\u1D1B\u1D00\u029F \u0280\u1D07\u0493\u1D07\u0280\u0280\u1D00\u029Fs:</b> ${user.referralCount}`,
    `\u2502 \u{1FA99} <b>\u0299\u1D0F\u0274\u1D1Cs \u1D04\u0280\u1D07\u1D05\u026A\u1D1Bs:</b> ${user.credits} s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`,
    `\u2502 \u{1F525} <b>\u0280\u1D07\u1D21\u1D00\u0280\u1D05:</b> +${store.config.referralBonusCredits} \u1D18\u1D07\u0280 \u026A\u0274\u1D20\u026A\u1D1B\u1D07`,
    WIDE_BOT_BORDER,
    `\u{1F517} <b>\u028F\u1D0F\u1D1C\u0280 \u026A\u0274\u1D20\u026A\u1D1B\u1D07 \u029F\u026A\u0274\u1D0B (\u1D1B\u1D00\u1D18 \u1D1B\u1D0F \u1D04\u1D0F\u1D18\u028F):</b>`,
    `<code>${escapeHtml(refLink)}</code>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        withEmojiId(
          {
            text: `\u{1F4E4} s\u029C\u1D00\u0280\u1D07 \u0280\u1D07\u0493\u1D07\u0280\u0280\u1D00\u029F \u029F\u026A\u0274\u1D0B (+${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07)`,
            url: shareUrl,
            style: "success"
          },
          "refer"
        )
      ],
      [
        withEmojiId(
          { text: "\u{1F451} \u1D1C\u0274\u029F\u1D0F\u1D04\u1D0B \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "menu_premium", style: "primary" },
          "premium"
        ),
        withEmojiId(
          { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "danger" },
          "close"
        )
      ]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    targetMessageId: options.targetMessageId,
    photoKind: "banner"
  });
}
async function sendHelpScreen(chatId, user, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const text = [
    `\u{1F4AC} <b>${toBoldSans("OSINT BOT GUIDE")}</b> \u{1F4A1}`,
    WIDE_TOP_BORDER,
    `\u2502 1\uFE0F\u20E3 \u1D1B\u1D00\u1D18 <b>\u{1F4DE} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u026A\u0274\u0493\u1D0F</b> & s\u1D07\u0274\u1D05`,
    `\u2502    \u1D00\u0274\u028F 10-\u1D05\u026A\u0262\u026A\u1D1B \u1D0D\u1D0F\u0299\u026A\u029F\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280.`,
    `\u2502 2\uFE0F\u20E3 \u1D1Cs\u1D07 <b>\u2B05\uFE0F \u1D18\u0280\u1D07\u1D20 / \u0274\u1D07x\u1D1B \u27A1\uFE0F</b> \u1D1B\u1D0F`,
    `\u2502    \u0299\u0280\u1D0F\u1D21s\u1D07 \u1D0D\u1D1C\u029F\u1D1B\u026A\u1D18\u029F\u1D07 \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s.`,
    `\u2502 3\uFE0F\u20E3 \u1D1B\u1D00\u1D18 <b>\u{1F451} \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D</b> \u1D1B\u1D0F \u1D20\u026A\u1D07\u1D21`,
    `\u2502    \u01EB\u0280 \u1D04\u1D0F\u1D05\u1D07 & \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u1D18\u029F\u1D00\u0274s.`,
    WIDE_BOT_BORDER,
    `\u2728 <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00\u0274 \u1D0F\u1D18\u1D1B\u026A\u1D0F\u0274 \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        withEmojiId(
          { text: "\u{1F4DE} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u026A\u0274\u0493\u1D0F", callback_data: "menu_num", style: "primary" },
          "num"
        ),
        withEmojiId(
          { text: "\u{1F451} \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "menu_premium", style: "success" },
          "premium"
        )
      ],
      [
        withEmojiId(
          { text: "\u{1F381} \u0280\u1D07\u0493\u1D07\u0280 & \u1D07\u1D00\u0280\u0274", callback_data: "menu_refer", style: "success" },
          "refer"
        ),
        withEmojiId(
          { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "danger" },
          "close"
        )
      ]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
function buildAdminDashboardText() {
  const allUsers = Object.values(store.users);
  const today = getTodayDateString();
  const activeToday = allUsers.filter((u) => u.lastActiveAt.startsWith(today)).length;
  const premiumCount = allUsers.filter((u) => isUserPremium(u)).length;
  const totalLookups = allUsers.reduce((acc, u) => acc + (u.totalLookups || 0), 0);
  const verifiedOrdersCount = Array.isArray(store.config.verifiedOrderIds) ? store.config.verifiedOrderIds.length : 0;
  return [
    `\u2261 \u{1F6E1}\uFE0F <b>${toBoldSans("STEALTH ADMIN PANEL")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F465} <b>\u1D1Cs\u1D07\u0280s:</b> ${allUsers.length} (\u1D1B\u1D0F\u1D05\u1D00\u028F: ${activeToday})`,
    `\u2502 \u{1F451} <b>\u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D:</b> ${premiumCount} | \u{1F50D} <b>s\u1D07\u1D00\u0280\u1D04\u029C:</b> ${totalLookups}`,
    `\u2502 \u{1F3AF} <b>\u029F\u026A\u1D0D\u026A\u1D1B:</b> ${store.config.dailyFreeLimit}/\u1D05 | \u{1F381} <b>\u0280\u1D07\u0493:</b> +${store.config.referralBonusCredits}`,
    `\u2502 \u{1F4E2} <b>\u1D04\u029C:</b> ${escapeHtml(store.config.channelUsername)}`,
    `\u2502 \u{1F4B3} <b>\u1D1C\u1D18\u026A:</b> <code>${escapeHtml(store.config.paymentUpiId)}</code> (${verifiedOrdersCount}\u2705)`,
    WIDE_BOT_BORDER,
    `\u{1F4C2} <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00 s\u1D07\u1D04\u1D1B\u026A\u1D0F\u0274 \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
}
async function sendAdminPanel(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const baseText = buildAdminDashboardText();
  const fullText = customNotice ? `${customNotice}

${baseText}` : baseText;
  await renderBotScreen(chatId, user, fullText, getAdminPanelKeyboard(), {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminUsersSection(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const allUsers = Object.values(store.users);
  const premiumCount = allUsers.filter((u) => isUserPremium(u)).length;
  const bannedCount = allUsers.filter((u) => u.isBanned).length;
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u{1F465} <b>${toBoldSans("USERS & PREMIUM SECTION")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F465} <b>\u1D1B\u1D0F\u1D1B\u1D00\u029F \u1D1Cs\u1D07\u0280s:</b> ${allUsers.length}`,
    `\u2502 \u{1F451} <b>\u1D00\u1D04\u1D1B\u026A\u1D20\u1D07 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D:</b> ${premiumCount}`,
    `\u2502 \u{1F6AB} <b>\u0299\u1D00\u0274\u0274\u1D07\u1D05 \u1D1Cs\u1D07\u0280s:</b> ${bannedCount}`,
    WIDE_BOT_BORDER,
    `\u2728 <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00 \u1D1Cs\u1D07\u0280 \u1D00\u1D04\u1D1B\u026A\u1D0F\u0274 \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        { text: "\u{1F451} +\u1D00\u1D05\u1D05 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "adm_add_prem", style: "success" },
        { text: "\u{1F5D1}\uFE0F -\u0280\u1D07\u1D0D\u1D0F\u1D20\u1D07 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D", callback_data: "adm_rem_prem", style: "danger" }
      ],
      [
        { text: "\u{1FA99} +\u1D00\u1D05\u1D05 \u1D04\u0280\u1D07\u1D05\u026A\u1D1Bs", callback_data: "adm_add_cred", style: "success" },
        { text: "\u2796 -\u1D05\u1D07\u1D05\u1D1C\u1D04\u1D1B \u1D04\u0280\u1D07\u1D05\u026A\u1D1Bs", callback_data: "adm_ded_cred", style: "danger" }
      ],
      [
        { text: "\u{1F6AB} \u0299\u1D00\u0274 \u1D1Cs\u1D07\u0280", callback_data: "adm_ban", style: "danger" },
        { text: "\u2705 \u1D1C\u0274\u0299\u1D00\u0274 \u1D1Cs\u1D07\u0280", callback_data: "adm_unban", style: "success" }
      ],
      [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminPaymentSection(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const verifiedOrdersCount = Array.isArray(store.config.verifiedOrderIds) ? store.config.verifiedOrderIds.length : 0;
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u{1F4B3} <b>${toBoldSans("PAYMENT & PLANS SECTION")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F3E6} <b>\u1D1C\u1D18\u026A \u026A\u1D05:</b> <code>${escapeHtml(store.config.paymentUpiId)}</code>`,
    `\u2502 \u{1F511} <b>\u1D20\u1D04 \u1D00\u1D18\u026A:</b> <code>${escapeHtml(store.config.paymentApiKey.slice(0, 12))}...</code>`,
    `\u2502 \u2705 <b>\u1D20\u1D07\u0280\u026A\u0493\u026A\u1D07\u1D05 \u1D0F\u0280\u1D05\u1D07\u0280s:</b> ${verifiedOrdersCount}`,
    `\u2502 \u{1F5D3}\uFE0F <b>\u1D21\u1D07\u1D07\u1D0B\u029F\u028F:</b> ${escapeHtml(store.config.premiumWeeklyPrice)}`,
    `\u2502 \u{1F4C5} <b>\u1D0D\u1D0F\u0274\u1D1B\u029C\u029F\u028F:</b> ${escapeHtml(store.config.premiumMonthlyPrice)}`,
    `\u2502 \u267E\uFE0F <b>\u029F\u026A\u0493\u1D07\u1D1B\u026A\u1D0D\u1D07:</b> ${escapeHtml(store.config.premiumLifetimePrice)}`,
    WIDE_BOT_BORDER,
    `\u2728 <b>s\u1D07\u029F\u1D07\u1D04\u1D1B \u1D00 \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B s\u1D07\u1D1B\u1D1B\u026A\u0274\u0262 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        { text: "\u{1F4B0} \u1D18\u029F\u1D00\u0274 \u1D18\u0280\u026A\u1D04\u1D07s", callback_data: "adm_set_prices", style: "success" },
        { text: "\u{1F4B3} \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B \u1D00\u1D18\u026A & \u1D1C\u1D18\u026A", callback_data: "adm_set_pay_api", style: "primary" }
      ],
      [{ text: "\u{1F4F2} \u1D04\u029C\u1D00\u0274\u0262\u1D07 \u01EB\u0280 \u1D18\u029C\u1D0F\u1D1B\u1D0F / \u029F\u026A\u0274\u1D0B", callback_data: "adm_set_qr", style: "success" }],
      [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminMediaSection(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const hasCustomBanner = Boolean(store.config.customBannerImageUrl || fs.existsSync(CUSTOM_BANNER_DISK_PATH));
  const hasCustomQr = Boolean(store.config.customQrImageUrl || fs.existsSync(CUSTOM_QR_DISK_PATH));
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u{1F5BC}\uFE0F <b>${toBoldSans("MEDIA & EMOJIS SECTION")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F5BC}\uFE0F <b>s\u1D1B\u1D00\u0280\u1D1B \u0299\u1D00\u0274\u0274\u1D07\u0280:</b> ${hasCustomBanner ? "\u2705 Custom (1376\xD7768)" : "\u{1F539} Default (1376\xD7768)"}`,
    `\u2502 \u{1F4F2} <b>\u01EB\u0280 \u026A\u1D0D\u1D00\u0262\u1D07:</b> ${hasCustomQr ? "\u2705 Custom (1024\xD71024)" : "\u{1F539} Default (1024\xD71024)"}`,
    `\u2502 \u2728 <b>\u0299\u1D1C\u1D1B\u1D1B\u1D0F\u0274 \u1D07\u1D0D\u1D0F\u1D0A\u026As:</b> Active`,
    WIDE_BOT_BORDER,
    `\u{1F4A1} <b>s\u1D1C\u1D18\u1D18\u1D0F\u0280\u1D1Bs \u1D05\u026A\u0280\u1D07\u1D04\u1D1B \u1D18\u029C\u1D0F\u1D1B\u1D0F & \u026A\u1D0D\u1D00\u0262\u1D07 \u029F\u026A\u0274\u1D0Bs!</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        { text: "\u{1F5BC}\uFE0F s\u1D1B\u1D00\u0280\u1D1B \u1D18\u029C\u1D0F\u1D1B\u1D0F / \u029F\u026A\u0274\u1D0B", callback_data: "adm_set_banner", style: "primary" },
        { text: "\u{1F4F2} \u01EB\u0280 \u1D18\u029C\u1D0F\u1D1B\u1D0F / \u029F\u026A\u0274\u1D0B", callback_data: "adm_set_qr", style: "success" }
      ],
      [{ text: "\u2728 \u1D04\u1D1Cs\u1D1B\u1D0F\u1D0D \u0299\u1D1C\u1D1B\u1D1B\u1D0F\u0274 \u1D07\u1D0D\u1D0F\u1D0A\u026As", callback_data: "adm_set_emojis", style: "primary" }],
      [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminConfigSection(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const fjLabel = store.config.forceJoinEnabled ? "\u{1F7E2} \u0493-\u1D0A\u1D0F\u026A\u0274: \u1D0F\u0274" : "\u{1F534} \u0493-\u1D0A\u1D0F\u026A\u0274: \u1D0F\u0493\u0493";
  const adhModeLabel = store.config.aadhaarComingSoon ? "\u{1F6A7} \u1D00\u1D05\u029C: s\u1D0F\u1D0F\u0274" : "\u{1F7E2} \u1D00\u1D05\u029C: \u029F\u026A\u1D20\u1D07";
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u2699\uFE0F <b>${toBoldSans("CHANNELS & API SECTION")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F6E1}\uFE0F <b>\u0493\u1D0F\u0280\u1D04\u1D07-\u1D0A\u1D0F\u026A\u0274:</b> ${store.config.forceJoinEnabled ? "\u{1F7E2} \u1D07\u0274\u1D00\u0299\u029F\u1D07\u1D05" : "\u{1F534} \u1D05\u026As\u1D00\u0299\u029F\u1D07\u1D05"}`,
    `\u2502 \u{1F4A0} <b>\u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u1D0D\u1D0F\u1D05\u1D07:</b> ${store.config.aadhaarComingSoon ? "\u{1F6A7} \u1D04\u1D0F\u1D0D\u026A\u0274\u0262 s\u1D0F\u1D0F\u0274" : "\u{1F7E2} \u029F\u026A\u1D20\u1D07 \u1D00\u1D18\u026A"}`,
    `\u2502 \u{1F4E2} <b>\u1D04\u029C 1:</b> ${escapeHtml(store.config.channelUsername)}`,
    `\u2502 \u{1F4E2} <b>\u1D04\u029C 2:</b> ${escapeHtml(store.config.secondChannelUsername || "@followxpresss")}`,
    `\u2502 \u{1F511} <b>\u1D00\u1D18\u026A:</b> <code>${escapeHtml(store.config.numberApiUrl.slice(0, 28))}...</code>`,
    WIDE_BOT_BORDER,
    `\u2728 <b>\u1D1B\u1D0F\u0262\u0262\u029F\u1D07 \u1D0F\u0280 \u1D1C\u1D18\u1D05\u1D00\u1D1B\u1D07 \u1D04\u1D0F\u0274\u0493\u026A\u0262 \u0299\u1D07\u029F\u1D0F\u1D21 \u{1F447}\u{1F3FB}</b>`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        { text: fjLabel, callback_data: "adm_toggle_fj", style: "primary" },
        { text: adhModeLabel, callback_data: "adm_toggle_adh", style: "primary" }
      ],
      [
        { text: "\u{1F517} s\u1D07\u1D1B \u1D04\u029C\u1D00\u0274\u0274\u1D07\u029Fs", callback_data: "adm_set_chan", style: "primary" },
        { text: "\u{1F511} \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D00\u1D18\u026A", callback_data: "adm_set_num_api", style: "success" }
      ],
      [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminGithubSection(chatId, user, customNotice, options = {}) {
  user.awaitingInput = null;
  saveStore();
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u{1F4E6} <b>${toBoldSans("STANDALONE BOT (GITHUB 24/7)")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F916} <b>\u1D0D\u1D0F\u1D05\u1D07:</b> s\u1D1B\u1D00\u0274\u1D05\u1D00\u029F\u1D0F\u0274\u1D07 (\u0274\u1D0F \u1D21\u1D07\u0299s\u026A\u1D1B\u1D07)`,
    `\u2502 \u23F1\uFE0F <b>\u1D00\u1D1C\u1D1B\u1D0F-\u0280\u1D07s\u1D1B\u1D00\u0280\u1D1B:</b> \u1D07\u1D20\u1D07\u0280\u028F 6 \u029C\u1D0F\u1D1C\u0280s (\u028F\u1D0D\u029F)`,
    `\u2502 \u{1F4BE} <b>\u1D00\u1D1C\u1D1B\u1D0F-s\u1D00\u1D20\u1D07:</b> \u1D05\u0299.\u1D0As\u1D0F\u0274 + \u1D18\u029C\u1D0F\u1D1B\u1D0Fs`,
    WIDE_BOT_BORDER,
    `\u{1F4CB} <b>\u0262\u026A\u1D1B\u029C\u1D1C\u0299 24/7 s\u1D1B\u1D07\u1D18-\u0299\u028F-s\u1D1B\u1D07\u1D18:</b>`,
    `1\uFE0F\u20E3 Tap <b>\u{1F4E5} s\u1D07\u0274\u1D05 s\u1D1B\u1D00\u0274\u1D05\u1D00\u029F\u1D0F\u0274\u1D07 \u1D22\u026A\u1D18</b> & extract files.`,
    `2\uFE0F\u20E3 Create a new <b>GitHub Repo</b> & upload files (<code>bot.js</code>, <code>package.json</code>, <code>db.json</code>, <code>.github/workflows/bot.yml</code>).`,
    `3\uFE0F\u20E3 Open Repo \u2794 <b>Actions</b> tab \u2794 Click <b>Run workflow</b>!`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [{ text: "\u{1F4E5} s\u1D07\u0274\u1D05 s\u1D1B\u1D00\u0274\u1D05\u1D00\u029F\u1D0F\u0274\u1D07 \u1D22\u026A\u1D18 \u026A\u0274 \u1D04\u029C\u1D00\u1D1B", callback_data: "adm_send_zip", style: "success" }],
      [{ text: "\u{1F4C4} s\u1D07\u0274\u1D05 6\u029C \u1D00\u1D1C\u1D1B\u1D0F-\u0280\u1D07s\u1D1B\u1D00\u0280\u1D1B \u028F\u1D0D\u029F", callback_data: "adm_send_yml", style: "primary" }],
      [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function sendAdminDailyLimitScreen(chatId, user, customNotice, options = {}) {
  user.awaitingInput = "admin_set_daily_limit";
  saveStore();
  const headerNotice = customNotice ? `${customNotice}

` : "";
  const text = [
    `${headerNotice}\u{1F3AF} <b>${toBoldSans("DAILY LIMIT & REFERRAL")}</b> \u26A1`,
    WIDE_TOP_BORDER,
    `\u2502 \u{1F3AF} <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B:</b> ${store.config.dailyFreeLimit} s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s/\u1D05\u1D00\u028F`,
    `\u2502 \u{1F381} <b>\u0280\u1D07\u0493\u1D07\u0280 \u0299\u1D0F\u0274\u1D1Cs:</b> +${store.config.referralBonusCredits} s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s/\u026A\u0274\u1D20\u026A\u1D1B\u1D07`,
    WIDE_BOT_BORDER,
    `\u26A1 <b>\u1D1B\u1D00\u1D18 \u1D00 \u1D18\u0280\u1D07s\u1D07\u1D1B \u1D0F\u0280 \u1D1B\u028F\u1D18\u1D07:</b>`,
    `\u2022 <code>5</code> (s\u1D07\u1D1B \u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B) | <code>5 | 3</code> (\u029F\u026A\u1D0D\u026A\u1D1B & \u0280\u1D07\u0493)`,
    `\u2022 <code>reset 6672896116</code> (\u0280\u1D07s\u1D07\u1D1B 1 \u1D1Cs\u1D07\u0280)`
  ].join("\n");
  const markup = {
    inline_keyboard: [
      [
        { text: "\u{1F3AF} 1/\u1D05\u1D00\u028F", callback_data: "adm_qlimit_1", style: "primary" },
        { text: "\u{1F3AF} 2/\u1D05\u1D00\u028F", callback_data: "adm_qlimit_2", style: "primary" },
        { text: "\u{1F3AF} 3/\u1D05\u1D00\u028F", callback_data: "adm_qlimit_3", style: "success" }
      ],
      [
        { text: "\u{1F3AF} 5/\u1D05\u1D00\u028F", callback_data: "adm_qlimit_5", style: "success" },
        { text: "\u{1F3AF} 10/\u1D05\u1D00\u028F", callback_data: "adm_qlimit_10", style: "success" },
        { text: "\u{1F504} \u0280\u1D07s\u1D07\u1D1B \u1D00\u029F\u029F", callback_data: "adm_reset_limits", style: "primary" }
      ],
      [
        { text: "\u{1F381} +1 \u0280\u1D07\u0493", callback_data: "adm_qref_1", style: "primary" },
        { text: "\u{1F381} +2 \u0280\u1D07\u0493", callback_data: "adm_qref_2", style: "success" }
      ],
      [
        { text: "\u{1F381} +3 \u0280\u1D07\u0493", callback_data: "adm_qref_3", style: "success" },
        { text: "\u{1F381} +5 \u0280\u1D07\u0493", callback_data: "adm_qref_5", style: "success" }
      ],
      [
        { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }
      ]
    ]
  };
  await renderBotScreen(chatId, user, text, markup, {
    ...options,
    photoKind: "banner"
  });
}
async function executeUserLookup(chatId, user, serviceType, rawText) {
  if (serviceType === "num_aadhaar" && store.config.aadhaarComingSoon) {
    await sendAadhaarPrompt(chatId, user);
    return;
  }
  const digits = rawText.replace(/\D/g, "");
  if (serviceType === "number_info") {
    const clean10 = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    if (clean10.length !== 10) {
      await renderBotScreen(
        chatId,
        user,
        `\u26A0\uFE0F <b>${toBoldSans("INVALID NUMBER")}</b>
${WIDE_TOP_BORDER}
\u2502 \u1D18\u029F\u1D07\u1D00s\u1D07 s\u1D07\u0274\u1D05 \u1D00 \u1D20\u1D00\u029F\u026A\u1D05 <b>10-\u1D05\u026A\u0262\u026A\u1D1B</b>
\u2502 \u1D0D\u1D0F\u0299\u026A\u029F\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 (\u1D07.\u0262. <code>9835216800</code>).
${WIDE_BOT_BORDER}`,
        getCancelToMenuKeyboard(),
        { photoKind: "banner" }
      );
      return;
    }
  } else {
    if (digits.length !== 12) {
      await renderBotScreen(
        chatId,
        user,
        `\u26A0\uFE0F <b>${toBoldSans("INVALID AADHAAR")}</b>
${WIDE_TOP_BORDER}
\u2502 \u1D18\u029F\u1D07\u1D00s\u1D07 s\u1D07\u0274\u1D05 \u1D00 \u1D20\u1D00\u029F\u026A\u1D05 <b>12-\u1D05\u026A\u0262\u026A\u1D1B</b>
\u2502 \u1D00\u1D00\u1D05\u029C\u1D00\u1D00\u0280 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 (\u1D07.\u0262. <code>123456789012</code>).
${WIDE_BOT_BORDER}`,
        getCancelToMenuKeyboard(),
        { photoKind: "banner" }
      );
      return;
    }
  }
  const unlimited = isUserPremium(user);
  refreshDailyQuota(user);
  const freeLeft = getRemainingDailyFree(user);
  if (!unlimited && freeLeft <= 0 && user.credits <= 0) {
    await sendReferScreen(chatId, user, { limitReached: true });
    return;
  }
  user.awaitingInput = null;
  saveStore();
  await renderBotScreen(
    chatId,
    user,
    serviceType === "num_aadhaar" ? `\u2261 \u{1F4A0} <b>${toBoldSans("SCANNING AADHAAR DATABASE...")}</b> \u26A1
${WIDE_TOP_BORDER}
\u2502 \u{1F50E} \u1D1B\u1D00\u0280\u0262\u1D07\u1D1B: <code>${escapeHtml(digits)}</code>
\u2502 \u23F3 \u0493\u1D07\u1D1B\u1D04\u029C\u026A\u0274\u0262 \u029F\u026A\u1D20\u1D07 \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s...
${WIDE_BOT_BORDER}` : `\u2261 \u{1F4DE} <b>${toBoldSans("SCANNING NUMBER DATABASE...")}</b> \u26A1
${WIDE_TOP_BORDER}
\u2502 \u{1F50E} \u1D1B\u1D00\u0280\u0262\u1D07\u1D1B: <code>${escapeHtml(digits)}</code>
\u2502 \u23F3 \u0493\u1D07\u1D1B\u1D04\u029C\u026A\u0274\u0262 \u029F\u026A\u1D20\u1D07 \u0280\u1D07\u1D04\u1D0F\u0280\u1D05s...
${WIDE_BOT_BORDER}`,
    getCancelToMenuKeyboard(),
    { photoKind: "banner" }
  );
  const result = await performOsintLookup(serviceType, digits);
  if (!unlimited) {
    if (freeLeft > 0) {
      user.dailySearchCount += 1;
    } else if (user.credits > 0) {
      user.credits = Math.max(0, user.credits - 1);
    }
  }
  user.totalLookups = (user.totalLookups || 0) + 1;
  user.lastLookupSession = {
    serviceType,
    query: result.cleanQuery,
    records: result.records,
    page: 0
  };
  store.history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    telegramId: user.telegramId,
    username: user.username || user.firstName,
    serviceType,
    query: result.cleanQuery,
    status: result.status,
    recordCount: result.records.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (store.history.length > 200) {
    store.history = store.history.slice(0, 200);
  }
  saveStore();
  const remainingAfter = getRemainingDailyFree(user);
  const exhaustedAfter = !unlimited && remainingAfter <= 0 && user.credits <= 0;
  const refLink = `https://t.me/${botUsernameCache}?start=ref_${user.telegramId}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("\u26A1 Fast OSINT Number Lookup Bot on Telegram! Get Free Searches:")}`;
  let pageCaption = formatPaginatedRecordCaption(serviceType, result.cleanQuery, result.records, 0);
  if (exhaustedAfter) {
    const footer = `
\u26A0\uFE0F <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B \u1D04\u1D0F\u1D0D\u1D18\u029F\u1D07\u1D1B\u1D07\u1D05!</b> \u{1F381} s\u029C\u1D00\u0280\u1D07 \u029F\u026A\u0274\u1D0B \u0493\u1D0F\u0280 <b>+${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s</b>:
<code>${escapeHtml(refLink)}</code>`;
    if (pageCaption.length + footer.length <= 1024) {
      pageCaption += footer;
    }
  }
  await renderBotScreen(
    chatId,
    user,
    pageCaption,
    getLookupResultKeyboard(
      serviceType,
      0,
      result.records.length,
      exhaustedAfter ? shareUrl : void 0
    ),
    { photoKind: "banner" }
  );
}
async function handleAdminTextInput(chatId, adminUser, text, entities) {
  const mode = adminUser.awaitingInput;
  adminUser.awaitingInput = null;
  saveStore();
  const parts = text.trim().split(/\s+/);
  if (mode === "admin_set_custom_emojis") {
    if (text.trim().toLowerCase() === "reset") {
      store.config.buttonCustomEmojis = { ...DEFAULT_CUSTOM_EMOJIS };
      saveStore();
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u2705 <b>Reset to Official Telegram Custom Emoji IDs!</b>`
      );
      return;
    }
    const extractedIds = [];
    if (Array.isArray(entities)) {
      for (const ent of entities) {
        if (ent.type === "custom_emoji" && ent.custom_emoji_id) {
          extractedIds.push(String(ent.custom_emoji_id));
        }
      }
    }
    const rawDigitMatches = text.match(/\b\d{17,21}\b/g);
    if (rawDigitMatches) {
      for (const m of rawDigitMatches) {
        if (!extractedIds.includes(m)) extractedIds.push(m);
      }
    }
    if (extractedIds.length > 0) {
      const keys = ["num", "aadhaar", "premium", "refer", "channel", "help", "close"];
      if (!store.config.buttonCustomEmojis) {
        store.config.buttonCustomEmojis = { ...DEFAULT_CUSTOM_EMOJIS };
      }
      extractedIds.forEach((id, idx) => {
        if (keys[idx]) {
          store.config.buttonCustomEmojis[keys[idx]] = id;
        }
      });
      saveStore();
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u2705 <b>Detected & Applied ${extractedIds.length} Custom Emoji ID(s) to Colored Buttons!</b>
<code>${extractedIds.join(", ")}</code>`
      );
      return;
    }
    await sendAdminPanel(
      chatId,
      adminUser,
      `\u26A0\uFE0F <b>No Telegram Custom Emoji detected.</b> Send a message containing Telegram Premium emojis, forward a bot message with custom emojis, or type <code>reset</code>.`
    );
    return;
  }
  if (mode === "admin_set_start_image") {
    if (text.trim().toLowerCase() === "reset") {
      if (fs.existsSync(CUSTOM_BANNER_DISK_PATH)) {
        try {
          fs.unlinkSync(CUSTOM_BANNER_DISK_PATH);
        } catch {
        }
      }
      store.config.cachedBannerFileId = "";
      store.config.customBannerImageUrl = "";
      for (const u of Object.values(store.users)) {
        u.lastBotPhotoKind = void 0;
      }
      saveStore();
      await sendAdminPanel(chatId, adminUser, `\u2705 <b>Start Banner Image reset to default (1376\xD7768)!</b>`, {
        forceMediaSwap: true
      });
      return;
    }
    const cleanLink = normalizeImageShareUrl(text.trim());
    store.config.customBannerImageUrl = cleanLink;
    store.config.cachedBannerFileId = "";
    saveStore();
    const normRes = await processAndSaveCustomImage({ url: cleanLink }, "banner");
    if (normRes.ok) {
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u2705 <b>Start Banner Link Downloaded & Auto-Resized to Exact Same Size (1376\xD7768)!</b>`,
        { forceMediaSwap: true }
      );
    } else {
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u26A0\uFE0F <b>Link could not be downloaded (${escapeHtml(normRes.error || "invalid image URL")}). Please send a direct image URL or upload the photo directly!</b>`
      );
    }
    return;
  }
  if (mode === "admin_set_qr_image") {
    if (text.trim().toLowerCase() === "reset") {
      if (fs.existsSync(CUSTOM_QR_DISK_PATH)) {
        try {
          fs.unlinkSync(CUSTOM_QR_DISK_PATH);
        } catch {
        }
      }
      store.config.cachedQrFileId = "";
      store.config.customQrImageUrl = "";
      for (const u of Object.values(store.users)) {
        u.lastBotPhotoKind = void 0;
      }
      saveStore();
      await sendAdminPanel(chatId, adminUser, `\u2705 <b>Premium QR Image reset to default!</b>`, {
        forceMediaSwap: true
      });
      return;
    }
    const cleanLink = normalizeImageShareUrl(text.trim());
    store.config.customQrImageUrl = cleanLink;
    store.config.cachedQrFileId = "";
    saveStore();
    const normRes = await processAndSaveCustomImage({ url: cleanLink }, "qr");
    if (normRes.ok) {
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u2705 <b>Premium QR Image Link Downloaded & Auto-Resized (1024\xD71024)!</b>`,
        { forceMediaSwap: true }
      );
    } else {
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u26A0\uFE0F <b>QR Link could not be downloaded (${escapeHtml(normRes.error || "invalid URL")}). Please send a direct image URL or upload the photo!</b>`
      );
    }
    return;
  }
  if (mode === "admin_set_premium_prices") {
    const segments = text.split("|").map((s) => s.trim()).filter(Boolean);
    if (segments.length >= 3) {
      store.config.premiumWeeklyPrice = segments[0];
      store.config.premiumMonthlyPrice = segments[1];
      store.config.premiumLifetimePrice = segments[2];
      if (segments[3]) {
        store.config.premiumPaymentNote = segments[3];
      }
    } else {
      store.config.premiumMonthlyPrice = text.trim();
    }
    saveStore();
    await sendAdminPanel(
      chatId,
      adminUser,
      `\u2705 <b>Premium Prices Updated:</b>
\u26A1 ${escapeHtml(store.config.premiumWeeklyPrice)} | \u{1F48E} ${escapeHtml(store.config.premiumMonthlyPrice)} | \u{1F451} ${escapeHtml(store.config.premiumLifetimePrice)}`
    );
    return;
  }
  if (mode === "admin_set_payment_api") {
    if (text.trim().toLowerCase() === "reset") {
      store.config.paymentApiKey = DEFAULT_PAYMENT_API_KEY;
      store.config.paymentUpiId = DEFAULT_PAYMENT_UPI_ID;
      store.config.paymentMerchantName = DEFAULT_PAYMENT_MERCHANT;
      saveStore();
      await sendAdminPanel(
        chatId,
        adminUser,
        `\u2705 <b>VC Gateway Payment API & UPI reset to default!</b>`
      );
      return;
    }
    const segs = text.split("|").map((s) => s.trim()).filter(Boolean);
    if (segs.length === 1) {
      if (segs[0].includes("@")) {
        store.config.paymentUpiId = segs[0];
      } else {
        store.config.paymentApiKey = segs[0];
      }
    } else {
      if (segs.length >= 1) {
        store.config.paymentApiKey = segs[0];
      }
      if (segs.length >= 2) {
        store.config.paymentUpiId = segs[1];
      }
      if (segs.length >= 3) {
        store.config.paymentMerchantName = segs[2];
      }
    }
    saveStore();
    await sendAdminPanel(
      chatId,
      adminUser,
      `\u2705 <b>VC Gateway Payment Config Updated!</b>
\u{1F511} API Key: <code>${escapeHtml(
        store.config.paymentApiKey
      )}</code>
\u{1F3E6} UPI ID: <code>${escapeHtml(store.config.paymentUpiId)}</code>`
    );
    return;
  }
  if (mode === "admin_set_daily_limit") {
    const rawTrimmed = text.trim();
    if (rawTrimmed.toLowerCase().startsWith("reset")) {
      const targetPart = rawTrimmed.split(/\s+/)[1] || "all";
      if (targetPart.toLowerCase() === "all") {
        const today = getTodayDateString();
        let resetCount = 0;
        for (const u of Object.values(store.users)) {
          u.dailySearchDate = today;
          u.dailySearchCount = 0;
          resetCount++;
        }
        saveStore();
        await sendAdminPanel(
          chatId,
          adminUser,
          `\u2705 <b>Reset today's daily search quota for all ${resetCount} users!</b>`
        );
        return;
      } else {
        const targetUser = findUserByIdentifier(targetPart);
        if (!targetUser) {
          await sendAdminPanel(
            chatId,
            adminUser,
            `\u26A0\uFE0F <b>User not found:</b> <code>${escapeHtml(targetPart)}</code>`
          );
          return;
        }
        targetUser.dailySearchDate = getTodayDateString();
        targetUser.dailySearchCount = 0;
        saveStore();
        await sendAdminPanel(
          chatId,
          adminUser,
          `\u2705 <b>Reset today's search limit for:</b> ${escapeHtml(targetUser.firstName)} (<code>${targetUser.telegramId}</code>)`
        );
        return;
      }
    }
    const segs = rawTrimmed.split(/[|\s]+/).map((s) => s.trim()).filter(Boolean);
    const newDaily = parseInt(segs[0] || "", 10);
    if (!isNaN(newDaily) && newDaily >= 0) {
      store.config.dailyFreeLimit = newDaily;
    }
    if (segs[1]) {
      const newRef = parseInt(segs[1], 10);
      if (!isNaN(newRef) && newRef >= 0) {
        store.config.referralBonusCredits = newRef;
      }
    }
    saveStore();
    await sendAdminPanel(
      chatId,
      adminUser,
      `\u2705 <b>Daily Limit & Referral Updated!</b>
\u{1F3AF} Daily Free Searches: <b>${store.config.dailyFreeLimit}/day</b>
\u{1F381} Referral Bonus: <b>+${store.config.referralBonusCredits} searches/invite</b>`
    );
    return;
  }
  if (mode === "admin_add_premium") {
    const targetKey = parts[0] || "";
    const days = Math.max(1, parseInt(parts[1] || "30", 10) || 30);
    const target = findUserByIdentifier(targetKey);
    if (!target) {
      await sendAdminPanel(chatId, adminUser, `\u26A0\uFE0F <b>User not found:</b> <code>${escapeHtml(targetKey)}</code>`);
      return;
    }
    const until = new Date(Date.now() + days * 864e5).toISOString();
    target.premiumUntil = until;
    saveStore();
    await sendAdminPanel(chatId, adminUser, `\u2705 <b>Granted ${days} days Premium to:</b> ${escapeHtml(target.firstName)} (<code>${target.telegramId}</code>)`);
    return;
  }
  if (mode === "admin_remove_premium") {
    const target = findUserByIdentifier(parts[0] || "");
    if (!target) {
      await sendAdminPanel(chatId, adminUser, `\u26A0\uFE0F <b>User not found.</b>`);
      return;
    }
    target.premiumUntil = null;
    saveStore();
    await sendAdminPanel(chatId, adminUser, `\u2705 <b>Removed Premium from:</b> ${escapeHtml(target.firstName)} (<code>${target.telegramId}</code>)`);
    return;
  }
  if (mode === "admin_add_credits" || mode === "admin_deduct_credits") {
    const targetKey = parts[0] || "";
    const amount = Math.max(1, parseInt(parts[1] || "5", 10) || 5);
    const target = findUserByIdentifier(targetKey);
    if (!target) {
      await sendAdminPanel(chatId, adminUser, `\u26A0\uFE0F <b>User not found:</b> <code>${escapeHtml(targetKey)}</code>`);
      return;
    }
    if (mode === "admin_add_credits") {
      target.credits += amount;
      saveStore();
      await sendAdminPanel(chatId, adminUser, `\u2705 <b>Added +${amount} credits to:</b> ${escapeHtml(target.firstName)} (Balance: ${target.credits})`);
    } else {
      target.credits = Math.max(0, target.credits - amount);
      saveStore();
      await sendAdminPanel(chatId, adminUser, `\u2705 <b>Deducted ${amount} credits from:</b> ${escapeHtml(target.firstName)} (Balance: ${target.credits})`);
    }
    return;
  }
  if (mode === "admin_ban_user" || mode === "admin_unban_user") {
    const target = findUserByIdentifier(parts[0] || "");
    if (!target) {
      await sendAdminPanel(chatId, adminUser, `\u26A0\uFE0F <b>User not found.</b>`);
      return;
    }
    target.isBanned = mode === "admin_ban_user";
    saveStore();
    await sendAdminPanel(
      chatId,
      adminUser,
      target.isBanned ? `\u{1F6AB} <b>Banned User:</b> ${escapeHtml(target.firstName)} (<code>${target.telegramId}</code>)` : `\u2705 <b>Unbanned User:</b> ${escapeHtml(target.firstName)} (<code>${target.telegramId}</code>)`
    );
    return;
  }
  if (mode === "admin_set_channel") {
    const rawChan1 = parts[0] || "";
    const cleanChan1 = rawChan1.startsWith("@") ? rawChan1 : `@${rawChan1.replace(/^https?:\/\/t\.me\//i, "")}`;
    const chanUrl1 = `https://t.me/${cleanChan1.replace(/^@/, "")}`;
    store.config.channelUsername = cleanChan1;
    store.config.channelUrl = chanUrl1;
    if (parts[1]) {
      const rawChan2 = parts[1];
      const cleanChan2 = rawChan2.startsWith("@") ? rawChan2 : `@${rawChan2.replace(/^https?:\/\/t\.me\//i, "")}`;
      store.config.secondChannelUsername = cleanChan2;
      store.config.secondChannelUrl = `https://t.me/${cleanChan2.replace(/^@/, "")}`;
    }
    saveStore();
    await sendAdminPanel(
      chatId,
      adminUser,
      `\u2705 <b>Channels Updated:</b> ${escapeHtml(store.config.channelUsername)} & ${escapeHtml(store.config.secondChannelUsername)}`
    );
    return;
  }
  if (mode === "admin_set_num_api") {
    store.config.numberApiUrl = normalizeApiTemplateUrl(text.trim());
    saveStore();
    await sendAdminPanel(chatId, adminUser, `\u2705 <b>Number API URL Updated!</b>
<code>${escapeHtml(store.config.numberApiUrl)}</code>`);
    return;
  }
  if (mode === "admin_set_aadhaar_api") {
    store.config.aadhaarApiUrl = normalizeApiTemplateUrl(text.trim());
    saveStore();
    await sendAdminPanel(chatId, adminUser, `\u2705 <b>Aadhaar API URL Updated!</b>`);
    return;
  }
  if (mode === "admin_broadcast") {
    const allUsers = Object.values(store.users);
    let sentCount = 0;
    for (const u of allUsers) {
      if (u.isBanned) continue;
      const res = await tgApi("sendMessage", {
        chat_id: u.telegramId,
        text: `\u{1F4E2} <b>${toBoldSans("ANNOUNCEMENT")}</b> \u2728
${WIDE_TOP_BORDER}
${escapeHtml(text)}
${WIDE_BOT_BORDER}`,
        parse_mode: "HTML"
      });
      if (res?.ok) sentCount++;
    }
    await sendAdminPanel(chatId, adminUser, `\u2705 <b>Broadcast delivered to ${sentCount} / ${allUsers.length} users.</b>`);
    return;
  }
}
async function handleTelegramUpdate(update) {
  try {
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const clickedMsgId = cb.message?.message_id;
      const data = String(cb.data || "");
      if (!chatId) return;
      const { user } = getOrCreateUser(cb.from);
      if (clickedMsgId) {
        user.lastBotMessageId = clickedMsgId;
        user.lastBotMessageIsPhoto = Boolean(cb.message?.photo);
      }
      if (user.isBanned && !isAdminUser(user.telegramId, user.username)) {
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: "\u{1F6AB} Your account has been restricted.",
          show_alert: true
        });
        return;
      }
      if (data === "page_noop") {
        await tgApi("answerCallbackQuery", { callback_query_id: cb.id }).catch(() => {
        });
        return;
      }
      if (data === "close_card") {
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: "\u2718 Closed"
        }).catch(() => {
        });
        await safeDeleteMessage(chatId, clickedMsgId);
        user.lastBotMessageId = null;
        user.awaitingInput = null;
        saveStore();
        return;
      }
      if (data === "verify_join") {
        const ch1 = await checkSingleChannelMember(store.config.channelUsername, user.telegramId);
        const ch2 = await checkSingleChannelMember(store.config.secondChannelUsername, user.telegramId);
        if (ch1 === "not_joined" || ch2 === "not_joined") {
          await tgApi("answerCallbackQuery", {
            callback_query_id: cb.id,
            text: "\u26A0\uFE0F Please join both official channels first, then tap Verify & Continue!",
            show_alert: true
          });
          return;
        }
        user.joinedChannel = true;
        saveStore();
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: "\u26A1 Access Granted!"
        });
        await sendMainMenu(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      const joined = await checkChannelMembership(user);
      if (!joined) {
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: "\u{1F512} Please join our official channels first to continue.",
          show_alert: true
        });
        await sendChannelJoinGate(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data.startsWith("verify_pay_")) {
        const orderId = data.replace("verify_pay_", "").trim();
        const verifyRes = await verifyOrderWithVcGateway(user, chatId, orderId, {
          targetMessageId: clickedMsgId
        });
        if (verifyRes.verified) {
          await tgApi("answerCallbackQuery", {
            callback_query_id: cb.id,
            text: `\u{1F389} Payment Verified! \u20B9${verifyRes.amount || ""} received.
\u{1F451} Your Premium Plan is now ACTIVE!`,
            show_alert: true
          }).catch(() => {
          });
        } else {
          const activeOrder = user.activePaymentOrder;
          const orderAmt = activeOrder?.amount || 1;
          const planKey = activeOrder?.planKey || "weekly";
          const planLabel = activeOrder?.planLabel || getPlanDetails(planKey).planLabel;
          const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
          await tgApi("answerCallbackQuery", {
            callback_query_id: cb.id,
            text: `\u23F3 Payment Not Verified Yet!

\u{1F194} Order ID: ${orderId}
\u{1F4B0} Amount: \u20B9${orderAmt}
\u{1F4E1} Status: ${verifyRes.message}

\u{1F4A1} Scan QR & pay \u20B9${orderAmt} first, then tap Verify Payment!`,
            show_alert: true
          }).catch(() => {
          });
          if (clickedMsgId) {
            const updatedCaption = buildDynamicQrCaption(
              planLabel,
              orderAmt,
              orderId,
              merchantName,
              `\u274C ${escapeHtml(verifyRes.message)}`
            );
            await tgApi("editMessageCaption", {
              chat_id: chatId,
              message_id: clickedMsgId,
              caption: updatedCaption,
              parse_mode: "HTML",
              reply_markup: buildDynamicQrMarkup(planKey, orderAmt, orderId)
            }).catch(() => {
            });
          }
        }
        return;
      }
      if (data.startsWith("enter_utr_")) {
        const orderId = data.replace("enter_utr_", "").trim();
        const activeOrder = user.activePaymentOrder;
        const orderAmt = activeOrder?.amount || 1;
        const planKey = activeOrder?.planKey || "weekly";
        const planLabel = activeOrder?.planLabel || getPlanDetails(planKey).planLabel;
        const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
        user.awaitingInput = "payment_utr";
        saveStore();
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: `\u{1F522} Send 12-Digit UPI UTR / Ref No.:

Apne UPI App (GPay / PhonePe / Navi / Paytm) ke payment receipt se 12-Digit UTR Number copy karke abhi is chat me bhejein \u2014 1 second me Auto-Verify ho jayega! \u26A1`,
          show_alert: true
        }).catch(() => {
        });
        if (clickedMsgId) {
          const updatedCaption = buildDynamicQrCaption(
            planLabel,
            orderAmt,
            orderId,
            merchantName,
            `\u{1F522} Waiting for your 12-Digit UPI UTR No. in chat...`
          );
          await tgApi("editMessageCaption", {
            chat_id: chatId,
            message_id: clickedMsgId,
            caption: updatedCaption,
            parse_mode: "HTML",
            reply_markup: buildDynamicQrMarkup(planKey, orderAmt, orderId)
          }).catch(() => {
          });
        }
        return;
      }
      if (data.startsWith("send_ss_")) {
        const orderId = data.replace("send_ss_", "").trim();
        const activeOrder = user.activePaymentOrder;
        const orderAmt = activeOrder?.amount || 1;
        const planKey = activeOrder?.planKey || "weekly";
        const planLabel = activeOrder?.planLabel || getPlanDetails(planKey).planLabel;
        const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
        user.awaitingInput = "payment_utr";
        saveStore();
        await tgApi("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: `\u{1F4F8} Send Payment Screenshot:

Apne \u20B9${orderAmt} payment ka Screenshot abhi is chat me photo ki tarah send karein (ya 12-digit UTR type karein)! \u26A1`,
          show_alert: true
        }).catch(() => {
        });
        if (clickedMsgId) {
          const updatedCaption = buildDynamicQrCaption(
            planLabel,
            orderAmt,
            orderId,
            merchantName,
            `\u{1F4F8} Send your Payment Screenshot Photo in chat...`
          );
          await tgApi("editMessageCaption", {
            chat_id: chatId,
            message_id: clickedMsgId,
            caption: updatedCaption,
            parse_mode: "HTML",
            reply_markup: buildDynamicQrMarkup(planKey, orderAmt, orderId)
          }).catch(() => {
          });
        }
        return;
      }
      await tgApi("answerCallbackQuery", { callback_query_id: cb.id }).catch(() => {
      });
      if (data.startsWith("page_")) {
        const targetPage = parseInt(data.replace("page_", ""), 10);
        const session = user.lastLookupSession;
        if (session && Array.isArray(session.records) && session.records.length > 0 && !isNaN(targetPage)) {
          session.page = Math.max(0, Math.min(targetPage, session.records.length - 1));
          saveStore();
          const unlimited = isUserPremium(user);
          const remainingAfter = getRemainingDailyFree(user);
          const exhaustedAfter = !unlimited && remainingAfter <= 0 && user.credits <= 0;
          const refLink = `https://t.me/${botUsernameCache}?start=ref_${user.telegramId}`;
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("\u26A1 Fast OSINT Number Lookup Bot on Telegram! Get Free Searches:")}`;
          let caption = formatPaginatedRecordCaption(
            session.serviceType,
            session.query,
            session.records,
            session.page
          );
          if (exhaustedAfter) {
            const footer = `
\u26A0\uFE0F <b>\u1D05\u1D00\u026A\u029F\u028F \u029F\u026A\u1D0D\u026A\u1D1B \u1D04\u1D0F\u1D0D\u1D18\u029F\u1D07\u1D1B\u1D07\u1D05!</b> \u{1F381} s\u029C\u1D00\u0280\u1D07 \u029F\u026A\u0274\u1D0B \u0493\u1D0F\u0280 <b>+${store.config.referralBonusCredits} \u0493\u0280\u1D07\u1D07 s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s</b>:
<code>${escapeHtml(refLink)}</code>`;
            if (caption.length + footer.length <= 1024) {
              caption += footer;
            }
          }
          await renderBotScreen(
            chatId,
            user,
            caption,
            getLookupResultKeyboard(
              session.serviceType,
              session.page,
              session.records.length,
              exhaustedAfter ? shareUrl : void 0
            ),
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
        }
        return;
      }
      if (data === "back_menu") {
        await sendMainMenu(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_num") {
        await sendNumberPrompt(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_aadhar") {
        await sendAadhaarPrompt(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_premium") {
        await sendPremiumScreen(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "buy_plan_weekly") {
        await sendDynamicPaymentQrScreen(chatId, user, "weekly", { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "buy_plan_monthly") {
        await sendDynamicPaymentQrScreen(chatId, user, "monthly", { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "buy_plan_lifetime") {
        await sendDynamicPaymentQrScreen(chatId, user, "lifetime", { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_refer") {
        await sendReferScreen(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_help") {
        await sendHelpScreen(chatId, user, { targetMessageId: clickedMsgId });
        return;
      }
      if (data === "menu_admin" || data.startsWith("adm_")) {
        if (!isAdminUser(user.telegramId, user.username)) {
          await sendMainMenu(chatId, user, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "menu_admin" || data === "adm_stats") {
          await sendAdminPanel(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_users") {
          await sendAdminUsersSection(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_limits" || data === "adm_set_limit") {
          await sendAdminDailyLimitScreen(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_payment") {
          await sendAdminPaymentSection(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_media") {
          await sendAdminMediaSection(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_config") {
          await sendAdminConfigSection(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_sec_github" || data === "adm_host_guide") {
          await sendAdminGithubSection(chatId, user, void 0, { targetMessageId: clickedMsgId });
          return;
        }
        if (data === "adm_send_zip") {
          const zipBuf = await buildStandaloneBotZipBuffer();
          await sendTelegramDocument(
            chatId,
            zipBuf,
            "standalone-osint-bot-github-24x7.zip",
            [
              `\u{1F4E6} <b>${toBoldSans("STANDALONE BOT ZIP (NO WEBSITE)")}</b> \u2705`,
              WIDE_TOP_BORDER,
              `\u2502 \u{1F4C1} <b>\u0493\u026A\u029F\u1D07s \u026A\u0274s\u026A\u1D05\u1D07 \u1D22\u026A\u1D18:</b>`,
              `\u2502 \u251C <code>bot.js</code> (s\u1D1B\u1D00\u0274\u1D05\u1D00\u029F\u1D0F\u0274\u1D07 \u0299\u1D0F\u1D1B \u1D04\u1D0F\u1D05\u1D07)`,
              `\u2502 \u251C <code>package.json</code> (\u1D0F\u0274\u029F\u028F s\u029C\u1D00\u0280\u1D18)`,
              `\u2502 \u251C <code>db.json</code> (\u028F\u1D0F\u1D1C\u0280 \u029F\u026A\u1D20\u1D07 \u1D05\u1D00\u1D1B\u1D00 & \u1D1B\u1D0F\u1D0B\u1D07\u0274)`,
              `\u2502 \u251C <code>.github/workflows/bot.yml</code> (6\u029C \u029F\u1D0F\u1D0F\u1D18)`,
              `\u2502 \u2570 <code>assets/</code> (1376\xD7768 \u0299\u1D00\u0274\u0274\u1D07\u0280 & \u01EB\u0280)`,
              WIDE_BOT_BORDER,
              `\u{1F680} <b>s\u1D1B\u1D07\u1D18s \u0493\u1D0F\u0280 24/7 \u0262\u026A\u1D1B\u029C\u1D1C\u0299 \u029C\u1D0Fs\u1D1B\u026A\u0274\u0262:</b>`,
              `1\uFE0F\u20E3 Extract this ZIP & upload all files to a new <b>GitHub Repository</b>.`,
              `2\uFE0F\u20E3 Go to Repo \u2794 <b>Settings \u2794 Actions \u2794 General</b> \u2794 Select <b>Read and write permissions</b> & Save.`,
              `3\uFE0F\u20E3 Go to <b>Actions</b> tab \u2794 Click <b>24/7 Standalone Telegram Bot</b> \u2794 Click <b>Run workflow</b>!`
            ].join("\n"),
            {
              inline_keyboard: [
                [{ text: "\u{1F4C4} s\u1D07\u0274\u1D05 6\u029C \u028F\u1D0D\u029F \u1D04\u1D0F\u1D05\u1D07", callback_data: "adm_send_yml", style: "primary" }],
                [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
              ]
            }
          );
          return;
        }
        if (data === "adm_send_yml") {
          const ymlText = getGithubActionsYmlContent();
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: [
              `\u{1F4C4} <b><code>.github/workflows/bot.yml</code> (6-Hour Auto-Restart + Auto-Save DB):</b>`,
              `Tap the code block below to copy it, then in your GitHub Repo create file <code>.github/workflows/bot.yml</code> and paste:`,
              ``,
              `<pre><code>${escapeHtml(ymlText)}</code></pre>`
            ].join("\n"),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F4E5} s\u1D07\u0274\u1D05 s\u1D1B\u1D00\u0274\u1D05\u1D00\u029F\u1D0F\u0274\u1D07 \u1D22\u026A\u1D18", callback_data: "adm_send_zip", style: "success" }],
                [{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]
              ]
            }
          });
          return;
        }
        if (data === "adm_toggle_fj") {
          store.config.forceJoinEnabled = !store.config.forceJoinEnabled;
          saveStore();
          await sendAdminConfigSection(
            chatId,
            user,
            `\u2705 <b>Force-Join is now ${store.config.forceJoinEnabled ? "ENABLED \u{1F7E2}" : "DISABLED \u{1F534}"}.</b>`,
            { targetMessageId: clickedMsgId }
          );
          return;
        }
        if (data === "adm_toggle_adh") {
          store.config.aadhaarComingSoon = !store.config.aadhaarComingSoon;
          saveStore();
          await sendAdminConfigSection(
            chatId,
            user,
            `\u2705 <b>Aadhaar Mode is now: ${store.config.aadhaarComingSoon ? "COMING SOON \u{1F6A7}" : "LIVE API \u{1F7E2}"}.</b>`,
            { targetMessageId: clickedMsgId }
          );
          return;
        }
        const adminBackMarkup = {
          inline_keyboard: [[{ text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }]]
        };
        const usersBackMarkup = {
          inline_keyboard: [
            [
              { text: "\u2B05\uFE0F \u1D1Cs\u1D07\u0280s s\u1D07\u1D04\u1D1B\u026A\u1D0F\u0274", callback_data: "adm_sec_users", style: "primary" },
              { text: "\u{1F3E0} \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }
            ]
          ]
        };
        const paymentBackMarkup = {
          inline_keyboard: [
            [
              { text: "\u2B05\uFE0F \u1D18\u1D00\u028F\u1D0D\u1D07\u0274\u1D1B s\u1D07\u1D04\u1D1B\u026A\u1D0F\u0274", callback_data: "adm_sec_payment", style: "primary" },
              { text: "\u{1F3E0} \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }
            ]
          ]
        };
        const mediaBackMarkup = {
          inline_keyboard: [
            [
              { text: "\u2B05\uFE0F \u1D0D\u1D07\u1D05\u026A\u1D00 s\u1D07\u1D04\u1D1B\u026A\u1D0F\u0274", callback_data: "adm_sec_media", style: "primary" },
              { text: "\u{1F3E0} \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }
            ]
          ]
        };
        const configBackMarkup = {
          inline_keyboard: [
            [
              { text: "\u2B05\uFE0F \u1D04\u1D0F\u0274\u0493\u026A\u0262 s\u1D07\u1D04\u1D1B\u026A\u1D0F\u0274", callback_data: "adm_sec_config", style: "primary" },
              { text: "\u{1F3E0} \u1D00\u1D05\u1D0D\u026A\u0274 \u1D18\u1D00\u0274\u1D07\u029F", callback_data: "menu_admin", style: "danger" }
            ]
          ]
        };
        if (data === "adm_set_emojis") {
          user.awaitingInput = "admin_set_custom_emojis";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u2728 <b>SET BUTTON CUSTOM EMOJIS</b>
${WIDE_TOP_BORDER}
\u2502 s\u1D07\u0274\u1D05 \u1D1C\u1D18 \u1D1B\u1D0F 7 <b>\u1D1B\u1D07\u029F\u1D07\u0262\u0280\u1D00\u1D0D \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D</b>
\u2502 <b>\u1D07\u1D0D\u1D0F\u1D0A\u026As</b> \u026A\u0274 \u1D00 s\u026A\u0274\u0262\u029F\u1D07 \u1D0D\u1D07ss\u1D00\u0262\u1D07!
\u2502
\u2502 \u0299\u1D0F\u1D1B \u1D21\u026A\u029F\u029F \u1D00\u1D1C\u1D1B\u1D0F-\u1D07x\u1D1B\u0280\u1D00\u1D04\u1D1B \u1D1B\u029C\u1D07\u026A\u0280
\u2502 <code>custom_emoji_id</code> & \u1D00\u1D1B\u1D1B\u1D00\u1D04\u029C
\u2502 \u1D1B\u029C\u1D07\u1D0D \u1D1B\u1D0F \u028F\u1D0F\u1D1C\u0280 \u1D04\u1D0F\u029F\u1D0F\u0280\u1D07\u1D05 \u0299\u1D1C\u1D1B\u1D1B\u1D0F\u0274s!
${WIDE_BOT_BORDER}`,
            mediaBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_set_banner") {
          user.awaitingInput = "admin_set_start_image";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F5BC}\uFE0F <b>CHANGE BOT START IMAGE (1376\xD7768)</b>
${WIDE_TOP_BORDER}
\u2502 \u{1F4E4} <b>s\u1D07\u0274\u1D05 \u1D00 \u1D18\u029C\u1D0F\u1D1B\u1D0F \u1D05\u026A\u0280\u1D07\u1D04\u1D1B\u029F\u028F</b> \u1D0F\u0280
\u2502 \u{1F517} <b>\u1D18\u1D00s\u1D1B\u1D07 \u1D00\u0274\u028F \u026A\u1D0D\u1D00\u0262\u1D07 \u029F\u026A\u0274\u1D0B</b> (Postimg,
\u2502 ImgBB, Imgur, Direct URL).
\u2502 \u2728 \u1D00\u1D1C\u1D1B\u1D0F-\u0280\u1D07s\u026A\u1D22\u1D07s \u1D1B\u1D0F <b>1376\xD7768</b>!
\u2502 \u{1F4A1} \u1D1B\u028F\u1D18\u1D07 <code>reset</code> \u0493\u1D0F\u0280 \u1D05\u1D07\u0493\u1D00\u1D1C\u029F\u1D1B.
${WIDE_BOT_BORDER}`,
            mediaBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_set_qr") {
          user.awaitingInput = "admin_set_qr_image";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F4F2} <b>CHANGE PREMIUM QR CODE (1024\xD71024)</b>
${WIDE_TOP_BORDER}
\u2502 \u{1F4E4} <b>s\u1D07\u0274\u1D05 \u01EB\u0280 \u1D18\u029C\u1D0F\u1D1B\u1D0F</b> \u1D0F\u0280 <b>\u1D18\u1D00s\u1D1B\u1D07 \u029F\u026A\u0274\u1D0B</b>
\u2502 \u1D1B\u1D0F \u1D1C\u1D18\u1D05\u1D00\u1D1B\u1D07 \u026A\u1D1B (\u1D00\u1D1C\u1D1B\u1D0F-s\u026A\u1D22\u1D07\u1D05)!
\u2502 \u{1F4A1} \u1D1B\u028F\u1D18\u1D07 <code>reset</code> \u0493\u1D0F\u0280 \u1D05\u1D07\u0493\u1D00\u1D1C\u029F\u1D1B.
${WIDE_BOT_BORDER}`,
            mediaBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "qr" }
          );
          return;
        }
        if (data === "adm_set_prices") {
          user.awaitingInput = "admin_set_premium_prices";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F4B0} <b>SET PREMIUM PRICING PLANS</b>
${WIDE_TOP_BORDER}
\u2502 s\u1D07\u0274\u1D05 \u1D21\u1D07\u1D07\u1D0B\u029F\u028F | \u1D0D\u1D0F\u0274\u1D1B\u029C\u029F\u028F | \u029F\u026A\u0493\u1D07\u1D1B\u026A\u1D0D\u1D07
\u2502 \u1D18\u0280\u026A\u1D04\u1D07s s\u1D07\u1D18\u1D00\u0280\u1D00\u1D1B\u1D07\u1D05 \u0299\u028F <code>|</code>
${WIDE_BOT_BORDER}
\u{1F4CC} <b>Example:</b>
<code>\u20B949 / 7 Days | \u20B9149 / 30 Days | \u20B9499 / Lifetime</code>`,
            paymentBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data.startsWith("adm_qlimit_")) {
          const val = parseInt(data.replace("adm_qlimit_", "").trim(), 10);
          if (!isNaN(val) && val >= 0) {
            store.config.dailyFreeLimit = val;
            saveStore();
            await sendAdminDailyLimitScreen(
              chatId,
              user,
              `\u2705 <b>Daily Free Search Limit set to ${val} searches/day!</b>`,
              { targetMessageId: clickedMsgId }
            );
          }
          return;
        }
        if (data.startsWith("adm_qref_")) {
          const val = parseInt(data.replace("adm_qref_", "").trim(), 10);
          if (!isNaN(val) && val >= 0) {
            store.config.referralBonusCredits = val;
            saveStore();
            await sendAdminDailyLimitScreen(
              chatId,
              user,
              `\u2705 <b>Referral Bonus set to +${val} free searches per invite!</b>`,
              { targetMessageId: clickedMsgId }
            );
          }
          return;
        }
        if (data === "adm_reset_limits") {
          const today = getTodayDateString();
          let count = 0;
          for (const u of Object.values(store.users)) {
            u.dailySearchDate = today;
            u.dailySearchCount = 0;
            count++;
          }
          saveStore();
          await sendAdminDailyLimitScreen(
            chatId,
            user,
            `\u2705 <b>Reset today's search limit to ${store.config.dailyFreeLimit}/${store.config.dailyFreeLimit} for all ${count} users!</b>`,
            { targetMessageId: clickedMsgId }
          );
          return;
        }
        if (data === "adm_set_pay_api") {
          user.awaitingInput = "admin_set_payment_api";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F4B3} <b>VC GATEWAY AUTO-PAYMENT API</b>
${WIDE_TOP_BORDER}
\u2502 \u{1F511} <b>\u1D00\u1D18\u026A \u1D0B\u1D07\u028F:</b> <code>${escapeHtml(
              store.config.paymentApiKey
            )}</code>
\u2502 \u{1F3E6} <b>\u1D1C\u1D18\u026A \u026A\u1D05:</b> <code>${escapeHtml(
              store.config.paymentUpiId
            )}</code>
\u2502 \u{1F3E2} <b>\u1D0D\u1D07\u0280\u1D04\u029C\u1D00\u0274\u1D1B:</b> ${escapeHtml(
              store.config.paymentMerchantName
            )}
${WIDE_BOT_BORDER}
Send new <code>API_KEY</code> or <code>API_KEY | UPI_ID</code> (or type <code>reset</code>):`,
            paymentBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_add_prem") {
          user.awaitingInput = "admin_add_premium";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F451} <b>ADD PREMIUM</b>
Send User ID and number of days separated by space.

\u{1F4CC} <b>Example:</b> <code>6672896116 30</code>`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_rem_prem") {
          user.awaitingInput = "admin_remove_premium";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F5D1}\uFE0F <b>REMOVE PREMIUM</b>
Send the User ID to revoke Premium access.`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_add_cred") {
          user.awaitingInput = "admin_add_credits";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1FA99} <b>ADD BONUS CREDITS</b>
Send User ID and credit amount separated by space.

\u{1F4CC} <b>Example:</b> <code>6672896116 10</code>`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_ded_cred") {
          user.awaitingInput = "admin_deduct_credits";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u2796 <b>DEDUCT BONUS CREDITS</b>
Send User ID and credit amount to deduct.`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_ban") {
          user.awaitingInput = "admin_ban_user";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F6AB} <b>BAN USER</b>
Send the User ID to ban from using the bot.`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_unban") {
          user.awaitingInput = "admin_unban_user";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u2705 <b>UNBAN USER</b>
Send the User ID to restore access.`,
            usersBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_broadcast") {
          user.awaitingInput = "admin_broadcast";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F4E2} <b>BROADCAST MESSAGE</b>
Send the announcement text to broadcast to all ${Object.keys(store.users).length} users.`,
            adminBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_set_chan") {
          user.awaitingInput = "admin_set_channel";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F517} <b>SET OFFICIAL CHANNELS</b>
Send Channel 1 and Channel 2 separated by space.

\u{1F4CC} <b>Example:</b>
<code>@Toxicexploit @followxpresss</code>`,
            configBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data === "adm_set_num_api") {
          user.awaitingInput = "admin_set_num_api";
          saveStore();
          await renderBotScreen(
            chatId,
            user,
            `\u{1F511} <b>UPDATE NUMBER API URL</b>
Current:
<code>${escapeHtml(store.config.numberApiUrl)}</code>

Send the new API URL (sample number or <code>{query}</code>):`,
            configBackMarkup,
            { targetMessageId: clickedMsgId, photoKind: "banner" }
          );
          return;
        }
        if (data.startsWith("adm_revoke_utr_")) {
          const targetId = data.replace("adm_revoke_utr_", "").trim();
          const targetUser = store.users[targetId];
          if (targetUser) {
            targetUser.premiumUntil = null;
            saveStore();
            await tgApi("sendMessage", {
              chat_id: chatId,
              text: `\u{1F6AB} <b>Revoked Premium from ${escapeHtml(targetUser.firstName)} (<code>${targetId}</code>) due to invalid UTR.</b>`,
              parse_mode: "HTML"
            }).catch(() => {
            });
            await tgApi("sendMessage", {
              chat_id: targetId,
              text: `\u{1F6AB} <b>Your Premium access was revoked by Admin because the submitted UPI UTR number could not be matched.</b>`,
              parse_mode: "HTML"
            }).catch(() => {
            });
          }
          return;
        }
        if (data.startsWith("adm_pay_ok_")) {
          const parts = data.replace("adm_pay_ok_", "").split("_");
          const targetId = parts[0] || "";
          const days = Math.max(1, parseInt(parts[1] || "7", 10) || 7);
          const amt = parseInt(parts[2] || "1", 10) || 1;
          const targetUser = store.users[targetId];
          if (targetUser) {
            const nowMs = Date.now();
            const newExpiry = new Date(nowMs + days * 864e5).toISOString();
            targetUser.premiumUntil = newExpiry;
            targetUser.activePaymentOrder = null;
            targetUser.awaitingInput = null;
            saveStore();
            await tgApi("sendMessage", {
              chat_id: chatId,
              text: `\u2705 <b>Approved \u20B9${amt} Payment & Activated ${days} Days Premium for ${escapeHtml(targetUser.firstName)} (<code>${targetId}</code>)!</b>`,
              parse_mode: "HTML"
            }).catch(() => {
            });
            const expDateStr = new Date(newExpiry).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            await renderBotScreen(
              targetId,
              targetUser,
              [
                `\u{1F389} <b>${toBoldSans("PAYMENT VERIFIED")}</b> \u2705`,
                WIDE_TOP_BORDER,
                `\u2502 \u{1F451} <b>s\u1D1B\u1D00\u1D1B\u1D1Cs:</b> \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u1D00\u1D04\u1D1B\u026A\u1D20\u1D00\u1D1B\u1D07\u1D05!`,
                `\u2502 \u{1F4B0} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B \u1D18\u1D00\u026A\u1D05:</b> \u20B9${amt}`,
                `\u2502 \u{1F4C5} <b>\u1D20\u1D00\u029F\u026A\u1D05 \u1D1C\u0274\u1D1B\u026A\u029F:</b> ${escapeHtml(expDateStr)}`,
                `\u2502 \u267E\uFE0F <b>\u1D00\u1D04\u1D04\u1D07ss:</b> \u1D1C\u0274\u029F\u026A\u1D0D\u026A\u1D1B\u1D07\u1D05 \u1D0Fs\u026A\u0274\u1D1B s\u1D07\u1D00\u0280\u1D04\u029C\u1D07s`,
                WIDE_BOT_BORDER,
                `\u2728 <b>\u1D1B\u029C\u1D00\u0274\u1D0B \u028F\u1D0F\u1D1C! \u028F\u1D0F\u1D1C\u0280 \u1D18\u0280\u1D07\u1D0D\u026A\u1D1C\u1D0D \u026As \u0274\u1D0F\u1D21 \u029F\u026A\u1D20\u1D07 \u{1F680}</b>`
              ].join("\n"),
              {
                inline_keyboard: [
                  [
                    withEmojiId(
                      { text: "\u{1F4DE} s\u1D1B\u1D00\u0280\u1D1B \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 s\u1D07\u1D00\u0280\u1D04\u029C", callback_data: "menu_num", style: "success" },
                      "num"
                    )
                  ],
                  [
                    withEmojiId(
                      { text: "\u{1F519} \u0299\u1D00\u1D04\u1D0B \u1D1B\u1D0F \u1D0D\u1D07\u0274\u1D1C", callback_data: "back_menu", style: "primary" },
                      "close"
                    )
                  ]
                ]
              },
              { photoKind: "banner" }
            );
          }
          return;
        }
        if (data.startsWith("adm_pay_no_")) {
          const targetId = data.replace("adm_pay_no_", "").trim();
          const targetUser = store.users[targetId];
          if (targetUser) {
            await tgApi("sendMessage", {
              chat_id: chatId,
              text: `\u274C <b>Rejected payment screenshot for <code>${targetId}</code>.</b>`,
              parse_mode: "HTML"
            }).catch(() => {
            });
            await tgApi("sendMessage", {
              chat_id: targetId,
              text: `\u274C <b>Your payment screenshot could not be verified. Please send a valid 12-Digit UPI UTR number or clear payment screenshot.</b>`,
              parse_mode: "HTML"
            }).catch(() => {
            });
          }
          return;
        }
      }
      return;
    }
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const { user } = getOrCreateUser(msg.from);
      if (isAdminUser(user.telegramId, user.username) && user.awaitingInput === "admin_set_custom_emojis" && !(msg.text && msg.text.trim().startsWith("/"))) {
        await safeDeleteMessage(chatId, msg.message_id);
        const combinedEntities = [
          ...Array.isArray(msg.entities) ? msg.entities : [],
          ...Array.isArray(msg.caption_entities) ? msg.caption_entities : []
        ];
        if (msg.sticker?.custom_emoji_id) {
          combinedEntities.push({
            type: "custom_emoji",
            custom_emoji_id: String(msg.sticker.custom_emoji_id)
          });
        }
        const kbRows = msg.reply_markup?.inline_keyboard || msg.reply_to_message?.reply_markup?.inline_keyboard;
        if (Array.isArray(kbRows)) {
          for (const row of kbRows) {
            if (Array.isArray(row)) {
              for (const btn of row) {
                if (btn?.icon_custom_emoji_id) {
                  combinedEntities.push({
                    type: "custom_emoji",
                    custom_emoji_id: String(btn.icon_custom_emoji_id)
                  });
                }
              }
            }
          }
        }
        await handleAdminTextInput(
          chatId,
          user,
          String(msg.text || msg.caption || ""),
          combinedEntities
        );
        return;
      }
    }
    const hasPhotoArray = update.message && Array.isArray(update.message.photo) && update.message.photo.length > 0;
    const hasImageDoc = update.message && update.message.document && typeof update.message.document.mime_type === "string" && update.message.document.mime_type.startsWith("image/");
    if (hasPhotoArray || hasImageDoc) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const { user } = getOrCreateUser(msg.from);
      const uploadedFileId = hasPhotoArray ? msg.photo[msg.photo.length - 1]?.file_id : msg.document?.file_id;
      await safeDeleteMessage(chatId, msg.message_id);
      if (isAdminUser(user.telegramId, user.username)) {
        if (uploadedFileId && user.awaitingInput === "admin_set_start_image") {
          user.awaitingInput = null;
          store.config.customBannerImageUrl = "/api/custom-banner.jpg?t=" + Date.now();
          const normRes = await processAndSaveCustomImage({ telegramFileId: uploadedFileId }, "banner");
          if (!normRes.ok) {
            store.config.cachedBannerFileId = uploadedFileId;
          }
          user.lastBotPhotoKind = void 0;
          saveStore();
          await sendAdminPanel(
            chatId,
            user,
            `\u2705 <b>Bot Start Banner Photo Updated & Auto-Resized to Exact Same Size (1376\xD7768)!</b>`,
            { forceMediaSwap: true }
          );
          return;
        }
        if (uploadedFileId && user.awaitingInput === "admin_set_qr_image") {
          user.awaitingInput = null;
          store.config.customQrImageUrl = "/api/custom-qr.jpg?t=" + Date.now();
          const normRes = await processAndSaveCustomImage({ telegramFileId: uploadedFileId }, "qr");
          if (!normRes.ok) {
            store.config.cachedQrFileId = uploadedFileId;
          }
          user.lastBotPhotoKind = void 0;
          saveStore();
          await sendAdminPanel(
            chatId,
            user,
            `\u2705 <b>Premium Payment QR Code Photo Updated & Auto-Resized (1024\xD71024)!</b>`,
            { forceMediaSwap: true }
          );
          return;
        }
      }
      if (uploadedFileId && (user.activePaymentOrder || user.awaitingInput === "payment_utr")) {
        const fallbackPlan = getPlanDetails("weekly");
        const order = user.activePaymentOrder || {
          orderId: "VC" + Date.now(),
          planKey: fallbackPlan.planKey,
          planLabel: fallbackPlan.planLabel,
          amount: fallbackPlan.amount,
          days: fallbackPlan.days,
          upiString: "",
          qrImageUrl: "",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const merchantName = (store.config.paymentMerchantName || DEFAULT_PAYMENT_MERCHANT).trim();
        const captionDigits = String(msg.caption || "").replace(/\D/g, "");
        if (captionDigits.length === 12) {
          await verifyPaymentByUtr(user, chatId, captionDigits);
          return;
        }
        const updatedCaption = buildDynamicQrCaption(
          order.planLabel,
          order.amount,
          order.orderId,
          merchantName,
          `\u2705 Screenshot Sent to Admin! (Or send 12-Digit UTR for Instant Verify)`
        );
        await renderBotScreen(
          chatId,
          user,
          updatedCaption,
          buildDynamicQrMarkup(order.planKey, order.amount, order.orderId),
          {
            photoKind: "dynamic_qr",
            customPhotoUrl: order.qrImageUrl || void 0
          }
        );
        for (const adminId of store.config.adminIds) {
          await tgApi("sendPhoto", {
            chat_id: adminId,
            photo: uploadedFileId,
            caption: [
              `\u{1F4F8} <b>${toBoldSans("NEW PAYMENT SCREENSHOT")}</b> \u26A1`,
              WIDE_TOP_BORDER,
              `\u2502 \u{1F464} <b>\u1D1Cs\u1D07\u0280:</b> ${escapeHtml(user.firstName)} (${user.username ? "@" + escapeHtml(user.username) : "No Username"})`,
              `\u2502 \u{1F194} <b>\u1D1Cs\u1D07\u0280 \u026A\u1D05:</b> <code>${user.telegramId}</code>`,
              `\u2502 \u{1F4E6} <b>\u1D18\u029F\u1D00\u0274:</b> ${order.planLabel}`,
              `\u2502 \u{1F4B5} <b>\u1D00\u1D0D\u1D0F\u1D1C\u0274\u1D1B:</b> \u20B9${order.amount}`,
              `\u2502 \u{1F9FE} <b>\u1D0F\u0280\u1D05\u1D07\u0280 \u026A\u1D05:</b> <code>${escapeHtml(order.orderId)}</code>`,
              WIDE_BOT_BORDER,
              `\u{1F447}\u{1F3FB} <b>Tap below to Approve or Reject in 1 click:</b>`
            ].join("\n"),
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `\u2705 \u1D00\u1D18\u1D18\u0280\u1D0F\u1D20\u1D07 \u20B9${order.amount} (${order.days} \u1D05\u1D00\u028Fs)`,
                    callback_data: `adm_pay_ok_${user.telegramId}_${order.days}_${order.amount}`,
                    style: "success"
                  },
                  {
                    text: "\u274C \u0280\u1D07\u1D0A\u1D07\u1D04\u1D1B",
                    callback_data: `adm_pay_no_${user.telegramId}`,
                    style: "danger"
                  }
                ]
              ]
            }
          }).catch(() => {
          });
        }
        return;
      }
      return;
    }
    if (update.message && update.message.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = String(msg.text).trim();
      let startPayload;
      if (text.startsWith("/start")) {
        const parts = text.split(/\s+/);
        if (parts[1]) startPayload = parts[1];
      }
      const { user, isNew, referrerId } = getOrCreateUser(msg.from, startPayload);
      if (isNew && referrerId && store.users[referrerId]) {
        await tgApi("sendMessage", {
          chat_id: referrerId,
          text: `\u{1F381} <b>New Referral Joined!</b>
<b>${escapeHtml(user.firstName)}</b> joined via your link. You earned <b>+${store.config.referralBonusCredits} Bonus Searches</b>!`,
          parse_mode: "HTML"
        }).catch(() => {
        });
      }
      await clearFourDotsReplyKeyboardOnce(chatId, user);
      await safeDeleteMessage(chatId, msg.message_id);
      if (user.isBanned && !isAdminUser(user.telegramId, user.username)) {
        return;
      }
      const lowerCmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();
      if (lowerCmd === "/admin") {
        if (!isAdminUser(user.telegramId, user.username)) {
          await sendMainMenu(chatId, user);
          return;
        }
        await sendAdminPanel(chatId, user);
        return;
      }
      const isJoined = await checkChannelMembership(user);
      if (!isJoined) {
        await sendChannelJoinGate(chatId, user, { forceNew: lowerCmd === "/start" });
        return;
      }
      if (lowerCmd === "/start" || lowerCmd === "/menu") {
        await sendMainMenu(chatId, user, { forceNew: true });
        return;
      }
      if (user.awaitingInput && user.awaitingInput.startsWith("admin_") && isAdminUser(user.telegramId, user.username)) {
        await handleAdminTextInput(chatId, user, text, msg.entities);
        return;
      }
      if (user.awaitingInput === "payment_utr") {
        await verifyPaymentByUtr(user, chatId, text);
        return;
      }
      if (user.awaitingInput === "number") {
        await executeUserLookup(chatId, user, "number_info", text);
        return;
      }
      if (user.awaitingInput === "aadhaar") {
        await executeUserLookup(chatId, user, "num_aadhaar", text);
        return;
      }
      const digitsOnly = text.replace(/\D/g, "");
      if (digitsOnly.length === 12 && user.activePaymentOrder) {
        await verifyPaymentByUtr(user, chatId, digitsOnly);
        return;
      }
      if (digitsOnly.length === 12 && !digitsOnly.startsWith("91")) {
        await executeUserLookup(chatId, user, "num_aadhaar", digitsOnly);
        return;
      }
      if (digitsOnly.length === 10 || digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        await executeUserLookup(chatId, user, "number_info", digitsOnly);
        return;
      }
      await sendMainMenu(chatId, user);
    }
  } catch (err) {
    console.warn("Error handling Telegram update:", err);
  }
}
async function configureBotCommandsAndMenuButton() {
  const me = await tgApi("getMe");
  if (me?.ok && me.result) {
    botUsernameCache = me.result.username || botUsernameCache;
    botFirstNameCache = me.result.first_name || botFirstNameCache;
    console.log(`\u2705 Connected to Telegram Bot: @${botUsernameCache} (${botFirstNameCache})`);
  }
  await tgApi("deleteMyCommands");
  await tgApi("setChatMenuButton", {
    menu_button: { type: "default" }
  });
}
async function startPollingLoop() {
  if (pollingActive) return;
  pollingActive = true;
  await tgApi("deleteWebhook", { drop_pending_updates: false });
  await configureBotCommandsAndMenuButton();
  while (pollingActive) {
    try {
      const res = await tgApi("getUpdates", {
        offset: pollOffset,
        timeout: 20,
        allowed_updates: ["message", "callback_query"]
      });
      if (res?.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          pollOffset = update.update_id + 1;
          await handleTelegramUpdate(update);
        }
      } else if (res?.error_code === 409) {
        await new Promise((r) => setTimeout(r, 3e3));
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err) {
      await new Promise((r) => setTimeout(r, 2e3));
    }
  }
}
const ZIP_CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
  }
  ZIP_CRC_TABLE[i] = c >>> 0;
}
function computeCrc32(buf) {
  let crc = 4294967295;
  for (let i = 0; i < buf.length; i++) {
    crc = ZIP_CRC_TABLE[(crc ^ buf[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function createZipArchive(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name.replace(/^\/+/, ""), "utf-8");
    const rawBuf = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(String(entry.content), "utf-8");
    const compressedBuf = zlib.deflateRawSync(rawBuf);
    const crc = computeCrc32(rawBuf);
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(67324752, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(2048, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(33, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedBuf.length, 18);
    localHeader.writeUInt32LE(rawBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(33639248, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(2048, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(33, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedBuf.length, 20);
    centralHeader.writeUInt32LE(rawBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);
    localParts.push(localHeader, compressedBuf);
    centralParts.push(centralHeader);
    offset += localHeader.length + compressedBuf.length;
  }
  const centralDirBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(101010256, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}
function getGithubActionsYmlContent() {
  return [
    `name: 24/7 Standalone Telegram Bot`,
    ``,
    `on:`,
    `  push:`,
    `    branches: [ main, master ]`,
    `  workflow_dispatch:`,
    `  schedule:`,
    `    # Auto-starts every 6 hours (24/7 loop)`,
    `    - cron: '0 */6 * * *'`,
    ``,
    `permissions:`,
    `  contents: write`,
    `  actions: write`,
    ``,
    `concurrency:`,
    `  group: standalone-telegram-bot-24x7`,
    `  cancel-in-progress: true`,
    ``,
    `jobs:`,
    `  run-bot:`,
    `    runs-on: ubuntu-latest`,
    `    timeout-minutes: 358`,
    ``,
    `    steps:`,
    `      - name: Checkout Repository`,
    `        uses: actions/checkout@v4`,
    `        with:`,
    `          fetch-depth: 1`,
    ``,
    `      - name: Auto-Extract ZIP (If ZIP Uploaded Directly)`,
    `        run: |`,
    `          if [ ! -f "bot.js" ] && ls *.zip >/dev/null 2>&1; then`,
    `            echo "\u{1F4E6} ZIP file detected! Extracting bot files..."`,
    `            unzip -o *.zip`,
    `          fi`,
    `          if [ ! -f "bot.js" ] && [ ! -f "server.ts" ]; then`,
    `            echo "\u274C ERROR: bot.js file repo me nahi mili! Kripya bot.js, package.json aur db.json (ya poori ZIP file) repo me upload karein."`,
    `            exit 1`,
    `          fi`,
    ``,
    `      - name: Setup Node.js 20`,
    `        uses: actions/setup-node@v4`,
    `        with:`,
    `          node-version: '20'`,
    ``,
    `      - name: Install Bot Dependencies`,
    `        run: |`,
    `          if [ -f "package.json" ]; then`,
    `            npm install --no-audit --no-fund`,
    `          else`,
    `            npm init -y && npm install sharp --no-audit --no-fund`,
    `          fi`,
    ``,
    `      - name: Run Standalone Bot (5h 45m Shift - No Website)`,
    `        id: bot_runner`,
    `        env:`,
    `          GITHUB_ACTIONS: 'true'`,
    `          STANDALONE_BOT: 'true'`,
    `        run: |`,
    `          START_TS=$(date +%s)`,
    `          git config user.name "Telegram Bot Auto-Save"`,
    `          git config user.email "bot@users.noreply.github.com"`,
    `          if [ -f "bot.js" ]; then`,
    `            timeout --signal=SIGINT 20700s node bot.js || true`,
    `          else`,
    `            timeout --signal=SIGINT 20700s npx tsx server.ts || true`,
    `          fi`,
    `          END_TS=$(date +%s)`,
    `          ELAPSED=$((END_TS - START_TS))`,
    `          echo "elapsed=$ELAPSED" >> $GITHUB_OUTPUT`,
    ``,
    `      - name: Auto-Save Database (db.json & Custom Photos) to Repo`,
    `        if: success()`,
    `        run: |`,
    `          git config user.name "Telegram Bot Auto-Save"`,
    `          git config user.email "bot@users.noreply.github.com"`,
    `          git add db.json .bot-store.json bot.js package.json assets/ 2>/dev/null || true`,
    `          if ! git diff --staged --quiet; then`,
    `            git commit -m "Auto-save bot database [skip ci]"`,
    `            git pull --rebase origin \${{ github.ref_name }} || true`,
    `            git push origin HEAD:\${{ github.ref_name }} || true`,
    `          fi`,
    ``,
    `      - name: Auto-Trigger Next 6-Hour Shift (Only After Full Shift)`,
    `        if: success() && steps.bot_runner.outputs.elapsed >= 18000`,
    `        env:`,
    `          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
    `        run: |`,
    `          gh workflow run "24/7 Standalone Telegram Bot" --ref "\${{ github.ref_name }}" || gh workflow run "bot.yml" --ref "\${{ github.ref_name }}" || true`,
    ``
  ].join("\n");
}
function getStandalonePackageJsonContent() {
  return JSON.stringify(
    {
      name: "hex-osint-standalone-bot",
      version: "2.0.0",
      private: true,
      type: "module",
      scripts: {
        start: "node bot.js"
      },
      dependencies: {
        sharp: "^0.33.5"
      }
    },
    null,
    2
  );
}
function getStandaloneReadmeContent() {
  return [
    `# \u{1F916} HEX OSINT \u2014 Standalone Telegram Bot (No Website / 24/7 GitHub Actions)`,
    ``,
    `Ye code **100% Standalone Telegram Bot** hai \u2014 isme koi Website / React / Express nahi hai. Ye seedha \`node bot.js\` se akela chalta hai aur GitHub Actions ke 6-hour auto-restart loop ke saath 24/7 non-stop run hota hai.`,
    ``,
    `## \u{1F680} Step-by-Step GitHub 24/7 Setup Guide`,
    ``,
    `### Step 1: GitHub Par Naya Repository Banayein`,
    `1. [github.com/new](https://github.com/new) kholein.`,
    `2. Repository ka naam rakhein (jaise \`osint-telegram-bot\`), **Private** select karein (taaki aapka Bot Token safe rahe), aur **Create repository** par click karein.`,
    ``,
    `### Step 2: ZIP Ki Files Upload Karein`,
    `1. Is ZIP file ko extract karein.`,
    `2. Apne GitHub Repository me **uploading an existing file** par click karein aur ye files upload karke **Commit changes** kar dein:`,
    `   - \`bot.js\` (Main standalone bot code \u2014 bina website ke)`,
    `   - \`package.json\` (Sirf \`sharp\` dependency)`,
    `   - \`db.json\` (Aapka Bot Token, Admin ID, Paytm UPI, Daily Limit aur Users data)`,
    `   - \`assets/\` folder (Start banner aur QR photo \u2014 agar skip bhi ho jaye to bot khud bana lega!)`,
    ``,
    `### Step 3: \`.github/workflows/bot.yml\` Add Karein`,
    `1. Agar \`Upload files\` me \`.github/workflows/bot.yml\` upload ho gaya hai to ye step skip karein.`,
    `2. Mobile par agar dot-folder (\`.github\`) hide ho gaya ho, to Repo me **Add file \u2794 Create new file** par click karein.`,
    `3. File name me type karein: \`.github/workflows/bot.yml\``,
    `4. ZIP ke andar di gayi \`bot.yml\` file ka code copy karke paste karein aur **Commit changes** \u0926\u092C\u093E dein.`,
    ``,
    `### Step 4: Actions Permission & Run Workflow (24/7 Start)`,
    `1. Repo ke **Settings \u2794 Actions \u2794 General** me jayein.`,
    `2. Neeche **Workflow permissions** me **Read and write permissions** select karke **Save** karein (taaki har 6 ghante me aapka \`db.json\` automatically save hota rahe).`,
    `3. Ab **Actions** tab me jayein \u2794 **24/7 Standalone Telegram Bot** par click karein \u2794 **Run workflow** button daba dein!`,
    ``,
    `\u2705 **Done!** Aapka bot ab 24/7 chalega aur har 6 ghante me apna database (\`db.json\`) save karke apne aap restart ho jayega!`
  ].join("\n");
}
async function sendTelegramDocument(chatId, fileBuffer, fileName, caption, replyMarkup) {
  const token = store.config.botToken.trim();
  if (!token) return { ok: false };
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    if (replyMarkup) {
      form.append("reply_markup", JSON.stringify(stripCustomEmojiIdsFromMarkup(replyMarkup)));
    }
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: "application/zip" });
    form.append("document", blob, fileName);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: form
    });
    return await res.json();
  } catch (err) {
    return { ok: false, description: err?.message || "Document upload failed" };
  }
}
async function generateStandaloneBotJsSource() {
  const rawSelf = fs.readFileSync(__filename, "utf-8");
  if (__filename.endsWith(".js")) {
    return rawSelf;
  }
  const cutoffMarker = "// === STANDALONE_BOT_CUTOFF ===";
  const cutoffIdx = rawSelf.lastIndexOf(cutoffMarker);
  const botPortion = cutoffIdx !== -1 ? rawSelf.slice(0, cutoffIdx) : rawSelf;
  const cleanedTs = botPortion.replace(/^import express from ['"]express['"];?\r?\n/m, "").replace(/^import \{ createServer as createViteServer \} from ['"]vite['"];?\r?\n/m, "").replace(
    "const STORE_FILE = path.join(__dirname, '.bot-store.json');",
    "const STORE_FILE = path.join(__dirname, 'db.json');"
  ).replace(/\/src\/assets\/images\//g, "/assets/").replace(/src\/assets\/images\//g, "assets/");
  const standaloneFooter = `
// ============================================================================
// STANDALONE 24/7 BOT RUNNER (NO WEBSITE / NO EXPRESS)
// ============================================================================

function syncDbToGithubRepo() {
  if (process.env.GITHUB_ACTIONS !== 'true') return;
  exec(
    'git config user.name "Telegram Bot Auto-Save" && git config user.email "bot@users.noreply.github.com" && git add db.json assets/ 2>/dev/null && (git diff --staged --quiet || (git commit -m "Auto-save bot database [skip ci]" && git pull --rebase && git push))',
    () => {}
  );
}

async function ensureStandaloneAssets() {
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(DEFAULT_BANNER_DISK_PATH)) {
    const svgBanner = \`<svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1376" height="768" fill="#060b19"/>
      <rect x="36" y="36" width="1304" height="696" rx="28" fill="#0b132b" stroke="#10b981" stroke-width="4"/>
      <text x="688" y="340" font-family="sans-serif" font-size="68" font-weight="bold" fill="#10b981" text-anchor="middle">HEX OSINT INTELLIGENCE</text>
      <text x="688" y="430" font-family="sans-serif" font-size="34" fill="#94a3b8" text-anchor="middle">24/7 STANDALONE TELEGRAM BOT</text>
    </svg>\`;
    await sharp(Buffer.from(svgBanner)).jpeg({ quality: 92 }).toFile(DEFAULT_BANNER_DISK_PATH);
  }
  if (!fs.existsSync(DEFAULT_QR_DISK_PATH)) {
    const svgQr = \`<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#0b132b"/>
      <text x="512" y="512" font-family="sans-serif" font-size="48" font-weight="bold" fill="#10b981" text-anchor="middle">PREMIUM UPI QR</text>
    </svg>\`;
    await sharp(Buffer.from(svgQr)).jpeg({ quality: 92 }).toFile(DEFAULT_QR_DISK_PATH);
  }
  if (
    store.config.customBannerImageUrl &&
    store.config.customBannerImageUrl.startsWith('http') &&
    !fs.existsSync(CUSTOM_BANNER_DISK_PATH)
  ) {
    await processAndSaveCustomImage({ url: store.config.customBannerImageUrl }, 'banner').catch(() => {});
  }
  if (
    store.config.customQrImageUrl &&
    store.config.customQrImageUrl.startsWith('http') &&
    !fs.existsSync(CUSTOM_QR_DISK_PATH)
  ) {
    await processAndSaveCustomImage({ url: store.config.customQrImageUrl }, 'qr').catch(() => {});
  }
}

async function runStandaloneBot() {
  console.log('\u{1F680} Starting HEX OSINT Standalone 24/7 Telegram Bot (No Website Mode)...');
  await ensureStandaloneAssets();

  if (process.env.GITHUB_ACTIONS === 'true') {
    setInterval(() => {
      saveStore();
      syncDbToGithubRepo();
    }, 10 * 60 * 1000);

    setTimeout(() => {
      console.log('\u23F0 5h 45m GitHub Actions shift complete \u2014 saving db.json and exiting for auto-restart...');
      saveStore();
      process.exit(0);
    }, 345 * 60 * 1000);
  }

  process.on('SIGINT', () => {
    saveStore();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    saveStore();
    process.exit(0);
  });

  await startPollingLoop();
}

runStandaloneBot();
`;
  const fullTs = cleanedTs + "\n" + standaloneFooter;
  try {
    const esbuildMod = await import("esbuild");
    const transformed = esbuildMod.transformSync(fullTs, {
      loader: "ts",
      format: "esm",
      target: "node20"
    });
    return transformed.code;
  } catch {
    return fullTs;
  }
}
async function buildStandaloneBotZipBuffer() {
  const botJsCode = await generateStandaloneBotJsSource();
  const ymlCode = getGithubActionsYmlContent();
  const pkgJson = getStandalonePackageJsonContent();
  const readmeMd = getStandaloneReadmeContent();
  const exportedStore = {
    ...store,
    config: {
      ...store.config,
      cachedBannerFileId: "",
      cachedQrFileId: ""
    }
  };
  const entries = [
    { name: "bot.js", content: botJsCode },
    { name: "package.json", content: pkgJson },
    { name: "db.json", content: JSON.stringify(exportedStore, null, 2) },
    { name: ".github/workflows/bot.yml", content: ymlCode },
    { name: "bot.yml", content: ymlCode },
    { name: "README.md", content: readmeMd }
  ];
  if (fs.existsSync(DEFAULT_BANNER_DISK_PATH)) {
    entries.push({
      name: "assets/osint_bot_banner_1791447498565.jpg",
      content: fs.readFileSync(DEFAULT_BANNER_DISK_PATH)
    });
  }
  if (fs.existsSync(CUSTOM_BANNER_DISK_PATH)) {
    entries.push({
      name: "assets/custom_start_banner.jpg",
      content: fs.readFileSync(CUSTOM_BANNER_DISK_PATH)
    });
  }
  if (fs.existsSync(DEFAULT_QR_DISK_PATH)) {
    entries.push({
      name: "assets/premium_upi_qr_1791448449822.jpg",
      content: fs.readFileSync(DEFAULT_QR_DISK_PATH)
    });
  }
  if (fs.existsSync(CUSTOM_QR_DISK_PATH)) {
    entries.push({
      name: "assets/custom_premium_qr.jpg",
      content: fs.readFileSync(CUSTOM_QR_DISK_PATH)
    });
  }
  return createZipArchive(entries);
}
function syncDbToGithubRepo() {
  if (process.env.GITHUB_ACTIONS !== "true") return;
  exec(
    'git config user.name "Telegram Bot Auto-Save" && git config user.email "bot@users.noreply.github.com" && git add db.json assets/ 2>/dev/null && (git diff --staged --quiet || (git commit -m "Auto-save bot database [skip ci]" && git pull --rebase && git push))',
    () => {
    }
  );
}
async function ensureStandaloneAssets() {
  const assetsDir = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(DEFAULT_BANNER_DISK_PATH)) {
    const svgBanner = `<svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
      <rect width="1376" height="768" fill="#060b19"/>
      <rect x="36" y="36" width="1304" height="696" rx="28" fill="#0b132b" stroke="#10b981" stroke-width="4"/>
      <text x="688" y="340" font-family="sans-serif" font-size="68" font-weight="bold" fill="#10b981" text-anchor="middle">HEX OSINT INTELLIGENCE</text>
      <text x="688" y="430" font-family="sans-serif" font-size="34" fill="#94a3b8" text-anchor="middle">24/7 STANDALONE TELEGRAM BOT</text>
    </svg>`;
    await sharp(Buffer.from(svgBanner)).jpeg({ quality: 92 }).toFile(DEFAULT_BANNER_DISK_PATH);
  }
  if (!fs.existsSync(DEFAULT_QR_DISK_PATH)) {
    const svgQr = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#0b132b"/>
      <text x="512" y="512" font-family="sans-serif" font-size="48" font-weight="bold" fill="#10b981" text-anchor="middle">PREMIUM UPI QR</text>
    </svg>`;
    await sharp(Buffer.from(svgQr)).jpeg({ quality: 92 }).toFile(DEFAULT_QR_DISK_PATH);
  }
  if (store.config.customBannerImageUrl && store.config.customBannerImageUrl.startsWith("http") && !fs.existsSync(CUSTOM_BANNER_DISK_PATH)) {
    await processAndSaveCustomImage({ url: store.config.customBannerImageUrl }, "banner").catch(() => {
    });
  }
  if (store.config.customQrImageUrl && store.config.customQrImageUrl.startsWith("http") && !fs.existsSync(CUSTOM_QR_DISK_PATH)) {
    await processAndSaveCustomImage({ url: store.config.customQrImageUrl }, "qr").catch(() => {
    });
  }
}
async function runStandaloneBot() {
  console.log("\u{1F680} Starting HEX OSINT Standalone 24/7 Telegram Bot (No Website Mode)...");
  await ensureStandaloneAssets();
  if (process.env.GITHUB_ACTIONS === "true") {
    setInterval(() => {
      saveStore();
      syncDbToGithubRepo();
    }, 10 * 60 * 1e3);
    setTimeout(() => {
      console.log("\u23F0 5h 45m GitHub Actions shift complete \u2014 saving db.json and exiting for auto-restart...");
      saveStore();
      process.exit(0);
    }, 345 * 60 * 1e3);
  }
  process.on("SIGINT", () => {
    saveStore();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    saveStore();
    process.exit(0);
  });
  await startPollingLoop();
}
runStandaloneBot();
export {
  buildMainMenuText,
  performOsintLookup,
  verifyOrderWithVcGateway
};
