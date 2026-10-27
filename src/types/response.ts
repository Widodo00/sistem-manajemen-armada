export interface Vehicle {
  id: number;
  attributes: {
    current_status: string;
    latitude: number;
    longitude: number;
    updated_at: string;
    label: string;
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
