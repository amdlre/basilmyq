# basilmyq.com — Personal Portfolio + Full CMS

## Engineering Specification & Build Prompt (for Claude Code)

> **كيف تستخدم هذا الملف:**
>
> 1. ضعه في مجلد فاضي باسم `basilmyq/` وسمّه `SPEC.md`.
> 2. شغّل Claude Code داخل المجلد واكتب:
>    `اقرأ SPEC.md كاملاً، ثم نفّذ Phase 0 فقط وتوقف للمراجعة.`
> 3. بعد مراجعة كل مرحلة، قل: `نفّذ Phase N`.
> 4. لا تسمح له بتنفيذ أكثر من مرحلة واحدة في المرة.

---

# 0. الدور والقواعد الحاكمة (اقرأها قبل أي كود)

أنت **Senior Full-Stack Engineer + Design Engineer**. تبني منتجاً إنتاجياً، لا نموذجاً أولياً.

## القواعد غير القابلة للتفاوض

1. **Zero duplication.** أي نمط UI يتكرر مرتين → يُستخرج فوراً إلى مكوّن في `src/components/shared/`. قبل كتابة أي مكوّن جديد، ابحث في `shared/` أولاً.
2. **مكوّن واحد لكل مفهوم.** جدول واحد (`DataTable`)، بطاقة إحصائية واحدة (`StatCard`)، هيكل صفحة واحد (`PageShell`)، نموذج واحد (`FormSheet`). كل صفحات الداشبورد تستهلك نفس هذه المكوّنات بـ props مختلفة فقط.
3. **TypeScript صارم.** `strict: true`, `noUncheckedIndexedAccess: true`. ممنوع `any` نهائياً. ممنوع `@ts-ignore`.
4. **Server Components افتراضياً.** `'use client'` فقط عند الحاجة لـ state/effects/event handlers، وفي أصغر مكوّن ممكن (leaf component).
5. **Server Actions لكل الطفرات (mutations).** لا API routes إلا لما يلزم فعلاً (upload, webhooks, sitemap).
6. **Zod هو مصدر الحقيقة للتحقق.** نفس الـ schema يُستخدم في الـ client form والـ server action. لا تكرار.
7. **لا نصوص ثابتة (hardcoded) في الواجهات.** كل نص إما من `next-intl` (نصوص الواجهة) أو من قاعدة البيانات (محتوى الموقع).
8. **لا ألوان ثابتة.** فقط CSS variables من نظام التصميم (`bg-background`, `text-muted-foreground`, …). ممنوع `#hex` أو `text-gray-500` في الكود.
9. **كل تعديل ناجح يظهر Toast، وكل خطأ يظهر Toast خطأ، وكل حذف يمر بـ Confirm Dialog.**
10. **بعد كل مرحلة:** شغّل `npm run typecheck && npm run lint && npm run build`. لا تنتقل للمرحلة التالية قبل أن تمر الثلاثة بنجاح.

## التقنيات المعتمدة

| الطبقة    | التقنية                                                                     |
| --------- | --------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, React 19, Server Actions)                |
| Language  | TypeScript (strict)                                                         |
| UI        | **shadcn/ui** + بلوكات وكمبوننتس من **https://shadcnstudio.com/components** |
| Styling   | Tailwind CSS v4 (`@theme inline`, بدون `tailwind.config.ts`)                |
| Icons     | `lucide-react`                                                              |
| Animation | `motion` (Framer Motion v12) — خفيفة فقط                                    |
| Database  | PostgreSQL                                                                  |
| ORM       | Prisma                                                                      |
| Tables    | TanStack Table v8                                                           |
| Forms     | React Hook Form + Zod + `@hookform/resolvers`                               |
| Auth      | JWT في httpOnly cookie — **جلسة أدمن واحدة فقط، لا تسجيل، لا مستخدمين**     |
| i18n      | `next-intl` (ar افتراضي + en، دعم RTL كامل)                                 |
| Theme     | `next-themes` (light / dark / system)                                       |
| Uploads   | UploadThing أو تخزين محلي `/public/uploads` (قرر حسب البيئة)                |
| Email     | Resend (نموذج التواصل)                                                      |
| Deploy    | Coolify (self-hosted) على `basilmyq.com`                                    |

## اتفاقية التسمية

