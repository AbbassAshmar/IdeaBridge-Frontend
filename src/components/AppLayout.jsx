import { useEffect, useMemo, useState } from "react";
import { Lightbulb, PlusCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
import { isDeveloper } from "../utils/userRoles";

function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = useMemo(() => {
    const items = [
      {
        to: "/ideas",
        label: "Ideas",
        icon: Lightbulb,
      },
    ];

    if (!isDeveloper(user)) {
      items.push({
        to: "/ideas/create",
        label: "Create idea",
        icon: PlusCircle,
      });
    }

    return items;
  }, [user]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="page-bg" />
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navigationItems={navigationItems}
      />
      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6">{children}</main>
    </>
  );
}

export default AppLayout;
