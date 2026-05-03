import { NavLink, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  BarChart2,
  Users,
  BookOpen,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';

/** NavLink that wraps navigation in the View Transitions API when available. */
function TransitionNavLink({
  to,
  end,
  onClick,
  className,
  children,
}: {
  to: string;
  end?: boolean;
  onClick?: () => void;
  className: ({ isActive }: { isActive: boolean }) => string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    if (!document.startViewTransition) {
      navigate(to);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => navigate(to));
    });
  };

  return (
    <NavLink to={to} end={end} onClick={handleClick} className={className}>
      {children}
    </NavLink>
  );
}

function CaritasCross({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50,50)">
        <ellipse cx="0" cy="-28" rx="9" ry="18" />
        <ellipse cx="0" cy="-28" rx="9" ry="18" transform="rotate(45)" />
        <ellipse cx="28" cy="0" rx="18" ry="9" />
        <ellipse cx="28" cy="0" rx="18" ry="9" transform="rotate(45)" />
        <ellipse cx="0" cy="28" rx="9" ry="18" />
        <ellipse cx="0" cy="28" rx="9" ry="18" transform="rotate(-45)" />
        <ellipse cx="-28" cy="0" rx="18" ry="9" />
        <ellipse cx="-28" cy="0" rx="18" ry="9" transform="rotate(-45)" />
        <circle cx="0" cy="0" r="12" />
      </g>
    </svg>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  show: boolean;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin, isSpecialist, isBrigadista, canViewReports, canManageBrigadistas } = usePermissions();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
      show: true,
    },
    {
      to: '/incidents',
      label: 'Módulo GRD',
      icon: <AlertTriangle className="h-5 w-5 flex-shrink-0" />,
      show: true,
    },
    {
      to: '/training',
      label: 'Capacitaciones',
      icon: <GraduationCap className="h-5 w-5 flex-shrink-0" />,
      show: true,
    },
    {
      to: '/brigadistas',
      label: 'Brigadistas',
      icon: <ShieldCheck className="h-5 w-5 flex-shrink-0" />,
      show: canManageBrigadistas || isBrigadista,
    },
    {
      to: '/reports',
      label: 'Reportes',
      icon: <BarChart2 className="h-5 w-5 flex-shrink-0" />,
      show: canViewReports,
    },
    {
      to: '/admin/users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5 flex-shrink-0" />,
      show: isAdmin,
    },
    {
      to: '/admin/catalogs',
      label: 'Catálogos',
      icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
      show: isAdmin,
    },
  ];

  const linkBase =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150';
  const activeClass = 'bg-[#009850] text-white shadow-sm';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  // On mobile: close sidebar when a nav item is clicked (overlay mode)
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay — only shown when open on small screens */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel — always fixed, slides in/out */}
      <aside
        style={{ transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
        className={[
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Header: logo + collapse button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-[#009850] flex items-center justify-center flex-shrink-0 p-1.5">
              <CaritasCross className="text-white w-full h-full" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#009850] leading-tight text-sm truncate">Cáritas Lima</p>
              <p className="text-xs text-gray-500">Sistema GRD</p>
            </div>
          </div>

          {/* Collapse button — visible on all screen sizes */}
          <button
            onClick={onClose}
            title="Ocultar menú"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <TransitionNavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  [linkBase, isActive ? activeClass : inactiveClass].join(' ')
                }
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </TransitionNavLink>
            ))}
        </nav>

        {/* User info at the bottom */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#009850]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#009850]">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
