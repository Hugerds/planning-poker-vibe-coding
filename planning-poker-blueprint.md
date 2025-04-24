# Blueprint Técnico: Sistema de Planning Poker

## 1. Visão Geral do Sistema

### 1.1 Descrição
O Sistema de Planning Poker é uma aplicação web leve e eficiente para facilitar sessões de estimativa de tarefas em equipes ágeis. A aplicação permite que múltiplos usuários se conectem a uma sala virtual, selecionem cartas de um deck customizado para estimar pontos/horas, e visualizem os resultados após a revelação.

### 1.2 Objetivos Principais
- Criar uma plataforma intuitiva e responsiva para sessões de estimativa
- Permitir execução local sem necessidade de banco de dados remoto
- Priorizar experiência do usuário e simplicidade de implementação
- Facilitar a comunicação em tempo real entre os participantes

### 1.3 Público-alvo
- Equipes de desenvolvimento de software que utilizam metodologias ágeis
- Desenvolvedores que desejam testar o conceito antes de implementar uma solução mais complexa
- Equipes pequenas que precisam de uma solução rápida e eficiente

## 2. Arquitetura do Sistema

### 2.1 Visão de Alto Nível
```
+----------------------------------+     +----------------------------------+
|           Cliente Web            |     |           Servidor               |
|  (Vue.js, HTML5, CSS3)          |<--->|  (Node.js, Express, Socket.io)   |
+----------------------------------+     +----------------------------------+
                                                       |
                                                       v
                                         +----------------------------------+
                                         |     Gerenciamento de Estado      |
                                         |     (Memória/Redis opcional)     |
                                         +----------------------------------+
```

### 2.2 Componentes Principais
1. **Interface do Usuário (UI)**
   - Componentes Vue.js para renderização das telas
   - Interação com o usuário e captura de eventos
   - Apresentação dos estados do jogo

2. **Cliente Socket.io**
   - Integração com Vue.js para comunicação em tempo real
   - Envio e recebimento de eventos em tempo real
   - Gerenciamento do estado local sincronizado

3. **Servidor Socket.io**
   - Gerenciamento de salas e conexões
   - Broadcast de eventos para os clientes conectados
   - Validação de ações e manutenção da integridade do jogo

4. **Controlador de Jogo**
   - Lógica de votação e revelação
   - Cálculo de estatísticas (média, consenso)
   - Gerenciamento de rodadas

## 3. Especificação Técnica

### 3.1 Stack Tecnológico

#### Frontend
- **Vue.js** - Framework progressivo para construção de interfaces
- **Vuex** - Gerenciamento de estado centralizado para Vue.js
- **Vue Router** - Roteamento oficial para aplicações Vue.js
- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização com variáveis CSS para tema escuro
- **Socket.io-client** - Biblioteca para comunicação em tempo real
- **Font Awesome** - Biblioteca de ícones
- **QRCode.js** - Geração de QR codes para convites

#### Backend
- **Node.js** - Ambiente de execução JavaScript no servidor
- **Express** - Framework web para Node.js
- **Socket.io** - Biblioteca para comunicação bidirecional em tempo real
- **UUID** - Geração de identificadores únicos para jogos e jogadores

#### Desenvolvimento e Implantação
- **Vue CLI** - Ferramenta de linha de comando para desenvolvimento Vue.js
- **Vite** - Servidor de desenvolvimento e bundler para Vue.js
- **Nodemon** - Reinicialização automática do servidor durante desenvolvimento
- **Docker** - Containerização para implantação em ambientes diversos
- **PM2** - Gerenciador de processos para produção (opcional)
- **Nginx** - Servidor web para proxy reverso (opcional para produção)

