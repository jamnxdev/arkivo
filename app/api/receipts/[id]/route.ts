import { getCurrentUser } from "@/lib/auth";
import { deleteReceipt, updateReceipt } from "@/lib/db/queries/receipts";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const { id } = await context.params;
  const body = await req.json();

  const updated = await updateReceipt(id, body);

  return Response.json({ success: true, data: updated });
}

export async function DELETE(req: Request, context: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const { id } = await context.params;

  await deleteReceipt(id);

  return Response.json({ success: true });
}