- الملفات والمجلدات: `kebab-case`
- المكوّنات: `PascalCase`
- الدوال والمتغيرات: `camelCase`
- الثوابت: `SCREAMING_SNAKE_CASE`
- جداول Prisma: `PascalCase` مفرد (`Project`)، الحقول `camelCase`

## هيكل المجلدات الملزم

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/              # الموقع العام
│   │   │   ├── page.tsx           # الرئيسية
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/[slug]/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── layout.tsx         # Navbar + Footer عامّين
│   │   ├── (auth)/login/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Sidebar + Topbar
│   │   │   ├── page.tsx           # نظرة عامة
│   │   │   ├── projects/
│   │   │   ├── experience/
│   │   │   ├── skills/
│   │   │   ├── services/
│   │   │   ├── testimonials/
│   │   │   ├── blog/
│   │   │   ├── education/
│   │   │   ├── messages/
│   │   │   ├── media/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── api/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn primitives (مولّدة، لا تُعدّل يدوياً)
│   ├── shared/                    # ← قلب المشروع، مكوّنات معاد استخدامها
│   │   ├── data-table/
│   │   ├── page-shell.tsx
│   │   ├── stat-card.tsx
│   │   ├── stats-grid.tsx
│   │   ├── form-sheet.tsx
│   │   ├── form-fields/           # TextField, SelectField, RichTextField...
│   │   ├── confirm-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── status-badge.tsx
│   │   ├── image-upload.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── locale-toggle.tsx
│   │   └── section.tsx
│   ├── public/                    # أقسام الموقع العام
│   └── dashboard/                 # عناصر خاصة بالداشبورد
├── server/
│   ├── actions/                   # Server Actions لكل موديول
│   ├── queries/                   # دوال قراءة (cached)
│   └── db.ts                      # Prisma singleton
├── lib/
│   ├── validations/               # Zod schemas
│   ├── auth/
│   ├── utils.ts
│   ├── constants.ts
│   └── seo.ts
├── hooks/
├── types/
├── i18n/
├── messages/{ar,en}.json
└── middleware.ts
prisma/
├── schema.prisma
└── seed.ts
```

---

# Phase 0 — التأسيس والبنية

**الهدف:** مشروع يعمل، بنظام تصميم مضبوط، بدون أي منطق أعمال.

## المهام

1. **Scaffold**

   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
   ```

2. **الاعتماديات**

   ```bash
   npm i next-intl next-themes prisma @prisma/client zod react-hook-form @hookform/resolvers \
         @tanstack/react-table lucide-react motion date-fns clsx tailwind-merge \
         class-variance-authority sonner jose bcryptjs nuqs
   npm i -D @types/bcryptjs prettier prettier-plugin-tailwindcss tsx
   npx shadcn@latest init
   ```

3. **تثبيت مكوّنات shadcn المطلوبة** (كلها دفعة واحدة):

   ```
   button card input textarea label select checkbox switch badge avatar separator
   dropdown-menu dialog alert-dialog sheet tabs table tooltip popover command
   skeleton scroll-area sidebar breadcrumb form sonner calendar progress
   ```

4. **shadcn studio** — افتح `https://shadcnstudio.com/components` واختر بذوقك:
   - **Sidebar** أنيق للداشبورد (collapsible + icon mode)
   - **Stat / Metric cards** بنمط موحّد
   - **Table toolbar** مع بحث وفلاتر
   - **Hero / Bento grid** للصفحة الرئيسية
   - **Timeline** للخبرات
   - **Pricing / Services cards**
   - **Testimonial marquee**
   - انسخ البلوكات إلى `src/components/shared/` أو `src/components/public/` وأعد هيكلتها لتقبل props بدل المحتوى الثابت.

   > **قاعدة:** أي بلوك تنسخه يجب أن يخرج منه مكوّن generic واحد، لا نسخة لكل صفحة.

5. **الثيم**
   - `globals.css` بـ Tailwind v4 `@theme inline` + متغيرات light/dark.
   - باليت: خلفية شبه محايدة + لون Accent واحد جريء. خطوط: `Geist` أو `Inter` للإنجليزي + `IBM Plex Sans Arabic` للعربي عبر `next/font`.
   - `ThemeProvider` من `next-themes` + مكوّن `<ThemeToggle />` (light / dark / system) مع حفظ التفضيل.

