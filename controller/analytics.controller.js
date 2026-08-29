const { AnalyticsEvent, Lead, Course, Event } = require("../models");
const { Sequelize, Op } = require("sequelize");

exports.trackEvent = async (req, res) => {
  try {
    const { eventName, source, pageUrl, metaJson } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const event = await AnalyticsEvent.create({
      eventName,
      source,
      pageUrl,
      metaJson,
      ipAddress,
      userAgent,
    });

    return res.status(201).json({ message: "Event log qilindi", event });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalLeads = await Lead.count();
    const newLeads = await Lead.count({ where: { status: "New" } });
    const registeredLeads = await Lead.count({ where: { status: "Registered" } });

    const totalCourses = await Course.count();
    const totalEvents = await Event.count();

    // 1. Group Leads by Source dynamically
    const rawSources = await Lead.findAll({
      attributes: ["source", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      group: ["source"],
      raw: true,
    });

    const sourceColors = {
      Landing: "#6366f1",
      "Course Page": "#8b5cf6",
      Popup: "#ec4899",
      Event: "#10b981",
      Telegram: "#06b6d4",
      "Floating CTA": "#f59e0b",
    };

    const sourceData = rawSources.map((item) => ({
      name: item.source || "Landing",
      count: parseInt(item.count, 10),
      color: sourceColors[item.source] || "#6366f1",
    }));

    // If sourceData is empty, populate standard source categories with 0 count
    const allSources = ["Landing", "Course Page", "Popup", "Event", "Telegram"];
    allSources.forEach((src) => {
      if (!sourceData.find((s) => s.name === src)) {
        sourceData.push({ name: src, count: 0, color: sourceColors[src] });
      }
    });

    // 2. Weekly Trend Data (Last 7 Days)
    const dayNames = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
    const weeklyTrend = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const leadsCount = await Lead.count({
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const viewsCount = await AnalyticsEvent.count({
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      weeklyTrend.push({
        day: dayNames[startOfDay.getDay()],
        date: startOfDay.toISOString().split("T")[0],
        leads: leadsCount,
        views: viewsCount,
      });
    }

    // 3. Conversion Rate & Growth Rate
    const conversionRate = totalLeads > 0 ? ((registeredLeads / totalLeads) * 100).toFixed(1) : "0.0";

    return res.status(200).json({
      summary: {
        totalLeads,
        newLeads,
        registeredLeads,
        totalCourses,
        totalEvents,
        conversionRate,
      },
      sourceData,
      weeklyTrend,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
