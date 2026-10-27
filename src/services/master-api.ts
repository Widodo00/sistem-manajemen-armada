import api from "../utils/api";

const MasterAPi = {
  getVehicles: async function (params = "") {
    return api.get(`/vehicles${params}`);
  },
  getRoute: async function (params = "") {
    return api.get(`/routes${params}`);
  },
  getTrip: async function (params = "") {
    return api.get(`/trips${params}`);
  },
};

export default MasterAPi;
