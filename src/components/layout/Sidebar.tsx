import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { RoleEnum } from '@/lib/types';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Building2,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: RoleEnum[];
}

interface NavGroup {
  role: RoleEnum;
  label: string;
  items: NavItem[];
}

// Navigation structure grouped by role
const navGroups: NavGroup[] = [
  {
    role: RoleEnum.ADMIN,
    label: 'Administration',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [RoleEnum.ADMIN] },
      { label: 'COTON Check', href: '/dashboard/admin/check', icon: ClipboardCheck, roles: [RoleEnum.ADMIN] },
      { label: 'Clients', href: '/dashboard/admin/clients', icon: Building2, roles: [RoleEnum.ADMIN] },
      { label: 'Freelances', href: '/dashboard/admin/freelances', icon: Users, roles: [RoleEnum.ADMIN] },
      { label: 'Candidats', href: '/dashboard/admin/candidats', icon: UserCircle, roles: [RoleEnum.ADMIN] },
    ],
  },
  {
    role: RoleEnum.FREELANCE,
    label: 'Freelance',
    items: [
      { label: 'Mes missions', href: '/dashboard/freelance/missions', icon: Briefcase, roles: [RoleEnum.FREELANCE] },
      { label: 'Mes évaluations', href: '/dashboard/freelance/evaluations', icon: FileText, roles: [RoleEnum.FREELANCE] },
    ],
  },
  {
    role: RoleEnum.CLIENT,
    label: 'Client',
    items: [
      { label: 'Mes missions', href: '/dashboard/client/missions', icon: Briefcase, roles: [RoleEnum.CLIENT] },
      { label: 'Candidats', href: '/dashboard/client/candidats', icon: UserCircle, roles: [RoleEnum.CLIENT] },
    ],
  },
  {
    role: RoleEnum.CANDIDAT,
    label: 'Candidat',
    items: [
      { label: 'Mon évaluation', href: '/dashboard/candidat/evaluation', icon: FileText, roles: [RoleEnum.CANDIDAT] },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { roles } = useAuth();

  // Filter groups to only show those matching user's roles
  const visibleGroups = navGroups.filter(group =>
    roles.includes(group.role)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-sm font-bold text-sidebar-primary-foreground">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">COTON</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
            <span className="text-sm font-bold text-sidebar-primary-foreground">C</span>
          </div>
        )}
      </div>

      {/* Navigation - Grouped by Role */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group, groupIndex) => (
          <div key={group.role}>
            {/* Group Label */}
            {!collapsed && (
              <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted/70">
                {group.label}
              </div>
            )}

            {/* Group Items */}
            <div className="space-y-1 mb-4">
              {group.items.map(item => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Separator between groups (except for last group) */}
            {!collapsed && groupIndex < visibleGroups.length - 1 && (
              <div className="my-3 border-t border-sidebar-border" />
            )}
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <Link
          to="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
          title={collapsed ? 'Paramètres' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card text-card-foreground shadow-sm hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}
