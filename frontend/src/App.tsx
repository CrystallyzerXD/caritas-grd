import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { PageSpinner } from './components/common/Spinner';

// Pages
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const IncidentList = lazy(() => import('./pages/incidents/IncidentList').then((m) => ({ default: m.IncidentList })));
const IncidentDetail = lazy(() => import('./pages/incidents/IncidentDetail').then((m) => ({ default: m.IncidentDetail })));
const IncidentForm = lazy(() => import('./pages/incidents/IncidentForm').then((m) => ({ default: m.IncidentForm })));
const EnvironmentalList = lazy(() => import('./pages/environmental/EnvironmentalList').then((m) => ({ default: m.EnvironmentalList })));
const EnvironmentalForm = lazy(() => import('./pages/environmental/EnvironmentalForm').then((m) => ({ default: m.EnvironmentalForm })));
const Reports = lazy(() => import('./pages/reports/Reports').then((m) => ({ default: m.Reports })));
const Users = lazy(() => import('./pages/admin/Users').then((m) => ({ default: m.Users })));
const Catalogs = lazy(() => import('./pages/admin/Catalogs').then((m) => ({ default: m.Catalogs })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected - all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/incidents" element={<IncidentList />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>

            {/* Protected - brigadista and above */}
            <Route element={<ProtectedRoute requireBrigadista />}>
              <Route element={<Layout />}>
                <Route path="/incidents/new" element={<IncidentForm />} />
                <Route path="/incidents/:id/edit" element={<IncidentForm />} />
                <Route path="/environmental" element={<EnvironmentalList />} />
                <Route path="/environmental/new" element={<EnvironmentalForm />} />
                <Route path="/environmental/:id" element={<EnvironmentalForm />} />
              </Route>
            </Route>

            {/* Protected - admin only */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route element={<Layout />}>
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/catalogs" element={<Catalogs />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            },
            iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            },
            iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
