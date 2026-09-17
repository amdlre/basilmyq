import { resolveLocale } from "@/i18n/resolve-locale";

/** No navbar or footer here — the login screen stands alone. */
export default async function AuthLayout(props: LayoutProps<"/[locale]">) {
  await resolveLocale(props.params);
  return props.children;
}
