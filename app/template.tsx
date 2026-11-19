import { headers } from "next/headers";
import { recordPageview } from "@/lib/queries";

export default async function Template({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const purpose = headerList.get("purpose") || headerList.get("sec-purpose");
  const prefetch = headerList.get("next-router-prefetch");
  if (purpose !== "prefetch" && prefetch !== "1") {
    const path = headerList.get("x-pathname") || "/";
    await recordPageview(path);
  }
  return children;
}
