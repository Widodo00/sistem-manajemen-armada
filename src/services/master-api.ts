import type { Vehicle } from "../types/response";
import api from "../utils/api";

interface VehicleData {
  data: Vehicle[];
  links: {
    last: string;
  };
}

const MasterAPi = {
  getVehicles: async function (params = "") {
    return api.get<VehicleData, VehicleData>(`/vehicles${params}`);
  },
  getRoute: async function (params = "") {
    return api.get(`/routes${params}`);
  },
  getTrip: async function (params = "") {
    return api.get(`/trips${params}`);
  },
};

export default MasterAPi;
