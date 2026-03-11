import { useState, useEffect } from "react";
import api from "../../services/api";
import UploadVideo from "./UploadVideo";

function PortfolioPage() {
  const [profile, setProfile] = useState(null);

  const [skills, setSkills] = useState("");
  const [services, setServices] = useState("");
  const [experience, setExperience] = useState("");

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/auth/me");

      setProfile(res.data);
    };

    fetchProfile();
  }, []);

  const savePortfolio = async () => {
    const formData = new FormData();

    formData.append("skills", skills);
    formData.append("services", services);
    formData.append("experience", experience);

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    await api.post("/portfolio", formData);

    alert("Portfolio saved successfully");
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>Worker Portfolio</h2>

      {/* PROFILE IMAGE */}

      <div>
        <label>Profile Image</label>

        <input
          type="file"
          onChange={(e) => setProfileImage(e.target.files[0])}
        />
      </div>

      {/* AUTOFILLED USER DATA */}

      <div>
        <label>Name</label>

        <input value={profile.name} disabled />
      </div>

      <div>
        <label>Email</label>

        <input value={profile.email} disabled />
      </div>

      <div>
        <label>Phone</label>

        <input value={profile.phone} disabled />
      </div>

      <div>
        <label>Category</label>

        <input value={profile.category} disabled />
      </div>

      {/* PORTFOLIO DATA */}

      <div>
        <label>Skills</label>

        <input
          placeholder="fan repair, wiring, switchboard"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>

      <div>
        <label>Services</label>

        <input
          placeholder="home wiring, light installation"
          value={services}
          onChange={(e) => setServices(e.target.value)}
        />
      </div>

      <div>
        <label>Experience</label>

        <textarea
          placeholder="5 years electrician experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      {/* VIDEO AI AUTO FILL */}

      <UploadVideo />

      {/* SAVE BUTTON */}

      <button onClick={savePortfolio}>Save Portfolio</button>
    </div>
  );
}

export default PortfolioPage;
