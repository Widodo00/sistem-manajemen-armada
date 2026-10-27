import { BeatLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex justify-center items-center fixed z-99999 bg-gray-200 opacity-80 inset-x-0 inset-y-0">
      <BeatLoader size={45} color="#0846A1" />
    </div>
  );
}
