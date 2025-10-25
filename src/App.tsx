import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { LandingPage } from './features/landing/LandingPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './features/users/DashboardPage';
import { UsersPage } from './features/users/UsersPage';
import { RolesPage } from './features/roles/RolesPage';
import { PermissionsPage } from './features/permissions/PermissionsPage';
import { AIPage } from './features/ai/AIPage';
import { HubboChat } from './features/chat/HubboChat';
import { FilesPage } from './features/files/FilesPage';
import { IdeasPage } from './features/ideas/IdeasPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { ProjectProgressPage } from './features/projects/ProjectProgressPage';
import { TasksPage } from './features/tasks/TasksPage';
import { ExperimentsPage } from './features/experiments/ExperimentsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="ideas" element={<IdeasPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId/progress" element={<ProjectProgressPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="experiments" element={<ExperimentsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="ai" element={<AIPage />} />
              <Route path="guru" element={<HubboChat />} />
              <Route path="files" element={<FilesPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