6. **i18n + RTL**
   - `next-intl` بـ routing: `/ar` (افتراضي) و `/en`.
   - `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`.
   - استخدم دائماً logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`. **ممنوع** `ml-*`/`pl-*`/`text-left`.
   - `<LocaleToggle />` يحافظ على نفس المسار عند التبديل.

7. **الإعدادات**
   - `.env.example` بكل المتغيرات (انظر قسم Env بالأسفل).
   - `prettier` + `eslint` صارم + سكربتات `typecheck`, `lint`, `format`, `db:push`, `db:seed`, `db:studio`.
   - `src/lib/utils.ts` فيه `cn()`.
   - `AGENTS.md` يلخّص القواعد العشر أعلاه ليلتزم بها أي عمل لاحق.

**معيار الإنجاز:** صفحة `/ar` و `/en` تعمل، تبديل الثيم واللغة يعمل، الاتجاه ينقلب صحيحاً، `build` ينجح.

---

# Phase 1 — قاعدة البيانات

**الهدف:** Schema كامل + seed.

## مبدأ التصميم

كل جدول محتوى يرث نفس الحقول المشتركة — **هذا ما يجعل الداشبورد موحّداً**:

```prisma
// كل موديل محتوى يحتوي على:
id          String   @id @default(cuid())
titleAr     String
titleEn     String
// ... حقول خاصة
isVisible   Boolean  @default(true)   // إخفاء/إظهار في الموقع العام
isFeatured  Boolean  @default(false)
order       Int      @default(0)      // ترتيب يدوي
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

## الموديلات المطلوبة

| Model             | الغرض             | حقول مميزة                                                                                                               |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `SiteSetting`     | صف واحد singleton | اسم الموقع، الشعار، الوصف، أيقونة، روابط التواصل، رابط CV، ألوان، حالة الصيانة                                           |
| `HeroSection`     | singleton         | عنوان، عنوان فرعي، نص أزرار، صورة، badge                                                                                 |
| `AboutSection`    | singleton         | نبذة ar/en، صورة، إحصائيات (سنوات خبرة، مشاريع، عملاء)                                                                   |
| `Project`         | المشاريع          | slug, summary, content (MDX/HTML), cover, gallery[], liveUrl, repoUrl, status, categoryId, tags[], client, year, results |
| `ProjectCategory` | تصنيفات           | name ar/en, slug, color                                                                                                  |
| `Skill`           | المهارات          | name, icon, level, groupId                                                                                               |
| `SkillGroup`      | مجموعات المهارات  | name ar/en                                                                                                               |
| `Experience`      | الخبرة            | company, role, location, startDate, endDate, isCurrent, description, logo                                                |
| `Education`       | التعليم/الشهادات  | school, degree, field, dates, credentialUrl                                                                              |
| `Service`         | الخدمات           | title, description, icon, features[], price                                                                              |
| `Testimonial`     | آراء العملاء      | name, role, company, avatar, quote, rating                                                                               |
| `Post`            | المدونة           | slug, excerpt, content, cover, tags[], readTime, publishedAt, views                                                      |
| `ContactMessage`  | رسائل التواصل     | name, email, subject, message, isRead, isArchived, ip, userAgent                                                         |
| `Media`           | مكتبة الوسائط     | url, filename, mimeType, size, width, height, alt                                                                        |
| `ActivityLog`     | سجل العمليات      | action, entity, entityId, meta, createdAt                                                                                |

## المهام

1. `prisma/schema.prisma` بكل ما سبق + فهارس على `slug`, `isVisible`, `order`, `createdAt`.
2. `src/server/db.ts` — Prisma singleton آمن مع HMR.
3. `prisma/seed.ts` — بيانات واقعية لباسل: 6 مشاريع، 4 خبرات، 12 مهارة، 4 خدمات، 3 آراء، 3 مقالات، إعدادات الموقع.
4. `npx prisma db push && npm run db:seed`.

**معيار الإنجاز:** `prisma studio` يعرض بيانات كاملة.

---

# Phase 2 — المصادقة (أدمن واحد)

**الهدف:** دخول آمن بإيميل واحد من `.env`، بدون جدول مستخدمين.

## المهام

