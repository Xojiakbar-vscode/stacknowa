const { GrantExam, GrantQuestion, GrantParticipant } = require("../models");
const { sendGrantBroadcastMessage } = require("../bot/grantBot");

// Get Grant Exam Config
exports.getGrantExamConfig = async (req, res) => {
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
    } else {
      if (exam.location.includes("Toshkent") || exam.phone.includes("90 123 45 67") || exam.phone === "+998 90 123 45 67") {
        await exam.update({
          location: "Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida",
          phone: "+998 20 014 66 67",
        });
      }
    }
    return res.json(exam);
  } catch (err) {
    return res.status(500).json({ message: "Exam config yuklashda xatolik: " + err.message });
  }
};

// Update Grant Exam Config
exports.updateGrantExamConfig = async (req, res) => {
  try {
    let exam = await GrantExam.findOne();
    if (!exam) {
      exam = await GrantExam.create(req.body);
    } else {
      await exam.update(req.body);
    }
    return res.json(exam);
  } catch (err) {
    return res.status(500).json({ message: "Exam config yangilashda xatolik: " + err.message });
  }
};

// Get Grant Test Questions
exports.getGrantQuestions = async (req, res) => {
  try {
    const questions = await GrantQuestion.findAll({ order: [["orderIndex", "ASC"]] });
    return res.json(questions);
  } catch (err) {
    return res.status(500).json({ message: "Savollarni yuklashda xatolik: " + err.message });
  }
};

// Create Grant Test Question
exports.createGrantQuestion = async (req, res) => {
  try {
    const question = await GrantQuestion.create(req.body);
    return res.status(201).json(question);
  } catch (err) {
    return res.status(500).json({ message: "Savol yaratishda xatolik: " + err.message });
  }
};

// Update Grant Test Question
exports.updateGrantQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await GrantQuestion.findByPk(id);
    if (!question) return res.status(404).json({ message: "Savol topilmadi" });

    await question.update(req.body);
    return res.json(question);
  } catch (err) {
    return res.status(500).json({ message: "Savolni tahrirlashda xatolik: " + err.message });
  }
};

// Delete Grant Test Question
exports.deleteGrantQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await GrantQuestion.findByPk(id);
    if (!question) return res.status(404).json({ message: "Savol topilmadi" });

    await question.destroy();
    return res.json({ message: "Savol o'chirildi" });
  } catch (err) {
    return res.status(500).json({ message: "Savolni o'chirishda xatolik: " + err.message });
  }
};

// Get All Grant Test Participants
exports.getGrantParticipants = async (req, res) => {
  try {
    const participants = await GrantParticipant.findAll({ order: [["score", "DESC"], ["createdAt", "DESC"]] });
    return res.json(participants);
  } catch (err) {
    return res.status(500).json({ message: "Ishtirokchilarni yuklashda xatolik: " + err.message });
  }
};

// Send Broadcast Telegram Message to High Scorers (score >= 70%) or selected participants
exports.sendBroadcastMessage = async (req, res) => {
  try {
    const { targetIds, messageText, onlyPassed } = req.body;

    if (!messageText) {
      return res.status(400).json({ message: "Xabar matni kiritilishi shart!" });
    }

    let targets = [];
    if (Array.isArray(targetIds) && targetIds.length > 0) {
      targets = targetIds;
    } else {
      const whereClause = onlyPassed ? { passed: true } : {};
      const participants = await GrantParticipant.findAll({ where: whereClause });
      targets = participants.map((p) => p.telegramId).filter(Boolean);
    }

    if (targets.length === 0) {
      return res.status(400).json({ message: "Xabar yuborish uchun mos foydalanuvchilar topilmadi." });
    }

    const result = await sendGrantBroadcastMessage(targets, messageText);
    return res.json({
      message: `Xabar tarqatildi! Muvaffaqiyatli: ${result.successCount} ta, Xatolik: ${result.failCount} ta`,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ message: "Xabar yuborishda xatolik: " + err.message });
  }
};

// Delete Single Grant Participant (Reset progress)
exports.deleteGrantParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const participant = await GrantParticipant.findByPk(id);
    if (!participant) return res.status(404).json({ message: "Ishtirokchi topilmadi" });

    await participant.destroy();
    return res.json({ message: "Ishtirokchi natijasi va progressi o'chirildi" });
  } catch (err) {
    return res.status(500).json({ message: "O'chirishda xatolik: " + err.message });
  }
};

// Reset All Grant Participants
exports.resetAllGrantParticipants = async (req, res) => {
  try {
    const deletedCount = await GrantParticipant.destroy({ where: {} });
    return res.json({ message: `Barcha ${deletedCount} ta ishtirokchilar progressi tozalandi` });
  } catch (err) {
    return res.status(500).json({ message: "Tozalashda xatolik: " + err.message });
  }
};
