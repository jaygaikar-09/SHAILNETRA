import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mountain, ShieldAlert, LineChart, BellRing } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/digital-twin', label: 'Twin', icon: Mountain },
  { to: '/zones', label: 'Zones', icon: ShieldAlert },
  { to: '/analytics', label: 'Trends', icon: LineChart },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-base-900/95 border-t border-line backdrop-blur-sm flex items-center justify-around z-20">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono ${
              isActive ? 'text-ochre-400' : 'text-ink-500'
            }`
          }
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
