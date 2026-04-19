import { getCurrentUser } from "@/lib/auth";
import { getTimeSeries } from "@/lib/db/queries/analytics";
import { setRlsUserContext } from "@/lib/db/rls";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, message: "Unauthorized" });
  }

  await setRlsUserContext(user.id);
  const data = await getTimeSeries(user.id);

  return Response.json({ success: true, data });
}
