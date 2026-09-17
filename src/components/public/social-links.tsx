import type { ComponentType, SVGProps } from "react";
import { GlobeIcon, MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "./brand-icons";

export type SocialLink = {
  label: string;
  url: string;
  icon: string;
};

/** Icon names stored in settings are mapped here; anything unknown gets a globe. */
const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  mail: MailIcon,
  email: MailIcon,
};

export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => {
        const Icon = ICONS[link.icon.toLowerCase()] ?? GlobeIcon;
        return (
          <li key={`${link.label}-${link.url}`}>
            <Button asChild variant="ghost" size="icon" aria-label={link.label}>
              <a href={link.url} target="_blank" rel="noopener noreferrer me">
                <Icon className="size-4" />
              </a>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
