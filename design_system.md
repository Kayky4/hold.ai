# 🎨 DESIGN SYSTEM — HOLDAI

> Documento de referência para implementação visual da plataforma.
> **Regra de Ouro:** NUNCA use valores arbitrários. SEMPRE use os tokens semânticos.

---

## 📋 Visão Geral

| Atributo | Valor |
|----------|-------|
| **Nome** | HoldAI |
| **Propósito** | Decision Intelligence Platform para founders solo |
| **Público** | Founders que tomam decisões estratégicas |
| **Filosofia** | Confronto, Rigor, Clareza |
| **Approach** | Mobile-first |

### Direção Estética

| Aspecto | Definição |
|---------|-----------|
| **Nome** | Industrial Minimal / Strategic Severity |
| **Inspiração** | Terminal financeiro + War room + Consultoria premium |
| **Sensação** | "Isto é sério. Foi feito para quem pensa antes de agir." |
| **Diferenciador** | Fricção intencional, sem gamificação, sem confetti |

---

# 🎨 CORES

## Paleta de Valores

```css
:root {
  /* === NEUTRALS (Slate) === */
  --slate-50: #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;
  
  /* === CONFRONTO (Violet) === */
  --violet-400: #A78BFA;
  --violet-500: #8B5CF6;
  --violet-600: #7C3AED;
  --violet-950: #2E1065;
  
  /* === STATUS === */
  --green-600: #059669;
  --amber-600: #D97706;
  --red-600: #DC2626;
}
```

---

## Tokens Semânticos — Light Mode

### Texto

| Token | Valor | Uso |
|-------|-------|-----|
| `text-primary` | `slate-900` | Títulos, texto importante |
| `text-secondary` | `slate-600` | Legendas, descrições |
| `text-muted` | `slate-400` | Placeholders, hints, desabilitado |
| `text-on-dark` | `slate-50` | Texto sobre fundos escuros |
| `text-on-brand` | `#FFFFFF` | Texto sobre cor primária |

### Superfícies (Fundos)

| Token | Valor | Uso |
|-------|-------|-----|
| `surface-page` | `#FAFBFC` | Fundo principal da página |
| `surface-section` | `slate-100` | Seções alternadas |
| `surface-card` | `#FFFFFF` | Fundo de cards |
| `surface-subtle` | `slate-50` | Áreas de destaque leve |
| `surface-elevated` | `#FFFFFF` | Elementos elevados (modais) |

### Ações (Botões, Links)

| Token | Valor | Uso |
|-------|-------|-----|
| `action-primary` | `slate-800` | Botões principais — sobriedade |
| `action-primary-hover` | `slate-700` | Hover |
| `action-primary-active` | `slate-900` | Pressed |
| `action-secondary` | `slate-100` | Botões secundários |
| `action-secondary-hover` | `slate-200` | Hover |
| `action-strong` | `slate-900` | CTAs máximos |
| `action-strong-hover` | `slate-800` | Hover |

### Bordas

| Token | Valor | Uso |
|-------|-------|-----|
| `border-default` | `slate-200` | Bordas padrão |
| `border-subtle` | `slate-100` | Bordas muito sutis |
| `border-focus` | `slate-600` | Focus ring |

### Status

| Token | Valor | Uso |
|-------|-------|-----|
| `status-success` | `green-600` | Confirmação sóbria |
| `status-warning` | `amber-600` | Alertas, atenção |
| `status-error` | `red-600` | Erros, problemas |

### Confronto

| Token | Valor | Uso |
|-------|-------|-----|
| `confrontation` | `violet-600` | Tensão sem agressão |
| `confrontation-subtle` | `#EDE9FE` | Background confronto |
| `confrontation-text` | `violet-600` | Texto de confronto |

---

## Tokens Semânticos — Dark Mode

```css
[data-theme="dark"] {
  --text-primary: var(--slate-50);
  --text-secondary: var(--slate-400);
  --text-muted: var(--slate-500);
  --text-on-dark: var(--slate-900);
  --text-on-brand: var(--slate-900);
  
  --surface-page: var(--slate-900);
  --surface-section: var(--slate-800);
  --surface-card: var(--slate-800);
  --surface-subtle: var(--slate-700);
  --surface-elevated: var(--slate-700);
  
  --action-primary: var(--slate-200);
  --action-primary-hover: var(--slate-100);
  --action-primary-active: #FFFFFF;
  --action-secondary: var(--slate-700);
  --action-secondary-hover: var(--slate-600);
  
  --border-default: var(--slate-700);
  --border-subtle: var(--slate-800);
  --border-focus: var(--slate-400);
  
  --confrontation: var(--violet-400);
  --confrontation-subtle: var(--violet-950);
}
```

