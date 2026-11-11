import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, ArrowLeftRight } from 'lucide-react';

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (newRole) => {
    switchRole(newRole);
    if (newRole === ROLES.DMO) {
      navigate('/dmo/overview');
    } else {
      navigate('/hospital/entry');
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs font-medium">
      <span className="text-slate-500 pl-1.5 flex items-center gap-1">
        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Role:</span>
      </span>

      <button
        type="button"
        onClick={() => handleSwitch(ROLES.DMO)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
          user?.role === ROLES.DMO
            ? 'bg-navy-900 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span>DMO Officer</span>
      </button>

      <button
        type="button"
        onClick={() => handleSwitch(ROLES.HOSPITAL)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
          user?.role === ROLES.HOSPITAL
            ? 'bg-teal-700 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <Building2 className="w-3.5 h-3.5 text-teal-200" />
        <span>Hospital User</span>
      </button>
    </div>
  );
}

