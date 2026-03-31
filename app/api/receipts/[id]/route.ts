import { getCurrentUser } from "@/lib/auth";
import { deleteReceipt, updateReceipt } from "@/lib/db/queries/receipts";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const body = await req.json();

  const updated = await updateReceipt(params.id, body);

  return Response.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  await deleteReceipt(params.id);

  return Response.json({ success: true });
}
