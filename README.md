# Planning Poker

Uma aplicação web leve e eficiente para facilitar sessões de Planning Poker em equipes ágeis, permitindo estimativas colaborativas em tempo real.

## Visão Geral

O Planning Poker é uma aplicação web que permite que múltiplos usuários se conectem a uma sala virtual, selecionem cartas de um deck customizado para estimar pontos/horas, e visualizem os resultados após a revelação. A aplicação foi projetada para ser simples, intuitiva e eficiente, focando na experiência do usuário e na facilidade de uso.

### Principais Funcionalidades

- Criação rápida de salas de Planning Poker
- Múltiplos decks de cartas (Fibonacci, Modificado, T-Shirt, Personalizado)
- Comunicação em tempo real entre participantes
- Revelação simultânea de cartas
- Cálculo automático de média e consenso
- Compartilhamento fácil via links e QR codes
- Interface responsiva para desktop e dispositivos móveis
- Tema escuro para reduzir o cansaço visual

## Começando

### Pré-requisitos

- Node.js (versão 14.x ou superior)
- npm (versão 6.x ou superior) ou yarn (versão 1.22.x ou superior)
- Docker e Docker Compose (opcional, para implantação containerizada)

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/planning-poker.git
cd planning-poker

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Usando Docker

```bash
# Construa e inicie os containers
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

## Documentação

A documentação completa do projeto está disponível nos seguintes arquivos:

- [Manual do Usuário](resultados/asgards-hall/manual-usuario.md) - Guia completo para usuários finais
- [Documentação Técnica](resultados/asgards-hall/documentacao-tecnica.md) - Documentação detalhada para desenvolvedores
- [Guia de Instalação](resultados/asgards-hall/guia-instalacao.md) - Instruções detalhadas de instalação e configuração
- [Guia de Docker](resultados/asgards-hall/guia-docker.md) - Instruções para containerização com Docker
- [Plano de Entrega](resultados/asgards-hall/plano-entrega.md) - Plano completo de entrega e transição

## Estrutura do Projeto

```
planning-poker/
├── client/               # Frontend (Vue.js)
│   ├── src/              # Código-fonte do frontend
│   └── public/           # Arquivos estáticos
├── server/               # Backend (Node.js, Express, Socket.io)
│   ├── controllers/      # Controladores
│   ├── models/           # Modelos de dados
│   └── utils/            # Utilitários
├── docs/                 # Documentação
├── Dockerfile            # Configuração do Docker
└── docker-compose.yml    # Configuração do Docker Compose
```

## Desenvolvimento

### Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento com hot-reload
npm run dev

# Construir para produção
npm run build

# Iniciar servidor em modo produção
npm start

# Executar testes
npm test
```

### Fluxo de Desenvolvimento

1. Crie uma branch a partir da `main`
2. Faça suas alterações
3. Execute os testes para garantir que tudo está funcionando
4. Envie um Pull Request

## Implantação

Consulte o [Guia de Instalação](resultados/asgards-hall/guia-instalacao.md) para instruções detalhadas sobre como implantar o sistema em diferentes ambientes.

## Tecnologias Utilizadas

- **Frontend**: Vue.js, Vuex, Vue Router, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Ferramentas**: Vite, ESLint, Jest
- **Implantação**: Docker, Docker Compose

## Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Se você tiver alguma dúvida ou sugestão, por favor abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
