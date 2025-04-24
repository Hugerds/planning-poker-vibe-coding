# Prompt para Vibe Coding - Fase 1: Backend Foundation

**Objetivo:** Criar a estrutura e a lógica fundamental do backend para a aplicação Planning Poker, utilizando Node.js, Express e Socket.io, conforme definido no [planning-poker-blueprint.md](../../planning-poker-blueprint.md).

**Contexto:**
*   **Stack:** Node.js, Express, Socket.io
*   **Blueprint:** `c:\Projetos\planning-poker\planning-poker-blueprint.md` (especialmente seções 2, 3.1, 3.2, 3.3)
*   **Memórias:** Lógica de Jogo (`ace602e1`), Broadcast (`70aafcc9`), Validação (`e9d4b9e2`) - usar como referência conceitual.

**Funcionalidades Essenciais a Implementar (Backend - `server/` directory):**
1.  **Estrutura:** Crie a estrutura de diretórios inicial para o servidor (`server/`) conforme o blueprint (`index.js`, `socket.js`, `controllers/`, `models/`, `utils/`).
2.  **Setup Básico:** Configure um servidor Express simples e integre o Socket.io nele (`index.js`, `socket.js`).
3.  **Modelos:** Defina os modelos básicos `Game` e `Player` em `models/` baseados no blueprint (classes ou objetos simples).
4.  **Gerenciamento em Memória:** Implemente lógica em `controllers/` (ex: `roomController.js`, `gameController.js`) para gerenciar salas e jogadores *apenas em memória* por enquanto (use um objeto ou Map global, por exemplo).
5.  **Eventos Socket.io Chave:** Implemente handlers no servidor (`socket.js` ou nos controllers) para os seguintes eventos, atualizando o estado em memória e notificando os clientes relevantes:
    *   `create_room`: Gera um ID único, cria a sala em memória, retorna o ID da sala e o ID do jogador (moderador).
    *   `join_room`: Adiciona um jogador a uma sala existente, notifica os outros na sala (`player_joined`). Requer `roomId` e `playerName`. Retorna o estado atual da sala e o ID do jogador.
    *   `disconnect` (evento padrão do Socket.io): Remove o jogador da sala, notifica os outros (`player_left`).
    *   `start_round`: (Iniciado pelo moderador) Limpa votos anteriores, muda o estado da rodada para 'voting', notifica a sala.
    *   `submit_vote`: Jogador envia seu voto (`playerId`, `voteValue`). Armazena o voto em memória (sem revelar ainda). Notifica o moderador/sala que o jogador votou.
    *   `reveal_votes`: (Iniciado pelo moderador) Muda o estado da rodada para 'revealed', envia todos os votos para a sala.
6.  **Broadcasts:** Utilize `socket.to(roomId).emit(...)` e `io.to(roomId).emit(...)` adequadamente para enviar atualizações de estado (`update_room_state` contendo o objeto `Game` atualizado) para os participantes da sala após ações relevantes.

**Não Incluir Nesta Fase:**
*   Persistência em banco de dados (tudo em memória).
*   Autenticação de usuários.
*   Decks de cartas complexos ou customizáveis (use um array fixo simples por enquanto se necessário para a lógica de voto).
*   Cálculos estatísticos complexos (média, consenso).
*   Qualquer código frontend (foco 100% no backend `server/`).
*   Validações de entrada muito robustas (foco na lógica principal).

**Resultado Esperado:** Uma base funcional do servidor Node.js/Socket.io na pasta `server/`, capaz de gerenciar o ciclo básico de múltiplas salas e rodadas de votação em tempo real, pronta para ser conectada a um cliente frontend na próxima fase. Certifique-se de incluir um `package.json` com as dependências necessárias (Express, Socket.io, UUID, etc.).
