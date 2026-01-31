# 📊 Análise do Sistema Existente — HoldAI

> Análise do código existente e o que será reutilizado/adaptado.
> **Data:** 30/01/2026 | **Status:** Atualizado

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # ✅ Adaptar para sessões
│   │   ├── meeting/       # ✅ Adaptar para Mesa
│   │   └── summary/       # ✅ Adaptar para síntese
│   ├── globals.css        # ✅ Expandir com tokens
│   ├── layout.tsx         # ✅ Manter
│   └── page.tsx           # ✅ Adaptar
├── components/ (26 arquivos)
├── contexts/
│   ├── AuthContext.tsx    # ✅ Manter
│   └── ThemeContext.tsx   # ✅ Manter
├── lib/
│   ├── auth.ts            # ✅ Manter
│   ├── conversations.ts   # ✅ Adaptar para sessions
│   ├── decisions.ts       # ✅ Expandir schema
│   ├── firebase.ts        # ✅ Manter
│   ├── meetings.ts        # ✅ Adaptar
│   ├── personas.ts        # ✅ Adaptar + defaults
│   └── projects.ts        # ⚠️ Avaliar necessidade
└── types/
    ├── index.ts           # ✅ Expandir
    ├── models.ts          # ✅ Manter
    ├── project.ts         # ⚠️ Avaliar
    └── templates.ts       # ⚠️ Avaliar
```

---

## ✅ REUTILIZAR (manter como está)

| Componente | Arquivo | Motivo |
|------------|---------|--------|
| Auth Page | `AuthPage.tsx` | Login/signup funciona |
| Auth Guard | `AuthGuard.tsx` | Proteção de rotas funciona |
| Auth Context | `AuthContext.tsx` | Estado de auth funciona |
| Theme Toggle | `ThemeToggle.tsx` | Dark mode funciona |
| Theme Context | `ThemeContext.tsx` | Estado de tema funciona |
| Confirm Modal | `ConfirmModal.tsx` | Modal reutilizável |
| Password Input | `PasswordInput.tsx` | Input reutilizável |
| Providers | `Providers.tsx` | Wrapper funciona |
| Firebase | `firebase.ts` | Configuração funciona |
| Auth Service | `auth.ts` | Funções funcionam |

---

## 🔄 ADAPTAR (manter e modificar)

| Componente | Arquivo | Adaptação |
|------------|---------|-----------|
| Meeting Room | `MeetingRoom.tsx` (905 linhas) | → "Mesa de Conselheiros" |
| Persona Manager | `PersonaManager.tsx` (296 linhas) | → Gerenciar conselheiros |
| Persona Form | `PersonaForm.tsx` (316 linhas) | → Edição de conselheiros |
| Chat Interface | `ChatInterface.tsx` (584 linhas) | → Interface de sessão |
| Sidebar | `Sidebar.tsx` (421 linhas) | → Simplificar |
| Onboarding | `Onboarding.tsx` (267 linhas) | → Ultra premium |
| Decisions Dashboard | `DecisionsDashboard.tsx` | → Expandir para banco |
| Conversations | `conversations.ts` | → Sessions |
| Decisions | `decisions.ts` | → Expandir schema |
| Personas | `personas.ts` | → Adicionar defaults |

---

## ⚠️ AVALIAR (decidir se mantém)

| Componente | Arquivo | Questão |
|------------|---------|---------|
| Meeting Setup | `MeetingSetup.tsx` | Substituído por Portal? |
| Meeting Summary | `MeetingSummary.tsx` | Integrar com Fase L? |
| Meeting Viewer | `MeetingViewer.tsx` | Necessário? |
| Model Selector | `ModelSelector.tsx` | Esconder no MVP? |
| Metrics Dashboard | `MetricsDashboard.tsx` | Pós-MVP? |
| Project Manager | `ProjectManager.tsx` | Pós-MVP? |
| Project Switcher | `ProjectSwitcher.tsx` | Pós-MVP? |
| Project Context | `ProjectContextCard.tsx` | Pós-MVP? |
| Template Picker | `TemplatePicker.tsx` | Pós-MVP? |
| Edit Profile Modal | `EditProfileModal.tsx` | Simplificar? |
| Settings Modal | `SettingsModal.tsx` | Simplificar? |

---

## 📐 NOVO (criar do zero)

| Item | Descrição |
|------|-----------|
| `defaultPersonas.ts` | 5 personas pré-definidas com prompts completos |
| `sessions.ts` | Service para sessões HOLD |
| Portal Component | Seleção de modo (Solo/Mesa/Revisão) |
| Counselor Selector | UI para escolher conselheiros |
| Session Interface | Interface de chat com indicadores de fase |
| Phase H Logic | Lógica de clarificação com Moderador |
| Phase O Logic | Lógica de debate |
| Phase L Logic | Lógica de síntese e decisão |
| Phase D Logic | Lógica de ação e encerramento |

---

## 📊 Resumo Quantitativo

| Categoria | Quantidade |
|-----------|------------|
| Componentes **manter** | 10 |
| Componentes **adaptar** | 10 |
| Componentes **avaliar** | 11 |
| Services **manter** | 2 |
| Services **adaptar** | 4 |
| **Criar novo** | ~9 |

---

## 🎯 Plano de Ação

### Fase 01 (Limpeza)
1. Revisar cada componente "avaliar"
2. Decidir: manter para pós-MVP ou remover
3. Não deletar — apenas esconder da UI

### Fase 02+ (Implementação)
1. Adaptar componentes existentes incrementalmente
2. Criar novos componentes conforme necessário
3. Testar a cada adaptação

---

## ✅ Conclusão

O sistema existente é **70% aproveitável** para o MVP:
- Stack completa funciona (Next.js, React, Firebase, Gemini)
- Auth está pronta
- Conceito de personas/meetings existe (só adaptar)
- Design system base existe (só expandir tokens)

**Estratégia:** Refatoração progressiva, não rewrite completo.

---

> **Última atualização:** 30/01/2026
