const { Telegraf, Markup } = require("telegraf");
const { GrantExam, GrantQuestion, GrantParticipant, Lead } = require("../models");
const { sendGrantNotification, ADMIN_CHAT_IDS } = require("../utils/telegramNotifier");

let grantBotInstance = null;

/**
 * 10 Real Logical Seed Questions for Grant Exam
 * Seeded ONCE into database if GrantQuestion table is empty
 */
const initialGrantQuestions = [
  {
    questionText: "Ketma-ketlikni davom ettiring: 5, 10, 15, 20, ?",
    optionA: "22",
    optionB: "25",
    optionC: "30",
    optionD: "35",
    correctOption: "B",
    points: 10,
    orderIndex: 1,
  },
  {
    questionText: "Bir haftada 7 kun bor. 3 haftada nechta kun bor?",
    optionA: "14",
    optionB: "18",
    optionC: "21",
    optionD: "24",
    correctOption: "C",
    points: 10,
    orderIndex: 2,
  },
  {
    questionText: "Ortiqchasini toping:",
    optionA: "Olma",
    optionB: "Nok",
    optionC: "Banan",
    optionD: "Kartoshka",
    correctOption: "D",
    points: 10,
    orderIndex: 3,
  },
  {
    questionText: "Agar bugun chorshanba bo‘lsa, 3 kundan keyin qaysi kun bo‘ladi?",
    optionA: "Payshanba",
    optionB: "Juma",
    optionC: "Shanba",
    optionD: "Yakshanba",
    correctOption: "C",
    points: 10,
    orderIndex: 4,
  },
  {
    questionText: "Ketma-ketlikni davom ettiring: 2, 4, 8, 16, ?",
    optionA: "20",
    optionB: "24",
    optionC: "30",
    optionD: "32",
    correctOption: "D",
    points: 10,
    orderIndex: 5,
  },
  {
    questionText: "Ketma-ketlikni davom ettiring: 3, 6, 12, 24, 48, ?",
    optionA: "72",
    optionB: "84",
    optionC: "96",
    optionD: "100",
    correctOption: "C",
    points: 10,
    orderIndex: 6,
  },
  {
    questionText: "Bir oilada 4 ta aka-uka bor. Ularning barchasiga bitta singil umumiy. Oilada jami nechta farzand bor?",
    optionA: "4",
    optionB: "5",
    optionC: "6",
    optionD: "8",
    correctOption: "B",
    points: 10,
    orderIndex: 7,
  },
  {
    questionText: "1, 4, 9, 16, 25, ? ketma-ketligidagi keyingi sonni toping.",
    optionA: "30",
    optionB: "32",
    optionC: "36",
    optionD: "40",
    correctOption: "C",
    points: 10,
    orderIndex: 8,
  },
  {
    questionText: "Ali Validan katta. Vali Sardordan katta. Sardor Kamoldan katta. Eng kichigi kim?",
    optionA: "Ali",
    optionB: "Vali",
    optionC: "Sardor",
    optionD: "Kamol",
    correctOption: "D",
    points: 10,
    orderIndex: 9,
  },
  {
    questionText: "Bir xonada 6 kishi bor. Har bir kishi boshqa har bir kishi bilan bir martadan qo‘l berib ko‘rishdi. Jami nechta qo‘l berishish bo‘lgan?",
    optionA: "12",
    optionB: "15",
    optionC: "18",
    optionD: "30",
    correctOption: "B",
    points: 10,
    orderIndex: 10,
  },
];

/**
 * Helper to map letter answer (A, B, C, D) or index to 0-based integer ID for Telegram Polls
 */
const mapLetterToIndex = (letter) => {
  if (letter === null || letter === undefined) return 0;
  const l = String(letter).trim().toUpperCase();
  if (l === "A" || l === "1" || l === "0") return 0;
  if (l === "B" || l === "2") return 1;
  if (l === "C" || l === "3") return 2;
  if (l === "D" || l === "4") return 3;
  return 0;
};

