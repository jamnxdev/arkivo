import { getCurrentUser } from "@/lib/auth";
import { getSummary } from "@/lib/db/queries/analytics";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const data = await getSummary(user.id);

  return Response.json({ success: true, data });
}
