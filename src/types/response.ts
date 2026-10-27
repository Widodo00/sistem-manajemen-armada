export interface Vehicle {
  id: string;
  attributes: {
    current_status: string;
    latitude: number;
    longitude: number;
    updated_at: string;
    label: string;
    current_stop_sequence: number;
    occupancy_status: string;
  };
  relationships: {
    route: {
      data: { id: string };
    };
    trip: {
      data: { id: string };
    };
  };
}

export interface Route {
  id: number;
  attributes: {
    long_name: string;
  };
}

export interface Trip {
  id: number;
  attributes: {
    headsign: string;
  };
}
