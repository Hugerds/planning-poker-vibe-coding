# Prompt para Vibe Coding - Fase 4: Compartilhamento e Notificações (Full Stack)

**Objetivo:** Facilitar o convite de participantes para as salas implementando URLs únicas e QR Codes, e melhorar a experiência do usuário com notificações básicas no frontend.

**Contexto:**
*   **Stack:** Node.js/Express/Socket.io (Backend), Vue.js/Vuex/Socket.io-client (Frontend).
*   **Estado Atual:** Aplicação com backend e frontend funcionais, suportando decks e configurações básicas.
*   **Blueprint:** `c:\Projetos\planning-poker\planning-poker-blueprint.md` (QRCode.js mencionado, Fluxo de Entrada).
*   **Memórias:** URLs Únicas (`2d341c3c`), Validação de URL (`2d315de3`), Redirecionamento (`eb569290`), QR Codes (`98c25a2b`, `20ea066a`), Opções de Compartilhamento (`dc9318d3`), Notificações (`27fc69bd`).

**Funcionalidades Essenciais a Implementar:**

**Backend (`server/`):**
1.  **(Opcional/Simplificado):** Por enquanto, podemos simplificar. A URL de convite pode ser apenas a URL da sala (ex: `http://localhost:8080/room/UNIQUE_ROOM_ID`). Não precisamos implementar URLs *realmente* únicas ou com expiração nesta fase, a menos que seja trivial.

**Frontend (`client/`):**
1.  **Geração de Link:** Na tela da sala (`Room.vue`), adicione um botão "Convidar" (visível para todos ou só moderador?). Ao clicar, mostrar a URL completa da sala atual (ex: `window.location.href`).
2.  **Botão Copiar:** Adicione um botão para copiar a URL para a área de transferência.
3.  **Geração de QR Code:**
    *   Integre uma biblioteca de geração de QR Code (como `qrcode.vue` ou `vue-qrcode-reader` se precisar ler, mas aqui só gerar - `qrcode.js` como no blueprint ou uma lib Vue como `vue-qrcode`).
    *   No modal/painel de convite, gere e exiba um QR Code que contenha a URL da sala.
4.  **Notificações Simples:**
    *   Implemente um sistema de notificações toasts/snackbar simples no frontend (usando uma biblioteca como `vue-toastification` ou criando um componente básico).
    *   Mostre notificações para eventos chave recebidos do backend:
        *   `player_joined`: "Jogador [Nome] entrou na sala."
        *   `player_left`: "Jogador [Nome] saiu da sala."
        *   `round_started`: "Nova rodada iniciada!"
        *   `votes_revealed`: "Votos revelados!"
        *   Feedback ao copiar link: "Link copiado!"

**Não Incluir Nesta Fase:**
*   URLs com expiração, limite de uso ou rastreamento.
*   Validação complexa de URLs de convite.
*   Opções avançadas de compartilhamento (WhatsApp, Telegram, etc.).
*   Centro de notificações complexo ou configurações de notificação.
*   Notificações sonoras ou push.

**Resultado Esperado:** Usuários podem facilmente obter um link ou QR Code para convidar outros para a sala. O frontend fornece feedback visual básico sobre eventos importantes do jogo através de notificações simples.
