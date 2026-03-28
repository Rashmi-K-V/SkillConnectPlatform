import api from "../../services/api.services.js";

import { useState, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";

function UploadVideo() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useContext(LanguageContext);

  const handleUpload = async () => {
    if (!file) return alert("Please select a video");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("video", file);

      const res = await api.post("/video/upload", formData);

      // 🔥 auto-fill from AI
      setDescription(res.data.autoDescription);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{t("uploadVideo")}</h2>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : t("uploadVideo")}
      </button>

      <br />
      <br />

      <textarea
        rows="6"
        cols="50"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="AI generated description..."
      />
    </div>
  );
}

export default UploadVideo;