---

# 📏 ESPAÇAMENTO

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Mínimo, ícones inline |
| `space-2` | 8px | Gaps pequenos |
| `space-3` | 12px | Gaps médios internos |
| `space-4` | 16px | Padding padrão |
| `space-6` | 24px | Padding de cards |
| `space-8` | 32px | Gaps entre seções |
| `space-12` | 48px | Padding de seções |
| `space-16` | 64px | Padding vertical grande |
| `space-20` | 80px | Seções hero |

---

# 🔤 TIPOGRAFIA

## Font Stack

```css
--font-display: 'IBM Plex Mono', monospace;  /* Títulos — técnico, sério */
--font-body: 'Inter', system-ui, sans-serif; /* Corpo — legível, neutro */
```

> **Justificativa:** IBM Plex Mono comunica precisão/seriedade. Inter é altamente legível.

## Tamanhos

| Token | Valor | Uso |
|-------|-------|-----|
| `text-xs` | 12px | Badges, labels pequenos |
| `text-sm` | 14px | Texto secundário, captions |
| `text-base` | 16px | Corpo de texto |
| `text-lg` | 18px | Texto destacado |
| `text-xl` | 20px | Subtítulos |
| `text-2xl` | 24px | Títulos de cards |
| `text-3xl` | 30px | Títulos de seção |
| `text-4xl` | 36px | Títulos principais |
| `text-5xl` | 48px | Headlines hero |

## Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `font-normal` | 400 | Corpo |
| `font-medium` | 500 | Ênfase leve |
| `font-semibold` | 600 | Títulos, botões |
| `font-bold` | 700 | Headlines |

---

# 🔲 BORDAS E SOMBRAS

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Inputs, badges |
| `radius-md` | 8px | Botões |
| `radius-lg` | 12px | Cards pequenos |
| `radius-xl` | 16px | Cards grandes |
| `radius-2xl` | 24px | Cards hero |
| `radius-full` | 9999px | Avatares, pills |

## Sombras

