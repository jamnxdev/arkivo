import { getCurrentUser } from "@/lib/auth";
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
  const data = await getCategoryBreakdown(user.id);

  return Response.json({ success: true, data });
}
