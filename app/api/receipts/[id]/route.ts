import { getCurrentUser } from "@/lib/auth";
import { deleteReceipt, updateReceipt } from "@/lib/db/queries/receipts";
import { setRlsUserContext } from "@/lib/db/rls";
import { receiptUpdateSchema } from "@/lib/validators";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

function toReceiptDate(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PATCH(req: Request, context: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" });
    }

    await setRlsUserContext(user.id);
    const { id } = await context.params;
    const body: unknown = await req.json();
    const validated = receiptUpdateSchema.parse(body);
    const updateData = {
      ...validated,
      total:
        validated.total === undefined
          ? undefined
          : validated.total === null
            ? null
            : validated.total.toString(),
      date: toReceiptDate(validated.date),
    };

    const updated = await updateReceipt(id, updateData);

    return Response.json({ success: true, data: updated });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update receipt",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request, context: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  await setRlsUserContext(user.id);
  const { id } = await context.params;

  await deleteReceipt(id);

  return Response.json({ success: true });
}
