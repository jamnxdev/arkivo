import { getCurrentUser } from "@/lib/auth";
import { getCategoryBreakdown } from "@/lib/db/queries/analytics";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const data = await getCategoryBreakdown(user.id);

  return Response.json({ success: true, data });
}
