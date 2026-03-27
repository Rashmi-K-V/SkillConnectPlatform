import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api.service.js";

function UploadVideo() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();

    formData.append("video", file);

    const res = await api.post("/video/upload", formData);

    alert("AI portfolio generated");
  };

  return (
    <div>
      <h3>Upload Work Video</h3>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={upload}>Upload</button>
    </div>
  );
}

export default UploadVideo;
