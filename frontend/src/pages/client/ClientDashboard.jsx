import React from "react";

import { useNavigate } from "react-router-dom";

function ClientDashboard() {
  const nav = useNavigate();

  return (
    <div>
      <h2>Select Service Category</h2>

      <div>
        <div>
          <button onClick={() => nav("/client/workers/electrician")}>
            Electrician
          </button>
        </div>

        <div>
          <button onClick={() => nav("/client/workers/plumber")}>
            Plumber
          </button>
        </div>

        <div>
          <button onClick={() => nav("/client/workers/cleaner")}>
            Cleaner
          </button>
        </div>

        <div>
          <button onClick={() => nav("/client/workers/cook")}>Cook</button>
        </div>
      </div>
    </div>
  );
}
export default ClientDashboard;
