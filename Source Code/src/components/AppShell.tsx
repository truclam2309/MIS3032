import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BackButton } from './BackButton';
import {
  AlertTriangleIcon,
  ClipboardListIcon,
  FileTextIcon,
  GavelIcon,
  MenuIcon,
  PackageIcon,
  PlusIcon,
  ScaleIcon,
  TruckIcon,
  WalletIcon,
  XIcon } from
'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';

interface NavItem {
  to: string;
  label: string;
  role: string;
  icon: React.ComponentType<{className?: string;}>;
  count?: number;
}

export function AppShell() {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { requests, orders, lastError, clearError } = useProcurement();

  const [mobileOpen, setMobileOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === '/requests') return pathname.startsWith('/requests') && pathname !== '/requests/new';
    if (to === '/requests/new') return pathname === '/requests/new';
    return pathname.startsWith(to);
  };

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const pendingApproval = requests.filter((r) => r.status === 'pending-approval').length;
  const budgetQueue = requests.filter((r) => r.status === 'budget-warning').length;
  const sourcing = requests.filter((r) =>
  ['approved', 'quotation-comparison', 'ai-recommendation'].includes(r.status)
  ).length;
  const attention = requests.filter((r) => ['error', 'revision-required', 'draft'].includes(r.status)).length;

  const items: NavItem[] = [
  { to: '/requests', label: 'Purchase requests', role: 'Employee', icon: ClipboardListIcon, count: attention },
  { to: '/requests/new', label: 'New request', role: 'Employee', icon: PlusIcon },
  { to: '/approvals', label: 'Approvals', role: 'Manager', icon: GavelIcon, count: pendingApproval },
  { to: '/budget', label: 'Budget review', role: 'Finance', icon: WalletIcon, count: budgetQueue },
  { to: '/sourcing', label: 'Sourcing', role: 'Procurement', icon: ScaleIcon, count: sourcing },
  { to: '/suppliers', label: 'Suppliers', role: 'Procurement', icon: TruckIcon },
  {
    to: '/orders',
    label: 'Purchase orders',
    role: 'Procurement',
    icon: PackageIcon,
    count: orders.filter((o) => o.status !== 'closed').length
  },
  { to: '/assumptions', label: 'Prototype assumptions', role: '', icon: FileTextIcon }
];
const visibleItems = items.filter(
  (item) =>
    !item.role ||
    user?.role === 'admin' ||
    item.role.toLowerCase() === user?.role,
)


  return (
    <div className="flex min-h-full w-full bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm">
        
        Skip to content
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-line bg-surface transition-transform duration-200 ease-exp lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        }>
        
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <div>
            <p className="text-sm font-semibold leading-tight">Procure</p>
            <p className="text-2xs uppercase tracking-wider text-ink-subtle">Request &amp; approval</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas lg:hidden"
            aria-label="Close navigation">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Main" className="p-2">
          <ul className="space-y-0.5">
            {visibleItems.map((item) =>
            <li key={item.to}>
                <NavLink
                to={item.to}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className={`group flex items-center gap-2.5 rounded px-2.5 py-2 text-sm transition-colors duration-150 ease-exp ${
                isActive(item.to) ?
                'bg-brand-50 text-brand-700' :
                'text-ink-muted hover:bg-canvas hover:text-ink'}`
                }>
                
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {item.role ?
                <span className="text-2xs uppercase tracking-wide text-ink-subtle">{item.role}</span> :
                null}
                  {typeof item.count === 'number' && item.count > 0 ?
                <span className="tabular rounded bg-canvas px-1.5 text-2xs font-semibold text-ink-muted">
                      {item.count}
                    </span> :
                null}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="mx-2 mt-4 rounded border border-line bg-raised p-3">
          <p className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">Prototype</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Sample data only. The assistant never approves a request or selects a supplier — it produces
            recommendations that a person accepts or overrides.
          </p>
        </div>
        <div className="mx-2 mt-3 border-t border-line pt-3">
  <button
    type="button"
    onClick={handleLogout}
    className="w-full rounded px-2.5 py-2 text-left text-sm font-medium text-danger-700 hover:bg-danger-50"
  >
    Đăng xuất
  </button>
</div>
      </aside>

      {mobileOpen ?
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-30 bg-ink/20 lg:hidden" /> :

      null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded border border-line p-1.5 text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas"
            aria-label="Open navigation">
            
            <MenuIcon className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">Procure</span>
        </header>

        {lastError ?
        <div
          role="alert"
          className="flex items-start gap-2 border-b border-danger-200 bg-danger-50 px-4 py-2.5 text-sm text-danger-700 lg:px-8">
          
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{lastError}</p>
            <button
            type="button"
            onClick={clearError}
            className="rounded px-2 py-0.5 text-xs font-semibold underline decoration-danger-200 underline-offset-2 transition-colors duration-150 ease-exp hover:bg-danger-200/40">
            
              Dismiss
            </button>
          </div> :
        null}

        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
           <BackButton />
          <Outlet />
        </main>
      </div>
    </div>);

}