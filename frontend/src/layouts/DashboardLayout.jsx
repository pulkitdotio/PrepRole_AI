import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router";

import { useEffect, useRef, useState } from "react";

import Logo from "../components/common/Logo";
import { useAuth } from "../context/useAuth";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);

  const isInterviewHistoryContext =
    location.pathname === "/interviews" ||
    location.pathname.startsWith("/interviews/report/") ||
    location.pathname.startsWith("/resume/");

  useEffect(() => {
    if (!sidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector("a, button")?.focus();

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", {
        replace: true,
      });
    } catch {
      navigate("/login", {
        replace: true,
        state: { authNotice: "We couldn't confirm sign-out with the server. Your session may remain active until it expires." },
      });
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getNavClass = ({ isActive }) =>
    ["sidebar-link", isActive ? "sidebar-link--active" : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="app-shell">
      <a className="skip-link" href="#app-content">Skip to content</a>
      {/* Mobile menu button */}
      <button
        ref={menuButtonRef}
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen((current) => !current)}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={sidebarOpen}
        aria-controls="workspace-navigation"
      >
        {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="workspace-navigation"
        aria-label="Workspace navigation"
        className={["sidebar", sidebarOpen ? "sidebar--open" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Logo */}
        <div className="sidebar__header">
          <Logo />
          <span className="sidebar__workspace">Role workspace</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          <span className="sidebar__label">Workspace</span>

          <NavLink
            to="/dashboard"
            end
            onClick={closeSidebar}
            className={getNavClass}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/interviews/new"
            end
            onClick={closeSidebar}
            className={getNavClass}
          >
            <FileText size={17} />
            <span>New Interview</span>
          </NavLink>

          <NavLink
            to="/interviews"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              getNavClass({
                isActive:
                  isActive ||
                  isInterviewHistoryContext,
              })
            }
            aria-current={
              isInterviewHistoryContext
                ? "page"
                : undefined
            }
          >
            <BarChart3 size={17} />
            <span>Interview History</span>
          </NavLink>

          <NavLink
            to="/settings"
            end
            onClick={closeSidebar}
            className={getNavClass}
          >
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>

        </nav>

        {/* Logout */}
        <div className="sidebar__footer">
          <div className="sidebar-account" aria-label={`Signed in as ${user?.email || 'PrepRole AI user'}`}>
            <span className="sidebar-account__avatar"><BriefcaseBusiness size={15} /></span>
            <span className="sidebar-account__copy"><strong>{user?.username || user?.name || 'Candidate'}</strong><small>{user?.email || 'Private workspace'}</small></span>
          </div>
          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main application area */}
      <main className="app-main" id="app-content" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}

export default DashboardLayout;