### 3.2 Estrutura de Diretórios
```
planning-poker/
├── client/
│   ├── src/
│   │   ├── main.js            # Ponto de entrada da aplicação
│   │   ├── App.vue            # Componente principal da aplicação
│   │   ├── components/
│   │   │   ├── Game.vue       # Componente de jogo
│   │   │   ├── Player.vue     # Componente de jogador
│   │   │   └── Deck.vue       # Componente de deck
│   │   ├── store/
│   │   │   ├── index.js       # Gerenciamento de estado com Vuex
│   │   │   └── modules/
│   │   │       ├── game.js    # Módulo de estado do jogo
│   │   │       └── player.js  # Módulo de estado do jogador
│   │   ├── router/
│   │   │   └── index.js       # Roteamento da aplicação
│   │   └── utils/
│   │       ├── qrcode.js      # Geração de QR code
│   │       └── statistics.js  # Cálculos estatísticos
│   └── public/
│       ├── index.html         # Ponto de entrada da aplicação
│       └── favicon.ico        # Ícone da aplicação
├── server/
│   ├── index.js             # Ponto de entrada do servidor
│   ├── socket.js            # Configuração do servidor Socket.io
│   ├── controllers/
│   │   ├── gameController.js # Lógica do jogo no servidor
│   │   └── roomController.js # Gerenciamento de salas
│   ├── models/
│   │   ├── game.js           # Modelo de jogo no servidor
│   │   └── player.js         # Modelo de jogador no servidor
│   └── utils/
│       └── gameUtils.js       # Utilitários para lógica do jogo
├── package.json            # Dependências do projeto
├── Dockerfile              # Configuração para containerização
├── docker-compose.yml      # Configuração para ambiente de desenvolvimento
└── README.md               # Documentação
```

### 3.3 Modelos de Dados

#### Game
```javascript
{
  id: "unique-game-id",
  name: "Sprint Planning",
  deckType: "fibonacci",
  customDeck: null,
  settings: {
    revealPermission: "all", // "all" ou "moderator"
    autoReveal: true,
    showAverage: true,
    showCountdown: true,
    funFeatures: true
  },
  players: [], // Array de objetos Player
  currentRound: {
    status: "voting", // "voting", "revealed", "completed"
    votes: {}, // Map de playerID para valor da carta
    results: {
      average: 0,
      consensus: false
    }
  },
  moderator: "player-id-1"
}
```

#### Player
```javascript
{
  id: "player-id-1",
  name: "John Doe",
  isSpectator: false,
  isConnected: true,
  hasVoted: false,
  vote: null
}
```

#### Deck
```javascript
{
  type: "fibonacci",
  values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞"],
  display: {
    "?": "question.png",
    "∞": "infinity.png"
  }
}
```

## 4. Fluxos de Interação

### 4.1 Fluxo de Criação de Jogo
```
+----------------+     +----------------+     +----------------+
| Tela Inicial   |---->| Configuração   |---->| Tela de Nome  |
| (Criar Jogo)   |     | do Jogo        |     | do Jogador    |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
                                              +----------------+
                                              | Tela Principal |
                                              | do Jogo        |
                                              +----------------+
```

### 4.2 Fluxo de Entrada em Jogo Existente
```
+----------------+     +----------------+     +----------------+
| Link de        |---->| Tela de Nome   |---->| Tela Principal |
| Convite        |     | do Jogador     |     | do Jogo        |
+----------------+     +----------------+     +----------------+
```

### 4.3 Fluxo de Votação
```
+----------------+     +----------------+     +----------------+
| Seleção de     |---->| Aguardando     |---->| Revelação      |
| Carta          |     | Outros Votos   |     | de Cartas      |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
                                              +----------------+
                                              | Exibição de    |
                                              | Resultados     |
                                              +----------------+
                                                      |
                                                      v
                                              +----------------+
                                              | Nova Rodada    |
                                              +----------------+
```

## 5. Interfaces de Usuário

### 5.1 Tela de Criação de Jogo
- **Componentes:**
  - Campo de texto para nome do jogo
  - Dropdown para seleção do sistema de votação
  - Botões de rádio para configurações avançadas
  - Botão "Criar Jogo"

