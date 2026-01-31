# Hold.ai — Tasks de Desenvolvimento

> Última atualização: 27/01/2026

---

## v0.7 — "Brutal Value" ✅ COMPLETA

**Objetivo**: Entregar o valor principal com brutalidade. Nada além do essencial.

### Resumo Automático (P1) ✅
- [x] API endpoint `/api/summary` para gerar resumo via Gemini
- [x] Framework HOLD aplicado automaticamente no resumo
- [x] UI modal exibida ao encerrar reunião
- [x] Exportar resumo como Markdown (.md)
- [x] Botão "Copiar" para clipboard

### Banco de Decisões (P2) ✅
- [x] Coleção Firestore `decisions`
- [x] Extração automática de decisões do resumo via IA
- [x] Dashboard com contador: "X decisões no Hold"
- [x] Lista de decisões filtráveis (todas, pendentes, decididas, revisitadas)
- [x] Ações: marcar acerto/erro, excluir
- [x] Botão de acesso no header do chat

### Analytics (P3) — Adiado ⏸️
> **Decisão**: Removido Posthog para simplificar o MVP.
> Quando precisar, usar Firebase Analytics (já tem Firebase configurado).

---

## v0.8 — "Retention Engine" ✅ CONCLUÍDA

**Objetivo**: Estrutura mental invisível + lock-in irresistível.

### Método HOLD (Invisível) ✅
- [x] IA estrutura a reunião naturalmente usando HOLD
- [x] Resumo mostra as 4 dimensões preenchidas (H, O, L, D)
- [x] Usuário percebe estrutura DEPOIS, não antes

### Dashboard de Decisões Reforçado ✅
- [x] Contador grande: "327 decisões tomadas no Hold"
- [x] Estatísticas de decididas/pendentes/revisitadas
- [x] Copy: "Não perca seu histórico de raciocínio"
- [ ] Timeline visual das últimas decisões (nice-to-have)
- [ ] Alerta quando usuário não decide há X dias (nice-to-have)

### Templates de Reunião ✅
- [x] Template: "Validação de Ideia"
- [x] Template: "Decisão de Pricing"
- [x] Template: "Pivô ou Perseverança"
- [x] Template: "Priorização de Features"
- [x] Template: "Go-to-Market"
- [x] Template: "Problem-Solution Fit"
- [x] TemplatePicker com categorias e personalização

### Multi-projeto ✅
- [x] Múltiplos contextos de negócio
- [x] Switch rápido entre projetos (ProjectSwitcher na sidebar)
- [x] ProjectManager: criar, editar, excluir e ativar projetos
- [ ] Disponível em Founder e Pro apenas (quando paywall for implementado)

### Insights Marcantes ⏸️ ADIADO
- [ ] Marcar trechos importantes durante reunião
- [ ] Salvos para consulta futura
- *Movido para versões futuras*

---

## v0.9 — "Growth Flywheel" ⏸️ ADIADO

**Objetivo**: Viralização e aquisição orgânica.
*Versão adiada para implementação futura*

### Compartilhamento de Resumo
- [ ] Link público para resumo de reunião
- [ ] "Powered by hold.ai" com CTA
- [ ] OG tags para preview no LinkedIn/Twitter

### Public Templates
- [ ] Usuários podem publicar templates próprios
- [ ] Galeria de templates da comunidade
- [ ] Crédito ao criador

### Referral Program
- [ ] "Convide um amigo, ganhe 1 mês Founder"
- [ ] Link único de referral
- [ ] Dashboard de convites

### Testimonials Automatizados
- [ ] Pedir review após 5ª reunião
- [ ] Coletar NPS
- [ ] Social proof para landing page

---

## v1.0 — "Scale Ready" � EM PROGRESSO

**Objetivo**: Produto pronto para escalar com monetização.

### 1. Dashboard de Métricas Pessoais ✅
- [x] Reuniões realizadas (total + por período)
- [x] Decisões tomadas (total + taxa de conclusão)
- [x] Streak de consistência (dias seguidos usando)
- [x] Gráficos visuais de progresso

### 2. Autenticação Completa ✅
- [x] Firebase Auth com Email/Senha
- [x] Firebase Auth com Google (continuar com Google)
- [x] Sincronização: mesmo email pode logar de ambas formas
- [x] Proteção de rotas (redirect se não autenticado)
- [x] Fluxo de cadastro com Google: completar informações adicionais
- [x] Persistência de sessão

### 3. Onboarding Guiado ✅
- [x] Tutorial interativo passo-a-passo
- [x] "Complete seu perfil" checklist
- [x] Primeira reunião assistida (sugestões automáticas) - via tutorial
- [x] Início após primeiro login com cadastro completo

### Stripe Integration ⏸️ ADIADO
- [ ] Checkout simples
- [ ] Planos: Free / Founder ($29) / Pro ($79)
- [ ] Webhook para ativar/desativar features

### Paywall Inteligente ⏸️ ADIADO
- [ ] Limites por plano (reuniões, personas, projetos)
- [ ] Upgrade prompts contextuais

### Landing Page Completa ⏸️ ADIADO
- [ ] Headline + vídeo demo + pricing
- [ ] Comparativo de planos
- [ ] CTA para signup
- [ ] Social proof

---

## Features Adiadas (v1.1+)

| Feature | Versão | Justificativa |
|---------|--------|---------------|
| Multi-usuário / Team | v1.1 | Requer infra complexa |
| Rituais agendados | v1.2 | Nice-to-have para retenção |
| UX Premium redesign | v1.2 | Polimento pós-tração |
| Colaboração real-time | v1.3 | Requer infra complexa |
| Perguntas poderosas automáticas | v1.1 | Melhoria incremental |
| Checklist de vieses | v1.2 | Feature avançada |
| Avatares animados | v1.3 | Estético, não essencial |
| PWA / Mobile | v1.2 | Depois de validar web |
| Email marketing / retenção | v1.1 | Após validar core |

---

## Progresso Geral

```
v0.7  ████████████████████ 100% ✅
v0.8  ░░░░░░░░░░░░░░░░░░░░   0%
v0.9  ░░░░░░░░░░░░░░░░░░░░   0%
v1.0  ░░░░░░░░░░░░░░░░░░░░   0%
```

**Meta**: v1.0 monetizável em 7-10 semanas
