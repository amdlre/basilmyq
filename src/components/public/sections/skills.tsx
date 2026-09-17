import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Badge } from "@/components/ui/badge";
import type { AppLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import type { PublicSkillGroup } from "@/server/queries/public";

export function SkillsSection({
  groups,
  locale,
  title,
  description,
}: {
  groups: PublicSkillGroup[];
  locale: AppLocale;
  title: string;
  description?: string;
}) {
  const populated = groups.filter((group) => group.skills.length > 0);
  if (populated.length === 0) return null;

  return (
    <Section title={title} description={description} className="bg-muted/30">
      <div className="grid gap-8 sm:grid-cols-2">
        {populated.map((group, index) => (
          <AnimatedIn key={group.id} delay={index * 0.05} className="space-y-3">
            <h3 className="font-heading font-semibold">
              {pick(group, "name", locale)}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill.id}>
                  <Badge variant="outline" className="px-3 py-1 font-normal">
                    {pick(skill, "name", locale)}
                  </Badge>
                </li>
              ))}
            </ul>
          </AnimatedIn>
        ))}
      </div>
    </Section>
  );
}