- **Interações:**
  - Validação de campos obrigatórios
  - Exibição/ocultação de configurações avançadas
  - Navegação para tela de nome do jogador após criação

### 5.2 Tela de Nome do Jogador
- **Componentes:**
  - Campo de texto para nome do jogador
  - Toggle para "Entrar como espectador"
  - Botão "Continuar para o jogo"

- **Interações:**
  - Validação de nome (não vazio)
  - Armazenamento de preferências do jogador
  - Navegação para tela principal do jogo

### 5.3 Tela Principal do Jogo
- **Componentes:**
  - Área central com jogadores e cartas
  - Deck de cartas para seleção
  - Botão "Revelar Cartas"
  - Botão "Nova Rodada"
  - Botão "Convidar Jogadores"

- **Interações:**
  - Seleção de carta (destaque visual)
  - Animação de carta virada/desvirada
  - Atualização em tempo real do status dos jogadores
  - Modal de convite com link e QR code

### 5.4 Tela de Resultados
- **Componentes:**
  - Cartas reveladas de cada jogador
  - Indicador de média
  - Indicador de consenso
  - Estatísticas visuais (opcional)

- **Interações:**
  - Destaque para valores extremos
  - Animação de revelação
  - Transição para nova rodada

## 6. Comunicação em Tempo Real

### 6.1 Eventos do Sistema
- **playerJoined**: Novo jogador entrou na sala
- **playerLeft**: Jogador saiu da sala
- **cardSelected**: Jogador selecionou uma carta
- **allVoted**: Todos os jogadores votaram
- **cardsRevealed**: Cartas foram reveladas
- **newRound**: Nova rodada iniciada

### 6.2 Implementação com Socket.io
```javascript
// Exemplo de implementação do servidor Socket.io
io.on('connection', (socket) => {
  // Jogador entra na sala
  socket.on('joinGame', (gameId, player) => {
    socket.join(gameId);
    games[gameId].players.push(player);
    io.to(gameId).emit('playerJoined', player);
  });
  
  // Jogador seleciona carta
  socket.on('selectCard', (gameId, playerId, card) => {
    games[gameId].votes[playerId] = card;
    io.to(gameId).emit('cardSelected', playerId);
    
    // Verificar se todos votaram
    if (allPlayersVoted(games[gameId])) {
      io.to(gameId).emit('allVoted');
    }
  });
  
  // Revelar cartas
  socket.on('revealCards', (gameId) => {
    const results = calculateResults(games[gameId]);
    games[gameId].currentRound.status = 'revealed';
    games[gameId].currentRound.results = results;
    io.to(gameId).emit('cardsRevealed', games[gameId].votes, results);
  });
});
```
## 7. Implementação Incremental

### 7.1 Fase 1: Estrutura Básica e Comunicação em Tempo Real
- **Entregáveis:**
  - Configuração inicial do projeto Vue.js com Vue CLI
  - Estrutura do projeto cliente-servidor
  - Configuração básica do Socket.io e integração com Vue.js
  - Implementação de conexão e desconexão de jogadores
  - Componentes Vue.js básicos com tema escuro

- **Métricas de Sucesso:**
  - Servidor Socket.io funcionando
  - Clientes Vue.js conseguem se conectar ao servidor
  - Eventos básicos de conexão sendo transmitidos
  - Componentes básicos responsivos

### 7.2 Fase 2: Lógica de Jogo e Sincronização
- **Entregáveis:**
  - Implementação da store Vuex para gerenciamento de estado
  - Componentes Vue.js para seleção e revelação de cartas
  - Sincronização de estado entre clientes via Socket.io
  - Cálculo de média e consenso funcionando
  - Gerenciamento de rodadas

- **Métricas de Sucesso:**
  - Fluxo completo de votação funcional
  - Estado do jogo sincronizado entre clientes
  - Cálculos estatísticos precisos
  - Transição entre rodadas funcionando

