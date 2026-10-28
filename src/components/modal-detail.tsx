import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import type { Vehicle } from "../types/response";
import { Clock, XIcon } from "lucide-react";
import dayjs from "dayjs";
import Status from "./status";

const VehicleMap = ({ latitude, longitude }: { latitude: number | undefined; longitude: number | undefined }) => {
  let mapUrl: string;
  if (latitude && longitude) {
    mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  } else {
    mapUrl = `https://maps.google.com/maps?z=15&output=embed`;
  }

  return <iframe title="Lokasi Kendaraan" src={mapUrl} width="100%" height="400" style={{ border: 0, borderRadius: 8 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />;
};

export default function ModalDetail({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: Vehicle | null }) {
  const viewField = [
    { title: "RUTE", value: data?.relationships.route.data.id },
    { title: "TRIP", value: data?.relationships.trip.data.id },
    { title: "KETERSEDIAN KURSI", value: data?.attributes.occupancy_status === "MANY_SEATS_AVAILABLE" ? "Banyak kursi tersedia" : data?.attributes.occupancy_status === "FEW_SEATS_AVAILABLE" ? "Sedikit kursi tersedia" : "-" },
    { title: "PEMBERENTIAN KE", value: data?.attributes.current_stop_sequence },
    { title: "LATITUDE", value: data?.attributes.latitude },
    { title: "LONGITUDE", value: data?.attributes.longitude },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} center showCloseIcon={false}>
      <div className="px-4 py-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <p className="text-primary font-bold text-xs">DETAIL KENDARAAN</p>
            <div className="flex gap-2 items-end">
              <p className="text-xl text-text-title">{data?.attributes.label}</p>
              <p className="text-xs text-text-body">{data?.id}</p>
            </div>
          </div>
          <XIcon className="size-5 cursor-pointer" onClick={onClose} />
        </div>

        <VehicleMap latitude={data?.attributes.latitude} longitude={data?.attributes.longitude} />

        <div className="flex justify-between">
          <Status status={data?.attributes.current_status as string} />
          <div className="flex gap-1 items-center text-text-body">
            <Clock className="size-4" />
            <p className="text-xs">Diperbarui: {dayjs(data?.attributes?.updated_at).format("DD-MM-YYYY HH:mm:ss")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {viewField.map((item) => (
            <div className="flex flex-col gap-1" key={item.title}>
              <p className="text-xs text-text-body">{item.title}</p>
              <p className="text-text-title text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
