import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

const navigation = createNavigation(routing);

export const { Link, usePathname, useRouter, getPathname } = navigation;

/**
 * Re-exported with an explicit annotation: TypeScript only applies its
 * never-returning-call analysis to a `const` that carries a type, not to one
 * produced by destructuring. Without this, every caller would need an
 * unreachable `return` to satisfy the compiler.
 */
export const redirect: typeof navigation.redirect = navigation.redirect;
