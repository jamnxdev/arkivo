import { getCurrentUser } from "@/lib/auth";
import { getCachedValue, setCachedValue } from "@/lib/cache/user-analytics-cache";
import { getSummary } from "@/lib/db/queries/analytics";
import { setRlsUserContext } from "@/lib/db/rls";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  await setRlsUserContext(user.id);
  const cached = getCachedValue<Awaited<ReturnType<typeof getSummary>>>(
    user.id,
    "summary",
  );
  if (cached) {
    return Response.json({ success: true, data: cached });
  }

  const data = await getSummary(user.id);
  setCachedValue(user.id, "summary", data);

  return Response.json({ success: true, data });
}
