import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Truck, Settings, Users } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-white hover:text-primary-glow transition-smooth">
              {/* Inline SVG icon for logistics */}
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-white">
                <path
                  fill="currentColor"
                  d="M4 16h6v2H4v-2zm8-8h2v2h-2V8zM4 20h6v2H4v-2zm8-8h10v6h-2v-4h-8v-2zm8 8h6v2h-6v-2zm-8 4h6v2h-6v-2z"
                />
                <path
                  fill="currentColor"
                  d="M26 24h-2v-2h2v2zm-4-6h2v2h-2v-2zm-4 0h2v2h-2v-2z"
                />
              </svg>
              <div>
                <h1 className="text-xl font-bold">فورواردرت</h1>
                <p className="text-sm text-primary-glow">forwarderett.ir</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                  isActive("/")
                    ? "bg-white/20 text-white"
                    : "text-primary-glow hover:bg-white/10 hover:text-white"
                }`}
              >
                <Truck size={20} />
                <span>درخواست حمل</span>
              </Link>
              <Link
                to="/agent"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                  isActive("/agent")
                    ? "bg-white/20 text-white"
                    : "text-primary-glow hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users size={20} />
                <span>داشبورد کارشناس</span>
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                  location.pathname.startsWith("/admin")
                    ? "bg-white/20 text-white"
                    : "text-primary-glow hover:bg-white/10 hover:text-white"
                }`}
              >
                <Settings size={20} />
                <span>مدیریت</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;