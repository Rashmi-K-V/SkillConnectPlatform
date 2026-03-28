import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { LanguageContext } from "../../context/LanguageContext";

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const [worker, setWorker] = useState(null);

  useEffect(() => {
    fetchWorker();
  }, [id, lang]);

  const fetchWorker = async () => {
    const res = await api.get(`/portfolio/${id}?lang=${lang}`);
    setWorker(res.data);
  };

  const requestJob = async () => {
    const res = await api.post("/jobs/request", {
      workerId: id,
      description: "Need service",
      location: {
        lat: 12.9716,
        lng: 77.5946,
      },
    });

    navigate(`/client/job/${res.data._id}`);
  };

  if (!worker) return <p>Loading...</p>;

  return (
    <div>
      <h2>{worker.workerId.name}</h2>

      <p>{worker.translatedDescription || worker.description}</p>

      <p>Skills: {worker.skills?.join(", ")}</p>

      <button onClick={requestJob}>Request Job</button>
    </div>
  );
}
