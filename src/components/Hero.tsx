import React from 'react';

export const Hero: React.FC = () => {
    return (
        <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-50 mb-4 tracking-tight">
                Planeje sua Mudança com Confiança
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
                Mudar para um novo país é complexo. Nossa ferramenta com IA gera um checklist de imigração personalizado para ajudar você a se manter organizado e no caminho certo. Apenas nos diga para onde você vai.
            </p>
        </div>
    );
};
