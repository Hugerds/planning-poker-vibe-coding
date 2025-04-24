# Prompt para Vibe Coding - Fase 3: Decks Personalizados e Configurações (Full Stack)

**Objetivo:** Aprimorar a aplicação adicionando suporte a diferentes tipos de decks de cartas e permitindo que o moderador configure opções da sala, tanto no backend quanto no frontend.

**Contexto:**
*   **Stack:** Node.js/Express/Socket.io (Backend), Vue.js/Vuex/Socket.io-client (Frontend).
*   **Estado Atual:** Backend e Frontend básicos funcionais das Fases 1 e 2.
*   **Blueprint:** `c:\Projetos\planning-poker\planning-poker-blueprint.md` (Modelos `Game` e `Deck`, seção de configurações).
*   **Memórias:** Personalização de Decks (`c1984a30`), Interface de Configuração (`c96d21d5`).

**Funcionalidades Essenciais a Implementar:**

**Backend (`server/`):**
1.  **Modelos Atualizados:** Modifique o modelo `Game` para incluir `deckType` (string, ex: "fibonacci", "tshirt") e `settings` (objeto com opções como `autoReveal`, `showAverage`).
2.  **Decks Pré-definidos:** Crie uma estrutura (ex: em `utils/` ou `models/`) para armazenar definições de decks comuns (Fibonacci, Modified Fibonacci, T-Shirt Sizes).
3.  **Lógica de Criação/Config:**
    *   Ao criar a sala (`create_room`), permita especificar o `deckType` e as `settings` iniciais. Use padrões se não fornecido.
    *   Implemente um novo evento `update_settings` que permita ao moderador alterar o `deckType` e as `settings` da sala. Valide se o emissor é o moderador.
4.  **Broadcast:** Notifique todos na sala (`update_room_state`) quando as configurações ou o deck forem alterados.

**Frontend (`client/`):**
1.  **Estado (Vuex/Pinia):** Adapte o store para armazenar o `deckType`, os `values` do deck atual e as `settings` da sala.
2.  **Seleção na Criação:** Modifique a tela inicial (`Home.vue`) para permitir ao criador da sala selecionar o tipo de deck inicial e talvez algumas configurações básicas.
3.  **Componente de Configuração (`RoomSettings.vue`):** Crie um novo componente (talvez um modal ou painel lateral na `Room.vue`) visível apenas para o moderador. Este componente deve:
    *   Exibir as configurações atuais da sala.
    *   Permitir ao moderador selecionar um `deckType` diferente (usando os tipos definidos no backend).
    *   Permitir ao moderador ativar/desativar opções (ex: `autoReveal`, `showAverage`).
    *   Emitir o evento `update_settings` para o backend ao salvar as mudanças.
4.  **Deck Dinâmico (`Deck.vue`):** Modifique o componente `Deck.vue` para renderizar as cartas com base nos `values` do deck atual recebido do estado (Vuex/Pinia).
5.  **Exibição de Configurações:** Mostre as configurações ativas relevantes na interface (ex: se a média será exibida após a revelação).

**Não Incluir Nesta Fase:**
*   Criação de decks 100% customizáveis pelo usuário (apenas seleção de pré-definidos).
*   Cálculo e exibição da média ou outras estatísticas (apenas a opção de mostrar).
*   Persistência das configurações além da memória do servidor.

**Resultado Esperado:** Usuários podem criar salas com diferentes decks pré-definidos. O moderador pode alterar o deck e as configurações da sala durante o jogo, e essas mudanças são refletidas em tempo real para todos os participantes.
