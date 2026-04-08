import { getCurrentUser } from "@/lib/auth";
import { getTimeSeries } from "@/lib/db/queries/analytics";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, message: "Unauthorized" });
  }

  const data = await getTimeSeries(user.id);

  return Response.json({ success: true, data });
}
