import {
  BriefcaseIcon,
  FileTextIcon,
  FolderKanbanIcon,
  GaugeIcon,
  ImageIcon,
  MailIcon,
  SettingsIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Literal unions, not `string`: they let `t(`dashboard.${labelKey}`)` resolve to
 * a real message key, so a missing translation is a compile error.
 */
export type NavLabelKey =
  | "overview"
  | "projects"
  | "blog"
  | "experience"
  | "skills"
  | "messages"
  | "media"
  | "settings";

export type NavGroupKey = "overview" | "content" | "profile" | "system";

export type NavItem = {
  /** Path without the locale prefix. */
  href: string;
  /** Key under the `Nav.dashboard` message namespace. */
  labelKey: NavLabelKey;
  icon: LucideIcon;
  /** Renders an unread counter, e.g. the inbox. */
  badgeKey?: "unreadMessages";
};

export type NavGroup = {
  labelKey: NavGroupKey;
  items: NavItem[];
};

/**
 * The single source of truth for dashboard navigation: the sidebar, the
 * breadcrumbs and the ⌘K palette all read this, so adding a module means
 * adding one entry here.
 */
export const DASHBOARD_NAV: NavGroup[] = [
  {
    labelKey: "overview",
    items: [{ href: "/dashboard", labelKey: "overview", icon: GaugeIcon }],
  },
  {
    labelKey: "content",
    items: [
      {
        href: "/dashboard/projects",
        labelKey: "projects",
        icon: FolderKanbanIcon,
      },
      { href: "/dashboard/blog", labelKey: "blog", icon: FileTextIcon },
    ],
  },
  {
    labelKey: "profile",
    items: [
      {
        href: "/dashboard/experience",
        labelKey: "experience",
        icon: BriefcaseIcon,
      },
      { href: "/dashboard/skills", labelKey: "skills", icon: SparklesIcon },
    ],
  },
  {
    labelKey: "system",
    items: [
      {
        href: "/dashboard/messages",
        labelKey: "messages",
        icon: MailIcon,
        badgeKey: "unreadMessages",
      },
      { href: "/dashboard/media", labelKey: "media", icon: ImageIcon },
      { href: "/dashboard/settings", labelKey: "settings", icon: SettingsIcon },
    ],
  },
];