1. **المتغيرات:**

   ```
   ADMIN_EMAIL=basil@basilmyq.com
   ADMIN_PASSWORD_HASH=$2b$12$...     # bcrypt hash، لا كلمة مرور خام أبداً
   AUTH_SECRET=...                     # openssl rand -base64 32
   ```

   أضف سكربت `npm run hash-password` يولّد الهاش.

2. **`src/lib/auth/`**
   - `session.ts` — توقيع/تحقق JWT بـ `jose`، مدة 7 أيام.
   - `verify-credentials.ts` — يقارن الإيميل (case-insensitive) ويتحقق من الهاش بـ `bcrypt.compare`.
   - `get-session.ts` — `cache()`-wrapped لقراءة الجلسة في Server Components.
   - `require-auth.ts` — يرمي/يعيد توجيه إذا لم توجد جلسة. **يُستدعى في بداية كل Server Action إداري.**

3. **`login/page.tsx`** — بطاقة نظيفة متمركزة، RHF + Zod، رسائل خطأ عامة (لا تكشف أي الحقلين خاطئ)، rate limit بسيط (5 محاولات / 15 دقيقة بالـ IP، in-memory Map كافية).

4. **`middleware.ts`** — يجمع: توجيه اللغة + حماية `/dashboard/*` + منع الوصول لـ `/login` عند وجود جلسة. cookie: `httpOnly`, `secure`, `sameSite: 'lax'`.

**معيار الإنجاز:** `/dashboard` يحوّل للـ login بدون جلسة، والدخول بالبيانات الصحيحة يعمل.

---

# Phase 3 — محرك المكوّنات المشتركة ⭐ (أهم مرحلة)

**الهدف:** بناء الطبقة التي تجعل كل صفحات الداشبورد متطابقة الشكل وخالية من التكرار. **لا تبنِ أي صفحة CRUD قبل إنهاء هذه المرحلة.**

## 3.1 `<DataTable />` — جدول واحد لكل الموقع

`src/components/shared/data-table/` مبني على TanStack Table، generic بالكامل:

```tsx
<DataTable
  columns={projectColumns}
  data={projects}
  searchKeys={["titleAr", "titleEn"]}
  filters={[{ key: "status", options: STATUS_OPTIONS }]}
  bulkActions={[bulkDelete, bulkHide, bulkFeature]}
  exportFileName="projects"
  enableRowReorder
  storageKey="projects-table" // لحفظ تفضيلات الأعمدة
/>
```

**المزايا الإلزامية:**

- ✅ **Bulk selection** — checkbox في الهيدر والصفوف + شريط عائم يظهر عند التحديد يعرض "تم تحديد N" مع أزرار: حذف جماعي، إخفاء/إظهار جماعي، تمييز، إلغاء التحديد.
- ✅ **Column visibility** — قائمة منسدلة لإظهار/إخفاء أي عمود.
- ✅ **Column reordering** — سحب وإفلات لترتيب الأعمدة (`dnd-kit`)، مع حفظ الترتيب في `localStorage` عبر `storageKey`.
- ✅ **Column resizing** — سحب حدود العمود.
- ✅ **Row reordering** — مقبض سحب لتغيير `order` في قاعدة البيانات (عند `enableRowReorder`).
- ✅ **Sorting** متعدد الأعمدة.
- ✅ **Global search** + **faceted filters** لكل عمود قابل للفلترة.
- ✅ **Pagination** — 10/20/50/100 + الانتقال لصفحة محددة + عدّاد.
- ✅ **URL state** — البحث والفلاتر والصفحة والفرز كلها في الـ query string عبر `nuqs` (الرابط قابل للمشاركة، والتحديث لا يفقد الحالة).
- ✅ **Export** — زر تصدير يدعم **CSV / Excel (.xlsx) / JSON / PDF**، مع خيارين: "الصفحة الحالية" أو "كل البيانات"، ويصدّر الأعمدة المرئية فقط.
- ✅ **Row actions** — قائمة `⋯` لكل صف: تعديل، نسخ (duplicate)، إخفاء/إظهار (switch فوري)، عرض في الموقع، حذف.
- ✅ **Density toggle** — مريح / مضغوط.
- ✅ **Sticky header** + سكرول أفقي أنيق + عمود الإجراءات ثابت.
- ✅ **Loading skeleton** + **EmptyState** + **ErrorState**.
- ✅ **Responsive** — على الجوال يتحول لبطاقات (`DataTableCards`) بنفس الـ columns definition.

