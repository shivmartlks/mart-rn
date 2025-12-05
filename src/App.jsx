import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ProtectedRoute handles admin/user dashboards */}
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
    </Router>
  );
}
