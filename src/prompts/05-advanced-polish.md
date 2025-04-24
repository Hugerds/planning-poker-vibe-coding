# Prompt para Vibe Coding - Fase 5: Recursos Avançados, Autenticação e Polimento (Full Stack)

**Objetivo:** Adicionar funcionalidades avançadas como autenticação de usuário, persistência de dados, temas visuais, e realizar polimento geral da aplicação, incluindo testes e preparação para deploy.

**Contexto:**
*   **Stack:** Node.js/Express/Socket.io (Backend), Vue.js/Vuex/Socket.io-client (Frontend).
*   **Estado Atual:** Aplicação funcional com salas, votação, decks, configurações, compartilhamento básico e notificações.
*   **Blueprint:** `c:\Projetos\planning-poker\planning-poker-blueprint.md` (Menciona Docker, PM2, Nginx, Autenticação implícita pela figura do 'moderator', Temas CSS).
*   **Memórias:** Perfis/Autenticação (`b1e86d27`), Temas (`405cb4d2`), Backup/Restauração (`be11504a`), Import/Export (`fe80b550`), Integrações (`88cfb5e3`), além das de jogo e UI.

**Funcionalidades Essenciais a Implementar (Priorizar conforme necessidade):**

**Backend (`server/`):**
1.  **Persistência (Escolher UMA):**
    *   **Opção Simples:** Salvar o estado das salas em arquivos JSON locais periodicamente ou ao final de eventos importantes.
    *   **Opção Robusta:** Integrar um banco de dados (ex: SQLite com `sequelize` ou MongoDB com `mongoose`) para persistir salas, jogadores, votos, configurações.
2.  **Autenticação (Opcional):** Implementar um sistema básico de autenticação (ex: com JWT ou sessions) se usuários registrados forem necessários. Associar salas e moderação a usuários autenticados.
3.  **Cálculos Estatísticos:** Implementar lógica para calcular média, desvio padrão, ou identificar consenso após `reveal_votes`. Adicionar esses resultados ao estado da sala.

**Frontend (`client/`):**
1.  **Autenticação UI (Se implementado no backend):** Adicionar telas/componentes para login/registro. Proteger rotas/ações que exigem autenticação.
2.  **Exibição de Estatísticas:** Mostrar os resultados estatísticos calculados pelo backend após a revelação dos votos.
3.  **Temas Visuais:**
    *   Implementar um seletor de tema (Claro/Escuro) usando variáveis CSS.
    *   Ajustar os estilos dos componentes para respeitar o tema selecionado. Salvar a preferência do usuário (LocalStorage).
4.  **Polimento UI/UX:** Refinar a interface, melhorar feedback visual, tratar casos de borda (desconexões, erros), adicionar animações sutis.
5.  **Testes (Opcional):** Adicionar testes unitários/integração básicos para componentes frontend e lógica backend crítica.

**Deploy:**
1.  **Dockerização:** Criar/Ajustar `Dockerfile` e `docker-compose.yml` (conforme blueprint) para facilitar o build e execução da aplicação (backend + frontend) em containers.

**Outros Recursos Avançados (Implementar se houver tempo/necessidade):**
*   Importação/Exportação de dados da sessão.
*   Backup/Restauração.
*   Integrações com Jira, etc.

**Resultado Esperado:** Uma aplicação Planning Poker mais completa e robusta, com (opcionalmente) persistência, autenticação, temas, estatísticas, e pronta para ser facilmente executada via Docker. A interface estará mais polida e a experiência do usuário aprimorada.
