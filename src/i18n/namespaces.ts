/**
 * Which message namespaces each area sends to the client.
 *
 * Only namespaces used by client components need to be here — anything read in
 * a Server Component is resolved on the server and never serialised.
 */
export const PUBLIC_NAMESPACES = [
  "Common",
  "Nav",
  "Footer",
  "Theme",
  "Locale",
  "Form",
  "Upload",
  "ProjectsPage",
  "BlogPage",
  "ContactPage",
  "ErrorPage",
  "Maintenance",
] as const;

export const DASHBOARD_NAMESPACES = [
  ...PUBLIC_NAMESPACES,
  "Login",
  "Dashboard",
  "DataTable",
  "Columns",
  "Crud",
  "FormSteps",
  "Settings",
  "Projects",
  "Blog",
  "Experience",
  "Education",
  "Skills",
  "Messages",
  "Media",
  "Overview",
] as const;
