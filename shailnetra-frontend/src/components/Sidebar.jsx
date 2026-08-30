import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mountain, ShieldAlert, LineChart, BellRing, SlidersHorizontal } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/digital-twin', label: 'Digital Twin', icon: Mountain },
  { to: '/zones', label: 'Zone Risk', icon: ShieldAlert },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/simulate', label: 'Simulate Input', icon: SlidersHorizontal },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-line bg-base-900/60">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-ochre-500/15 ring-1 ring-ochre-500/30 flex items-center justify-center">
            <Mountain className="h-4 w-4 text-ochre-400" strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-display font-semibold text-sm leading-none tracking-wide">SHAILNETRA</p>
            <p className="text-[10px] font-mono text-ink-500 mt-1 tracking-wide">ROCKFALL WATCH</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-ochre-500/10 text-ochre-400 ring-1 ring-ochre-500/25'
                  : 'text-ink-300 hover:text-ink-100 hover:bg-base-700/60'
              }`
            }
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-line">
        <p className="text-[10px] font-mono text-ink-700 leading-relaxed">
          VIT BHOPAL · SIH26
          <br />
          TEAM VITBSIH26-100
        </p>
      </div>
    </aside>
  );
}
