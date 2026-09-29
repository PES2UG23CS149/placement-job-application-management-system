import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-slate-800 flex flex-col flex-shrink-0">

        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700">

          <h1 className="text-white font-bold text-xl">
            Placement Portal
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Administrator Panel
          </p>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-2">

          {/* Dashboard */}
          <NavLink
            to="/admin"
            end
            className={navClass}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z"
              />
            </svg>

            Dashboard
          </NavLink>

          {/* Companies */}
          <NavLink
            to="/admin/companies"
            className={navClass}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h1m4 0h1m-6 4h1m4 0h1"
              />
            </svg>

            Companies
          </NavLink>

          {/* Placement Drives */}
          <NavLink
            to="/admin/drives"
            className={navClass}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>

            Placement Drives
          </NavLink>

          {/* Applicants */}
          <NavLink
            to="/admin/applicants"
            className={navClass}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-4-4"
              />
            </svg>

            Applicants
          </NavLink>

        </nav>

        {/* ================= BOTTOM ================= */}
        <div className="border-t border-slate-700">

          {/* Theme */}
          <div className="px-4 py-4">

            <p className="text-xs text-slate-400 px-2 mb-2">
              Theme
            </p>

            <div className="relative">

              <select
                value={theme}
                onChange={(event) =>
                  setTheme(event.target.value)
                }
                className="w-full appearance-none bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="default">
                  Default
                </option>

                <option value="light">
                  Light
                </option>

                <option value="dark">
                  Dark
                </option>
              </select>

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>

            </div>

          </div>

          {/* User */}
          <div className="px-6 py-4 border-t border-slate-700">

            <p className="text-xs text-slate-400">
              Signed in as
            </p>

            <p className="text-white font-semibold mt-1">
              Administrator
            </p>

          </div>

          {/* Logout */}
          <div className="px-3 pb-4">

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>

              Logout

            </button>

          </div>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  );
}