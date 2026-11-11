import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DmoOverviewPage } from '../pages/dmo/DmoOverviewPage';
import { DmoAnalyticsPage } from '../pages/dmo/DmoAnalyticsPage';
import { DmoTrendsPage } from '../pages/dmo/DmoTrendsPage';
import { DmoHospitalComparePage } from '../pages/dmo/DmoHospitalComparePage';
import { DmoGeoMapPage } from '../pages/dmo/DmoGeoMapPage';
import { DmoReportsPage } from '../pages/dmo/DmoReportsPage';

import { HospitalEntryPage } from '../pages/hospital/HospitalEntryPage';
import { HospitalUploadPage } from '../pages/hospital/HospitalUploadPage';
import { HospitalHistoryPage } from '../pages/hospital/HospitalHistoryPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // Root redirector based on authentication and active role
  const RootRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    return user.role === ROLES.DMO ? (
      <Navigate to="/dmo/overview" replace />
    ) : (
      <Navigate to="/hospital/entry" replace />
    );
  };

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Index Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* DMO Portal Routes */}
      <Route
        path="/dmo"
        element={
          <ProtectedRoute allowedRole={ROLES.DMO}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dmo/overview" replace />} />
        <Route path="overview" element={<DmoOverviewPage />} />
        <Route path="analytics" element={<DmoAnalyticsPage />} />
        <Route path="trends" element={<DmoTrendsPage />} />
        <Route path="hospitals" element={<DmoHospitalComparePage />} />
        <Route path="map" element={<DmoGeoMapPage />} />
        <Route path="reports" element={<DmoReportsPage />} />
      </Route>

      {/* Hospital Portal Routes */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRole={ROLES.HOSPITAL}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hospital/entry" replace />} />
        <Route path="entry" element={<HospitalEntryPage />} />
        <Route path="upload" element={<HospitalUploadPage />} />
        <Route path="history" element={<HospitalHistoryPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

