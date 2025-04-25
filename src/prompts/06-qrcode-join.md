# Prompt 06: Entrada em Sala via QR Code

**Objetivo:** Implementar a funcionalidade que permite compartilhar o link de uma sala através de um QR Code e habilitar um fluxo simplificado para novos usuários entrarem na sala escaneando este código, apenas fornecendo seu nome.

**Contexto:** Já possuímos um sistema robusto para geração de QR Codes (`QRCodeRenderer`, `QRCodeGenerator`, `QRCodeService`), gerenciamento de URLs únicas (`UrlService`, `UrlController`) e redirecionamento (`RedirectController`). Esta funcionalidade deve integrar-se a esses sistemas existentes.

**Passos de Implementação:**

1.  **Backend:**
    *   **Geração de Link Específico:**
        *   No `UrlService`, criar ou adaptar um método para gerar um tipo específico de URL de convite que indique a entrada via QR Code. Esta URL deve conter o `roomId`.
        *   Considerar se parâmetros adicionais são necessários nesta URL (e.g., `source=qrcode`).
    *   **Validação:**
        *   Garantir que o `UrlValidationMiddleware` valide corretamente este novo tipo de URL ou parâmetro.
    *   **Fluxo de Entrada:**
        *   Modificar o `RedirectController` (ou criar um endpoint dedicado) para tratar as URLs de QR Code:
            *   Ao invés de redirecionar imediatamente para a sala ou pedir login/senha, este endpoint deve servir uma página/estado intermediário no frontend.
            *   Criar um novo endpoint (e.g., `POST /api/rooms/{roomId}/join/qrcode`) que receberá o nome do usuário e o `roomId` (validado a partir da URL original ou de um token seguro).
            *   Este endpoint validará o nome fornecido e utilizará os serviços existentes (`RoomService`, `PlayerService`) para adicionar o usuário à sala como um jogador (ou espectador, dependendo da lógica padrão/configuração da sala).
            *   Após a entrada bem-sucedida, o backend deve sinalizar ao frontend para redirecionar o usuário para a `RoomView`.

2.  **Frontend:**
    *   **Geração do QR Code:**
        *   Integrar a geração do QR Code na interface de compartilhamento da sala (provavelmente no modal/componente `ShareOptions` ou similar).
        *   Adicionar um botão ou opção "Compartilhar via QR Code".
        *   Ao clicar, chamar o backend para obter a URL específica de QR Code e usar o `QRCodeRenderer` ou `QRCodeGenerator` para exibir o QR Code correspondente.
        *   Oferecer opções para baixar/copiar o QR Code.
    *   **Página/Componente de Entrada:**
        *   Criar uma nova view ou componente Vue (e.g., `QRCodeJoinView.vue`) que será exibida quando um usuário acessar a URL de QR Code.
        *   Esta view deve:
            *   Opcionalmente, exibir informações básicas da sala (se disponíveis via API ou na URL).
            *   Apresentar um campo de input simples para o usuário digitar seu nome.
            *   Incluir um botão "Entrar na Sala".
            *   Ao submeter, chamar o novo endpoint backend (`POST /api/rooms/{roomId}/join/qrcode`) com o nome fornecido.
            *   Tratar respostas de sucesso (redirecionar para `RoomView` usando `vue-router`) e erros (exibir mensagens apropriadas, e.g., "Nome inválido", "Sala cheia", "Erro ao entrar").
    *   **Roteamento:**
        *   Configurar o `vue-router` para mapear o padrão da URL de QR Code para esta nova `QRCodeJoinView`.

**Considerações Adicionais:**

*   **Segurança:** Garantir que a URL e o processo de entrada não exponham informações sensíveis ou permitam acesso indevido. Validar o `roomId` e o nome do usuário rigorosamente.
*   **UX:** O fluxo deve ser o mais simples possível. Escanear o QR Code, digitar o nome, entrar. Fornecer feedback visual claro durante o processo.
*   **Usuários Anônimos vs. Logados:** Definir o comportamento se um usuário já logado escanear o QR Code. Ele deve usar seu nome de perfil existente ou ainda assim fornecer um nome? (Sugestão: Se logado, usar o perfil; se anônimo, pedir o nome).
*   **Integração:** Assegurar a integração suave com os sistemas existentes de gerenciamento de estado (Vuex/Pinia), eventos de socket (`useSocket`) e componentes UI (Vuetify).

**Resultado Esperado:** Uma forma rápida e fácil para anfitriões compartilharem o acesso à sala via QR Code, e para novos participantes entrarem rapidamente apenas fornecendo um nome.
