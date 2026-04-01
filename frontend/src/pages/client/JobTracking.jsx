import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../services/socket.services.js";
import ChatBox from "../../components/ChatBox.jsx";

export default function JobTracking() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    socket.emit("joinJob", id);

    socket.on("updateWorkerLocation", (loc) => {
      setLocation(loc);
    });
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Tracking</h3>

        {location ? (
          <p className="text-sm text-gray-600">
            {location.lat}, {location.lng}
          </p>
        ) : (
          <p>Waiting for location...</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <ChatBox jobId={id} />
      </div>
    </div>
  );
}
