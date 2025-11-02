import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 mt-12 py-6 border-t border-slate-700">
      <div className="container mx-auto px-4 text-center text-slate-400">
        <p>&copy; {new Date().getFullYear()} Meu Visto Fácil. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Desenvolvido com IA. Sempre verifique as informações com fontes oficiais do governo.</p>
      </div>
    </footer>
  );
};
