# Especificação de Design Visual e UX - Planning Poker

## 1. Visão Geral

Este documento descreve as diretrizes de design visual e experiência do usuário (UX) para a aplicação Planning Poker. O objetivo é criar uma interface limpa, moderna, intuitiva e responsiva, garantindo uma boa experiência tanto em desktops quanto em dispositivos móveis.

## 2. Paleta de Cores

-   **Primária:** `#A86EFF` (Roxo Vibrante)
    -   Uso: Botões principais, links, indicadores de seleção, títulos importantes, ícones ativos.
-   **Secundária:** `#FFFFFF` (Branco)
    -   Uso: Fundo principal da aplicação, texto sobre fundos escuros/primários, fundos de cards/seções.
-   **Complementar/Fundo:** `#F8F9FA` (Cinza Muito Claro)
    -   Uso: Fundo de seções alternativas para contraste sutil, background de inputs desabilitados.
-   **Texto Principal:** `#212529` (Cinza Muito Escuro/Quase Preto)
    -   Uso: Corpo de texto principal, labels.
-   **Texto Secundário/Labels:** `#6C757D` (Cinza Médio)
    -   Uso: Textos de apoio, placeholders, informações menos importantes.
-   **Bordas/Divisores:** `#DEE2E6` (Cinza Claro)
    -   Uso: Bordas de inputs, cards, divisores de seção.
-   **Status - Sucesso/Online:** `#28A745` (Verde)
    -   Uso: Indicador de conexão online, mensagens de sucesso.
-   **Status - Alerta/Votado:** `#FFC107` (Amarelo/Âmbar)
    -   Uso: Indicador de "Voto Enviado" (alternativa ao checkmark), mensagens de alerta.
-   **Status - Erro:** `#DC3545` (Vermelho)
    -   Uso: Mensagens de erro.

## 3. Tipografia

-   **Fonte Principal:** Sans-serif limpa e legível (Ex: 'Roboto', 'Lato', 'Open Sans' - a ser definida e importada via Google Fonts ou similar).
-   **Tamanhos:**
    -   Título Principal (h1): `2rem` (32px), `font-weight: 600`
    -   Títulos de Seção (h2): `1.75rem` (28px), `font-weight: 600`
    -   Subtítulos (h3): `1.5rem` (24px), `font-weight: 500`
    -   Corpo de Texto/Padrão: `1rem` (16px), `font-weight: 400`
    -   Texto Pequeno/Labels: `0.875rem` (14px), `font-weight: 400`
-   **Espaçamento:** Usar espaçamento consistente (margens, paddings) baseado em múltiplos de `0.25rem` (4px) ou `0.5rem` (8px) para criar um ritmo visual agradável.

## 4. Layout e Responsividade

-   **Abordagem:** Mobile-first. O design deve funcionar bem em telas pequenas e se adaptar a telas maiores.
-   **Containers:** Usar containers com `max-width` (ex: `1140px`, `960px`) em telas maiores para evitar que o conteúdo se estique demais. Centralizar os containers.
-   **Layout Flexível:** Utilizar Flexbox e CSS Grid extensivamente para criar layouts que se ajustam automaticamente.
    -   **Telas Pequenas (< 768px):** Seções como "Área de Votação" e "Lista de Jogadores" devem empilhar verticalmente (`flex-direction: column`). Cards de votação podem quebrar em múltiplas linhas. Botões devem ter largura total ou serem facilmente clicáveis.
    -   **Telas Médias/Grandes (>= 768px):** Seções podem ficar lado a lado (`flex-direction: row`). Manter boa legibilidade e espaçamento.
-   **Espaçamento:** Garantir `padding` adequado ao redor dos elementos e seções para evitar que toquem as bordas da tela em dispositivos móveis.

## 5. Componentes Chave

-   **Botões:**
    -   Principal: Fundo `#A86EFF`, texto `#FFFFFF`. Cantos arredondados (`4px` a `8px`). Efeito `hover` sutil (leve escurecimento/clareamento).
    -   Secundário/Alternativo: Fundo `#FFFFFF`, borda `1px solid #A86EFF`, texto `#A86EFF`.
    -   Desabilitado: Fundo `#E9ECEF` (Cinza Claro), texto `#6C757D`.
    -   Tamanho: `Padding` adequado para boa área de clique (`0.5rem 1rem`).
-   **Inputs e Selects:**
    -   Borda `1px solid #DEE2E6`. Cantos arredondados (`4px`).
    -   `Padding` interno (`0.5rem`).
    -   Estado `:focus`: Borda com a cor primária `#A86EFF` e/ou `box-shadow` sutil.
    -   Labels claras acima ou ao lado do campo.
-   **Cards de Votação:**
    -   Fundo `#FFFFFF`, borda `1px solid #DEE2E6`. Cantos arredondados (`4px` a `8px`). `box-shadow` sutil no hover.
    -   Estado Selecionado: Borda ou fundo destacado com a cor primária `#A86EFF`.
    -   Estado Revelado: Mostrar o voto claramente. Se for o voto do próprio usuário, talvez um destaque extra.
    -   Tamanho: Facilmente clicável/tocável em telas móveis.
-   **Lista de Jogadores:**
    -   Layout limpo, talvez cards individuais ou itens de lista com `padding`.
    -   Separadores sutis (`border-bottom`).
    -   Indicador de Conexão: Ponto verde (`#28A745`) visível.
    -   Indicador de Moderador: Ícone 👑 claro e bem posicionado.
    -   Indicador de "Votou": Checkmark (✅) ou indicador Amarelo (`#FFC107`).
    -   Jogador Atual: Leve destaque (ex: `font-weight: bold` ou fundo sutil `#F8F9FA`).
-   **Sumário de Resultados:**
    -   Hierarquia visual clara usando tamanhos de fonte.
    -   Métricas bem espaçadas.
    -   Pode ter um fundo sutil (`#F8F9FA`) ou borda para se destacar.

## 6. Experiência Geral

-   **Feedback Visual:** Ações do usuário (clicar em botão, votar) devem ter feedback imediato (mudança de estado do botão, indicador de "Voto Enviado").
-   **Transições:** Usar transições CSS sutis para mudanças de estado (ex: hover de botão, revelação de votos) para tornar a interface mais fluida (evitar excessos).
-   **Clareza:** A informação mais importante deve ser facilmente identificável. Evitar poluição visual.
-   **Acessibilidade:** Considerar contraste de cores adequado para texto e elementos interativos. Usar atributos ARIA quando apropriado (embora fora do escopo principal desta especificação visual).
