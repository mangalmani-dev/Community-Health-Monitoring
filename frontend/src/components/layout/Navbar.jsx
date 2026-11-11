import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { Activity, Bell, LogOut, Menu, Shield, Building2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-900 via-navy-800 to-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-sm md:text-base">
                Smart Community Health
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                Surveillance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Integrated Disease Surveillance & Hospital Reporting
            </p>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher */}
        <RoleSwitcher />

        {/* Live Notification Indicator */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="hidden xl:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              {user?.role === ROLES.DMO ? (
                <Shield className="w-3 h-3 text-navy-700 inline" />
              ) : (
                <Building2 className="w-3 h-3 text-teal-600 inline" />
              )}
              <span>{user?.title}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

