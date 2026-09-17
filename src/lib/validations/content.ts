import { z } from "zod";

/**
 * One file, every content schema. Each is the single source of truth for both
 * the form in the dashboard and the Server Action that persists it (rule 6).
 */

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

const optionalUrl = z
  .union([z.url(), z.literal("")])
  .transform((value) => (value ? value : null))
  .nullable();

/** Shared by every content model — this is what keeps the dashboard uniform. */
const common = {
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
  order: z.number().int().min(0),
};

const slug = z
  .string()
  .min(2)
  .regex(/^[\p{L}\p{N}-]+$/u, "Slug may contain letters, numbers and dashes.");

export const projectSchema = z.object({
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  slug,
  summaryAr: z.string().min(10),
  summaryEn: z.string().min(10),
  contentAr: z.string().min(10),
  contentEn: z.string().min(10),
  coverUrl: optionalText,
  gallery: z.array(z.string()),
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]),
  categoryId: optionalText,
  tags: z.array(z.string()),
  clientAr: optionalText,
  clientEn: optionalText,
  year: z.number().int().min(1990).max(2100).nullable(),
  roleAr: optionalText,
  roleEn: optionalText,
  ...common,
});

export const projectCategorySchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  slug,
  color: z.string().min(1),
  isVisible: z.boolean(),
  order: z.number().int().min(0),
});

export const postSchema = z.object({
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  slug,
  excerptAr: z.string().min(10),
  excerptEn: z.string().min(10),
  contentAr: z.string().min(10),
  contentEn: z.string().min(10),
  coverUrl: optionalText,
  tags: z.array(z.string()),
  readTimeMinutes: z.number().int().min(1).max(120),
  publishedAt: z.date().nullable(),
  ...common,
});

export const serviceSchema = z.object({
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  icon: optionalText,
  featuresAr: z.array(z.string()),
  featuresEn: z.array(z.string()),
  price: optionalText,
  priceNote: optionalText,
  ...common,
});

export const testimonialSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  roleAr: optionalText,
  roleEn: optionalText,
  companyAr: optionalText,
  companyEn: optionalText,
  avatarUrl: optionalText,
  quoteAr: z.string().min(10),
  quoteEn: z.string().min(10),
  rating: z.number().int().min(1).max(5),
  ...common,
});

export const experienceSchema = z.object({
  companyAr: z.string().min(2),
  companyEn: z.string().min(2),
  roleAr: z.string().min(2),
  roleEn: z.string().min(2),
  locationAr: optionalText,
  locationEn: optionalText,
  startDate: z.date(),
  endDate: z.date().nullable(),
  isCurrent: z.boolean(),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  logoUrl: optionalText,
  companyUrl: optionalUrl,
  ...common,
});

export const educationSchema = z.object({
  type: z.enum(["DEGREE", "CERTIFICATE"]),
  schoolAr: z.string().min(2),
  schoolEn: z.string().min(2),
  degreeAr: z.string().min(2),
  degreeEn: z.string().min(2),
  fieldAr: optionalText,
  fieldEn: optionalText,
  startDate: z.date(),
  endDate: z.date().nullable(),
  credentialUrl: optionalUrl,
  logoUrl: optionalText,
  ...common,
});

export const skillSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  icon: optionalText,
  level: z.number().int().min(0).max(100),
  groupId: optionalText,
  ...common,
});

export const skillGroupSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  isVisible: z.boolean(),
  order: z.number().int().min(0),
});

export const mediaSchema = z.object({
  altAr: optionalText,
  altEn: optionalText,
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectCategoryInput = z.infer<typeof projectCategorySchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupSchema>;

/** Settings and the two singleton content sections. */

const socialLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  icon: z.string().min(1),
});

export const siteSettingSchema = z.object({
  siteNameAr: z.string().min(1),
  siteNameEn: z.string().min(1),
  taglineAr: z.string().min(1),
  taglineEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  logoUrlAr: optionalText,
  logoUrlEn: optionalText,
  faviconUrl: optionalText,
  ogImageUrl: optionalText,
  email: z.email(),
  phone: optionalText,
  cityAr: optionalText,
  cityEn: optionalText,
  socialLinks: z.array(socialLinkSchema),
  cvUrlAr: optionalText,
  cvUrlEn: optionalText,
  seoKeywordsAr: optionalText,
  seoKeywordsEn: optionalText,
  googleVerification: optionalText,
  analyticsId: optionalText,
  accentColor: z.string().min(1),
  maintenanceMode: z.boolean(),
  showProjects: z.boolean(),
  showSkills: z.boolean(),
  showServices: z.boolean(),
  showExperience: z.boolean(),
  showTestimonials: z.boolean(),
  showBlog: z.boolean(),
});

export const heroSectionSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  subtitleAr: z.string().min(1),
  subtitleEn: z.string().min(1),
  badgeAr: optionalText,
  badgeEn: optionalText,
  primaryCtaLabelAr: optionalText,
  primaryCtaLabelEn: optionalText,
  primaryCtaUrl: optionalText,
  secondaryCtaLabelAr: optionalText,
  secondaryCtaLabelEn: optionalText,
  secondaryCtaUrl: optionalText,
  imageUrl: optionalText,
  isAvailable: z.boolean(),
  availabilityTextAr: optionalText,
  availabilityTextEn: optionalText,
});

export const aboutSectionSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  bioAr: z.string().min(1),
  bioEn: z.string().min(1),
  imageUrl: optionalText,
  yearsExperience: z.number().int().min(0).max(80),
  projectsCount: z.number().int().min(0),
  clientsCount: z.number().int().min(0),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
export type HeroSectionInput = z.infer<typeof heroSectionSchema>;
export type AboutSectionInput = z.infer<typeof aboutSectionSchema>;
