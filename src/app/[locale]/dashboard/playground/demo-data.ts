export type DemoRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  category: string;
  tags: string[];
  year: number;
  views: number;
  isVisible: boolean;
  isFeatured: boolean;
  order: number;
};

const TITLES: [string, string][] = [
  ["منصة حجوزات سفر", "Travel booking platform"],
  ["لوحة تحكم موحّدة", "Unified admin console"],
  ["نظام تصميم مشترك", "Shared design system"],
  ["واجهة متجر إلكتروني", "Commerce storefront"],
  ["بوابة تعليمية", "Learning portal"],
  ["تطبيق متابعة اللياقة", "Fitness tracker"],
  ["أداة تحليل النصوص", "Text analysis tool"],
  ["منصة حجز عيادات", "Clinic booking platform"],
  ["لوحة مؤشرات مبيعات", "Sales dashboard"],
  ["موقع مجلة رقمية", "Digital magazine"],
  ["نظام تذاكر دعم", "Support ticketing"],
  ["تطبيق إدارة مهام", "Task manager"],
];

const STATUSES: DemoRow["status"][] = [
  "COMPLETED",
  "IN_PROGRESS",
  "DRAFT",
  "ARCHIVED",
];
const CATEGORIES = ["web-apps", "ecommerce", "dashboards", "design-systems"];
const TAG_POOL = [
  "Next.js",
  "TypeScript",
  "Prisma",
  "Tailwind",
  "RTL",
  "Docker",
];

/** Deterministic rows — the demo must look identical on the server and client. */
export const DEMO_ROWS: DemoRow[] = Array.from({ length: 48 }, (_, index) => {
  const [titleAr, titleEn] = TITLES[index % TITLES.length] ?? ["", ""];
  const suffix = Math.floor(index / TITLES.length) + 1;

  return {
    id: `demo-${index + 1}`,
    titleAr: suffix > 1 ? `${titleAr} ${suffix}` : titleAr,
    titleEn: suffix > 1 ? `${titleEn} ${suffix}` : titleEn,
    slug: `demo-project-${index + 1}`,
    status: STATUSES[index % STATUSES.length] ?? "COMPLETED",
    category: CATEGORIES[index % CATEGORIES.length] ?? "web-apps",
    tags: TAG_POOL.slice(index % 3, (index % 3) + 2),
    year: 2021 + (index % 6),
    views: (index * 137) % 4200,
    isVisible: index % 5 !== 0,
    isFeatured: index % 7 === 0,
    order: index + 1,
  };
});
