const { Telegraf, Markup } = require("telegraf");
const { GrantExam, GrantQuestion, GrantParticipant } = require("../models");

let grantBotInstance = null;

/**
 * Default 10 Seed Questions for Grant Exam if database is empty
 */
const defaultQuestions = [
  { questionText: "1. HTML nima?", optionA: "Dasturlash tili", optionB: "Gipermatnli belgilash tili", optionC: "Ma'lumotlar bazasi", optionD: "Operatsion tizim", correctOption: "B", points: 10, orderIndex: 1 },
  { questionText: "2. CSS nimaga javob beradi?", optionA: "Stil va bezak", optionB: "Ma'lumotlar saqlash", optionC: "Server mantiq", optionD: "Fayl skanerlash", correctOption: "A", points: 10, orderIndex: 2 },
  { questionText: "3. JavaScript qayerda ishlaydi?", optionA: "Faqat serverda", optionB: "Faqat brauzerda", optionC: "Ham brauzer, ham serverda (Node.js)", optionD: "Faqat videokartada", correctOption: "C", points: 10, orderIndex: 3 },
  { questionText: "4. React nima?", optionA: "JavaScript kutubxonasi", optionB: "Ma'lumotlar bazasi", optionC: "Kabel turi", optionD: "Python ramkasi", correctOption: "A", points: 10, orderIndex: 4 },
  { questionText: "5. Prompt Engineering nima?", optionA: "Sun'iy intellektga aniq ko'rsatma yozish", optionB: "Kompyuter ta'mirlash", optionC: "Saytni xostingga joylash", optionD: "Grafik dizayn chizish", correctOption: "A", points: 10, orderIndex: 5 },
  { questionText: "6. Git nima uchun ishlatiladi?", optionA: "Versiyalarni boshqarish", optionB: "Rasm tahrirlash", optionC: "Video montaj", optionD: "Antivirus", correctOption: "A", points: 10, orderIndex: 6 },
  { questionText: "7. API so'zining kengaytmasi nima?", optionA: "Application Programming Interface", optionB: "Automated Program Integration", optionC: "Advanced Protocol Instruction", optionD: "Array Processing Interface", correctOption: "A", points: 10, orderIndex: 7 },
  { questionText: "8. SQL nima?", optionA: "So'rovlar tili (Database query language)", optionB: "Antivirus", optionC: "Grafik redaktor", optionD: "Operatsion tizim", correctOption: "A", points: 10, orderIndex: 8 },
  { questionText: "9. ChatGPT modelini yaratgan kompaniya qaysi?", optionA: "OpenAI", optionB: "Google", optionC: "Meta", optionD: "Apple", correctOption: "A", points: 10, orderIndex: 9 },
  { questionText: "10. Sun'iy intellektda LLM nimani anglatadi?", optionA: "Large Language Model", optionB: "Low Level Logic", optionC: "Local Link Machine", optionD: "Linear Learning Module", correctOption: "A", points: 10, orderIndex: 10 },
];

/**
 * Initializes and starts the dedicated Grant Telegram Bot (@stacknowa_academy_grand_bot)
 */
