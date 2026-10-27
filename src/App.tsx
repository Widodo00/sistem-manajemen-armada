import { useEffect, useMemo, useState } from "react";
import { ToastContainer, Slide, toast } from "react-toastify";
import Loading from "./components/loading";
import dayjs from "dayjs";
import { BusFront, ChevronLeft, ChevronRight, CircleX, LineSquiggle } from "lucide-react";
import type { Vehicle } from "./types/response";
import ModalDetail from "./components/modal-detail";
import Header from "./components/header";
import MasterApi from "./services/master-api";
import Filter from "./components/filter";
import Status from "./components/status";

interface VehicleData {
  data: Vehicle[];
  page: number;
  page_size: number;
  total: number;
  total_page: number;
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<Vehicle | null>(null);
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

  const fetchData = (page = 1, page_size = 10, isRaw = false, filter: string = "") => {
    return MasterApi.getVehicles(`?page[offset]=${isRaw ? page : page * page_size - page_size}&page[limit]=${page_size}${filter}`);
  };

  const handleOnChangeSize = (value: number) => {
    setLoading(true);
    fetchData(1, value)
      .then((res) => {
        let url;
        let offset = 0;
        if (res?.links?.last) {
          url = new URL(res.links.last);
          offset = Number(url.searchParams.get("page[offset]")) || 0;
        }
        const totalPage = offset / value + 1;
        setVehicleData((prev) => ({ ...prev, data: res.data, page_size: value, page: 1, total_page: totalPage }));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data vehicle");
        setLoading(false);
      });
  };

  const handleOnChangePage = (value: number) => {
    setLoading(true);
    fetchData(value, vehicleData.page_size)
      .then((res) => {
        if (value === vehicleData.total_page) {
          let url;
          let offset = 0;
          if (res?.links?.last) {
            url = new URL(res.links.last);
            offset = Number(url.searchParams.get("page[offset]")) || 0;
          }
          const totalPage = offset / vehicleData.page_size + 1;
          setVehicleData((prev) => ({ ...prev, data: res.data, page: value, total: offset + res.data.length, total_page: totalPage }));
        } else {
          setVehicleData((prev) => ({ ...prev, data: res.data, page: value }));
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data vehicle");
        setLoading(false);
      });
  };

  const onSearch = (value: string) => {
    setLoading(true);
    fetchData(1, vehicleData.page_size, false, value)
      .then(async (res) => {
        let url;
        let offset = 0;
        if (res?.links?.last) {
          url = new URL(res.links.last);
          offset = Number(url.searchParams.get("page[offset]")) || 0;
        }

        const lastResponse = await fetchData(offset, 10, true);
        const totalPage = offset / 10 + 1;
        setVehicleData((prev) => ({ ...prev, data: res.data, total: lastResponse.data.length + offset, total_page: totalPage }));

        setLoading(false);
      })
      .catch(() => {
        toast.error("Terjadi kesalahan dalam pengambilan data");
        setLoading(false);
      });
  };

  const onDetail = (data: Vehicle) => {
    setShowModal(true);
    setDataDetail(data);
  };

  useEffect(() => {
    fetchData()
      .then(async (res) => {
        let url;
        let offset = 0;
        if (res?.links?.last) {
          url = new URL(res.links.last);
          offset = Number(url.searchParams.get("page[offset]")) || 0;
        }

        const lastResponse = await fetchData(offset, 10, true);
        const totalPage = offset / 10 + 1;
        setVehicleData((prev) => ({ ...prev, data: res.data, total: lastResponse.data.length + offset, total_page: totalPage }));

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
      <ModalDetail isOpen={showModal} onClose={() => setShowModal(false)} data={dataDetail} />

      <Header />

      <div className="px-4 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <p className="font-extrabold text-text-title text-3xl md:text-5xl">Pantau Kendaraan</p>
          <p className="text-sm text-text-body">Lacak posisi dan status armada kendaraan secara real-time</p>
        </div>

        <Filter setLoading={(value) => setLoading(value)} onSearch={onSearch} />

        <div className="flex flex-col gap-4">
          <p className="text-lg text-text-title">Daftar Kendaraan</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {vehicleData.data.map((item: Vehicle) => (
              <div className="card flex-col p-4 gap-4" key={item.id}>
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="rounded-lg bg-primary">
                      <BusFront className="size-9 p-2.5 text-white" />
                    </div>
                    <p className="text-text-title">{item.attributes.label}</p>
                  </div>
                  {Status(item.attributes.current_status)}
                </div>

                <div className="flex gap-2 items-center">
                  <LineSquiggle className="size-4 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="text-primary text-xs">{item.relationships.route.data.id}</p>
                    <p className="text-text-title text-sm">{item.relationships.trip.data.id}</p>
                  </div>
                </div>

                <div className="border-y border-border py-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-text-body">LATITUDE</p>
                    <p className="text-sm text-text-title">{item.attributes.latitude}</p>
                  </div>
                  <div className="flex flex-col gap-1 ps-4 border-l border-border">
                    <p className="text-xs text-text-body">LONGITUDE</p>
                    <p className="text-sm text-text-title">{item.attributes.longitude}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <p className="text-text-body">Diperbarui: {dayjs(item.attributes.updated_at).format("DD-MM-YYYY HH:mm:ss")}</p>
                  <button className="text-primary p-1 font-bold cursor-pointer rounded-lg active:bg-secondary transition-all px-1 py-2" onClick={() => onDetail(item)}>
                    Lihat detail
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="card flex-col md:flex-row md:justify-between md:items-center px-4.5 py-3.5 gap-3">
            {vehicleData.data.length <= 0 ? (
              <div className="flex flex-col gap-2 items-center w-full p-4 md:p-8">
                <CircleX className="size-8 text-text-body" />
                <p className="text-xl text-text-title">Data Tidak Ditemukan</p>
                <p className="text-xs text-text-body text-center">Kami tidak menemukan data yang sesuai dengan pencarian atau filter yang kamu gunakan. Coba ubah filter.</p>
              </div>
            ) : (
              <>
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
                        <option value={item} key={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-1 items-center text-xs text-text-body">
                    <button className="size-7 flex justify-center items-center rounded-lg" disabled={vehicleData.page === 1} onClick={() => handleOnChangePage(vehicleData.page - 1)}>
                      <ChevronLeft className={`${vehicleData.page === 1 ? "text-border" : "text-text-body"} size-5`} />
                    </button>
                    {optionPage.map((item: number) => (
                      <button
                        key={item}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
