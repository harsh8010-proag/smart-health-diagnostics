import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  LogOut,
  User,
  FlaskConical,
  Syringe,
  ChevronRight,
} from 'lucide-react';

const roleConfig = {
  patient: {
    label: 'Patient',
    color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    icon: User,
    dashboard: '/patient/dashboard',
  },
  phlebotomist: {
    label: 'Phlebotomist',
    color: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    icon: Syringe,
    dashboard: '/phlebotomist/dashboard',
  },
  lab_admin: {
    label: 'Lab Admin',
    color: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    icon: FlaskConical,
    dashboard: '/lab/dashboard',
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const config = roleConfig[user?.role] || roleConfig.patient;
  const RoleIcon = config.icon;

  return (
    <header className="sticky top-0 z-50 border-b border-border-custom bg-bg-secondary/90 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Brand Logo */}
        <Link
          to={config.dashboard}
          className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow-primary">
            <Droplets className="h-6 w-6 text-bg-primary" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              Smart<span className="gradient-text">Blood</span>
            </span>
            <span className="hidden text-[10px] font-semibold tracking-wider text-text-muted uppercase sm:block">
              Diagnostic Network
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Role Badge */}
          <div
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ${config.color}`}
          >
            <RoleIcon className="h-3.5 w-3.5" />
            <span>{config.label}</span>
          </div>

          {/* User Profile Info */}
          <div className="hidden items-center gap-3 border-l border-border-custom pl-5 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card font-bold text-accent-primary border border-border-custom">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-tight">
                {user?.name}
              </span>
              <span className="text-xs text-text-muted truncate max-w-[140px]">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border-custom bg-bg-card px-3.5 py-2 text-xs font-medium text-text-secondary transition-all hover:border-accent-danger/50 hover:bg-accent-danger/10 hover:text-accent-danger"
            title="Sign out of account"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
