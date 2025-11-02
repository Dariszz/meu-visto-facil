import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import MyChecklistsPage from './pages/MyChecklistsPage';
import ViewChecklistPage from './pages/ViewChecklistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const location = useLocation();
  const hideFooterOnPages = ['/checklists/new', '/login', '/register', '/forgot-password'];

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col font-sans text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Public Route */}
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes */}
          <Route 
            path="/checklists/new" 
            element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} 
          />
          <Route 
            path="/checklists" 
            element={<ProtectedRoute><MyChecklistsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/checklists/:id" 
            element={<ProtectedRoute><ViewChecklistPage /></ProtectedRoute>} 
          />
        </Routes>
      </main>
      {!hideFooterOnPages.includes(location.pathname) && <Footer />}
    </div>
  );
};

export default App;
