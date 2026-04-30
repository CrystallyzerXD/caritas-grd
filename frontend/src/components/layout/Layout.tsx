import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  // Open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* Sidebar is always fixed-positioned; content shifts via padding */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Main content: on desktop, add left padding equal to sidebar width when open */}
      <div
        className={[
          'flex flex-col flex-1 min-w-0 overflow-hidden',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0',
        ].join(' ')}
        style={{ transition: 'padding-left 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <Topbar onMenuClick={toggleSidebar} />
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          style={{ viewTransitionName: 'page-content' } as React.CSSProperties}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
