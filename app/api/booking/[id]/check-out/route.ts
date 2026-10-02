import { transisiBooking, idTidakValid } from "@/lib/transisi";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return idTidakValid();
  return transisiBooking(id, ["check-in"], "check-out", "check-out");
}
