import { useEffect } from "react";
import MasterAPi from "./services/master-api";

function App() {
  useEffect(() => {
    Promise.all([MasterAPi.getVehicles(`?page[offset]=0&page[limit]=10`), MasterAPi.getRoute(`?page[offset]=0&page[limit]=10`), MasterAPi.getTrip(`?page[offset]=0&page[limit]=10&filter[route]=Red`)]);
  }, []);

  return <>Contoh</>;
}

export default App;
