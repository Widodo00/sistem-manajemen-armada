export default function Header() {
  return (
    <div className="flex bg-primary p-4 justify-between items-center md:p-6 shadow-lg sticky top-0 z-99">
      <div className="flex flex-col">
        <p className="font-bold text-sm text-white">TRANSJAKARTA</p>
        <p className="text-xs text-border">MANAJEMEN ARMADA</p>
      </div>
      <div className="flex gap-2 items-center">
        <div className="rounded-full size-2 bg-green-500" />
        <p className="text-border text-xs hidden md:block">SISTEM TERHUBUNG</p>
      </div>
    </div>
  );
}
