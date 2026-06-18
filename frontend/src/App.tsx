import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Patrol from "./pages/Patrol";
import Predictions from "./pages/Predictions";

export default function App() {
  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100">
      <Navbar />
      <main className="px-4 py-5 sm:px-6 lg:ml-[350px] lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/patrol" element={<Patrol />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
