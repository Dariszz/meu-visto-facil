import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ErrorDisplay } from '../components/ErrorDisplay';


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/checklists');
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Email ou senha inválidos.');
            } else {
                setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-center text-slate-50 mb-6">Entrar na sua Conta</h2>
                {error && <ErrorDisplay message={error} />}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="mt-1 w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-700 text-slate-200"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Senha
                            </label>
                            <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-400">
                                Esqueceu sua senha?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            className="mt-1 w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-700 text-slate-200"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm text-slate-400">
                    Não tem uma conta? <Link to="/register" className="font-medium text-sky-500 hover:text-sky-400">Crie uma aqui</Link>.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;