import { Funnel } from "lucide-react";
import { AsyncPaginate, type LoadOptions } from "react-select-async-paginate";
import type { OptionInterface } from "../types/general";
import { useState } from "react";
import type { GroupBase } from "react-select";
import MasterApi from "../services/master-api";
import type { Route, Trip } from "../types/response";

interface FormSearch {
  route: OptionInterface[];
  trip: OptionInterface[];
}

interface Additional {
  page: number;
}

export default function Filter({ setLoading, onSearch }: { setLoading: (value: boolean) => void; onSearch: (data: string) => void }) {
  const [formSearch, setFormSearch] = useState<FormSearch>({
    route: [],
    trip: [],
  });

  const fetchDataRoute = (page = 1, page_size = 20) => {
    return MasterApi.getRoute(`?page[offset]=${page * page_size - page_size}&page[limit]=${page_size}`);
  };

  const fetchDataTrip = (page = 1, page_size = 20, route = "") => {
    return MasterApi.getTrip(`?page[offset]=${page * page_size - page_size}&page[limit]=${page_size}&route=${route}`);
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

  const onSearchTemp = () => {
    const paramsRoute = formSearch.route.map((item: OptionInterface) => item.value).join(",");
    const paramsTrip = formSearch.trip.map((item: OptionInterface) => item.value).join(",");

    onSearch(`&filter[trip]=${paramsTrip}&filter[route]=${paramsRoute}`);
  };

  return (
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
      <button className="w-full bg-primary rounded-lg text-white font-medium py-2 md:px-6 md:w-fit md:self-end active:bg-primary-active transition-all" onClick={onSearchTemp}>
        Cari
      </button>
    </div>
  );
}
