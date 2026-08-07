import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '~root/components/ProtectedRoute';
import { AppShell } from '~root/components/layout/AppShell';
import { LoginPage } from '~root/screens/auth/login/LoginPage';
import { RegisterPage } from '~root/screens/auth/register/RegisterPage';
import { AccessRemovedPage } from '~root/screens/auth/access-removed/AccessRemovedPage';
import { DashboardPage } from '~root/screens/dashboard/DashboardPage';
import { ProfilePage } from '~root/screens/profile/ProfilePage';
import { SettingsPage } from '~root/screens/settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/access-removed" element={<AccessRemovedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default App;
