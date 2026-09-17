"use client";

import { useTranslations } from "next-intl";

import {
  ImageField,
  RichTextField,
  SocialLinksField,
  SwitchField,
  TextField,
} from "@/components/shared/form-fields";
import { SettingsForm } from "@/components/shared/settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Props = {
  settings: SiteSettingInput;
  hero: HeroSectionInput;
  about: AboutSectionInput;
  cvDownloadCount: number;
};

export function SettingsClient({
  settings,
  hero,
  about,
  cvDownloadCount,
}: Props) {
  const t = useTranslations("Settings");

  return (
    <Tabs defaultValue="general" className="gap-6">
      <TabsList className="flex-wrap">
        <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
        <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
        <TabsTrigger value="contact">{t("tabs.contact")}</TabsTrigger>
        <TabsTrigger value="cv">{t("tabs.cv")}</TabsTrigger>
        <TabsTrigger value="seo">{t("tabs.seo")}</TabsTrigger>
        <TabsTrigger value="advanced">{t("tabs.advanced")}</TabsTrigger>
      </TabsList>

      {/* 1 — General */}
      <TabsContent value="general">
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
          <ImageField name="logoUrlAr" label={t("general.logoAr")} />
          <ImageField name="logoUrlEn" label={t("general.logoEn")} />
          <TextField name="faviconUrl" label={t("general.favicon")} dir="ltr" />
          <ImageField name="ogImageUrl" label={t("general.ogImage")} />
        </SettingsForm>
      </TabsContent>

      {/* 2 — Content: the hero and about copy the public site renders */}
      <TabsContent value="content" className="space-y-6">
        <SettingsForm
          schema={heroSectionSchema}
          defaultValues={hero}
          action={saveHeroSection}
        >
          <p className="font-heading font-semibold">{t("hero.title")}</p>
          <TextField name="titleAr" label={t("hero.titleAr")} />
          <TextField name="titleEn" label={t("hero.titleEn")} dir="ltr" />
          <TextField name="subtitleAr" label={t("hero.subtitleAr")} multiline />
          <TextField name="subtitleEn" label={t("hero.subtitleEn")} multiline />
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
          <ImageField name="imageUrl" label={t("hero.image")} />
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

        <SettingsForm
          schema={aboutSectionSchema}
          defaultValues={about}
          action={saveAboutSection}
        >
          <p className="font-heading font-semibold">{t("about.title")}</p>
          <TextField name="titleAr" label={t("about.titleAr")} />
          <TextField name="titleEn" label={t("about.titleEn")} dir="ltr" />
          <RichTextField name="bioAr" label={t("about.bioAr")} rows={8} />
          <RichTextField name="bioEn" label={t("about.bioEn")} rows={8} />
          <ImageField name="imageUrl" label={t("about.image")} />
          <TextField
            name="yearsExperience"
            label={t("about.years")}
            type="number"
            dir="ltr"
          />
          <TextField
            name="projectsCount"
            label={t("about.projects")}
            type="number"
            dir="ltr"
          />
          <TextField
            name="clientsCount"
            label={t("about.clients")}
            type="number"
            dir="ltr"
          />
        </SettingsForm>
      </TabsContent>

      {/* 3 — Contact */}
      <TabsContent value="contact">
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
      </TabsContent>

      {/* 4 — CV */}
      <TabsContent value="cv">
        <SettingsForm
          schema={siteSettingSchema}
          defaultValues={settings}
          action={saveSiteSettings}
        >
          <TextField
            name="cvUrlAr"
            label={t("cv.ar")}
            dir="ltr"
            description={t("cv.hint")}
          />
          <TextField name="cvUrlEn" label={t("cv.en")} dir="ltr" />
          <p className="text-sm text-muted-foreground">
            {t("cv.downloads")}:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {cvDownloadCount}
            </span>
          </p>
        </SettingsForm>
      </TabsContent>

      {/* 5 — SEO */}
      <TabsContent value="seo">
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
      </TabsContent>

      {/* 6 — Advanced */}
      <TabsContent value="advanced">
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
          <TextField
            name="accentColor"
            label={t("advanced.accent")}
            dir="ltr"
            description={t("advanced.accentHint")}
          />
          <p className="pt-2 font-heading font-semibold">
            {t("advanced.sections")}
          </p>
          <SwitchField name="showProjects" label={t("advanced.showProjects")} />
          <SwitchField name="showSkills" label={t("advanced.showSkills")} />
          <SwitchField name="showServices" label={t("advanced.showServices")} />
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
      </TabsContent>
    </Tabs>
  );
}