| Token | Valor |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` |
| `shadow-card-hover` | `0 4px 6px rgba(0,0,0,0.1)` |
| `shadow-button-primary` | `0 1px 2px rgba(0,0,0,0.05)` |

---

# 🧩 COMPONENTES

## Botões

### Primary
```
bg: action-primary
text: text-on-brand
radius: radius-md
shadow: shadow-button-primary
font: font-semibold, text-sm
height: 44px (touch-friendly)
```

### Secondary
```
bg: surface-card
text: text-primary
border: border-default
radius: radius-md
font: font-medium, text-sm
height: 44px
```

### Strong (CTA)
```
bg: action-strong
text: text-on-dark
radius: radius-md
shadow: shadow-lg
font: font-bold, text-sm
height: 48px
```

### Estados
| Estado | Transformação |
|--------|--------------|
| Hover | bg → *-hover, shadow ↑ |
| Active | bg → *-active, scale(0.98) |
| Focus | ring: border-focus 2px |
| Disabled | opacity: 0.5, cursor: not-allowed |

---

## Cards

```
bg: surface-card
radius: radius-xl
shadow: shadow-card
padding: space-6
border: border-subtle (opcional)
```

### Estados
| Estado | Transformação |
|--------|--------------|
| Hover | shadow → shadow-card-hover, translateY(-2px) |
| Focus | ring: border-focus 2px |

---

## Inputs

```
bg: surface-card
border: border-default
radius: radius-sm
padding: space-3 space-4
font: text-base
height: 44px
```

### Estados
| Estado | Visual |
|--------|--------|
| Default | border-default |
| Hover | border-default darker |
| Focus | border-focus + ring |
| Error | border: status-error |
| Disabled | bg: surface-subtle, opacity: 0.6 |

---

## Modais

```
bg: surface-elevated
radius: radius-2xl
shadow: shadow-lg
padding: space-6
max-width: 480px (mobile: 100%)
```

---

## Mensagens de Confronto

```
bg: confrontation-subtle
border-left: 3px solid confrontation
padding: space-4
radius: radius-md
text: text-primary
```

---

# 🎭 PERSONALIDADE

## Tom de Voz

| Aspecto | Definição |
|---------|-----------|
| **Base** | Calma, firme, precisa |
| **Nunca** | Animada, entusiástica, casual |
| **Confronto** | Direto mas respeitoso |
| **Suporte** | Competência, não simpatia |

## Exemplos de Tom

| Situação | ❌ Errado | ✅ Correto |
|----------|----------|-----------|
| Início | "Oi! Vamos decidir algo?" | "Qual decisão você precisa tomar?" |
| Confronto | "Hmm, você tem certeza?" | "Essa premissa conflita com X." |
| Conclusão | "Ótimo! Você conseguiu!" | "Decisão registrada. Próxima ação definida." |
| Sucesso | Confetti + animação | Confirmação sóbria |
| Erro | "Oops! Algo deu errado!" | "Erro: [descrição]. Tente: [ação]." |

---

# ⚡ FRICÇÕES INTENCIONAIS

## Fricções Obrigatórias

| Fricção | Propósito |
|---------|-----------|
| Escolher modo antes de digitar | Força intenção consciente |
| Não pular etapas do HOLD | Garante processo completo |
| Definir próxima ação | Impede "decidir sem fazer" |
| Confronto em toda decisão | Impede validação automática |
| Perguntas de clarificação | Força lucidez antes de debater |

## Desaceleração Intencional

| Gatilho | Resposta |
|---------|----------|
| Muitas decisões rápidas | "Você tomou X decisões hoje. Todas eram estratégicas?" |
| Padrão de evasão | "Você tem mencionado Y sem decidir. Está evitando?" |
| Uso superficial | "Essa sessão não teve confronto real. Prefere recomeçar?" |

---

# ✅ ESTADOS OBRIGATÓRIOS

Todo componente interativo **DEVE** ter:

1. **Default** — Estado normal
2. **Hover** — Feedback visual ao passar mouse
3. **Active/Pressed** — Feedback ao clicar
4. **Focus** — Ring visível para acessibilidade
5. **Disabled** — Opacidade reduzida, cursor not-allowed

---

# 📱 RESPONSIVIDADE

## Breakpoints

| Token | Valor | Uso |
|-------|-------|-----|
| `mobile` | < 640px | Mobile-first (default) |
| `tablet` | ≥ 768px | Tablets |
| `desktop` | ≥ 1024px | Desktop |
| `wide` | ≥ 1280px | Wide screens |

## Container

```css
max-width: 1280px;
padding-inline: space-4; /* mobile */
padding-inline: space-6; /* tablet+ */
```

---

# ♿ ACESSIBILIDADE

## Requisitos Obrigatórios

- [x] Contraste mínimo: 4.5:1 (WCAG AA)
- [x] Touch targets: mínimo 44x44px
- [x] Focus visible em todos componentes interativos
- [x] `prefers-reduced-motion` respeitado
- [x] Labels em todos os inputs

---

# 🎬 ANIMAÇÕES

## Durações

| Token | Valor | Uso |
|-------|-------|-----|
| `duration-fast` | 150ms | Hovers, toggles |
| `duration-normal` | 200ms | Transições padrão |
| `duration-slow` | 300ms | Modais, expansões |

## Easing

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# ❌ ANTI-PADRÕES

| ❌ Proibido | ✅ Use em vez |
|-------------|---------------|
| Valores arbitrários (16px, #3B82F6) | Tokens semânticos |
| Emojis como ícones | Lucide Icons |
| `alert()` / `confirm()` | Modais customizados |
| Hover-only interactions | Touch + Hover |
| Touch targets < 44px | Mínimo 44x44px |
| Fontes genéricas (Arial, Times) | IBM Plex Mono / Inter |
| Confetti / celebrações | Confirmação sóbria |
| "Ótimo!" / "Você conseguiu!" | Tom firme |

---

# ✅ CHECKLIST DE VERIFICAÇÃO

## Visual
- [ ] Usa apenas tokens semânticos
- [ ] Contraste ≥ 4.5:1
- [ ] Touch targets ≥ 44px
- [ ] Espaçamento consistente
- [ ] Tipografia seguindo escala

## Estados
- [ ] Todos os botões têm hover/active/focus
- [ ] Inputs têm focus ring visível
- [ ] Cards têm hover suave
- [ ] Estados de loading implementados
- [ ] Estados de erro diretos (sem "Oops!")

## Responsividade
- [ ] Mobile-first implementado
- [ ] Testado em 375px, 768px, 1280px
- [ ] Dark mode funcional

## Personalidade
- [ ] Tom de voz firme (não friendly)
- [ ] Sem celebrações/confetti
- [ ] Confronto sempre presente
- [ ] Fricções implementadas

---

> **Última atualização:** 30/01/2026
> 
> **Referência:** Este documento deve ser consultado ANTES de implementar qualquer componente visual.
