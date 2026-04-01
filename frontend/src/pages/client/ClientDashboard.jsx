import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();

  const categories = [
    { name: "electrician", icon: "⚡" },
    { name: "plumber", icon: "🔧" },
    { name: "cleaner", icon: "🧹" },
    { name: "cook", icon: "🍳" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Select Service
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => navigate(`/client/browse?category=${cat.name}`)}
            className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="text-3xl">{cat.icon}</div>
            <p className="mt-2 capitalize font-medium">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