### 7.3 Fase 3: Interface Completa e Experiência do Usuário
- **Entregáveis:**
  - Implementação completa dos componentes Vue.js
  - Transições e animações com Vue Transition
  - Feedback visual para ações do usuário
  - Responsividade para diferentes dispositivos

- **Métricas de Sucesso:**
  - Interface atraente e intuitiva
  - Experiência de usuário fluida
  - Adaptação correta a diferentes tamanhos de tela
  - Feedback visual claro para todas as ações

### 7.4 Fase 4: Recursos Avançados e Otimizações
- **Entregáveis:**
  - Geração de links de convite e QR codes
  - Implementação de recursos divertidos (opções configuráveis)
  - Otimizações de performance (code-splitting, lazy loading)
  - Build de produção e preparação para implantação

- **Métricas de Sucesso:**
  - Links de convite e QR codes funcionais
  - Recursos adicionais implementados e configuráveis
  - Tempo de resposta otimizado
  - Aplicação pronta para implantação em ambiente de produção

## 8. Considerações Técnicas

### 8.1 Performance
- Otimizar a comunicação Socket.io para minimizar latência
- Implementar mecanismos de reconexão automática
- Utilizar compressão de payload para reduzir o tráfego de rede
- Implementar lazy loading de componentes Vue.js
- Otimizar o tamanho do bundle com code-splitting
- Considerar o uso de Redis para gerenciamento de estado em ambientes de produção

### 8.2 Segurança
- Validar inputs do usuário tanto no cliente quanto no servidor
- Implementar mecanismos anti-spam para evitar abuso das conexões
- Limitar número de conexões por sala e por IP
- Sanitizar dados antes de exibição e antes de processar no servidor
- Implementar mecanismos de autenticação para moderadores (opcional)
- Seguir as melhores práticas de segurança para aplicações Vue.js

### 8.3 Acessibilidade
- Implementar contraste adequado para tema escuro
- Adicionar atributos ARIA para elementos interativos
- Garantir navegação por teclado
- Suportar leitores de tela para elementos críticos
- Fornecer feedback visual e textual para ações importantes
- Utilizar componentes Vue.js acessíveis

### 8.4 Compatibilidade
- Suporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Adaptação para diferentes tamanhos de tela (desktop, tablet, mobile)
- Fallbacks para recursos não suportados
- Testar em diferentes dispositivos e conexões de rede
- Considerar polyfills para navegadores mais antigos quando necessário

### 8.5 Escalabilidade
- Arquitetura que permita escalar horizontalmente em ambientes de produção
- Considerar o uso de balanceadores de carga para distribuição de conexões
- Implementar mecanismos de recuperação de estado em caso de falha do servidor
- Projetar para suportar múltiplas salas simultaneamente
- Estruturar os componentes Vue.js e módulos Vuex para facilitar a manutenção

## 9. Métricas de Sucesso do Projeto

1. **Comunicação em Tempo Real**: Sincronização imediata entre todos os clientes conectados
2. **Flexibilidade de Implantação**: Aplicação pode ser executada tanto localmente quanto em ambiente cloud
3. **Responsividade**: Interface adapta-se a diferentes dispositivos
4. **Fluxo de Votação**: Ciclo completo de votação e revelação funciona conforme esperado
5. **Multi-jogador**: Múltiplos usuários podem participar simultaneamente
6. **Simplicidade**: Código limpo e fácil de entender
7. **Performance**: Baixa latência e operação fluida mesmo com múltiplos participantes
8. **Robustez**: Capacidade de lidar com desconexões e reconexões sem perda de dados

## 10. Entregáveis Finais

1. **Código-fonte**: Arquivos do cliente e servidor organizados
2. **Documentação**: README.md com instruções de uso, configuração e implantação
3. **Guia de Execução**: Passo a passo para execução local e implantação em cloud
4. **Demonstração**: Versão funcional para testes
5. **Configuração Docker**: Arquivos de configuração para containerização
6. **Scripts de Implantação**: Scripts para facilitar a implantação em diferentes ambientes