const initGrantBot = () => {
  const token = process.env.GRANT_BOT_TOKEN || "8893807091:AAF8zTIs8n9KJteLWQr63kO63W_jrIgNXDA";

  const bot = new Telegraf(token);
  grantBotInstance = bot;

  // Session map: userId -> { step, fullName, phone, currentQIndex, score, questions }
  const userSessions = new Map();

  const getSession = (userId) => {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, { currentQIndex: 0, score: 0 });
    }
    return userSessions.get(userId);
  };

  const clearSession = (userId) => {
    userSessions.delete(userId);
  };

  // Ensure default exam config and seed questions exist
  const ensureSeedData = async () => {
    try {
      let exam = await GrantExam.findOne();
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

      const qCount = await GrantQuestion.count();
      if (qCount === 0) {
        await GrantQuestion.bulkCreate(defaultQuestions);
      }
      return exam;
    } catch (err) {
      console.error("Grant bot seed data error:", err.message);
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

  // /start Command
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    clearSession(userId);

    const exam = await ensureSeedData();

    const welcomeMsg =
      `🎓 **Stacknowa Academy 2-Bosqichli Grant Imtihoni Botiga Xush Kelibsiz!**\n\n` +
      `Siz 100% va 50% lik ta'lim grantlarini qo'lga kiritish imtihonida qatnashmoqdasiz.\n\n` +
      `📌 **IMTIHON BOSQICHLARI:**\n` +
      `1️⃣ **1-Bosqich (Onlayn Telegram Bot):** 10 ta saralash testi (70%+ ball olish kerak).\n` +
      `2️⃣ **2-Bosqich (Oflayn Bosh Bino):** Yakuniy yuzma-yuz imtihon va grant topshirish.\n\n` +
      `📌 **2-Bosqich Oflayn Imtihon Ma'lumotlari:**\n` +
      `📅 Sana: ${exam ? exam.examDate : "25-Sentabr, 2026"} (${exam ? exam.examTime : "14:00"})\n` +
      `📍 Manzil: ${exam ? exam.location : "Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida"}\n` +
      `📞 Aloqa: ${exam ? exam.phone : "+998 20 014 66 67"}\n` +
      `👥 Qolgan grant o'rinlari: **${exam ? exam.seatsLeft : 35} ta**\n\n` +
      `1-Bosqich saralash testini boshlash uchun pastdagi tugmani bosing:`;

    return ctx.replyWithMarkdown(
      welcomeMsg,
      Markup.inlineKeyboard([
        [Markup.button.callback("🚀 Grant Imtihonini Boshlash", "START_GRANT_TEST")],
      ])
    );
  });

  // Action: START_GRANT_TEST
  bot.action("START_GRANT_TEST", async (ctx) => {
    const userId = ctx.from.id;
    await safeAnswerCb(ctx);

    const session = getSession(userId);
    session.step = "ENTER_NAME";
    session.score = 0;
    session.currentQIndex = 0;

    return ctx.reply("Iltimos, imtihonda qatnashish uchun **ismingiz va familiyangizni** kiriting:");
  });

  // Text Handler: Name and Phone Input
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
      session.phone = text;
      await startQuizQuestions(ctx, userId, session);
    }
  });

  // Contact Handler: Phone Input
  bot.on("contact", async (ctx) => {
    const userId = ctx.from.id;
    const session = getSession(userId);
    const phone = ctx.message.contact.phone_number;

    if (session.step === "ENTER_PHONE") {
      session.phone = phone;
      await startQuizQuestions(ctx, userId, session);
    }
  });

  // Helper: Start Quiz Questions
  const startQuizQuestions = async (ctx, userId, session) => {
    try {
      let questions = await GrantQuestion.findAll({ order: [["orderIndex", "ASC"]] });
      if (!questions || questions.length === 0) {
        questions = defaultQuestions;
      }
      session.questions = questions;
      session.currentQIndex = 0;
      session.score = 0;
      session.step = "QUIZ";

      await ctx.reply("Rahmat! Test 10 ta savoldan iborat. Omad yor bo'lsin! 🍀", Markup.removeKeyboard());

      return sendNextQuestion(ctx, session);
    } catch (err) {
      console.error("Grant quiz start error:", err.message);
      return ctx.reply("Testni boshlashda xatolik yuz berdi. Iltimos, /start bosing.");
    }
  };

  // Helper: Send Next Question
  const sendNextQuestion = async (ctx, session) => {
    const qIndex = session.currentQIndex;
    const total = session.questions.length;

    if (qIndex >= total) {
      return finishGrantTest(ctx, session);
    }

    const q = session.questions[qIndex];
    const qText = `**Savol ${qIndex + 1}/${total}:**\n\n${q.questionText}`;

    const buttons = [
      [Markup.button.callback(`A) ${q.optionA}`, `GRANT_ANS_${qIndex}_A`)],
      [Markup.button.callback(`B) ${q.optionB}`, `GRANT_ANS_${qIndex}_B`)],
      [Markup.button.callback(`C) ${q.optionC}`, `GRANT_ANS_${qIndex}_C`)],
      [Markup.button.callback(`D) ${q.optionD}`, `GRANT_ANS_${qIndex}_D`)],
    ];

    return ctx.replyWithMarkdown(qText, Markup.inlineKeyboard(buttons));
  };

  // Action: ANSWER_QUESTION
  bot.action(/GRANT_ANS_(\d+)_(A|B|C|D)/, async (ctx) => {
    const userId = ctx.from.id;
    await safeAnswerCb(ctx);

    const session = getSession(userId);
    const qIndex = Number(ctx.match[1]);
    const userAns = ctx.match[2];

    if (!session.questions || session.step !== "QUIZ" || session.currentQIndex !== qIndex) {
      return;
    }

    const currentQ = session.questions[qIndex];
    const points = currentQ.points || 10;

    if (userAns === currentQ.correctOption) {
      session.score += points;
    }

    session.currentQIndex += 1;
    return sendNextQuestion(ctx, session);
  });

  // Helper: Finish Grant Test & Save Participant
  const finishGrantTest = async (ctx, session) => {
    const userId = ctx.from.id;
    const totalPoints = session.questions.reduce((acc, curr) => acc + (curr.points || 10), 0);
    const maxScore = totalPoints > 0 ? totalPoints : 100;
    const finalScore = Math.round((session.score / maxScore) * 100);
    const passed = finalScore >= 70;

    try {
      const exam = await GrantExam.findOne();

      // Save participant to database
      await GrantParticipant.create({
        telegramId: userId,
        username: ctx.from.username ? `@${ctx.from.username}` : null,
        fullName: session.fullName || ctx.from.first_name || "Ismsiz",
        phone: session.phone || "Kiritilmadi",
        score: finalScore,
        passed: passed,
        status: "completed",
      });

      // Decrement available seats if passed
      if (passed && exam && exam.seatsLeft > 0) {
        await exam.decrement("seatsLeft");
      }

      let resultMsg = "";
      if (passed) {
        resultMsg =
          `🏆 **TABRIKLAYMIZ! 1-BOSQICH ONLAYN SARALASH TESTIDAN O'TDINGIZ!** 🎉\n\n` +
          `📊 **Sizning natijangiz:** ${finalScore}% ball (Saralash chegarasi: 70%)\n` +
          `👤 **Ism:** ${session.fullName}\n` +
          `📱 **Telefon:** ${session.phone}\n\n` +
          `📌 **STATUS:** 1-Bosqich Saralashdan O'tdi (2-Bosqich Oflayn Imtihonga Yo'llanma Olindi)\n\n` +
          `📌 **2-BOSQICH (YAKUNIY OFLAYN IMTIHON) MA'LUMOTLARI:**\n` +
          `📅 **Sana & Vaqt:** ${exam ? exam.examDate : "25-Sentabr, 2026"} (${exam ? exam.examTime : "14:00"})\n` +
          `📍 **Manzil:** ${exam ? exam.location : "Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida"}\n` +
          `📞 **Aloqa:** ${exam ? exam.phone : "+998 20 014 66 67"}\n\n` +
          `Tez orada menejerlarimiz siz bilan bog'lanib, 2-bosqich oflayn imtihon ruxsatnomasini rasmiylashtirishadi.`;
      } else {
        resultMsg =
          `📊 **1-BOSQICH TESTI YAKUNLANDI**\n\n` +
          `Sizning natijangiz: **${finalScore}% ball**\n` +
          `Saralash chegarasi: **70% ball**\n\n` +
          `Ishtirokingiz uchun rahmat! Standart kurslarimizga yozilish uchun markazimizga murojaat qilishingiz mumkin.`;
      }

      clearSession(userId);
      return ctx.replyWithMarkdown(resultMsg);
    } catch (err) {
      console.error("Finish grant test save error:", err.message);
      clearSession(userId);
      return ctx.reply(`Test yakunlandi. Sizning natijangiz: ${finalScore}% ball.`);
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
