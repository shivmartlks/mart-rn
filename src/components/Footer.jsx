import { useLocation, useNavigate } from "react-router-dom";
import { adminTabs, userTabs } from "./ui/footer";

export default function Footer({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] || "home";
  const tabs = role === "user" ? userTabs : adminTabs;

  console.log(role);

  return (
    <footer
      className="main-footer 
        bg-white border-t border-border 
        flex justify-around items-center 
        py-2 fixed bottom-0 left-0 right-0 
        shadow-inner z-50
      "
    >
      {tabs.map(({ key, label, icon: Icon, path }) => {
        const isActive = currentPath === key;

        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`
              flex flex-col items-center gap-0.5
              transition-all 
              ${isActive ? "text-black-800 font-medium" : "text-text-muted"}
            `}
          >
            <Icon size={22} />
            <span className="text-[11px]">{label}</span>
          </button>
        );
      })}
    </footer>
  );
}
