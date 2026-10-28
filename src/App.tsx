import { useState } from "react";
import { ToastContainer, Slide } from "react-toastify";
import Loading from "./components/loading";
import Header from "./components/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Pagination from "./components/pagination";

export default function App() {
  const queryClient = new QueryClient();
  const [loading, setLoading] = useState<boolean>(true);

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
