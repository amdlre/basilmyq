import { MessagesProvider } from "@/components/shared/messages-provider";
import { PUBLIC_NAMESPACES } from "@/i18n/namespaces";
import { resolveLocale } from "@/i18n/resolve-locale";

/** No navbar or footer here — the login screen stands alone. */
export default async function AuthLayout(props: LayoutProps<"/[locale]">) {
  await resolveLocale(props.params);

  return (
    <MessagesProvider namespaces={[...PUBLIC_NAMESPACES, "Login"]}>
      {props.children}
    </MessagesProvider>
  );
}
