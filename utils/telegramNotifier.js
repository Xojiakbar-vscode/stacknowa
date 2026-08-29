const https = require("https");

// Target Telegram Chat IDs for receiving new Lead notifications via @stacknowa_academy_bot
const ADMIN_CHAT_IDS = ["1828931356", "1743441642", "6519831069"];

/**
 * Sends a Telegram notification message to specified Admin Chat IDs
 * whenever a new lead is submitted (via Academy Bot).
 * @param {Object} lead - Lead database object
 * @param {String|Number} [excludeUserId] - Optional user Telegram ID to skip notifying themselves
 */
const sendLeadNotification = async (lead, excludeUserId = null) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN topilmadi, xabarnoma yuborilmadi.");
    return;
  }

  const message =
    `📥 **Yangi Ariza (Lead) Keldi!** 🎉\n\n` +
    `👤 **Ism:** ${lead.fullName || "Ko'rsatilmagan"}\n` +
    `📞 **Telefon:** ${lead.phone || "Ko'rsatilmagan"}\n` +
    `📌 **Manbaa (Source):** ${lead.source || "Landing"}\n` +
    `📝 **Qiziqqan kursi / Izoh:** ${lead.notes || "Ko'rsatilmagan"}\n` +
    `⏱ **Vaqt:** ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

  const promises = ADMIN_CHAT_IDS.map((chatId) => {
    // If the admin themselves performed the action, skip sending to their own chat
    if (excludeUserId && String(chatId) === String(excludeUserId)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      try {
        const postData = JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        });

        const options = {
          hostname: "api.telegram.org",
          port: 443,
          path: `/bot${token}/sendMessage`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            console.log(`Telegram xabarnoma chat_id ${chatId} ga yuborildi ✅`);
            resolve(true);
          });
        });

        req.on("error", (e) => {
          console.error(`Telegram xabarnoma xatosi (chat_id: ${chatId}):`, e.message);
          resolve(false);
        });

        req.write(postData);
        req.end();
      } catch (err) {
        console.error(`Telegram xabarnoma yuborishda xatolik (chat_id: ${chatId}):`, err.message);
        resolve(false);
      }
    });
  });

  await Promise.all(promises);
};

/**
 * Sends a Telegram notification message to specified Admin Chat IDs
 * specifically via Grant Telegram Bot (@stacknowa_academy_grand_bot).
 * @param {String} messageText - Markdown formatted text message
 * @param {String|Number} [excludeUserId] - Optional user Telegram ID to skip notifying themselves
 */
const sendGrantNotification = async (messageText, excludeUserId = null) => {
  const token = process.env.GRANT_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || "8893807091:AAF8zTIs8n9KJteLWQr63kO63W_jrIgNXDA";
  if (!token) {
    console.log("GRANT_BOT_TOKEN topilmadi, xabarnoma yuborilmadi.");
    return;
  }

  const promises = ADMIN_CHAT_IDS.map((chatId) => {
    // If the admin themselves performed the action, skip sending to their own chat
    if (excludeUserId && String(chatId) === String(excludeUserId)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      try {
        const postData = JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown",
        });

        const options = {
          hostname: "api.telegram.org",
          port: 443,
          path: `/bot${token}/sendMessage`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            console.log(`Grant bot telegram xabarnomasi chat_id ${chatId} ga yuborildi ✅`);
            resolve(true);
          });
        });

        req.on("error", (e) => {
          console.error(`Grant bot telegram xabarnoma xatosi (chat_id: ${chatId}):`, e.message);
          resolve(false);
        });

        req.write(postData);
        req.end();
      } catch (err) {
        console.error(`Grant bot telegram xabarnoma yuborishda xatolik (chat_id: ${chatId}):`, err.message);
        resolve(false);
      }
    });
  });

  await Promise.all(promises);
};

module.exports = { sendLeadNotification, sendGrantNotification, ADMIN_CHAT_IDS };


