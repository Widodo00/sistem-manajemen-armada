import { useEffect, useMemo, useState } from "react";
import MasterAPi from "./services/master-api";
import { ToastContainer, Slide, toast } from "react-toastify";
import Loading from "./components/loading";
import dayjs from "dayjs";
import { BusFront, ChevronLeft, ChevronRight, CircleX, Funnel, LineSquiggle } from "lucide-react";
import type { Route, Trip, Vehicle } from "./types/response";
import type { OptionInterface } from "./types/general";
import { AsyncPaginate, type LoadOptions } from "react-select-async-paginate";
import type { GroupBase } from "react-select";
import ModalDetail from "./components/modal-detail";

interface VehicleData {
  data: Vehicle[];
  page: number;
  page_size: number;
  total: number;
  total_page: number;
}

interface FormSearch {
  route: OptionInterface[];
  trip: OptionInterface[];
}

interface Additional {
  page: number;
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<Vehicle | null>(null);
  const [formSearch, setFormSearch] = useState<FormSearch>({
    route: [],
    trip: [],
  });
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
    const paramsRoute = formSearch.route.map((item: OptionInterface) => item.value).join(",");
    const paramsTrip = formSearch.trip.map((item: OptionInterface) => item.value).join(",");
    return MasterAPi.getVehicles(`?page[offset]=${isRaw ? page : page * page_size - page_size}&page[limit]=${page_size}${paramsTrip ? `&filter[trip]=${paramsTrip}` : `&filter[route]=${paramsRoute}`}`);
  };

  const fetchDataRoute = (page = 1, page_size = 20) => {
    return MasterAPi.getRoute(`?page[offset]=${page * page_size - page_size}&page[limit]=${page_size}`);
  };

  const fetchDataTrip = (page = 1, page_size = 20, route = "") => {
    return MasterAPi.getTrip(`?page[offset]=${page * page_size - page_size}&page[limit]=${page_size}&route=${route}`);
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

  const onSearch = () => {
    setLoading(true);
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
  };

  const onDetail = (data: Vehicle) => {
    setShowModal(true);
    setDataDetail(data);
  };

  const loadOptionRoute: LoadOptions<OptionInterface, GroupBase<OptionInterface>, Additional> = async (_, _loadedOptions, additional) => {
    const page = additional?.page ?? 1;

    setLoading(true);

    try {
      const res = await fetchDataRoute(page);
      const tempRoute: OptionInterface[] = res.data.map((item: Route) => ({
        value: item.id,
        label: item.attributes.long_name,
      }));

      return {
        options: tempRoute,
        hasMore: Boolean(res.links.next),
        additional: {
          page: page + 1,
        },
      };
    } finally {
      setLoading(false);
    }
  };

  const loadOptionTrip: LoadOptions<OptionInterface, GroupBase<OptionInterface>, Additional> = async (_, _loadedOptions, additional) => {
    const page = additional?.page ?? 1;

    if (formSearch.route.length <= 0) {
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    setLoading(true);

    try {
      const params = formSearch.route.map((item: OptionInterface) => item.value);
      const res = await fetchDataTrip(page, 20, params.join(","));
      const tempTrip: OptionInterface[] = res.data.map((item: Trip) => ({
        value: item.id,
        label: item.attributes.headsign + " - " + item.id,
      }));

      return {
        options: tempTrip,
        hasMore: Boolean(res.links.next),
        additional: {
          page: page + 1,
        },
      };
    } finally {
      setLoading(false);
    }
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

      <div className="flex bg-primary p-4 justify-between items-center md:p-6 shadow-lg sticky top-0 z-99">
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

        <div className="card gap-3 flex-col p-5">
          <div className="flex gap-3 items-center">
            <Funnel className="size-9 rounded-lg p-2 text-blue-500 bg-blue-200" />
            <p className="font-bold text-sm text-text-title">Filter</p>
          </div>
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-text-body">Rute</p>
              <AsyncPaginate
                value={formSearch.route}
                loadOptions={loadOptionRoute}
                additional={{ page: 1 }}
                onChange={(evt) => {
                  if (evt.length <= 0) {
                    setFormSearch((prev) => ({ ...prev, trip: [], route: evt as OptionInterface[] }));
                  } else {
                    setFormSearch((prev) => ({ ...prev, route: evt as OptionInterface[] }));
                  }
                }}
                placeholder="Pilih rute"
                debounceTimeout={300}
                isClearable
                isMulti
                loadingMessage={() => <p>Mohon tunggu...</p>}
                isSearchable={false}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-text-body">Trip</p>
              <AsyncPaginate
                value={formSearch.trip}
                loadOptions={loadOptionTrip}
                additional={{ page: 1 }}
                onChange={(evt) => setFormSearch((prev) => ({ ...prev, trip: evt as OptionInterface[] }))}
                placeholder="Pilih trip"
                debounceTimeout={300}
                isClearable
                isMulti
                loadingMessage={() => <p>Mohon tunggu...</p>}
                isDisabled={formSearch.route.length <= 0}
                cacheUniqs={[formSearch.route.map((item) => item.value).join(",")]}
                isSearchable={false}
              />
            </div>
          </div>
          <button className="w-full bg-primary rounded-lg text-white font-medium py-2 md:px-6 md:w-fit md:self-end" onClick={onSearch}>
            Cari
          </button>
        </div>

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
                  {statusComponent(item.attributes.current_status)}
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
                  <button className="text-primary p-1 font-boldcursor-pointer" onClick={() => onDetail(item)}>
                    Lihat detail
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="card flex-col md:flex-row md:justify-between md:items-center px-4.5 py-3.5 gap-3">
            {vehicleData.data.length <= 0 ? (
              <div className="flex flex-col gap-2 items-center">
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
