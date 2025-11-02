import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ErrorDisplay } from '../components/ErrorDisplay';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await register(email, password);
            navigate('/checklists');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso por outra conta.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-center text-slate-50 mb-6">Criar Nova Conta</h2>
                {error && <ErrorDisplay message={error} />}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-slate-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email-register"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="mt-1 w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-700 text-slate-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-slate-300">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password-register"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crie uma senha forte (mín. 6 caracteres)"
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
                            {isLoading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm text-slate-400">
                    Já tem uma conta? <Link to="/login" className="font-medium text-sky-500 hover:text-sky-400">Faça login</Link>.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;