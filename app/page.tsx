import { redirect } from "next/navigation";

// Until Home exists (Phase 3), everyone starts at the login page.
export default function RootPage() {
  redirect("/login");
}
