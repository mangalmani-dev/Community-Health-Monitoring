import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Activity, Home } from 'lucide-react';

export function NotFoundPage() {
  const { user } = useAuth();
  const homePath = user?.role === ROLES.DMO ? '/dmo/overview' : '/hospital/entry';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Surveillance Resource Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The requested health platform route does not exist or has been relocated within the network.
      </p>
      <Link to={homePath}>
        <Button variant="navy" icon={Home}>Return to Portal Home</Button>
      </Link>
    </div>
  );
}

