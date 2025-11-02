# Meu Visto Fácil

Aplicação web em React + Vite para gerar checklists de imigração personalizados, com autenticação via Firebase, persistência no Firestore e integração com Google AI (Gemini) para:
- Sugerir tipos de visto por país
- Resumir informações do visto selecionado (priorizando fontes oficiais)
- Gerar checklist detalhado com links oficiais

---

## Requisitos

- Node.js 18+
- npm 9+
- Conta Firebase com Authentication e Firestore habilitados
- (Opcional/Produção) Conta Vercel/Firebase Hosting/Netlify/Cloudflare para deploy

---

## Como rodar localmente

1. Instale dependências
```bash
npm install
