import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES, DEMO_USERS } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Activity,
  Shield,
  Hospital,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
  Building2,
  Stethoscope
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.DMO);
  const [email, setEmail] = useState(DEMO_USERS[ROLES.DMO].email);
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
    setPassword('demo1234');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(selectedRole);
      addToast({
        title: 'Authentication Successful',
        message: `Signed in as ${DEMO_USERS[selectedRole].name} (${selectedRole === ROLES.DMO ? 'DMO' : 'Hospital User'})`,
        type: 'success',
      });

      if (selectedRole === ROLES.DMO) {
        navigate('/dmo/overview');
      } else {
        navigate('/hospital/entry');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Healthcare Platform Brand Badge */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-900 via-navy-800 to-teal-600 flex items-center justify-center text-white shadow-card ring-4 ring-teal-500/20">
            <Activity className="w-8 h-8 text-teal-300 animate-pulse" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Smart Community Health
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-600 font-medium">
          Public Health Surveillance & Hospital Incident Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-elevated rounded-2xl border border-slate-200/80">
          {/* Quick Demo Persona Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Select Portal Access Persona
              </label>
              <Badge variant="teal" size="sm">Mock Auth Active</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DMO Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect(ROLES.DMO)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === ROLES.DMO
                    ? 'border-navy-900 bg-navy-50/80 ring-2 ring-navy-900/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-900 text-teal-300 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    {selectedRole === ROLES.DMO && (
                      <CheckCircle2 className="w-4 h-4 text-navy-900" />
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    District Medical Officer
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    District Surveillance & Analytics
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-medium text-navy-700">
                  {DEMO_USERS[ROLES.DMO].name}
                </div>
              </button>

              {/* Hospital User Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect(ROLES.HOSPITAL)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === ROLES.HOSPITAL
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                      <Hospital className="w-4 h-4" />
                    </div>
                    {selectedRole === ROLES.HOSPITAL && (
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    Hospital User
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Daily Entry & Bulk File Uploads
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-medium text-teal-800">
                  {DEMO_USERS[ROLES.HOSPITAL].name}
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Government Email ID
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 bg-slate-50/50"
                  placeholder="name@health.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 bg-slate-50/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Security clearance level: Tier 2</span>
              <span className="text-teal-700 font-semibold cursor-pointer hover:underline">
                Portal Instructions
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant={selectedRole === ROLES.DMO ? 'navy' : 'primary'}
                className="w-full py-2.5 shadow-sm text-sm"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Authenticating...' : `Enter as ${selectedRole === ROLES.DMO ? 'District Medical Officer' : 'Hospital User'}`}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          {/* Footer Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Surveillance Network v1.0
            </span>
            <span>Secured & Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

