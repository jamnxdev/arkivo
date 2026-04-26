import { getCurrentUser } from "@/lib/auth";
import { getCachedValue, setCachedValue } from "@/lib/cache/user-analytics-cache";
import { getCategoryBreakdown } from "@/lib/db/queries/analytics";
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
  const cached = getCachedValue<Awaited<ReturnType<typeof getCategoryBreakdown>>>(
    user.id,
    "categories",
  );
  if (cached) {
    return Response.json({ success: true, data: cached });
  }

  const data = await getCategoryBreakdown(user.id);
  setCachedValue(user.id, "categories", data);

  return Response.json({ success: true, data });
}
