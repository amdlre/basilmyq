/* eslint-disable no-console */
import "dotenv/config";
import { config as loadEnv } from "dotenv";

import { createPrismaClient } from "../src/server/prisma-client";

// The seed runs outside Next.js, so load the same env file the app uses.
loadEnv({ path: ".env.local", override: true, quiet: true });

const db = createPrismaClient();

/**
 * SAMPLE DATA ONLY — none of this is factual.
 *
 * This repository is public, so every organisation, client, employer and
 * credential below is a deliberately generic placeholder. Nothing here is
 * attributed to a real company or a real person. It exists to give the
 * dashboard realistically shaped rows to render.
 *
 * Replace all of it with real content from the dashboard.
 *
 * Seeding REPLACES content: every table below is emptied first. It refuses to
 * run against a database that already holds content unless `--force` is passed,
 * because "let me just check the seed still works" is otherwise one keystroke
 * away from deleting a real site's projects and posts.
 */

async function countExistingContent(): Promise<number> {
  const counts = await Promise.all([
    db.project.count(),
    db.post.count(),
    db.skill.count(),
    db.experience.count(),
    db.education.count(),
    db.contactMessage.count(),
  ]);
  return counts.reduce((total, count) => total + count, 0);
}

async function main() {
  const force = process.argv.includes("--force");
  const existing = await countExistingContent();

  if (existing > 0 && !force) {
    console.error(
      `\nRefusing to seed: the database already holds ${existing} content rows.\n` +
        "Seeding deletes them and writes sample data in their place.\n\n" +
        "If that is what you want, run:  npm run db:seed -- --force\n" +
        "To keep them, take a dump first: pg_dump ... > backup.sql\n",
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    force && existing > 0
      ? `Seeding basilmyq — replacing ${existing} existing content rows…`
      : "Seeding basilmyq…",
  );

  // Order matters: children before parents.
  await db.activityLog.deleteMany();
  await db.contactMessage.deleteMany();
  await db.media.deleteMany();
  await db.post.deleteMany();
  await db.education.deleteMany();
  await db.experience.deleteMany();
  await db.skill.deleteMany();
  await db.skillGroup.deleteMany();
  await db.project.deleteMany();
  await db.projectCategory.deleteMany();

  // -- Settings -------------------------------------------------------------

  await db.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteNameAr: "باسل مية",
      siteNameEn: "Basil Myq",
      taglineAr: "أبني منتجات ويب سريعة ومتقنة",
      taglineEn: "I build fast, carefully made web products",
      descriptionAr:
        "مهندس ويب متخصص في بناء منتجات رقمية بواجهات دقيقة وأداء عالٍ، من الفكرة حتى النشر.",
      descriptionEn:
        "Web engineer building digital products with precise interfaces and high performance, from idea to deployment.",
      email: "basil@basilmyq.com",
      phone: "+966500000000",
      cityAr: "الرياض، السعودية",
      cityEn: "Riyadh, Saudi Arabia",
      socialLinks: [
        { label: "GitHub", url: "https://github.com/", icon: "github" },
        {
          label: "LinkedIn",
          url: "https://linkedin.com/in/",
          icon: "linkedin",
        },
        { label: "X", url: "https://x.com/", icon: "twitter" },
      ],
      seoKeywordsAr: "مطور ويب, Next.js, واجهات أمامية, السعودية",
      seoKeywordsEn: "web developer, Next.js, frontend, Saudi Arabia",
    },
  });

  await db.heroSection.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      titleAr: "باسل مية",
      titleEn: "Basil Myq",
      subtitleAr:
        "مهندس ويب أبني منتجات كاملة — من نظام التصميم حتى قاعدة البيانات والنشر.",
      subtitleEn:
        "Web engineer building complete products — from the design system down to the database and deployment.",
      badgeAr: "متاح لمشاريع جديدة",
      badgeEn: "Available for new work",
      primaryCtaLabelAr: "شاهد المشاريع",
      primaryCtaLabelEn: "View projects",
      primaryCtaUrl: "/projects",
      secondaryCtaLabelAr: "تواصل معي",
      secondaryCtaLabelEn: "Get in touch",
      secondaryCtaUrl: "/contact",
      isAvailable: true,
      availabilityTextAr: "متاح للعمل",
      availabilityTextEn: "Open to work",
    },
  });

  await db.aboutSection.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      titleAr: "نبذة عني",
      titleEn: "About me",
      bioAr:
        "أعمل في هندسة الويب منذ سنوات، وأركّز على المنتجات التي تُستخدم يومياً: لوحات تحكم، منصات تجارة، وأنظمة إدارة محتوى. أهتم بالتفاصيل التي يشعر بها المستخدم ولا يلاحظها — سرعة الاستجابة، وضوح الحالة، ودعم كامل للعربية والاتجاه من اليمين لليسار.",
      bioEn:
        "I have spent years in web engineering, focused on products people use daily: dashboards, commerce platforms, and content systems. I care about the details users feel without noticing — responsiveness, clear state, and first-class Arabic and RTL support.",
      clientsCount: 18,
    },
  });

  // -- Project categories ---------------------------------------------------

  const categories = await Promise.all(
    [
      { slug: "web-apps", nameAr: "تطبيقات ويب", nameEn: "Web apps", order: 1 },
      {
        slug: "ecommerce",
        nameAr: "تجارة إلكترونية",
        nameEn: "E-commerce",
        order: 2,
      },
      {
        slug: "dashboards",
        nameAr: "لوحات تحكم",
        nameEn: "Dashboards",
        order: 3,
      },
      {
        slug: "design-systems",
        nameAr: "أنظمة تصميم",
        nameEn: "Design systems",
        order: 4,
      },
    ].map((data) => db.projectCategory.create({ data })),
  );

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const categoryId = (slug: string): string => {
    const id = categoryBySlug.get(slug);
    if (!id) throw new Error(`Unknown category: ${slug}`);
    return id;
  };

  // -- Projects -------------------------------------------------------------

  await db.project.createMany({
    data: [
      {
        slug: "travel-booking-platform",
        titleAr: "منصة حجوزات سفر",
        titleEn: "Travel booking platform",
        summaryAr: "منصة حجوزات سفر متعددة اللغات تخدم آلاف الطلبات يومياً.",
        summaryEn:
          "A multilingual travel booking platform serving thousands of daily requests.",
        contentAr:
          "أعدنا بناء تدفق الحجز بالكامل على Next.js مع عرض من الخادم للنتائج، فانخفض زمن أول عرض إلى النصف تقريباً. النظام يدعم العربية والإنجليزية باتجاهين كاملين، وتم توحيد الواجهة في نظام تصميم واحد.",
        contentEn:
          "We rebuilt the entire booking flow on Next.js with server-rendered results, cutting time to first render roughly in half. The system supports Arabic and English in both directions, with the interface unified into a single design system.",
        categoryId: categoryId("web-apps"),
        tags: ["Next.js", "TypeScript", "PostgreSQL", "Redis"],
        clientAr: "عميل في قطاع السفر (عيّنة)",
        clientEn: "A travel client (sample)",
        year: 2025,
        roleAr: "مهندس واجهات أول",
        roleEn: "Lead frontend engineer",
        results: [
          {
            labelAr: "تحسّن زمن التحميل",
            labelEn: "Faster load time",
            value: "52%",
          },
          {
            labelAr: "ارتفاع إتمام الحجز",
            labelEn: "Booking completion",
            value: "+23%",
          },
        ],
        status: "COMPLETED",
        isFeatured: true,
        order: 1,
      },
      {
        slug: "unified-admin-console",
        titleAr: "لوحة تحكم موحّدة",
        titleEn: "Unified admin console",
        summaryAr:
          "لوحة إدارة موحّدة لأكثر من عشرين وحدة بجدول واحد معاد استخدامه.",
        summaryEn:
          "A unified admin console covering twenty-plus modules with one reusable table.",
        contentAr:
          "بُنيت اللوحة حول مكوّن جدول واحد يتولى الفرز والفلترة والتحديد الجماعي والتصدير. أي وحدة جديدة تحتاج تعريف أعمدة فقط، فانخفض زمن إضافة وحدة من أيام إلى ساعات.",
        contentEn:
          "Built around a single table component handling sorting, filtering, bulk selection and export. A new module needs only a column definition, which cut module delivery from days to hours.",
        categoryId: categoryId("dashboards"),
        tags: ["React", "TanStack Table", "Prisma", "Tailwind"],
        clientAr: "شركة منتجات رقمية (عيّنة)",
        clientEn: "A digital products company (sample)",
        year: 2025,
        roleAr: "مهندس full-stack",
        roleEn: "Full-stack engineer",
        results: [
          {
            labelAr: "وحدات مدعومة",
            labelEn: "Modules supported",
            value: "24",
          },
          {
            labelAr: "تقليص كود الواجهة",
            labelEn: "UI code removed",
            value: "-61%",
          },
        ],
        status: "COMPLETED",
        isFeatured: true,
        order: 2,
      },
      {
        slug: "shared-design-system",
        titleAr: "نظام تصميم مشترك",
        titleEn: "Shared design system",
        summaryAr: "مكتبة مكوّنات مشتركة تدعم RTL والوضع الداكن افتراضياً.",
        summaryEn:
          "A shared component library with RTL and dark mode built in from the start.",
        contentAr:
          "مكتبة مبنية على shadcn/ui مع توكنات لونية موحّدة، تُستهلك في عدة مشاريع. كل مكوّن يمر باختبار في الاتجاهين وفي الوضعين الفاتح والداكن قبل الإصدار.",
        contentEn:
          "A shadcn/ui-based library with unified colour tokens, consumed across several projects. Every component is tested in both directions and both themes before release.",
        categoryId: categoryId("design-systems"),
        tags: ["Design system", "shadcn/ui", "Tailwind", "RTL"],
        year: 2024,
        roleAr: "مصمم ومهندس",
        roleEn: "Designer and engineer",
        results: [
          { labelAr: "مكوّنات", labelEn: "Components", value: "60+" },
          {
            labelAr: "مشاريع تستهلكها",
            labelEn: "Consuming projects",
            value: "5",
          },
        ],
        status: "COMPLETED",
        isFeatured: true,
        order: 3,
      },
      {
        slug: "commerce-storefront",
        titleAr: "واجهة متجر إلكتروني",
        titleEn: "Commerce storefront",
        summaryAr: "واجهة متجر إلكتروني بأداء عالٍ ودفع محلي.",
        summaryEn: "A high-performance storefront with local payment methods.",
        contentAr:
          "واجهة متجر مبنية على عرض ثابت مع تحديث تدريجي، تدعم مدى وApple Pay. صفحات المنتجات تُولّد مسبقاً ويُعاد توليدها عند تغيّر المخزون.",
        contentEn:
          "A storefront built on static rendering with incremental revalidation, supporting Mada and Apple Pay. Product pages are pre-generated and regenerated when stock changes.",
        categoryId: categoryId("ecommerce"),
        tags: ["Next.js", "Medusa", "Stripe", "ISR"],
        clientAr: "متجر تجزئة (عيّنة)",
        clientEn: "A retail client (sample)",
        year: 2024,
        roleAr: "مهندس واجهات",
        roleEn: "Frontend engineer",
        results: [
          {
            labelAr: "نتيجة Lighthouse",
            labelEn: "Lighthouse score",
            value: "98",
          },
          {
            labelAr: "انخفاض ترك السلة",
            labelEn: "Cart abandonment",
            value: "-17%",
          },
        ],
        status: "COMPLETED",
        order: 4,
      },
      {
        slug: "learning-portal",
        titleAr: "بوابة تعليمية",
        titleEn: "Learning portal",
        summaryAr: "منصة تعلّم بمسارات ومتابعة تقدّم وشهادات.",
        summaryEn:
          "A learning platform with tracks, progress tracking and certificates.",
        contentAr:
          "منصة تتيح للمدربين نشر مسارات تعليمية ومتابعة تقدّم المتدربين، مع إصدار شهادات تلقائي عند الإكمال.",
        contentEn:
          "A platform letting instructors publish learning tracks and follow learner progress, issuing certificates automatically on completion.",
        categoryId: categoryId("web-apps"),
        tags: ["Next.js", "Prisma", "PostgreSQL"],
        year: 2023,
        roleAr: "مهندس full-stack",
        roleEn: "Full-stack engineer",
        results: [
          {
            labelAr: "متدربون نشطون",
            labelEn: "Active learners",
            value: "3,400",
          },
        ],
        status: "COMPLETED",
        order: 5,
      },
      {
        slug: "basilmyq-cms",
        titleAr: "نظام إدارة basilmyq",
        titleEn: "basilmyq CMS",
        summaryAr: "هذا الموقع نفسه — معرض أعمال ونظام إدارة محتوى كامل.",
        summaryEn:
          "This very site — a portfolio and a complete content management system.",
        contentAr:
          "معرض أعمال ثنائي اللغة مع لوحة تحكم كاملة: كل نص وكل قسم في الموقع قابل للتحرير من الداشبورد بدون لمس الكود.",
        contentEn:
          "A bilingual portfolio with a full dashboard: every string and every section on the site is editable from the admin without touching code.",
        categoryId: categoryId("web-apps"),
        tags: ["Next.js 16", "Prisma", "next-intl", "shadcn/ui"],
        year: 2026,
        roleAr: "مهندس ومصمم",
        roleEn: "Engineer and designer",
        results: [],
        status: "IN_PROGRESS",
        order: 6,
      },
    ],
  });

  // -- Skills ---------------------------------------------------------------

  const skillGroups = await Promise.all(
    [
      { nameAr: "الواجهة الأمامية", nameEn: "Frontend", order: 1 },
      { nameAr: "الخلفية وقواعد البيانات", nameEn: "Backend & data", order: 2 },
      { nameAr: "التصميم", nameEn: "Design", order: 3 },
      { nameAr: "البنية والنشر", nameEn: "Infrastructure", order: 4 },
    ].map((data) => db.skillGroup.create({ data })),
  );

  const groupId = (index: number): string => {
    const group = skillGroups[index];
    if (!group) throw new Error(`Missing skill group ${index}`);
    return group.id;
  };

  await db.skill.createMany({
    data: [
      {
        nameAr: "TypeScript",
        nameEn: "TypeScript",
        icon: "typescript",
        level: 95,
        groupId: groupId(0),
        order: 1,
        isFeatured: true,
      },
      {
        nameAr: "React",
        nameEn: "React",
        icon: "react",
        level: 95,
        groupId: groupId(0),
        order: 2,
        isFeatured: true,
      },
      {
        nameAr: "Next.js",
        nameEn: "Next.js",
        icon: "nextjs",
        level: 92,
        groupId: groupId(0),
        order: 3,
        isFeatured: true,
      },
      {
        nameAr: "Tailwind CSS",
        nameEn: "Tailwind CSS",
        icon: "tailwind",
        level: 90,
        groupId: groupId(0),
        order: 4,
      },
      {
        nameAr: "Node.js",
        nameEn: "Node.js",
        icon: "nodejs",
        level: 85,
        groupId: groupId(1),
        order: 5,
      },
      {
        nameAr: "PostgreSQL",
        nameEn: "PostgreSQL",
        icon: "postgresql",
        level: 82,
        groupId: groupId(1),
        order: 6,
        isFeatured: true,
      },
      {
        nameAr: "Prisma",
        nameEn: "Prisma",
        icon: "prisma",
        level: 88,
        groupId: groupId(1),
        order: 7,
      },
      {
        nameAr: "تصميم الواجهات",
        nameEn: "UI design",
        icon: "figma",
        level: 80,
        groupId: groupId(2),
        order: 8,
      },
      {
        nameAr: "أنظمة التصميم",
        nameEn: "Design systems",
        icon: "components",
        level: 88,
        groupId: groupId(2),
        order: 9,
        isFeatured: true,
      },
      {
        nameAr: "إمكانية الوصول",
        nameEn: "Accessibility",
        icon: "accessibility",
        level: 78,
        groupId: groupId(2),
        order: 10,
      },
      {
        nameAr: "Docker",
        nameEn: "Docker",
        icon: "docker",
        level: 75,
        groupId: groupId(3),
        order: 11,
      },
      {
        nameAr: "CI/CD",
        nameEn: "CI/CD",
        icon: "workflow",
        level: 72,
        groupId: groupId(3),
        order: 12,
      },
    ],
  });

  // -- Experience -----------------------------------------------------------

  await db.experience.createMany({
    data: [
      {
        companyAr: "شركة منتجات رقمية (عيّنة)",
        companyEn: "A digital products company (sample)",
        roleAr: "مهندس ويب أول",
        roleEn: "Senior web engineer",
        locationAr: "الرياض، السعودية",
        locationEn: "Riyadh, Saudi Arabia",
        startDate: new Date("2024-01-01"),
        isCurrent: true,
        descriptionAr:
          "أقود بناء واجهات المنتجات وأضع نظام التصميم المشترك بين الفرق، مع مسؤولية عن الأداء وإمكانية الوصول.",
        descriptionEn:
          "I lead product interface work and own the design system shared across teams, with responsibility for performance and accessibility.",
        order: 1,
        isFeatured: true,
      },
      {
        companyAr: "شركة في قطاع السفر (عيّنة)",
        companyEn: "A travel company (sample)",
        roleAr: "مهندس واجهات أمامية",
        roleEn: "Frontend engineer",
        locationAr: "الرياض، السعودية",
        locationEn: "Riyadh, Saudi Arabia",
        startDate: new Date("2021-06-01"),
        endDate: new Date("2023-12-31"),
        descriptionAr:
          "عملت على تدفقات الحجز والدفع، وأعدت بناء صفحات النتائج لتُعرض من الخادم.",
        descriptionEn:
          "Worked on booking and payment flows, and rebuilt the results pages to render on the server.",
        order: 2,
      },
      {
        companyAr: "وكالة تقنية (عيّنة)",
        companyEn: "A technology agency (sample)",
        roleAr: "مطوّر full-stack",
        roleEn: "Full-stack developer",
        locationAr: "عن بُعد",
        locationEn: "Remote",
        startDate: new Date("2019-03-01"),
        endDate: new Date("2021-05-31"),
        descriptionAr:
          "بنيت لوحات التحكم الداخلية وواجهات برمجة التطبيقات التي تغذّيها.",
        descriptionEn:
          "Built the internal admin consoles and the APIs behind them.",
        order: 3,
      },
      {
        companyAr: "عمل حر",
        companyEn: "Freelance",
        roleAr: "مطوّر ويب",
        roleEn: "Web developer",
        locationAr: "عن بُعد",
        locationEn: "Remote",
        startDate: new Date("2017-09-01"),
        endDate: new Date("2019-02-28"),
        descriptionAr:
          "نفّذت مواقع ومتاجر لعملاء في السعودية والخليج، من التصميم حتى النشر.",
        descriptionEn:
          "Delivered sites and stores for clients across Saudi Arabia and the Gulf, from design through deployment.",
        order: 4,
      },
    ],
  });

  // -- Education ------------------------------------------------------------

  await db.education.createMany({
    data: [
      {
        type: "DEGREE",
        schoolAr: "الجامعة (عيّنة)",
        schoolEn: "University (sample)",
        degreeAr: "بكالوريوس",
        degreeEn: "Bachelor's degree",
        fieldAr: "علوم الحاسب",
        fieldEn: "Computer Science",
        startDate: new Date("2013-09-01"),
        endDate: new Date("2017-06-30"),
        order: 1,
      },
      {
        type: "CERTIFICATE",
        schoolAr: "جهة مانحة للشهادات (عيّنة)",
        schoolEn: "A certification body (sample)",
        degreeAr: "شهادة احترافية في الحوسبة السحابية",
        degreeEn: "Cloud developer certification",
        startDate: new Date("2022-04-01"),
        endDate: new Date("2022-04-30"),
        order: 2,
      },
      {
        type: "CERTIFICATE",
        schoolAr: "منصة تعليمية (عيّنة)",
        schoolEn: "A learning platform (sample)",
        degreeAr: "شهادة تطوير الواجهات الأمامية",
        degreeEn: "Front-end development certificate",
        startDate: new Date("2021-01-01"),
        endDate: new Date("2021-05-31"),
        order: 3,
      },
    ],
  });

  // -- Blog -----------------------------------------------------------------

  await db.post.createMany({
    data: [
      {
        slug: "rtl-that-actually-works",
        titleAr: "دعم RTL الذي يعمل فعلاً",
        titleEn: "RTL that actually works",
        excerptAr:
          "لماذا تفشل معظم محاولات تعريب الواجهات، وكيف تتجنب ذلك من اليوم الأول.",
        excerptEn:
          "Why most RTL retrofits fail, and how to avoid that from day one.",
        contentAr:
          "أغلب المشاريع تضيف دعم العربية في النهاية، فتتحول كل `margin-left` إلى استثناء. الحل ليس في القلب اليدوي بل في استخدام الخصائص المنطقية منذ أول سطر: `margin-inline-start` بدل `margin-left`، و`text-start` بدل `text-left`. عندها يصبح تبديل الاتجاه سطراً واحداً على عنصر `html`.",
        contentEn:
          "Most projects bolt Arabic on at the end, turning every `margin-left` into an exception. The fix is not manual mirroring but logical properties from the first line: `margin-inline-start` instead of `margin-left`, `text-start` instead of `text-left`. Flipping direction then becomes a single attribute on `html`.",
        tags: ["RTL", "CSS", "i18n"],
        readTimeMinutes: 6,
        publishedAt: new Date("2026-07-14"),
        views: 1284,
        isFeatured: true,
        order: 1,
      },
      {
        slug: "one-table-to-rule-the-dashboard",
        titleAr: "جدول واحد يحكم الداشبورد",
        titleEn: "One table to rule the dashboard",
        excerptAr: "كيف اختصرت عشرين صفحة إدارة إلى تعريف أعمدة فقط.",
        excerptEn:
          "How twenty admin pages collapsed into nothing but column definitions.",
        contentAr:
          "الخطأ الشائع هو بناء جدول لكل وحدة. البديل: مكوّن جدول واحد generic يستقبل تعريف الأعمدة والفلاتر والإجراءات كـ props. كل وحدة جديدة تصبح ملف أعمدة من ثلاثين سطراً، والصيانة تحدث في مكان واحد.",
        contentEn:
          "The common mistake is a table per module. The alternative: one generic table that takes columns, filters and actions as props. Each new module becomes a thirty-line column file, and maintenance happens in exactly one place.",
        tags: ["React", "TanStack Table", "Architecture"],
        readTimeMinutes: 8,
        publishedAt: new Date("2026-08-22"),
        views: 903,
        order: 2,
      },
      {
        slug: "shipping-on-coolify",
        titleAr: "النشر على Coolify",
        titleEn: "Shipping on Coolify",
        excerptAr: "استضافة ذاتية بتكلفة خادم واحد، بدون التخلي عن راحة النشر.",
        excerptEn:
          "Self-hosting on one server without giving up deployment comfort.",
        contentAr: "مسودة قيد الكتابة.",
        contentEn: "Draft in progress.",
        tags: ["DevOps", "Docker", "Coolify"],
        readTimeMinutes: 5,
        publishedAt: null,
        order: 3,
      },
    ],
  });

  // -- Inbox ----------------------------------------------------------------

  await db.contactMessage.createMany({
    data: [
      {
        name: "سارة المالكي",
        email: "sara@example.com",
        subject: "استفسار عن مشروع متجر",
        message:
          "السلام عليكم، لدينا متجر قائم ونحتاج إعادة بناء الواجهة. هل لديك وقت متاح؟",
        isRead: false,
      },
      {
        name: "Omar Nasser",
        email: "omar@example.com",
        subject: "Design system consultation",
        message:
          "We are starting a new product and want the design system right from the start.",
        isRead: false,
      },
      {
        name: "Layla Hassan",
        email: "layla@example.com",
        subject: "Speaking invitation",
        message:
          "Would you be interested in a talk about RTL engineering at our meetup?",
        isRead: true,
      },
    ],
  });

  const counts = {
    projects: await db.project.count(),
    categories: await db.projectCategory.count(),
    skills: await db.skill.count(),
    skillGroups: await db.skillGroup.count(),
    experiences: await db.experience.count(),
    education: await db.education.count(),
    posts: await db.post.count(),
    messages: await db.contactMessage.count(),
  };

  console.table(counts);
  console.log("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