**ملفات المجلد:**

```
data-table/
├── index.tsx              # المكوّن الرئيسي
├── toolbar.tsx            # بحث + فلاتر + أعمدة + تصدير
├── bulk-bar.tsx           # الشريط العائم
├── pagination.tsx
├── column-header.tsx      # عنوان قابل للفرز
├── row-actions.tsx        # قائمة الإجراءات
├── export.ts              # منطق التصدير
├── use-table-preferences.ts
└── types.ts
```

## 3.2 `<PageShell />`

هيكل موحّد لكل صفحة داشبورد: Breadcrumb + عنوان + وصف + أزرار إجراءات + المحتوى.

```tsx
<PageShell
  title="المشاريع"
  description="إدارة معرض أعمالك"
  actions={
    <Button>
      <Plus /> مشروع جديد
    </Button>
  }
>
  {children}
</PageShell>
```

## 3.3 `<StatsGrid />` + `<StatCard />`

```tsx
<StatsGrid
  stats={[
    { label: "إجمالي المشاريع", value: 24, icon: FolderKanban, trend: +12 },
    { label: "منشورة", value: 18, icon: Eye, variant: "success" },
    { label: "مخفية", value: 6, icon: EyeOff, variant: "muted" },
    { label: "مميزة", value: 4, icon: Star, variant: "accent" },
  ]}
/>
```

بطاقة مودرن: أيقونة في حاوية ملوّنة خفيفة، رقم كبير بخط tabular، نسبة تغيّر، وspark line اختياري. **نفس المكوّن يُستخدم في كل الصفحات بدون استثناء.**

## 3.4 `<FormSheet />` + حقول موحّدة

Sheet جانبي (أو Dialog على الديسكتوب — اختر واحداً والتزم به) يستضيف كل نماذج الإنشاء/التعديل:

```tsx
<FormSheet
  schema={projectSchema}
  defaultValues={project}
  action={upsertProject}
>
  <TextField name="titleAr" label="العنوان (عربي)" />
  <TextField name="titleEn" label="Title (English)" dir="ltr" />
  <SlugField name="slug" source="titleEn" />
  <RichTextField name="contentAr" />
  <ImageField name="cover" />
  <SelectField name="categoryId" options={categories} />
  <TagsField name="tags" />
  <SwitchField name="isVisible" label="ظاهر في الموقع" />
</FormSheet>
```

كل `*Field` يلتقط `useFormContext` تلقائياً — لا تمرير `control` يدوياً، ولا تكرار `FormItem/FormLabel/FormMessage` في كل حقل.

## 3.5 بقية المشتركات

`<ConfirmDialog />` (للحذف، مع اسم العنصر) · `<EmptyState />` · `<StatusBadge />` · `<ImageUpload />` (drag & drop + معاينة + حذف) · `<Section />` (غلاف أقسام الموقع العام) · `<AnimatedIn />` (fade-up عند الظهور).

## 3.6 تخطيط الداشبورد

Sidebar من shadcn studio: شعار، مجموعات منطقية (المحتوى / الموقع / النظام)، أيقونات، حالة نشطة، قابل للطي لوضع الأيقونات، Sheet على الجوال. Topbar: breadcrumb + بحث سريع (`⌘K` Command palette) + ThemeToggle + LocaleToggle + قائمة الأدمن.

**معيار الإنجاز:** صفحة تجريبية واحدة تستخدم كل المكوّنات أعلاه ببيانات وهمية وتعمل بكامل مزايا الجدول.

---

# Phase 4 — موديولات الداشبورد

**الهدف:** كل موديول = صفحة واحدة بنفس القالب. إذا احتجت كتابة كود UI جديد لموديول، فالمشكلة في Phase 3 — ارجع وأصلحها.

## القالب الموحّد لكل موديول

```
dashboard/<module>/
├── page.tsx        # Server: يجلب البيانات + الإحصائيات
├── columns.tsx     # تعريف الأعمدة فقط
├── form.tsx        # حقول النموذج فقط
└── (actions في src/server/actions/<module>.ts)
```

`page.tsx` لا يتجاوز ~40 سطر:

