import React from "react";
import UploadVideo from "./UploadVideo";
function WorkerDashboard() {
  return (
    <div>
      <h2>Worker DashBoard</h2>
      <button onClick={() => nav("/worker/portfolio")}>
        Create / Edit Portfolio
      </button>
    </div>
  );
}

export default WorkerDashboard;
