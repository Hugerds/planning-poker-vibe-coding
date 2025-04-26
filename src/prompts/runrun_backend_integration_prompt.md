### Prompt: Integração da API RunRun.it (Backend)

**Objetivo:** Adicionar a capacidade de interagir com a API do RunRun.it a partir do backend da aplicação Planning Poker, permitindo buscar quadros, tarefas por quadro e descrições de tarefas, utilizando tokens (`App-Key` e `User-Token`) fornecidos pelo usuário.

**Passos:**

1.  **Adicionar Dependência:**
    *   No diretório `src/server`, instale a biblioteca `axios` para realizar requisições HTTP. Execute o comando:
        ```bash
        npm install axios
        ```
        ou se usar Yarn:
        ```bash
        yarn add axios
        ```

2.  **Criar Serviço de API (`runrunService.js`):**
    *   Crie o arquivo `src/server/services/runrunService.js`.
    *   Implemente funções assíncronas que encapsulam as chamadas à API do RunRun.it:
        *   `async getBoards(appKey, userToken)`: Busca a lista de quadros (`/boards`).
        *   `async getTasksByBoard(boardId, appKey, userToken)`: Busca tarefas de um quadro específico (`/boards/{boardId}/tasks`), agrupadas por etapa (`group_by=board_stage`).
        *   `async getTaskDescription(taskId, appKey, userToken)`: Busca a descrição de uma tarefa específica (`/tasks/{taskId}/description`).
    *   Use `axios` para fazer as requisições GET. Configure a `baseURL` do axios para `https://runrun.it/api/v1.0` e passe os headers `App-Key`, `User-Token`, e `Content-Type: application/json` em cada requisição.
    *   Implemente tratamento de erros (ex: use `try...catch`, logue os erros e retorne `null` ou lance exceções customizadas se preferir).

3.  **Criar Controlador (`runrunController.js`):**
    *   Crie o arquivo `src/server/controllers/runrunController.js`.
    *   Implemente funções de middleware para o Express:
        *   `handleGetBoards(req, res)`
        *   `handleGetTasksByBoard(req, res)`
        *   `handleGetTaskDescription(req, res)`
    *   Essas funções devem:
        *   Extrair `App-Key` e `User-Token` dos headers da requisição (`req.headers['app-key']`, `req.headers['user-token']`). **Nota:** O frontend precisará enviar esses headers em cada chamada para estas APIs.
        *   Extrair IDs (`boardId`, `taskId`) dos parâmetros da rota (`req.params`).
        *   Chamar as funções correspondentes do `runrunService.js` passando os tokens e IDs.
        *   Enviar a resposta (dados do RunRun.it) ou um status de erro apropriado de volta ao cliente (`res.json(...)`, `res.status(...).send(...)`).

4.  **Definir Rotas da API:**
    *   No seu arquivo principal do servidor (`src/server/server.js`) ou em um arquivo de roteamento dedicado (se aplicável):
        *   Importe o `runrunController`.
        *   Crie um novo roteador Express para as rotas do RunRun.it ou adicione as rotas ao roteador existente.
        *   Defina as rotas GET que mapeiam para as funções do controlador:
            *   `GET /api/runrun/boards` -> `runrunController.handleGetBoards`
            *   `GET /api/runrun/boards/:boardId/tasks` -> `runrunController.handleGetTasksByBoard`
            *   `GET /api/runrun/tasks/:taskId/description` -> `runrunController.handleGetTaskDescription`

5.  **Atualizar Modelo e Lógica de Entrada na Sala:**
    *   **Modelo `Player.js`:** Se você tiver um modelo ou classe para `Player` (provavelmente em `src/server/models/Player.js`), adicione campos opcionais para armazenar os tokens: `runrunAppKey` (string) e `runrunUserToken` (string).
    *   **Lógica de `joinRoom`:** Modifique a lógica que lida com a entrada de um usuário na sala (provavelmente no manipulador de eventos do Socket.IO em `src/server/socket.js`, que deve interagir com `roomController.js`):
        *   Quando um usuário entrar (evento `joinRoom` ou similar), permita que ele envie opcionalmente `runrunAppKey` e `runrunUserToken` junto com o nome e ID da sala.
        *   Se os tokens forem fornecidos, armazene-os no objeto do jogador correspondente no servidor.
        *   **Importante (Segurança):** Garanta que esses tokens *nunca* sejam enviados para outros clientes. Eles devem ser usados apenas no servidor para fazer chamadas à API RunRun.it em nome daquele usuário específico.

**Validação:**
Após implementar esses passos, use uma ferramenta como Postman, Insomnia ou `curl` para testar as novas rotas `/api/runrun/*`. Envie requisições GET para essas rotas, incluindo os headers `App-Key` e `User-Token` com credenciais válidas do RunRun.it, para verificar se o backend está se comunicando corretamente com a API e retornando os dados esperados (lista de quadros, tarefas, descrição).