```tsx
export default async function Page() {
  const [data, stats] = await Promise.all([getProjects(), getProjectStats()]);
  return (
    <PageShell title="..." actions={<CreateButton />}>
      <StatsGrid stats={stats} />
      <DataTable columns={columns} data={data} {...config} />
    </PageShell>
  );
}
```

## الموديولات ونظام الإحصائيات لكل صفحة

| الصفحة       | الإحصائيات المعروضة فوق الجدول                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Overview** | إجمالي المشاريع · الزيارات · الرسائل غير المقروءة · المقالات · مخطط زيارات آخر 30 يوم · آخر 5 رسائل · آخر النشاطات |
| **المشاريع** | الإجمالي · منشورة · مخفية · مميزة                                                                                  |
| **الخبرات**  | عدد الوظائف · سنوات الخبرة · الوظيفة الحالية                                                                       |
| **المهارات** | الإجمالي · عدد المجموعات · المميزة                                                                                 |
| **الخدمات**  | الإجمالي · نشطة · مخفية                                                                                            |
| **الآراء**   | الإجمالي · متوسط التقييم · منشورة                                                                                  |
| **المدونة**  | الإجمالي · منشورة · مسودات · إجمالي المشاهدات                                                                      |
| **التعليم**  | الشهادات · المؤهلات                                                                                                |
| **الرسائل**  | الإجمالي · غير مقروءة · اليوم · مؤرشفة                                                                             |
| **الوسائط**  | عدد الملفات · المساحة المستخدمة · صور/ملفات                                                                        |

**الرسائل** حالة خاصة: قائمة/تفاصيل، تعليم كمقروء تلقائياً عند الفتح، أرشفة، حذف، رد عبر `mailto:`، ومؤشر عدد غير المقروء في الـ Sidebar.

## صفحة الإعدادات (تبويبات)

1. **عام** — اسم الموقع، الشعار (ar/en)، الوصف، أيقونة، صورة OG.
2. **المحتوى** — تحرير نصوص Hero و About مباشرة (ar/en).
3. **التواصل** — الإيميل الظاهر، الجوال، المدينة، روابط التواصل الاجتماعي (قائمة ديناميكية).
4. **السيرة الذاتية** — رفع ملف CV (ar/en)، عدّاد مرات التحميل.
5. **SEO** — كلمات مفتاحية، Google verification، معرّف التحليلات.
6. **متقدّم** — وضع الصيانة، لون الـ accent، تفعيل/تعطيل أقسام الموقع العام (switches).

**كل نص يظهر في الموقع العام يجب أن يكون قابلاً للتحرير من هنا.** بعد كل حفظ: `revalidatePath()` للصفحات المتأثرة.

**معيار الإنجاز:** CRUD كامل يعمل لكل موديول، مع Toast وConfirm وتحديث فوري.

---

# Phase 5 — الموقع العام

**الهدف:** واجهة ديناميكية 100% من قاعدة البيانات، بتصميم يستحق أن يُعرض.

## الصفحات والأقسام

**الرئيسية:** Hero (اسم + جملة تموضع + زرين + مؤشر توفّر) → شريط شعارات/تقنيات → About مختصر بإحصائيات → مشاريع مميزة (Bento grid) → المهارات مجمّعة → الخدمات → الخبرة (Timeline) → الآراء (marquee) → آخر المقالات → CTA تواصل.

**`/projects`** — شبكة + فلترة بالتصنيف والوسم + بحث (URL state).
**`/projects/[slug]`** — غلاف كبير، ميتا (العميل، السنة، الدور، التقنيات)، محتوى منسّق، معرض صور مع lightbox، النتائج بأرقام، روابط Live/Repo، "المشروع التالي".
**`/blog`** و **`/blog/[slug]`** — شريط تقدّم القراءة، جدول محتويات، وقت القراءة، مشاركة، عدّاد مشاهدات.
**`/about`** — القصة الكاملة، الخبرة، التعليم، الشهادات، زر تحميل CV.
**`/contact`** — نموذج (RHF + Zod + Server Action + Resend + honeypot + rate limit) + بطاقة إيميل مع **زر نسخ بضغطة واحدة** + روابط التواصل.

## عناصر عامة إلزامية

