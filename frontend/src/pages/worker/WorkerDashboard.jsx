import { useNavigate } from "react-router-dom";

export default function WorkerDashboard() {
  const nav = useNavigate();

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <div
        onClick={() => nav("/worker/upload")}
        className="p-6 bg-white rounded-xl shadow cursor-pointer"
      >
        📤 Upload Video
      </div>

      <div
        onClick={() => nav("/worker/portfolio")}
        className="p-6 bg-white rounded-xl shadow cursor-pointer"
      >
        📄 Portfolio
      </div>
    </div>
  );
}
