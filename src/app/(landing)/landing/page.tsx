import { redirect } from "next/navigation";

/** Default campaign slug — create a `home` landing in admin or seed. */
export default function LandingIndex() {
  redirect("/landing/home");
}
