import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import {
  LayoutDashboard, Building2, FolderKanban, Users, Shield, FileText,
  MapPin, ClipboardList, Monitor, LogOut, Globe, ClipboardCheck, Menu, X
} from 'lucide-react';

/* ─── Nav structure ──────────────────────────────────────────────────────── */
const NAV = [
  {
    section: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.SUPERVISOR] },
    ]
  },
  {
    section: 'Administración',
    items: [
      { to: '/companies', icon: Building2,    label: 'Empresas',  roles: [ROLES.SUPER_ADMIN] },
      { to: '/projects',  icon: FolderKanban, label: 'Proyectos', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY] },
      { to: '/members',   icon: Users,        label: 'Miembros',  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY] },
      { to: '/permissions',icon: Shield,      label: 'Permisos',  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY] },
    ]
  },
  {
    section: 'Operaciones',
    items: [
      { to: '/forms',   icon: FileText,    label: 'Formularios', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.SUPERVISOR] },
      { to: '/sectors', icon: MapPin,      label: 'Sectores',    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.SUPERVISOR] },
      { to: '/tasks',   icon: ClipboardList,label: 'Tareas',     roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.SUPERVISOR] },
    ]
  },
  {
    section: 'Análisis',
    items: [
      { to: '/monitoring', icon: Monitor, label: 'Monitoreo', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.SUPERVISOR] },
    ]
  },
  {
    section: 'Campo',
    items: [
      { to: '/survey', icon: ClipboardCheck, label: 'Mis Encuestas', roles: [ROLES.ENUMERATOR] },
    ]
  },
];

const ROLE_BADGE = {
  [ROLES.SUPER_ADMIN]:   { label: 'Super Admin',  color: '#a78bfa' },
  [ROLES.ADMIN_COMPANY]: { label: 'Admin',         color: '#60a5fa' },
  [ROLES.SUPERVISOR]:    { label: 'Supervisor',    color: '#34d399' },
  [ROLES.ENUMERATOR]:    { label: 'Encuestador',   color: '#fbbf24' },
};

/* ─── Sidebar inner content (shared between desktop+mobile) ─────────────── */
function SidebarContent({ user, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rb = ROLE_BADGE[user.role] || { label: user.role, color: '#94a3b8' };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-row">
          <div className="brand-icon"><Globe size={19} color="#fff" /></div>
          <div>
            <h1>TERRANALYTICS</h1>
          </div>
          {/* Close on mobile */}
          {onClose && (
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
              <X size={18} />
            </button>
          )}
        </div>
        <small>Inteligencia Territorial</small>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => {
          const visible = items.filter(i => !i.roles || i.roles.includes(user.role));
          if (!visible.length) return null;
          return (
            <div key={section}>
              <div className="sidebar-nav-section">{section}</div>
              {visible.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={onClose}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user.name}</div>
            <div className="role-dot">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: rb.color, display: 'inline-block' }} />
              <span style={{ color: rb.color }}>{rb.label}</span>
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </div>
    </>
  );
}

/* ─── Bottom nav items for mobile ──────────────────────────────────────── */
const BOTTOM_NAV_ITEMS = {
  [ROLES.SUPER_ADMIN]: [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects',  icon: FolderKanban,    label: 'Proyectos' },
    { to: '/tasks',     icon: ClipboardList,   label: 'Tareas' },
    { to: '/monitoring',icon: Monitor,         label: 'Monitor' },
    { to: '/companies', icon: Building2,       label: 'Empresas' },
  ],
  [ROLES.ADMIN_COMPANY]: [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects',  icon: FolderKanban,    label: 'Proyectos' },
    { to: '/tasks',     icon: ClipboardList,   label: 'Tareas' },
    { to: '/monitoring',icon: Monitor,         label: 'Monitor' },
    { to: '/members',   icon: Users,           label: 'Miembros' },
  ],
  [ROLES.SUPERVISOR]: [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks',     icon: ClipboardList,   label: 'Tareas' },
    { to: '/sectors',   icon: MapPin,          label: 'Sectores' },
    { to: '/monitoring',icon: Monitor,         label: 'Monitor' },
    { to: '/forms',     icon: FileText,        label: 'Formas' },
  ],
  [ROLES.ENUMERATOR]: [
    { to: '/survey', icon: ClipboardCheck, label: 'Encuestas' },
  ],
};

/* ─── Main Layout ───────────────────────────────────────────────────────── */
export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close drawer on ESC
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const bottomItems = BOTTOM_NAV_ITEMS[user.role] || [];

  return (
    <div className="app-layout">
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <SidebarContent user={user} onClose={null} />
      </aside>

      {/* ── Mobile: topbar ── */}
      <header className="topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div className="topbar-brand">
          <div className="brand-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
            <Globe size={16} color="#fff" />
          </div>
          <h1>TERRANALYTICS</h1>
        </div>
      </header>

      {/* ── Mobile: sidebar drawer + backdrop ── */}
      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ zIndex: 200 }}
        aria-hidden={!sidebarOpen}>
        <SidebarContent user={user} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── Mobile: bottom nav ── */}
      {bottomItems.length > 0 && (
        <nav className="bottom-nav" aria-label="Navegación móvil">
          <div className="bottom-nav-inner">
            {bottomItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
