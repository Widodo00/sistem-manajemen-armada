export default function Status({ status }: { status: string }) {
  return (
    <div
      className={`rounded-full text-xs px-2 py-1.5 font-bold flex gap-1.5 items-center ${status === "IN_TRANSIT_TO" ? "bg-green-100 text-green-500" : status === "STOPPED_AT" ? "bg-yellow-100 text-yellow-500" : "bg-blue-100 text-blue-500"}`}
    >
      <div className={`size-1.5 rounded-full ${status === "IN_TRANSIT_TO" ? "bg-green-500" : status === "STOPPED_AT" ? "bg-yellow-500" : "bg-blue-500"}`} />
      <p>{status === "IN_TRANSIT_TO" ? "Dalam perjalanan" : status === "STOPPED_AT" ? "Berhenti" : "Akan tiba"}</p>
    </div>
  );
}
