import { BusFront, ChevronLeft, ChevronRight, CircleX, LineSquiggle } from "lucide-react";
import type { Vehicle } from "../types/response";
import Status from "./status";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import MasterApi from "../services/master-api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Filter from "./filter";
import ModalDetail from "./modal-detail";

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_page: number;
}

export default function Pagination({ setLoading }: { setLoading: (value: boolean) => void }) {
  const [filter, setFilter] = useState<string>("");
  const [lastLink, setLastLink] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<Vehicle | null>(null);
  const optionPageSize = [10, 20, 50];
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total: 0,
    total_page: 1,
  });

  const optionPage = useMemo(() => {
    if (pagination.total_page <= 3) {
      return Array.from({ length: pagination.total_page }, (_, i) => i + 1);
    }

    if (pagination.page === 1) {
      return [1, 2, pagination.total_page];
    }

    if (pagination.page === pagination.total_page) {
      return [1, pagination.total_page - 1, pagination.total_page];
    }

    return [1, pagination.page, pagination.total_page];
  }, [pagination.page, pagination.total_page]);

  const params = useMemo(() => {
    return `?page[offset]=${pagination.page * pagination.page_size - pagination.page_size}&page[limit]=${pagination.page_size}${filter}`;
  }, [pagination.page, pagination.page_size, filter]);

  const fetchData = () => {
    return MasterApi.getVehicles(params);
  };

  const { isPending, error, data } = useQuery({
    queryKey: [`vehiclesData${params}`],
    queryFn: () => {
      return fetchData().then(async (res) => {
        if (res?.links?.last && res?.links?.last !== lastLink) {
          setLastLink(res.links.last);
          const url = new URL(res.links.last);
          const offset = Number(url.searchParams.get("page[offset]")) || 0;

          const lastResponse = await MasterApi.getVehicles(`?page[offset]=${offset}&page[limit]=${pagination.page_size}${filter}`);
          const totalPage = offset / pagination.page_size + 1;
          setPagination((prev) => ({ ...prev, total: lastResponse.data.length + offset, total_page: totalPage }));
        }

        return res.data;
      });
    },
    gcTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (isPending) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (error) {
      toast.error("Terjadi kesalahan dalam pengambilan data kendaraan");
    }
  }, [error]);

  const handleOnChangeSize = (value: number) => {
    setPagination((prev) => ({ ...prev, page: 1, page_size: value }));
  };

  const handleOnChangePage = (value: number) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const onDetail = (data: Vehicle) => {
    setShowModal(true);
    setDataDetail(data);
  };

  return (
    <>
      <ModalDetail isOpen={showModal} onClose={() => setShowModal(false)} data={dataDetail} />

      <Filter
        setLoading={(value) => setLoading(value)}
        onSearch={(value: string) => {
          setFilter(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      <div className="flex flex-col gap-4">
        <p className="text-lg text-text-title">Daftar Kendaraan</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data?.map((item: Vehicle) => (
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
          {data && data.length <= 0 ? (
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
                  {pagination.page * pagination.page_size - pagination.page_size + 1}-{pagination.page === pagination.total_page ? pagination.total : pagination.page * pagination.page_size}
                </span>{" "}
                dari <span className="font-bold text-text-title">{pagination.total} kendaraan</span>
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
                  <button className="size-7 flex justify-center items-center rounded-lg" disabled={pagination.page === 1} onClick={() => handleOnChangePage(pagination.page - 1)}>
                    <ChevronLeft className={`${pagination.page === 1 ? "text-border" : "text-text-body"} size-5`} />
                  </button>
                  {optionPage.map((item: number) => (
                    <button
                      key={item}
                      className={`size-7 flex justify-center items-center rounded-lg ${pagination.page === item ? "text-white bg-primary" : "text-text-body"}`}
                      disabled={pagination.page === item}
                      onClick={() => handleOnChangePage(item)}
                    >
                      <p>{item}</p>
                    </button>
                  ))}
                  <button className="size-7 flex justify-center items-center rounded-lg" disabled={pagination.page === pagination.total_page} onClick={() => handleOnChangePage(pagination.page + 1)}>
                    <ChevronRight className={`${pagination.page === pagination.total_page ? "text-border" : "text-text-body"} size-5`} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
