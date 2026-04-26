import { getCurrentUser } from "@/lib/auth";
import { getCachedValue, setCachedValue } from "@/lib/cache/user-analytics-cache";
import { getTimeSeries } from "@/lib/db/queries/analytics";
import { setRlsUserContext } from "@/lib/db/rls";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, message: "Unauthorized" });
  }

  await setRlsUserContext(user.id);
  const cached = getCachedValue<Awaited<ReturnType<typeof getTimeSeries>>>(
    user.id,
    "timeseries",
  );
  if (cached) {
    return Response.json({ success: true, data: cached });
  }

  const data = await getTimeSeries(user.id);
  setCachedValue(user.id, "timeseries", data);

  return Response.json({ success: true, data });
}
