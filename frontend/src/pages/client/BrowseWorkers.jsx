// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../../services/api.services.js";

// function BrowseWorkers() {
//   const [workers, setWorkers] = useState([]);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const params = new URLSearchParams(location.search);
//   const category = params.get("category");

//   useEffect(() => {
//     api.get(`/portfolios?category=${category.toLowerCase()}`).then((res) => {
//       setWorkers(res.data);
//     });
//   }, [category]);

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4 capitalize">
//         {category} Workers
//       </h2>

//       <div className="space-y-4">
//         {workers.map((w) => (
//           <div
//             key={w._id}
//             className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
//           >
//             <h3 className="font-semibold text-lg">{w.workerId.name}</h3>

//             <p className="text-gray-600 text-sm mt-1">{w.description}</p>

//             <button
//               onClick={() => navigate(`/client/worker/${w.workerId._id}`)}
//               className="mt-3 px-4 py-2 bg-black text-white rounded-lg"
//             >
//               View Profile
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// export default BrowseWorkers;
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
    api.get(`/portfolios?category=${category.toLowerCase()}`).then((res) => {
      setWorkers(res.data);
    });
  }, [category]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .bw-root {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          min-height: 100vh;
          background: #0d0d0d;
          padding: 36px 28px 48px;
          box-sizing: border-box;
        }

        .bw-header {
          margin-bottom: 28px;
        }

        .bw-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 14px;
          font-family: 'Manrope', sans-serif;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .bw-back:hover { color: #c8f135; }

        .bw-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
          text-transform: capitalize;
        }

        .bw-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.32);
        }

        .bw-count {
          display: inline-block;
          background: rgba(200,241,53,0.12);
          color: #c8f135;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          margin-left: 10px;
          letter-spacing: 0.04em;
          vertical-align: middle;
        }

        .bw-divider {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 28px;
        }

        .bw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .bw-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 22px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .bw-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 36px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.13);
        }

        .bw-card-top {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 14px;
        }

        .bw-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.5px;
        }

        .bw-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 3px;
        }

        .bw-badge {
          display: inline-block;
          background: rgba(200,241,53,0.1);
          color: #c8f135;
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 9px;
          border-radius: 20px;
          letter-spacing: 0.06em;
          text-transform: capitalize;
        }

        .bw-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          line-height: 1.65;
          margin-bottom: 20px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bw-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #c8f135;
          color: #0d0d0d;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          border-radius: 11px;
          padding: 11px 0;
          width: 100%;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .bw-btn:hover { opacity: 0.88; transform: scale(0.99); }
        .bw-btn:active { transform: scale(0.97); }

        .bw-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 64px 20px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
        }

        .bw-empty-icon {
          width: 52px;
          height: 52px;
          background: rgba(255,255,255,0.05);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .bw-empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }

        .bw-empty-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.28);
        }

        @media (max-width: 600px) {
          .bw-root { padding: 24px 16px 40px; }
          .bw-title { font-size: 22px; }
          .bw-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bw-root">
        {/* Header */}
        <div className="bw-header">
          <button className="bw-back" onClick={() => navigate(-1)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ width: 13, height: 13 }}
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          <h2 className="bw-title">
            {category} Workers
            <span className="bw-count">{workers.length} found</span>
          </h2>
          <p className="bw-subtitle">
            Browse talented professionals in this category.
          </p>
        </div>

        <div className="bw-divider" />

        {/* Cards */}
        <div className="bw-grid">
          {workers.length === 0 ? (
            <div className="bw-empty">
              <div className="bw-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.8"
                  style={{ width: 24, height: 24 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="bw-empty-title">No workers found</div>
              <div className="bw-empty-sub">
                There are no workers listed in this category yet.
              </div>
            </div>
          ) : (
            workers.map((w) => {
              const initials = w.workerId.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={w._id} className="bw-card">
                  <div className="bw-card-top">
                    <div className="bw-avatar">{initials}</div>
                    <div>
                      <h3 className="bw-name">{w.workerId.name}</h3>
                      <span className="bw-badge">{category}</span>
                    </div>
                  </div>

                  <p className="bw-desc">{w.description}</p>

                  <button
                    className="bw-btn"
                    onClick={() => navigate(`/client/worker/${w.workerId._id}`)}
                  >
                    View Profile
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ width: 14, height: 14 }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default BrowseWorkers;
