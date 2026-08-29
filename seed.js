const { sequelize, User, Course, Event, Mentor, Stat, Faq, Review, Result, Gallery } = require("./models");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Baza jadvallari tozalandi va qayta yaratildi 🔄");

    const adminName = process.env.ADMIN_NAME || "Admin Stacknowa";
    const adminEmail = process.env.ADMIN_EMAIL || "isomiddinxakimjanov@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "xakimdjanov._.7";

    // 1. Create Super Admin from .env
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "superadmin",
    });
    console.log(`Admin yaratildi 🔑: ${adminEmail} / ${adminPassword}`);

    // 2. Create Mentors
    const m1 = await Mentor.create({
      fullName: "Anvar Narzullayev",
      role: "Senior Full Stack & Python Developer",
      experience: "8+ yillik tajriba",
      bio: "Software Architect, ko'plab xalqaro loyihalar muallifi.",
      photoUrl: "https://stacknowa-files-2026.s3.eu-north-1.amazonaws.com/mentor/mentor1.jpg",
      socialLinks: { telegram: "@anvar_dev", github: "anvar-dev", linkedin: "anvar-dev" },
      isFeatured: true,
    });

    const m2 = await Mentor.create({
      fullName: "Jasur Raximov",
      role: "Frontend Team Lead (React/Next.js)",
      experience: "5+ yillik tajriba",
      bio: "EPAM Systems kompaniyasida Senior Frontend Developer.",
      photoUrl: "https://stacknowa-files-2026.s3.eu-north-1.amazonaws.com/mentor/mentor2.jpg",
      socialLinks: { telegram: "@jasur_frontend", github: "jasur-dev" },
      isFeatured: true,
    });

    // 3. Create Courses
    await Course.create({
      title: "Frontend Development",
      slug: "frontend-development",
      coverImage: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800",
      shortDescription: "Zamonaviy HTML, CSS, JavaScript, React va Next.js yordamida veb-saytlar yaratishni amalda o'rganing.",
      fullDescription: "Ushbu 6 oylik kurs davomida siz noldan boshlab professional Frontend dasturchi bo'lib yetishasiz. Kurs amaliy loyihalar va portfolio yaratishga yo'naltirilgan.",
      category: "IT",
      duration: "6 oy",
      level: "Boshlovchilar uchun",
      format: "Offline & Online",
      price: 1200000,
      priceText: "1 200 000 so‘m / oy",
      schedule: "Dushanba / Chorshanba / Juma (18:00 – 20:00)",
      startDate: "10-Sentabr",
      mentorId: m2.id,
      program: [
        { module: 1, title: "1-Modul: HTML & CSS Foundation", topics: ["HTML5 Semantics", "CSS Flexbox & Grid", "Responsive Web Design"] },
        { module: 2, title: "2-Modul: JavaScript Programming", topics: ["ES6+ Syntax", "DOM Manipulation", "Async JS & Fetch API"] },
        { module: 3, title: "3-Modul: React.js & Web Apps", topics: ["React Hooks", "State Management", "Routing & TailWind CSS"] },
        { module: 4, title: "4-Modul: Real World Portfolio Project", topics: ["Full Web App Deployment", "GitHub & CI/CD", "Resume preparation"] }
      ],
      features: ["✓ Boshlovchilar uchun", "✓ Real amaliy loyihalar", "✓ Mentor nazorati", "✓ Sertifikat va ishga taklif"],
      isFeatured: true,
      status: "published",
    });

    await Course.create({
      title: "Python & Backend Development",
      slug: "python-backend-development",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
      shortDescription: "Python, Django, FastAPI va PostgreSQL yordamida baquvvat backend tizimlarni yarating.",
      fullDescription: "Python backend kursida siz bazalar bilan ishlash, RESTful API hamda Microservices arxitekturasini noldan o'rganasiz.",
      category: "IT",
      duration: "6 oy",
      level: "Boshlovchilar uchun",
      format: "Offline",
      price: 1300000,
      priceText: "1 300 000 so‘m / oy",
      schedule: "Seshanba / Payshanba / Shanba (19:00 – 21:00)",
      startDate: "12-Sentabr",
      mentorId: m1.id,
      program: [
        { module: 1, title: "1-Modul: Python Asoslari", topics: ["OOP", "Data Structures", "Algorithms"] },
        { module: 2, title: "2-Modul: PostgreSQL & Database Architecture", topics: ["SQL Queries", "ORM Models", "Indexing"] },
        { module: 3, title: "3-Modul: Django REST Framework & FastAPI", topics: ["JWT Auth", "Swagger Docs", "AWS S3 Integration"] }
      ],
      features: ["✓ Boshlovchilar uchun", "✓ Database Optimization", "✓ AWS Deployment"],
      isFeatured: true,
      status: "published",
    });

    // 4. Create Events
    await Event.create({
      title: "🔥 AI va Veb Dasturlash Masterclass",
      slug: "ai-veb-dasturlash-masterclass",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      eventDate: "15-Sentabr, 2026",
      eventTime: "16:00",
      location: "Stacknowa Bosh Binosi (Chilonzor, 5-mavze)",
      shortDescription: "Sun'iy intellekt vositalaridan foydalanib 1 soatda to'liq sotuv landing page yaratish amaliy masterclass-i.",
      fullDescription: "Ushbu masterclass-da tajribali mentorlar real vaqt rejimida AI va zamonaviy frameworklar imkoniyatlarini ko'rsatib berishadi.",
      eventType: "Masterclass",
      price: 0,
      isFree: true,
      seatsTotal: 60,
      seatsLeft: 18,
      status: "upcoming",
    });

    // 5. Create Stats
    await Stat.create({ key: "students", label: "Bitiruvchilar", value: "5000+", orderIndex: 1 });
    await Stat.create({ key: "mentors", label: "Professional Ustozlar", value: "15+", orderIndex: 2 });
    await Stat.create({ key: "courses", label: "Mavjud Kurslar", value: "20+", orderIndex: 3 });
    await Stat.create({ key: "experience", label: "Yillik Tajriba", value: "5+ Yil", orderIndex: 4 });

    // 6. Create FAQs
    await Faq.create({ question: "Kurslar qancha davom etadi?", answer: "Yo'nalishga qarab kurslar 3 oydan 8 oygacha davom etadi.", orderIndex: 1 });
    await Faq.create({ question: "Kursga yozilish uchun boshlang'ich bilim kerakmi?", answer: "Yo'q, barcha asosiy kurslarimiz mutlaqo boshlovchilar uchun noldan o'rgatiladi.", orderIndex: 2 });
    await Faq.create({ question: "Kursni tugatgach sertifikat beriladimi?", answer: "Ha, amaliy loyihalarni va yakuniy imtihonni topshirgan o'quvchilarga sertifikat taqdim etiladi.", orderIndex: 3 });

    // 7. Create Success Stories
    await Result.create({
      studentName: "Azizbek Karimov",
      beforeRole: "Talaba",
      afterRole: "Junior Frontend Developer (EPAM)",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      story: "Frontend kursini bitirib 1 oy ichida xalqaro IT kompaniyaga ishga kirdim.",
    });

    // 8. Create Reviews
    await Review.create({
      studentName: "Madina Aliyeva",
      courseName: "Frontend Development",
      rating: 5,
      reviewText: "Ustozlarning tushuntirishi va muhit juda ajoyib. Amaliy darslar tufayli tez rivojlandim!",
      isPublished: true,
    });

    console.log("Baza ma'lumotlar bilan to'ldirildi! 🎉");
    process.exit(0);
  } catch (err) {
    console.error("Seed xatosi:", err);
    process.exit(1);
  }
};

seedDatabase();
