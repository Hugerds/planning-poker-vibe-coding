# Prompt para Vibe Coding - Fase 2: Interface de Jogo e Interação (Vue.js Frontend)

**Objetivo:** Desenvolver a interface de usuário (UI) básica e a interação em tempo real para a aplicação Planning Poker, utilizando Vue.js e conectando-se ao backend Node.js/Socket.io criado na Fase 1.

**Contexto:**
*   **Stack:** Vue.js (Vue 3 recomendado), Vue Router, Vuex (ou Pinia), Socket.io-client, HTML5, CSS3.
*   **Backend:** Servidor Node.js/Socket.io funcional da Fase 1 (rodando localmente).
*   **Blueprint:** `c:\Projetos\planning-poker\planning-poker-blueprint.md` (seções 2, 3.1, 3.2, 4.1, 4.2, 5.1).

**Funcionalidades Essenciais a Implementar (Frontend - `client/` directory):**
1.  **Estrutura:** Crie a estrutura de diretórios para o cliente (`client/`) usando Vue CLI ou Vite (`src/`, `main.js`, `App.vue`, `components/`, `router/`, `store/`).
2.  **Roteamento:** Configure rotas básicas com Vue Router:
    *   `/`: Tela inicial para criar ou entrar em uma sala.
    *   `/room/:roomId`: Tela principal do jogo.
3.  **Gerenciamento de Estado:** Configure Vuex ou Pinia (`store/`) para gerenciar o estado global da aplicação (ID da sala, ID do jogador, estado do jogo recebido do backend).
4.  **Conexão Socket.io:** Implemente a lógica para conectar ao servidor Socket.io (`main.js` ou um serviço dedicado), emitir eventos e ouvir por atualizações (`update_room_state`, `player_joined`, `player_left`). Atualize o store Vuex/Pinia com os dados recebidos.
5.  **Componentes Visuais:** Crie os componentes Vue.js básicos:
    *   `Home.vue`: Formulário para criar sala (emite `create_room`) ou inserir ID/link para entrar (navega para `/room/:roomId`).
    *   `Room.vue`: Tela principal do jogo. Deve:
        *   Obter o `roomId` da URL.
        *   Pedir o nome do jogador e emitir `join_room`.
        *   Exibir a lista de jogadores (obtida do estado Vuex/Pinia).
        *   Exibir o status da rodada atual ('voting', 'revealed').
        *   Mostrar um deck de cartas padrão (ex: Fibonacci simples em `Deck.vue`).
        *   Permitir ao jogador selecionar uma carta e emitir `submit_vote`.
        *   Mostrar os votos de todos após o evento `reveal_votes` ser recebido.
        *   Mostrar botões para o moderador (iniciar rodada, revelar votos).
    *   `PlayerList.vue`: Componente para exibir a lista de jogadores e seus status (conectado, votou).
    *   `Deck.vue`: Componente para exibir as cartas do deck padrão.
6.  **Estilização Básica:** Aplique CSS simples para layout e usabilidade.

**Não Incluir Nesta Fase:**
*   Decks personalizáveis ou configurações avançadas da sala.
*   Autenticação de usuário.
*   Compartilhamento via QR Code ou links complexos.
*   Notificações elaboradas.
*   Temas visuais.
*   Cálculos estatísticos no frontend.

**Resultado Esperado:** Uma aplicação frontend Vue.js funcional na pasta `client/`, capaz de se conectar ao backend, permitir que usuários criem/entrem em salas, participem de rodadas de votação e vejam os resultados em tempo real.