- Navbar شفاف يتحوّل عند السكرول + قائمة جوال (Sheet) + ThemeToggle + LocaleToggle + زر CV.
- Footer: روابط، تواصل، حقوق ديناميكية.
- **زر تحميل السيرة الذاتية** بارز — يفتح PDF بتبويب جديد ويسجّل التحميل.
- صفحة 404 و `error.tsx` مصمّمتان.
- أنيميشن دخول خفيف (`AnimatedIn`) — يحترم `prefers-reduced-motion`.
- كل قسم يختفي تلقائياً إذا كان معطّلاً في الإعدادات أو بلا بيانات.

**معيار الإنجاز:** تعديل أي نص من الداشبورد ينعكس فوراً في الموقع العام.

---

# Phase 6 — SEO والأداء وإمكانية الوصول

1. `generateMetadata` لكل صفحة من قاعدة البيانات + hreflang لـ ar/en + canonical.
2. صور OG ديناميكية عبر `next/og` (عنوان المشروع/المقال).
3. `sitemap.ts` ديناميكي (يشمل المشاريع والمقالات المنشورة فقط) + `robots.ts`.
4. JSON-LD: `Person` في الرئيسية، `BlogPosting` للمقالات، `CreativeWork` للمشاريع.
5. صور: `next/image` + AVIF/WebP + `sizes` صحيحة + `priority` للـ hero + blur placeholder.
6. أداء: Lighthouse **≥ 95** في الأربعة. راجع `next build` وحجم الـ bundle.
7. إمكانية الوصول: تباين AA، تنقّل كامل بالكيبورد، `focus-visible` واضح، `aria-label` لكل زر أيقونة، `alt` لكل صورة، skip link.
8. Caching: `unstable_cache` للاستعلامات العامة + `revalidateTag` عند التعديل.

---

# Phase 7 — النشر على Coolify

1. `Dockerfile` متعدد المراحل مع `output: 'standalone'` في `next.config.ts`.
2. `docker-compose.yml`: خدمة `web` + خدمة `postgres` مع volume دائم.
3. `.dockerignore`.
4. Health check على `/api/health`.
5. `migrate deploy` عند الإقلاع (لا `db push` في الإنتاج).
6. الدومين `basilmyq.com` + `www` → redirect، SSL تلقائي من Coolify.
7. سكربت نسخ احتياطي يومي لقاعدة البيانات.
8. `DEPLOYMENT.md` فيه: المتغيرات المطلوبة، خطوات النشر، استعادة النسخة الاحتياطية.

---

# متغيرات البيئة (`.env.example`)

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/basilmyq"

# Auth — أدمن واحد فقط
ADMIN_EMAIL="basil@basilmyq.com"
ADMIN_PASSWORD_HASH=""              # npm run hash-password
AUTH_SECRET=""                      # openssl rand -base64 32

# Site
NEXT_PUBLIC_SITE_URL="https://basilmyq.com"
NEXT_PUBLIC_DEFAULT_LOCALE="ar"

# Email
RESEND_API_KEY=""
CONTACT_TO_EMAIL="basil@basilmyq.com"

# Uploads
UPLOADTHING_TOKEN=""
```

---

# قائمة التحقق النهائية

- [ ] `npm run typecheck` نظيف · `npm run lint` نظيف · `npm run build` ينجح
- [ ] لا يوجد `any` ولا `console.log` ولا `TODO` متروك
- [ ] لا يوجد لون ثابت ولا نص ثابت في الواجهات
- [ ] الجدول واحد مستخدم في كل الصفحات — لا نسخة ثانية منه
- [ ] RTL مضبوط في كل صفحة (افحص `/ar` و `/en`)
- [ ] الوضع الداكن مضبوط في كل مكوّن
- [ ] كل Server Action إداري يبدأ بـ `requireAuth()`
- [ ] Lighthouse ≥ 95 × 4
- [ ] تجربة كاملة على جوال حقيقي
- [ ] `README.md` + `DEPLOYMENT.md` + `AGENTS.md` مكتوبة

---

## الأمر الذي تبدأ به مع Claude Code

```
اقرأ SPEC.md بالكامل. لخّص لي فهمك في 10 أسطر، ثم نفّذ Phase 0 فقط.
التزم بالقواعد العشر الحاكمة حرفياً. لا تنتقل لأي مرحلة تالية قبل إذني.
```
