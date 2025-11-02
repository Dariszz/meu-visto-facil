import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            ✈️ Meu Visto Fácil
          </Link>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/checklists/new"
                  className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-sky-400' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  Novo Checklist
                </NavLink>
                <NavLink
                  to="/checklists"
                  className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-sky-400' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  Meus Checklists
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-300 hover:text-slate-100"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-sky-400' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  Entrar
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md"
                >
                  Criar Conta
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
