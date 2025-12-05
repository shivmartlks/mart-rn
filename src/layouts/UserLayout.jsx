import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function UserLayout({ role }) {
  return (
    <div className="main-wrapper">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className="main-content overflow-y-auto
        "
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer role={role} />
    </div>
  );
}
