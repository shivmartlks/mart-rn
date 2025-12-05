import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] || "home";
  return (
    <header className="main-header flex justify-between items-center bg-white shadow p-4 border-b">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center mb-4 md:mb-6">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center text-gray-500 hover:text-gray-800 rounded-full bg-gray-100 cursor-pointer p-4 mr-4"
          >
            <ArrowLeft size={18} className="mr-1" />
          </button>
          <h1 className="text-xl font-semibold capitalize text-gray-500">
            {currentPath}
          </h1>
        </div>
        <div className="flex items-center mb-4 md:mb-6">
          <button className="flex items-center text-gray-500 hover:text-gray-800 rounded-full bg-gray-100 cursor-pointer p-2 mr-2">
            <Search size={14} className="mr-1" />
          </button>
        </div>
      </div>
    </header>
  );
}
