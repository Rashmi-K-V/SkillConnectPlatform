import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api.services.js";

function BrowseWorkers() {
  const [workers, setWorkers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const category = params.get("category");

  useEffect(() => {
    api.get(`/portfolio?category=${category}`).then((res) => {
      setWorkers(res.data);
    });
  }, [category]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 capitalize">
        {category} Workers
      </h2>

      <div className="space-y-4">
        {workers.map((w) => (
          <div
            key={w._id}
            className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <h3 className="font-semibold text-lg">{w.workerId.name}</h3>

            <p className="text-gray-600 text-sm mt-1">{w.description}</p>

            <button
              onClick={() => navigate(`/client/worker/${w.workerId._id}`)}
              className="mt-3 px-4 py-2 bg-black text-white rounded-lg"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default BrowseWorkers;
