import { useState } from "react";
import { ToastContainer, Slide } from "react-toastify";
import Loading from "./components/loading";
import Header from "./components/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Pagination from "./components/pagination";

// interface VehicleData {
//   data: Vehicle[];
//   page: number;
//   page_size: number;
//   total: number;
//   total_page: number;
// }

export default function App() {
  const queryClient = new QueryClient();
  const [loading, setLoading] = useState<boolean>(true);

  // const [vehicleData, setVehicleData] = useState<VehicleData>({
  //   data: [],
  //   page: 1,
  //   page_size: 10,
  //   total: 0,
  //   total_page: 1,
  // });

  // useEffect(() => {
  //   fetchData()
  //     .then(async (res) => {
  //       let url;
  //       let offset = 0;
  //       if (res?.links?.last) {
  //         url = new URL(res.links.last);
  //         offset = Number(url.searchParams.get("page[offset]")) || 0;
  //       }

  //       const lastResponse = await fetchData(offset, 10, true);
  //       const totalPage = offset / 10 + 1;
  //       setVehicleData((prev) => ({ ...prev, data: res.data, total: lastResponse.data.length + offset, total_page: totalPage }));

  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       toast.error("Terjadi kesalahan dalam pengambilan data");
  //       setLoading(false);
  //     });
  // }, []);

  return (
    <div className="bg-background min-h-dvh">
      {loading && <Loading />}
      <ToastContainer theme="colored" position="top-right" autoClose={5000} transition={Slide} />

      <Header />

      <QueryClientProvider client={queryClient}>
        <div className="px-4 py-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2.5">
            <p className="font-extrabold text-text-title text-3xl md:text-5xl">Pantau Kendaraan</p>
            <p className="text-sm text-text-body">Lacak posisi dan status armada kendaraan secara real-time</p>
          </div>

          <Pagination setLoading={(value) => setLoading(value)} />
        </div>
      </QueryClientProvider>
    </div>
  );
}
