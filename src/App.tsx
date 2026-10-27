import { useEffect, useMemo, useState } from "react";
import MasterAPi from "./services/master-api";
import { ToastContainer, Slide, toast } from "react-toastify";
import Loading from "./components/loading";
import dayjs from "dayjs";
import { BusFront, ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "./types/response";
import type { OptionInterface } from "./types/general";

interface VehicleData {
  data: Vehicle[];
  page: number;
  page_size: number;
  total: number;
  total_page: number;
}

interface Route {
  id: number;
  attributes: {
    long_name: string;
  };
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [optionRoute, setOptionRoute] = useState<OptionInterface[]>([]);
  const [optionTrip, setOptionTrip] = useState<OptionInterface[]>([]);
  const optionPageSize = [10, 20, 50];
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    data: [],
    page: 1,
    page_size: 10,
    total: 0,
    total_page: 1,
  });

  const optionPage = useMemo(() => {
    if (vehicleData.total_page <= 3) {
      return Array.from({ length: vehicleData.total_page }, (_, i) => i + 1);
    }

    if (vehicleData.page === 1) {
      return [1, 2, vehicleData.total_page];
    }

    if (vehicleData.page === vehicleData.total_page) {
      return [1, vehicleData.total_page - 1, vehicleData.total_page];
    }

    return [1, vehicleData.page, vehicleData.total_page];
  }, [vehicleData.page, vehicleData.total_page]);

  const fetchData = (page = 1, page_size = 10, isRaw = false) => {
    return MasterAPi.getVehicles(`?page[offset]=${isRaw ? page : page * page_size - page_size}&page[limit]=${page_size}`);
  };

  const fetchDataRoute = (page = 1, page_size = 10) => {
    return MasterAPi.getRoute(`?page[offset]=${page * page_size - page_size}&page[limit]=${page_size}`);
  };

  const statusComponent = (status: string) => {
    return (
      <div
        className={`rounded-full text-xs px-2 py-1.5 font-bold flex gap-1.5 items-center ${status === "IN_TRANSIT_TO" ? "bg-green-100 text-green-500" : status === "STOPPED_AT" ? "bg-yellow-100 text-yellow-500" : "bg-blue-100 text-blue-500"}`}
      >
        <div className={`size-1.5 rounded-full ${status === "IN_TRANSIT_TO" ? "bg-green-500" : status === "STOPPED_AT" ? "bg-yellow-500" : "bg-blue-500"}`} />
        <p>{status === "IN_TRANSIT_TO" ? "Dalam perjalanan" : status === "STOPPED_AT" ? "Berhenti" : "Akan tiba"}</p>
      </div>
    );
  };

  const handleOnChangeSize = (value: number) => {
    setLoading(true);
    fetchData(1, value)
      .then((res) => {
        const url = new URL(res.links.last);
        const offset = Number(url.searchParams.get("page[offset]"));
        const totalPage = offset / value + 1;
        setVehicleData((prev) => ({ ...prev, data: res.data, page_size: value, page: 1, total_page: totalPage }));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data");
        setLoading(false);
      });
  };

  const handleOnChangePage = (value: number) => {
    setLoading(true);
    fetchData(value, vehicleData.page_size)
      .then((res) => {
        if (value === vehicleData.total_page) {
          const url = new URL(res.links.last);
          const offset = Number(url.searchParams.get("page[offset]"));
          const totalPage = offset / vehicleData.page_size + 1;
          setVehicleData((prev) => ({ ...prev, data: res.data, page: value, total: offset + res.data.length, total_page: totalPage }));
        } else {
          setVehicleData((prev) => ({ ...prev, data: res.data, page: value }));
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data");
        setLoading(false);
      });
  };

  useEffect(() => {
    Promise.all([fetchData(), fetchDataRoute()])
      .then(async ([vehicles, routes]) => {
        const tempRoute: OptionInterface[] = [{ label: "Semua Rute", value: "" }];
        routes.data.forEach((item: Route) => {
          tempRoute.push({ value: item.id, label: item.attributes.long_name });
        });
        setOptionRoute(tempRoute);

        const url = new URL(vehicles.links.last);
        const offset = Number(url.searchParams.get("page[offset]"));

        const lastResponse = await fetchData(offset, 10, true);
        const totalPage = offset / 10 + 1;
        setVehicleData((prev) => ({ ...prev, data: vehicles.data, total: lastResponse.data.length + offset, total_page: totalPage }));

        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-background min-h-dvh">
      {loading && <Loading />}
      <ToastContainer theme="colored" position="top-right" autoClose={5000} transition={Slide} />

      <div className="flex bg-primary p-4 justify-between items-center md:p-6 shadow-lg sticky top-0">
        <div className="flex flex-col">
          <p className="font-bold text-sm text-white">TRANSJAKARTA</p>
          <p className="text-xs text-border">MANAJEMEN ARMADA</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="rounded-full size-2 bg-green-500" />
          <p className="text-border text-xs hidden md:block">SISTEM TERHUBUNG</p>
        </div>
      </div>

      <div className="px-4 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <p className="font-extrabold text-text-title text-3xl md:text-5xl">Pantau Kendaraan</p>
          <p className="text-sm text-text-body">Lacak posisi dan status armada kendaraan secara real-time</p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-lg text-text-title">Daftar Kendaraan</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {vehicleData.data.map((item: Vehicle) => (
              <div className="card flex-col p-4 gap-4">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="rounded-lg bg-primary">
                      <BusFront className="size-9 p-2.5 text-white" />
                    </div>
                    <p className="text-text-title">{item.attributes.label}</p>
                  </div>
                  <p>{statusComponent(item.attributes.current_status)}</p>
                </div>

                <div className="border-y border-border py-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-text-body">LATITUDE</p>
                    <p className="text-xs text-text-title">{item.attributes.latitude}</p>
                  </div>
                  <div className="flex flex-col gap-1 ps-4 border-l border-border">
                    <p className="text-xs text-text-body">LONGITUDE</p>
                    <p className="text-xs text-text-title">{item.attributes.longitude}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-text-body">Diperbarui: {dayjs(item.attributes.updated_at).format("DD-MM-YYYY HH:mm:ss")}</p>
                  <button className="text-primary p-1 font-bold text-xs cursor-pointer">Lihat detail</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card flex-col md:flex-row md:justify-between md:items-center px-4.5 py-3.5 gap-3">
            <p className="text-xs text-text-body">
              Menampilkan{" "}
              <span className="font-bold text-text-title">
                {vehicleData.page * vehicleData.page_size - vehicleData.page_size + 1}-{vehicleData.page === vehicleData.total_page ? vehicleData.total : vehicleData.page * vehicleData.page_size}
              </span>{" "}
              dari <span className="font-bold text-text-title">{vehicleData.total} kendaraan</span>
            </p>

            <div className="flex justify-between gap-7">
              <div className="flex gap-2 items-center text-xs">
                <p className="text-text-body">Baris per halaman</p>
                <select className="text-title" onChange={(evt) => handleOnChangeSize(Number(evt.target.value))}>
                  {optionPageSize.map((item: number) => (
                    <option value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1 items-center text-xs text-text-body">
                <button className="size-7 flex justify-center items-center rounded-lg" disabled={vehicleData.page === 1} onClick={() => handleOnChangePage(vehicleData.page - 1)}>
                  <ChevronLeft className={`${vehicleData.page === 1 ? "text-border" : "text-text-body"} size-5`} />
                </button>
                {optionPage.map((item: number) => (
                  <button
                    className={`size-7 flex justify-center items-center rounded-lg ${vehicleData.page === item ? "text-white bg-primary" : "text-text-body"}`}
                    disabled={vehicleData.page === item}
                    onClick={() => handleOnChangePage(item)}
                  >
                    <p>{item}</p>
                  </button>
                ))}
                <button className="size-7 flex justify-center items-center rounded-lg" disabled={vehicleData.page === vehicleData.total_page} onClick={() => handleOnChangePage(vehicleData.page + 1)}>
                  <ChevronRight className={`${vehicleData.page === vehicleData.total_page ? "text-border" : "text-text-body"} size-5`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
