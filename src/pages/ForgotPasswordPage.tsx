import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ErrorDisplay } from '../components/ErrorDisplay';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            await resetPassword(email);
            setMessage('Se existir uma conta com este email, um link para redefinir a senha foi enviado.');
        } catch (err: any) {
            setError('Ocorreu um erro ao tentar enviar o email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-center text-slate-50 mb-6">Recuperar Senha</h2>
                {error && <ErrorDisplay message={error} />}
                {message && (
                    <div className="bg-emerald-900/20 border border-emerald-700 text-emerald-300 p-4 rounded-md my-4">
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email-forgot" className="block text-sm font-medium text-slate-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email-forgot"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
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
                            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm text-slate-400">
                    Lembrou da senha? <Link to="/login" className="font-medium text-sky-500 hover:text-sky-400">Faça login</Link>.
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
