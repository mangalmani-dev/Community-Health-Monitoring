import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  DMO: 'dmo',
  HOSPITAL: 'hospital'
};

export const DEMO_USERS = {
  [ROLES.DMO]: {
    id: 'user-dmo-01',
    name: 'Dr. Ananya Sharma',
    email: 'dmo.district@health.gov.in',
    role: ROLES.DMO,
    title: 'District Medical Officer',
    badge: 'District HQ Administration',
    jurisdiction: 'Kaveri District Health Division',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  },
  [ROLES.HOSPITAL]: {
    id: 'user-hosp-042',
    name: 'Dr. Rajesh Varma',
    email: 'incharge@citygeneral.gov.in',
    role: ROLES.HOSPITAL,
    title: 'Medical Superintendent',
    badge: 'Civil Hospital Unit',
    facilityName: 'City General Civil Hospital (Zone 1)',
    facilityCode: 'CGH-KA-042',
    district: 'Kaveri District',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('schm_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS[ROLES.DMO];
      }
    }
    // Default to DMO demo user on initial load
    return DEMO_USERS[ROLES.DMO];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('schm_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('schm_auth_user');
    }
  }, [currentUser]);

  const login = (role) => {
    const selected = DEMO_USERS[role] || DEMO_USERS[ROLES.DMO];
    setCurrentUser(selected);
    return selected;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole) => {
    const targetUser = DEMO_USERS[newRole];
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const isDMO = currentUser?.role === ROLES.DMO;
  const isHospital = currentUser?.role === ROLES.HOSPITAL;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated: !!currentUser,
        isDMO,
        isHospital,
        login,
        logout,
        switchRole,
        roles: ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

