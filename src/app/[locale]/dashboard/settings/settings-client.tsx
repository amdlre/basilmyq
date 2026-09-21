"use client";

import { useTranslations } from "next-intl";

import {
  DateField,
  FileField,
  ImageField,
  RichTextField,
  SelectField,
  SocialLinksField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { AnimatedTabs } from "@/components/shared/animated-tabs";
import { SettingsForm } from "@/components/shared/settings-form";
import {
  aboutSectionSchema,
  heroSectionSchema,
  siteSettingSchema,
  type AboutSectionInput,
  type HeroSectionInput,
  type SiteSettingInput,
} from "@/lib/validations/content";
import {
  saveAboutSection,
  saveHeroSection,
  saveSiteSettings,
} from "@/server/actions/settings";
import type {
  HeroCardRow,
  ProjectCategoryRow,
  SkillGroupRow,
  TagRow,
} from "@/server/queries/dashboard";

import { HeroCards } from "./hero-cards";
import { LookupLists } from "./lookup-lists";

type Props = {
  settings: SiteSettingInput;
  hero: HeroSectionInput;
  about: AboutSectionInput;
  cvDownloadCount: number;
  heroCards: HeroCardRow[];
  lookups: {
    tags: TagRow[];
    categories: ProjectCategoryRow[];
    groups: SkillGroupRow[];
  };
};

export function SettingsClient({
  settings,
  hero,
  about,
  cvDownloadCount,
  heroCards,
  lookups,
}: Props) {
  const t = useTranslations("Settings");

  return (
    <AnimatedTabs
      sticky
      tabs={[
        // 1 — General
        {
          value: "general",
          label: t("tabs.general"),
          content: (
            <SettingsForm
              schema={siteSettingSchema}
              defaultValues={settings}
              action={saveSiteSettings}
            >
              <TextField name="siteNameAr" label={t("general.siteNameAr")} />
              <TextField
                name="siteNameEn"
                label={t("general.siteNameEn")}
                dir="ltr"
              />
              <TextField name="taglineAr" label={t("general.taglineAr")} />
              <TextField
                name="taglineEn"
                label={t("general.taglineEn")}
                dir="ltr"
              />
              <TextField
                name="descriptionAr"
                label={t("general.descriptionAr")}
                multiline
              />
              <TextField
                name="descriptionEn"
                label={t("general.descriptionEn")}
                multiline
              />
              <ImageField
                compact
                name="logoUrlAr"
                label={t("general.logoAr")}
              />
              <ImageField
                compact
                name="logoUrlEn"
                label={t("general.logoEn")}
              />
              <TextField
                name="faviconUrl"
                label={t("general.favicon")}
                dir="ltr"
              />
              <ImageField
                compact
                name="ogImageUrl"
                label={t("general.ogImage")}
              />
            </SettingsForm>
          ),
        },

        // 2 — Content: the hero and about copy the public site renders
        {
          value: "content",
          label: t("tabs.content"),
          content: (
            <div className="space-y-6">
              <SettingsForm
                schema={heroSectionSchema}
                defaultValues={hero}
                action={saveHeroSection}
              >
                <p className="font-heading font-semibold">{t("hero.title")}</p>
                <TextField name="titleAr" label={t("hero.titleAr")} />
                <TextField name="titleEn" label={t("hero.titleEn")} dir="ltr" />
                <TextField
                  name="subtitleAr"
                  label={t("hero.subtitleAr")}
                  multiline
                />
                <TextField
                  name="subtitleEn"
                  label={t("hero.subtitleEn")}
                  multiline
                />
                <TextField
                  name="highlightAr"
                  label={t("hero.highlightAr")}
                  description={t("hero.highlightHint")}
                />
                <TextField
                  name="highlightEn"
                  label={t("hero.highlightEn")}
                  dir="ltr"
                />
                <DateField
                  name="careerStartDate"
                  label={t("hero.careerStart")}
                  description={t("hero.careerStartHint")}
                />
                <TextField name="badgeAr" label={t("hero.badgeAr")} />
                <TextField name="badgeEn" label={t("hero.badgeEn")} dir="ltr" />
                <TextField
                  name="primaryCtaLabelAr"
                  label={t("hero.primaryLabelAr")}
                />
                <TextField
                  name="primaryCtaLabelEn"
                  label={t("hero.primaryLabelEn")}
                  dir="ltr"
                />
                <TextField
                  name="primaryCtaUrl"
                  label={t("hero.primaryUrl")}
                  dir="ltr"
                />
                <TextField
                  name="secondaryCtaLabelAr"
                  label={t("hero.secondaryLabelAr")}
                />
                <TextField
                  name="secondaryCtaLabelEn"
                  label={t("hero.secondaryLabelEn")}
                  dir="ltr"
                />
                <TextField
                  name="secondaryCtaUrl"
                  label={t("hero.secondaryUrl")}
                  dir="ltr"
                />
                <ImageField compact name="imageUrl" label={t("hero.image")} />
                <SwitchField name="isAvailable" label={t("hero.isAvailable")} />
                <TextField
                  name="availabilityTextAr"
                  label={t("hero.availabilityAr")}
                />
                <TextField
                  name="availabilityTextEn"
                  label={t("hero.availabilityEn")}
                  dir="ltr"
                />
              </SettingsForm>

              <HeroCards rows={heroCards} />

              <SettingsForm
                schema={aboutSectionSchema}
                defaultValues={about}
                action={saveAboutSection}
              >
                <p className="font-heading font-semibold">{t("about.title")}</p>
                <TextField name="titleAr" label={t("about.titleAr")} />
                <TextField
                  name="titleEn"
                  label={t("about.titleEn")}
                  dir="ltr"
                />
                <RichTextField name="bioAr" label={t("about.bioAr")} rows={8} />
                <RichTextField name="bioEn" label={t("about.bioEn")} rows={8} />
                <ImageField compact name="imageUrl" label={t("about.image")} />
                <TextField
                  name="clientsCount"
                  label={t("about.clients")}
                  type="number"
                  dir="ltr"
                />
              </SettingsForm>
            </div>
          ),
        },

        // 3 — Contact
        {
          value: "contact",
          label: t("tabs.contact"),
          content: (
            <SettingsForm
              schema={siteSettingSchema}
              defaultValues={settings}
              action={saveSiteSettings}
            >
              <TextField
                name="email"
                label={t("contact.email")}
                type="email"
                dir="ltr"
              />
              <TextField name="phone" label={t("contact.phone")} dir="ltr" />
              <TextField name="cityAr" label={t("contact.cityAr")} />
              <TextField name="cityEn" label={t("contact.cityEn")} dir="ltr" />
              <SocialLinksField
                name="socialLinks"
                label={t("social.title")}
                description={t("social.hint")}
              />
            </SettingsForm>
          ),
        },

        // 4 — CV
        {
          value: "cv",
          label: t("tabs.cv"),
          content: (
            <SettingsForm
              schema={siteSettingSchema}
              defaultValues={settings}
              action={saveSiteSettings}
            >
              <FileField
                name="cvUrl"
                label={t("cv.file")}
                description={t("cv.hint")}
              />
              <p className="text-sm text-muted-foreground">
                {t("cv.downloads")}:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {cvDownloadCount}
                </span>
              </p>
            </SettingsForm>
          ),
        },

        // 5 — SEO
        {
          value: "seo",
          label: t("tabs.seo"),
          content: (
            <SettingsForm
              schema={siteSettingSchema}
              defaultValues={settings}
              action={saveSiteSettings}
            >
              <TextField
                name="seoKeywordsAr"
                label={t("seo.keywordsAr")}
                multiline
              />
              <TextField
                name="seoKeywordsEn"
                label={t("seo.keywordsEn")}
                multiline
              />
              <TextField
                name="googleVerification"
                label={t("seo.googleVerification")}
                dir="ltr"
              />
              <TextField
                name="analyticsId"
                label={t("seo.analyticsId")}
                dir="ltr"
              />
            </SettingsForm>
          ),
        },

        // Lookup lists: values the other forms pick from
        {
          value: "lookups",
          label: t("tabs.lookups"),
          content: <LookupLists {...lookups} />,
        },

        // 6 — Advanced
        {
          value: "advanced",
          label: t("tabs.advanced"),
          content: (
            <SettingsForm
              schema={siteSettingSchema}
              defaultValues={settings}
              action={saveSiteSettings}
            >
              <SwitchField
                name="maintenanceMode"
                label={t("advanced.maintenance")}
                description={t("advanced.maintenanceHint")}
              />
              <SelectField
                name="accentForeground"
                label={t("advanced.accentForeground")}
                description={t("advanced.accentForegroundHint")}
                options={[
                  { value: "auto", label: t("advanced.accentAuto") },
                  { value: "light", label: t("advanced.accentLight") },
                  { value: "dark", label: t("advanced.accentDark") },
                ]}
              />
              <TextField
                name="accentColor"
                label={t("advanced.accent")}
                dir="ltr"
                description={t("advanced.accentHint")}
              />
              <p className="pt-2 font-heading font-semibold">
                {t("advanced.sections")}
              </p>
              <SwitchField
                name="showProjects"
                label={t("advanced.showProjects")}
              />
              <SwitchField name="showSkills" label={t("advanced.showSkills")} />
              <SwitchField
                name="showExperience"
                label={t("advanced.showExperience")}
              />
              <SwitchField
                name="showTestimonials"
                label={t("advanced.showTestimonials")}
              />
              <SwitchField name="showBlog" label={t("advanced.showBlog")} />
            </SettingsForm>
          ),
        },
      ]}
    />
  );
}
