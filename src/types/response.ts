export interface Vehicle {
  id: number;
  attributes: {
    current_status: string;
    latitude: number;
    longitude: number;
    updated_at: string;
    label: string;
  };
}
