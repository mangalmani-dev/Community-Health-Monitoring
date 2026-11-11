import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <HealthDataProvider>
            <AppRoutes />
          </HealthDataProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
