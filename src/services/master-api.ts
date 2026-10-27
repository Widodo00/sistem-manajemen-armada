import type { Route, Trip, Vehicle } from "../types/response";
import api from "../utils/api";

interface VehicleData {
  data: Vehicle[];
  links: {
    last: string;
  };
}

interface RouteData {
  data: Route[];
  links: {
    next: string;
  };
}
interface TripData {
  data: Trip[];
  links: {
    next: string;
  };
}

const MasterAPi = {
  getVehicles: async function (params = "") {
    return api.get<VehicleData, VehicleData>(`/vehicles${params}`);
  },
  getRoute: async function (params = "") {
    return api.get<RouteData, RouteData>(`/routes${params}`);
  },
  getTrip: async function (params = "") {
    return api.get<TripData, TripData>(`/trips${params}`);
  },
};

export default MasterAPi;