/**
 * Validates name length (must be at least 3 characters)
 */
const isValidName = (name) => {
  if (!name || typeof name !== "string") return false;
  return name.trim().length >= 3;
};

/**
 * Validates and formats phone number input
 */
const validateAndFormatPhone = (phoneInput) => {
  if (!phoneInput || typeof phoneInput !== "string") return null;
  const digitsOnly = phoneInput.replace(/\D/g, "");

  if (digitsOnly.length === 9) {
    return `+998${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("998")) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return phoneInput.startsWith("+") ? phoneInput.trim() : `+${digitsOnly}`;
  }

  return null;
};

/**
 * Initializes and starts the dedicated Grant Telegram Bot (@stacknowa_academy_grand_bot)
 */
const initGrantBot = () => {
  const token = process.env.GRANT_BOT_TOKEN || "8893807091:AAF8zTIs8n9KJteLWQr63kO63W_jrIgNXDA";

  const bot = new Telegraf(token);
  grantBotInstance = bot;

  // User Session map: userId -> { step, fullName, phone, username, currentQIndex, score, questions, userId }
  const userSessions = new Map();
  // Poll map: pollId -> { userId, qIndex, correctOptionId, points }
  const pollSessions = new Map();

  const getSession = (userId) => {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, { currentQIndex: 0, score: 0, userId: userId });
    }
    return userSessions.get(userId);
  };

  const clearSession = (userId) => {
    userSessions.delete(userId);
  };

  // Ensure exam config exists in database (fetches dynamically from DB & seeds real questions ONCE if DB empty)
  const getExamConfig = async () => {
    try {
      let exam = await GrantExam.findOne({ order: [["id", "DESC"]] });
      if (!exam) {
        exam = await GrantExam.create({
          title: "Stacknowa Academy 100% Grant Imtihoni 🎓",
          examDate: "25-Sentabr, 2026",
          examTime: "14:00",
          location: "Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida",
          phone: "+998 20 014 66 67",
          seatsTotal: 100,
          seatsLeft: 35,
        });
      }

      // Seed / Sync the 10 initial questions in database
      const qCount = await GrantQuestion.count();
      if (qCount === 0 || qCount === 10) {
        await GrantQuestion.destroy({ where: {} });
        await GrantQuestion.bulkCreate(initialGrantQuestions);
        console.log("🎓 Grant bot uchun 10 ta yangi osonlashtirilgan savol ma'lumotlar bazasiga saqlandi! ✅");
      }

      return exam;
    } catch (err) {
      console.error("Grant bot exam config fetch error:", err.message);
      return null;
    }
  };

  // Safe Callback Query answer helper
  const safeAnswerCb = async (ctx) => {
    try {
      await ctx.answerCbQuery();
    } catch (e) {
      // Ignore expired query errors silently
    }
  };

  // /start Command - Short & Concise Message
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    clearSession(userId);

    const exam = await getExamConfig();

    const usernameStr = ctx.from.username ? `@${ctx.from.username}` : `ID: ${userId}`;
    const userFullName = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim() || "Foydalanuvchi";
    const isAdmin = ADMIN_CHAT_IDS.includes(String(userId));

    // Notify admins whenever a new user starts the bot
    try {
      const startBotMsg =
        `🔔 **Yangi foydalanuvchi Grant Botiga kirdi (/start)!** 🎓\n\n` +
        `👤 **Foydalanuvchi:** ${userFullName}\n` +
        `✈️ **Telegram:** ${usernameStr}\n` +
        `🆔 **Telegram ID:** ${userId}\n` +
        `⏱ **Vaqt:** ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

      await sendGrantNotification(startBotMsg, userId);
    } catch (e) {
      console.error("Start command notification trigger error:", e.message);
    }

    const inlineButtons = [
      [Markup.button.callback("🚀 Imtihonni Boshlash", "START_GRANT_TEST")],
    ];

    if (isAdmin) {
      inlineButtons.push([Markup.button.callback("📢 Userlarga Xabar Yuborish (Admin)", "ADMIN_BROADCAST_START")]);
    }

    const welcomeMsg =
      `🎓 **${exam ? exam.title : "Stacknowa Academy Grant Imtihoni"}**\n\n` +
      `📌 **Oflayn Imtihon Ma'lumotlari:**\n` +
      `📅 Sana: ${exam ? exam.examDate : "25-Sentabr, 2026"} (${exam ? exam.examTime : "14:00"})\n` +
      `📍 Manzil: ${exam ? exam.location : "Namangan, Bank ko'chasi, 9-uy"}\n` +
      `📞 Aloqa: ${exam ? exam.phone : "+998 20 014 66 67"}\n` +
      `👥 Qolgan grant o'rinlari: **${exam ? exam.seatsLeft : 35} ta**\n\n` +
      (isAdmin ? `👑 **Siz Adminsiz!** Pastdagi tugma orqali foydalanuvchilarga xabar yuborishingiz mumkin.\n\n` : "") +
      `1-Bosqich testini boshlash uchun tugmani bosing:`;

    return ctx.replyWithMarkdown(
      welcomeMsg,
      Markup.inlineKeyboard(inlineButtons)
    );
  });

  // Action & Command: ADMIN_BROADCAST_START / /broadcast
  const handleAdminBroadcastStart = async (ctx) => {
    const userId = ctx.from.id;
    if (!ADMIN_CHAT_IDS.includes(String(userId))) {
      return ctx.reply("⚠️ Ushbu funksiya faqat adminlar uchun!");
    }

    const session = getSession(userId);
    session.step = "ADMIN_WAITING_BROADCAST_MSG";

    return ctx.replyWithMarkdown(
      `📢 **USERLARGA XABAR YUBORISH (ADMIN)**\n\n` +
      `Barcha botdan ro'yxatdan o'tgan foydalanuvchilarga yubormoqchi bo'lgan xabaringizni kiriting:\n\n` +
      `*(Xabaringiz foydalanuvchilarga "📢 Admin xabari:\n\n..." formatida yetib boradi)*\n\n` +
      `❌ *Bekor qilish uchun /cancel deb yozing.*`
    );
  };

  bot.action("ADMIN_BROADCAST_START", async (ctx) => {
    await safeAnswerCb(ctx);
    await handleAdminBroadcastStart(ctx);
  });

  bot.command("broadcast", async (ctx) => {
    await handleAdminBroadcastStart(ctx);
  });

  // Action: START_GRANT_TEST
  bot.action("START_GRANT_TEST", async (ctx) => {
    const userId = ctx.from.id;
    await safeAnswerCb(ctx);

    // Check if user has already completed the test by Telegram ID
    try {
      const existingParticipant = await GrantParticipant.findOne({
        where: { telegramId: userId, status: "completed" },
      });

      if (existingParticipant) {
        return ctx.replyWithMarkdown(
          `⚠️ **Siz allaqachon imtihon topshirgansiz!**\n\n` +
          `📊 **Sizning natijangiz:** ${existingParticipant.score}% ball\n` +
          `👤 **Ism:** ${existingParticipant.fullName}\n` +
          `📱 **Telefon:** ${existingParticipant.phone}\n\n` +
          `Har bir ishtirokchi va telegram akkaunt faqat 1 marta imtihon topshirishi mumkin.`
        );
      }
    } catch (e) {
      console.error("Check existing participant error:", e.message);
    }

    const session = getSession(userId);
    session.step = "ENTER_NAME";
    session.score = 0;
    session.currentQIndex = 0;
    session.username = ctx.from.username ? `@${ctx.from.username}` : null;

    return ctx.reply("Ismingiz va familiyangizni kiriting:");
  });

  // Text Handler: Name, Phone Input & Admin Broadcast
  bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const session = getSession(userId);
    const text = ctx.message.text.trim();

    if (session.step === "ADMIN_WAITING_BROADCAST_MSG") {
      if (!ADMIN_CHAT_IDS.includes(String(userId))) {
        session.step = null;
        return ctx.reply("⚠️ Ruxsat berilmagan.");
      }

      if (text.toLowerCase() === "/cancel" || text.toLowerCase() === "cancel") {
        session.step = null;
        return ctx.reply("❌ Xabar yuborish bekor qilindi.");
      }

      let targetUserIds = [];
      try {
        const participants = await GrantParticipant.findAll({ attributes: ["telegramId"] });
        targetUserIds = [...new Set(participants.map((p) => p.telegramId).filter(Boolean))];
      } catch (e) {
        console.error("Broadcast participants fetch error:", e.message);
      }

      if (targetUserIds.length === 0) {
        session.step = null;
        return ctx.reply("⚠️ Hali bitta ham foydalanuvchi ro'yxatdan o'tmagan.");
      }

      const broadcastFormattedMsg = `📢 **Admin xabari:**\n\n${text}`;

      ctx.reply(`📤 Xabar ${targetUserIds.length} ta foydalanuvchiga yuborilmoqda...`);

      let successCount = 0;
      let failCount = 0;

      for (const targetId of targetUserIds) {
        try {
          await bot.telegram.sendMessage(targetId, broadcastFormattedMsg, { parse_mode: "Markdown" });
          successCount++;
        } catch (e) {
          console.error(`Broadcast message failed for ${targetId}:`, e.message);
          failCount++;
        }
      }

      session.step = null;

      return ctx.replyWithMarkdown(
        `✅ **Xabar muvaffaqiyatli yuborildi!** 🎉\n\n` +
        `🟢 **Yetib bordi:** ${successCount} ta foydalanuvchiga\n` +
        `🔴 **Yetib bormadi (botni bloklagan):** ${failCount} ta`
      );
    }

    if (session.step === "ENTER_NAME") {
      if (!isValidName(text)) {
        return ctx.reply("⚠️ Ism va familiyangiz kamida 3 ta harfdan iborat bo'lishi kerak!\n\nIltimos, ismingiz va familiyangizni qayta kiriting:");
      }

      session.fullName = text;
      session.step = "ENTER_PHONE";

      return ctx.reply(
        `Rahmat, ${text}! 👍\n\n` +
        `Telefon raqamingizni kiriting (masalan: +998901234567) yoki pastdagi tugmani bosing:`,
        Markup.keyboard([
          [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        ]).resize().oneTime()
      );
    }

    if (session.step === "ENTER_PHONE") {
      const formattedPhone = validateAndFormatPhone(text);
      if (!formattedPhone) {
        return ctx.reply(
          `⚠️ Noto'g'ri telefon raqam kiritildi!\n\n` +
          `Iltimos, amaldagi telefon raqamingizni kiriting (masalan: +998 90 123 45 67) yoki pastdagi tugmani bosing:`,
          Markup.keyboard([
            [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
          ]).resize().oneTime()
        );
      }

      session.phone = formattedPhone;
      await startQuizQuestions(ctx, userId, session);
    }
  });

  // Contact Handler: Phone Input
  bot.on("contact", async (ctx) => {
    const userId = ctx.from.id;
    const session = getSession(userId);
    const rawPhone = ctx.message.contact.phone_number;

    if (session.step === "ENTER_PHONE") {
      const formattedPhone = validateAndFormatPhone(rawPhone) || (rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`);
      session.phone = formattedPhone;
      await startQuizQuestions(ctx, userId, session);
    }
  });

  // Helper: Start Quiz Questions
  const startQuizQuestions = async (ctx, userId, session) => {
    try {
      const phone = session.phone || "Kiritilmadi";

      // Check if this phone number or telegram ID has already completed test
      try {
        const existingParticipant = await GrantParticipant.findOne({
          where: {
            status: "completed",
            phone: phone,
          },
        });

        if (existingParticipant) {
          clearSession(userId);
          return ctx.replyWithMarkdown(
            `⚠️ **Bu telefon raqam (${phone}) bilan allaqachon imtihon topshirilgan!**\n\n` +
            `📊 **Natija:** ${existingParticipant.score}% ball\n` +
            `👤 **Ism:** ${existingParticipant.fullName}\n\n` +
            `Har bir telefon raqam bilan faqat 1 marta imtihon topshirish mumkin.`
          );
        }
      } catch (e) {
        console.error("Phone duplicate check error:", e.message);
      }

      let questions = await GrantQuestion.findAll({ order: [["orderIndex", "ASC"]] });
      if (!questions || questions.length === 0) {
        return ctx.reply("⚠️ Imtihon savollari topilmadi. Keyinroq qayta urinib ko'ring.");
      }
      session.questions = questions;
      session.currentQIndex = 0;
      session.score = 0;
      session.step = "QUIZ";
      session.userId = userId;

      const usernameStr = ctx.from.username ? `@${ctx.from.username}` : `ID: ${userId}`;
      const fullName = session.fullName || ctx.from.first_name || "Ismsiz";

      // 1. Save Lead entry in database for Lead Admins CRM
      try {
        await Lead.create({
          fullName: fullName,
          phone: phone,
          source: "Grant Bot",
          status: "New",
          notes: `🎓 Grant Bot imtihoniga kirdi va 1-bosqich testini boshladi (TG: ${usernameStr})`,
        });
      } catch (e) {
        console.error("Grant bot start lead save error:", e.message);
      }

      // 2. Create or update GrantParticipant record in database
      try {
        const participant = await GrantParticipant.findOne({ where: { telegramId: userId } });
        if (!participant) {
          await GrantParticipant.create({
            telegramId: userId,
            username: ctx.from.username ? `@${ctx.from.username}` : null,
            fullName: fullName,
            phone: phone,
            score: 0,
            passed: false,
            status: "started",
          });
        }
      } catch (e) {
        console.error("Grant participant start save error:", e.message);
      }

      // 3. Send Telegram notification to Lead Admins via Grant Bot (@stacknowa_academy_grand_bot)
      try {
        const startMsg =
          `📥 **Yangi Grant Bot Ariza (Lead)!** 🚀\n\n` +
          `👤 **Ism:** ${fullName}\n` +
          `📱 **Telefon:** ${phone}\n` +
          `✈️ **Telegram:** ${usernameStr}\n` +
          `📌 **Manbaa:** Grant Bot (@stacknowa_academy_grand_bot)\n` +
          `📝 **Holat:** 1-Bosqich onlayn testini boshladi 🎓\n` +
          `⏱ **Vaqt:** ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

        await sendGrantNotification(startMsg, userId);
      } catch (e) {
        console.error("Grant bot start notification trigger error:", e.message);
      }

      await ctx.reply("Rahmat! Savollar poll ko'rinishida yuboriladi. Omad! 🍀", Markup.removeKeyboard());

      return sendNextPollQuestion(userId, session);
    } catch (err) {
      console.error("Grant quiz start error:", err.message);
      return ctx.reply("Xatolik yuz berdi. Iltimos, /start bosing.");
    }
  };

  // Helper: Send Next Native Telegram Quiz Poll
  const sendNextPollQuestion = async (userId, session) => {
    const qIndex = session.currentQIndex;
    const total = session.questions.length;

    if (qIndex >= total) {
      return finishGrantTestForUser(userId, session);
    }

    const q = session.questions[qIndex];
    const rawOptions = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
    const options = rawOptions.length >= 2 ? rawOptions : ["A", "B", "C", "D"];
    const correctOptionId = mapLetterToIndex(q.correctOption);

    // Limit question text to 295 chars for Telegram Poll API
    let questionText = `${qIndex + 1}/${total}: ${q.questionText || "Savol"}`;
    if (questionText.length > 295) {
      questionText = questionText.slice(0, 292) + "...";
    }

    try {
      const pollMsg = await bot.telegram.sendQuiz(
        userId,
        questionText,
        options,
        {
          is_anonymous: false, // Allows bot to identify answering user
          correct_option_id: correctOptionId >= options.length ? 0 : correctOptionId,
          explanation: `Savol ${qIndex + 1}/${total} - Grant Imtihoni 🎓`,
        }
      );

      if (pollMsg && pollMsg.poll) {
        pollSessions.set(pollMsg.poll.id, {
          userId: userId,
          qIndex: qIndex,
          correctOptionId: correctOptionId >= options.length ? 0 : correctOptionId,
          points: q.points || 10,
        });
      }
    } catch (err) {
      console.error("sendQuiz error:", err.message);
    }
  };

  // Handler: Telegram Poll Answer Event
  bot.on("poll_answer", async (ctx) => {
    const pollAnswer = ctx.pollAnswer;
    if (!pollAnswer) return;

    const pollId = pollAnswer.poll_id;
    const user = pollAnswer.user;
    if (!user) return;

    const userId = user.id;
    const pollData = pollSessions.get(pollId);
    if (!pollData || pollData.userId !== userId) return;

    pollSessions.delete(pollId);

    const session = getSession(userId);
    if (!session || session.step !== "QUIZ" || session.currentQIndex !== pollData.qIndex) return;

    const selectedOptionIds = pollAnswer.option_ids;
    if (selectedOptionIds && selectedOptionIds.length > 0) {
      const chosenIndex = selectedOptionIds[0];
      if (chosenIndex === pollData.correctOptionId) {
        session.score += pollData.points;
      }
    }

    session.currentQIndex += 1;

    // Small delay to allow Telegram UI poll animation to finish, then send next question
    setTimeout(() => {
      sendNextPollQuestion(userId, session);
    }, 1000);
  });

  // Helper: Finish Grant Test & Save Participant (Short & Clean Result Message)
  const finishGrantTestForUser = async (userId, session) => {
    const totalPoints = session.questions.reduce((acc, curr) => acc + (curr.points || 10), 0);
    const maxScore = totalPoints > 0 ? totalPoints : 100;
    const finalScore = Math.round((session.score / maxScore) * 100);
    const passed = finalScore >= 70;

    const usernameStr = session.username || `ID: ${userId}`;
    const fullName = session.fullName || "Ismsiz";
    const phone = session.phone || "Kiritilmadi";

    try {
      const exam = await getExamConfig();

      // 1. Save or update GrantParticipant record in database
      let participant = await GrantParticipant.findOne({ where: { telegramId: userId } });
      if (participant) {
        participant.score = finalScore;
        participant.passed = passed;
        participant.status = "completed";
        participant.completedAt = new Date();
        await participant.save();
      } else {
        participant = await GrantParticipant.create({
          telegramId: userId,
          username: session.username || null,
          fullName: fullName,
          phone: phone,
          score: finalScore,
          passed: passed,
          status: "completed",
        });
      }

      // 2. Create or update Lead record in Lead table for CRM admins
      try {
        const leadNotes = passed
          ? `🏆 Grant Imtihonidan muvaffaqiyatli o'tdi! Natija: ${finalScore}% (2-bosqich oflayn imtihonga yo'llanma olindi)`
          : `📊 Grant Imtihonini yakunladi. Natija: ${finalScore}% (O'ta olmadi)`;

        let lead = await Lead.findOne({
          where: { phone: phone, source: "Grant Bot" },
          order: [["createdAt", "DESC"]],
        });

        if (lead) {
          lead.status = passed ? "Interested" : "New";
          lead.notes = leadNotes;
          await lead.save();
        } else {
          await Lead.create({
            fullName: fullName,
            phone: phone,
            source: "Grant Bot",
            status: passed ? "Interested" : "New",
            notes: leadNotes,
          });
        }
      } catch (e) {
        console.error("Grant finish lead update error:", e.message);
      }


      // 4. Send Telegram notification to Lead Admins via Grant Bot (@stacknowa_academy_grand_bot)
      try {
        if (passed) {
          const successAdminMsg =
            `🏆 **GRANT IMTIHONIDAN MUVAFFAQIYATLI O'TDI! (70%+ Ball)** 🎉\n\n` +
            `👤 **Ism:** ${fullName}\n` +
            `📱 **Telefon:** ${phone}\n` +
            `✈️ **Telegram:** ${usernameStr}\n` +
            `📊 **Natija:** **${finalScore}%** ball (Saralash: 70%+)\n` +
            `📌 **STATUS:** 2-Bosqich Oflayn Imtihonga Yo'llanma Olindi 🎓\n` +
            `🤖 **Bot:** Grant Bot (@stacknowa_academy_grand_bot)\n` +
            `⏱ **Vaqt:** ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

          await sendGrantNotification(successAdminMsg, userId);
        } else {
          const failAdminMsg =
            `📊 **Grant Imtihon Natijasi (O'ta olmadi)**\n\n` +
            `👤 **Ism:** ${fullName}\n` +
            `📱 **Telefon:** ${phone}\n` +
            `✈️ **Telegram:** ${usernameStr}\n` +
            `📊 **Natija:** **${finalScore}%** ball (Saralash: 70%+)\n` +
            `📌 **STATUS:** Imtihondan o'ta olmadi\n` +
            `🤖 **Bot:** Grant Bot (@stacknowa_academy_grand_bot)\n` +
            `⏱ **Vaqt:** ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

          await sendGrantNotification(failAdminMsg, userId);
        }
      } catch (e) {
        console.error("Grant bot finish notification trigger error:", e.message);
      }

      let resultMsg = "";
      if (passed) {
        resultMsg =
          `🏆 **TABRIKLAYMIZ! SARALASH TESTIDAN O'TDINGIZ!** 🎉\n\n` +
          `📊 **Natijangiz:** ${finalScore}% ball\n` +
          `👤 **Ism:** ${fullName}\n` +
          `📱 **Telefon:** ${phone}\n\n` +
          `📌 **2-BOSQICH (YAKUNIY OFLAYN IMTIHON):**\n` +
          `📅 Sana & Vaqt: ${exam ? exam.examDate : "25-Sentabr"} (${exam ? exam.examTime : "14:00"})\n` +
          `📍 Manzil: ${exam ? exam.location : "Namangan, Bank ko'chasi, 9-uy"}\n\n` +
          `Tez orada menejerlarimiz siz bilan bog'lanishadi.`;
      } else {
        resultMsg =
          `📊 **TEST YAKUNLANDI**\n\n` +
          `Natijangiz: **${finalScore}% ball** (Saralash balidan o'ta olmadingiz)\n` +
          `Ishtirokingiz uchun rahmat!`;
      }

      clearSession(userId);
      return bot.telegram.sendMessage(userId, resultMsg, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Finish grant test save error:", err.message);
      clearSession(userId);
      return bot.telegram.sendMessage(userId, `Test yakunlandi. Natijangiz: ${finalScore}% ball.`);
    }
  };

  // Launch Bot polling
  bot.launch()
    .then(() => {
      console.log(`🎓 Grant Telegram Bot (@stacknowa_academy_grand_bot) muvaffaqiyatli ishga tushdi!`);
    })
    .catch((err) => {
      console.error("Grant Bot ishga tushishida xatolik:", err.message);
    });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};

/**
 * Sends broadcast Telegram message to specified Telegram IDs or High Scorers (score >= 70%)
 */
const sendGrantBroadcastMessage = async (targetTelegramIds, textMessage) => {
  if (!grantBotInstance) {
    throw new Error("Grant Telegram Bot hali ishga tushmagan!");
  }

  let successCount = 0;
  let failCount = 0;

  for (const telegramId of targetTelegramIds) {
    try {
      await grantBotInstance.telegram.sendMessage(telegramId, textMessage, { parse_mode: "Markdown" });
      successCount++;
    } catch (err) {
      console.error(`Broadcast message error to ${telegramId}:`, err.message);
      failCount++;
    }
  }

  return { successCount, failCount };
};

module.exports = {
  initGrantBot,
  sendGrantBroadcastMessage,
};
