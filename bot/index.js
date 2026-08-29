const { Telegraf, Markup } = require("telegraf");
const { Course, Event, Lead } = require("../models");
const { sendLeadNotification } = require("../utils/telegramNotifier");

/**
 * Initializes and starts the Telegram Bot for Stacknowa Academy.
 */
const initTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN belgilanmagan, bot o'tkazib yuborildi.");
    return null;
  }

  const bot = new Telegraf(token);

  // User session state map: userId -> { step, type, selectedId, selectedTitle, fullName }
  const userSessions = new Map();

  const getSession = (userId) => {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, {});
    }
    return userSessions.get(userId);
  };

  const clearSession = (userId) => {
    userSessions.delete(userId);
  };

  // Helper for Main Menu Keyboard
  const getMainMenu = () => {
    return Markup.keyboard([
      ["📚 Kurslarga yozilish", "🔥 Eventga yozilish"],
      ["📞 Biz bilan bog'lanish", "ℹ️ Markaz haqida"],
    ]).resize();
  };

  // /start command with Deep Linking support (e.g. /start event_3)
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const payload = ctx.payload; // e.g. "event_3" or "course_1"
    clearSession(userId);

    // Deep link handling: if start payload is "event_ID"
    if (payload && payload.startsWith("event_")) {
      const eventId = Number(payload.replace("event_", ""));
      try {
        const event = await Event.findByPk(eventId);
        if (event) {
          const session = getSession(userId);
          session.step = "ENTER_NAME";
          session.type = "EVENT";
          session.selectedId = event.id;
          session.selectedTitle = event.title;

          const eventMessage =
            `Siz **"${event.title}"** masterclassiga ro'yxatdan o'tish sahifasidasiz! 🔥\n\n` +
            `📅 **Sana:** ${event.eventDate} (${event.eventTime})\n` +
            `📍 **Manzil:** ${event.location}\n` +
            `👥 **Qolgan joylar:** ${event.seatsLeft} ta\n\n` +
            `Iltimos, ro'yxatdan o'tish uchun **ismingiz va familiyangizni** kiriting:`;

          return ctx.replyWithMarkdown(eventMessage, Markup.removeKeyboard());
        }
      } catch (err) {
        console.error("Deep link event fetch error:", err);
      }
    }

    // Deep link handling: if start payload is "course_ID"
    if (payload && payload.startsWith("course_")) {
      const courseId = Number(payload.replace("course_", ""));
      try {
        const course = await Course.findByPk(courseId);
        if (course) {
          const session = getSession(userId);
          session.step = "ENTER_NAME";
          session.type = "COURSE";
          session.selectedId = course.id;
          session.selectedTitle = course.title;

          const courseMessage =
            `Siz **"${course.title}"** kursiga ro'yxatdan o'tish sahifasidasiz! 📚\n\n` +
            `⏱ **Davomiyligi:** ${course.duration}\n` +
            `💵 **Narx:** ${course.priceText || "Kelishilgan"}\n\n` +
            `Iltimos, ro'yxatdan o'tish uchun **ismingiz va familiyangizni** kiriting:`;

          return ctx.replyWithMarkdown(courseMessage, Markup.removeKeyboard());
        }
      } catch (err) {
        console.error("Deep link course fetch error:", err);
      }
    }

    // Regular /start
    const welcomeText =
      `Assalomu alaykum, ${ctx.from.first_name || "do'stim"}! 🚀\n\n` +
      `**Stacknowa Academy** rasmiy ro'yxatdan o'tish botiga xush kelibsiz.\n\n` +
      `Sizni qaysi yo'nalish qiziqtiradi? Pastdagi menyudan tanlang:`;

    return ctx.replyWithMarkdown(welcomeText, getMainMenu());
  });

  // Action: "📚 Kurslarga yozilish"
  bot.hears("📚 Kurslarga yozilish", async (ctx) => {
    try {
      const courses = await Course.findAll({ where: { status: "published" } });
      if (!courses || courses.length === 0) {
        return ctx.reply("Hozircha faol kurslar mavjud emas.");
      }

      const buttons = courses.map((c) => [
        Markup.button.callback(`${c.title} (${c.duration || "6 oy"})`, `SELECT_COURSE_${c.id}`),
      ]);

      return ctx.reply("Qaysi kursga yozilmoqchisiz? Tanlang:", Markup.inlineKeyboard(buttons));
    } catch (err) {
      console.error("Bot courses fetch error:", err.message);
      return ctx.reply("Xatolik yuz berdi, iltimos qaytadan urinib ko'ring.");
    }
  });

  // Action: "🔥 Eventga yozilish"
  bot.hears("🔥 Eventga yozilish", async (ctx) => {
    try {
      const events = await Event.findAll({ where: { status: "upcoming" } });
      if (!events || events.length === 0) {
        return ctx.reply("Hozirda yaqinlashayotgan masterclass/eventlar mavjud emas.");
      }

      const buttons = events.map((e) => [
        Markup.button.callback(`🔥 ${e.title} (${e.eventDate})`, `SELECT_EVENT_${e.id}`),
      ]);

      return ctx.reply("Qaysi event yoki masterclassga yozilmoqchisiz?", Markup.inlineKeyboard(buttons));
    } catch (err) {
      console.error("Bot events fetch error:", err.message);
      return ctx.reply("Xatolik yuz berdi, iltimos qaytadan urinib ko'ring.");
    }
  });

  // Action: "📞 Biz bilan bog'lanish"
  bot.hears("📞 Biz bilan bog'lanish", (ctx) => {
    return ctx.reply(
      "📍 **Stacknowa Academy**\n\n" +
      "🏢 Manzil: Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida\n" +
      "📞 Telefon: +998 20 014 66 67\n" +
      "💬 Admin: @stacknowa_academy_bot\n" +
      "🌐 Veb-sayt: http://localhost:5173"
    );
  });

  // Action: "ℹ️ Markaz haqida"
  bot.hears("ℹ️ Markaz haqida", (ctx) => {
    return ctx.reply(
      "🚀 **Stacknowa Academy** — bu zamonaviy AT va raqamli kasblar akademiyasi!\n\n" +
      "Bizda Web Dasturlash, Kompyuter Savodxonligi, SMM va Sun'iy Intellekt Prompt Injenering yo'nalishlarida noldan professional darajagacha ta'lim beriladi."
    );
  });

  // Callback Query Handler: Select Course
  bot.action(/SELECT_COURSE_(\d+)/, async (ctx) => {
    const courseId = Number(ctx.match[1]);
    const userId = ctx.from.id;

    try {
      const course = await Course.findByPk(courseId);
      if (!course) return ctx.reply("Kurs topilmadi.");

      const session = getSession(userId);
      session.step = "ENTER_NAME";
      session.type = "COURSE";
      session.selectedId = course.id;
      session.selectedTitle = course.title;

      await ctx.answerCbQuery();
      return ctx.reply(
        `Siz **"${course.title}"** kursini tanladingiz. ✅\n\n` +
        `Iltimos, ismingiz va familiyangizni kiriting:`,
        Markup.removeKeyboard()
      );
    } catch (err) {
      console.error(err);
    }
  });

  // Callback Query Handler: Select Event
  bot.action(/SELECT_EVENT_(\d+)/, async (ctx) => {
    const eventId = Number(ctx.match[1]);
    const userId = ctx.from.id;

    try {
      const event = await Event.findByPk(eventId);
      if (!event) return ctx.reply("Event topilmadi.");

      const session = getSession(userId);
      session.step = "ENTER_NAME";
      session.type = "EVENT";
      session.selectedId = event.id;
      session.selectedTitle = event.title;

      await ctx.answerCbQuery();
      return ctx.reply(
        `Siz **"${event.title}"** eventini tanladingiz. 🔥\n\n` +
        `Iltimos, ismingiz va familiyangizni kiriting:`,
        Markup.removeKeyboard()
      );
    } catch (err) {
      console.error(err);
    }
  });

  // Text input handler for Name and Phone
  bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const session = getSession(userId);
    const text = ctx.message.text.trim();

    if (session.step === "ENTER_NAME") {
      session.fullName = text;
      session.step = "ENTER_PHONE";

      return ctx.reply(
        `Rahmat, ${text}! 👍\n\n` +
        `Endi telefon raqamingizni kiriting yoki pastdagi **"📱 Telefon raqamni yuborish"** tugmasini bosing:`,
        Markup.keyboard([
          [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        ]).resize().oneTime()
      );
    }

    if (session.step === "ENTER_PHONE") {
      const phone = text;
      await processRegistration(ctx, userId, session, phone);
    }
  });

  // Contact button input handler
  bot.on("contact", async (ctx) => {
    const userId = ctx.from.id;
    const session = getSession(userId);
    const phone = ctx.message.contact.phone_number;

    if (session.step === "ENTER_PHONE") {
      await processRegistration(ctx, userId, session, phone);
    }
  });

  // Saves lead to database and confirms to user
  const processRegistration = async (ctx, userId, session, phone) => {
    try {
      const lead = await Lead.create({
        fullName: session.fullName || ctx.from.first_name || "Foydalanuvchi",
        phone: phone,
        courseId: session.type === "COURSE" ? session.selectedId : null,
        eventId: session.type === "EVENT" ? session.selectedId : null,
        source: session.type === "EVENT" ? "Event Bot" : "Telegram",
        notes: session.type === "EVENT" ? `🔥 Masterclass: ${session.selectedTitle}` : `📚 Kurs: ${session.selectedTitle}`,
        status: "New",
      });

      // Send Telegram notification to specified admin chat IDs
      sendLeadNotification(lead).catch((err) => console.error("Bot lead telegram notification error:", err));

      // If Event, decrement seats left
      if (session.type === "EVENT" && session.selectedId) {
        const eventObj = await Event.findByPk(session.selectedId);
        if (eventObj && eventObj.seatsLeft > 0) {
          await eventObj.decrement("seatsLeft");
        }
      }

      const successMessage =
        `🎉 **Arizangiz muvaffaqiyatli qabul qilindi!**\n\n` +
        `📋 **Tanlangan:** ${session.selectedTitle}\n` +
        `👤 **Ism:** ${session.fullName}\n` +
        `📱 **Telefon:** ${phone}\n\n` +
        `Tez orada mas'ul menejerimiz siz bilan bog'lanadi! 😊`;

      clearSession(userId);
      return ctx.replyWithMarkdown(successMessage, getMainMenu());
    } catch (err) {
      console.error("Bot lead save error:", err.message);
      return ctx.reply("Arizani saqlashda xatolik yuz berdi. Iltimos, /start bosib qaytadan urinib ko'ring.", getMainMenu());
    }
  };

  // Launch Bot polling
  bot.launch()
    .then(() => {
      console.log(`🤖 Telegram Bot (@stacknowa_academy_bot) muvaffaqiyatli ishga tushdi!`);
    })
    .catch((err) => {
      console.error("Telegram Bot ishga tushishida xatolik:", err.message);
    });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};

module.exports = initTelegramBot;
