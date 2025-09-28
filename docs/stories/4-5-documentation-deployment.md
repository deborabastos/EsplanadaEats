# Story 4.5: Documentation & Deployment

## User Story
Como administrador do sistema, eu quero documentação completa e um processo de deployment automatizado para garantir que o aplicativo possa ser facilmente mantido, escalado e implantado em produção.

## Acceptance Criteria
- [ ] Documentação técnica completa deve ser gerada
- [ ] Guia de instalação e configuração deve estar disponível
- [ ] Processo de CI/CD deve ser implementado
- [ ] Deploy automatizado para produção deve funcionar
- [ ] Testes automatizados devem ser executados no pipeline
- [ ] Monitoramento pós-deploy deve ser configurado
- [ ] Documentação para usuários finais deve ser criada
- [ ] Processo de rollback deve ser definido

## Technical Implementation

### Technical Documentation Structure
```markdown
# docs/technical-overview.md

# Visão Geral Técnica - Esplanada Eats

## Arquitetura do Sistema

### Frontend
- **Framework**: Vanilla JavaScript com arquitetura modular
- **Estilos**: CSS com SASS/PostCSS para processamento
- **Build Tool**: Vite para build e desenvolvimento
- **Gerenciamento de Estados**: Client-side com Firebase
- **Cache**: Service Workers para Progressive Web App

### Backend
- **Banco de Dados**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage para imagens
- **Autenticação**: Firebase Authentication (anônima)
- **Hosting**: Firebase Hosting com CDN
- **Functions**: Firebase Cloud Functions para lógica server-side

### Infraestrutura
- **CI/CD**: GitHub Actions para automação
- **Monitoramento**: Google Analytics + Firebase Analytics
- **Logging**: Console do Firebase com extensões personalizadas
- **Segurança**: Firebase Security Rules + CORS
- **Performance**: Cloudflare CDN + otimizações frontend

## Estrutura de Pastas

```
esplanada_eats/
├── public/                    # Arquivos estáticos
│   ├── index.html            # Página principal
│   ├── sw.js                 # Service Worker
│   ├── offline.html          # Página offline
│   └── assets/               # Imagens, fontes, etc.
├── src/                      # Código fonte
│   ├── js/                   # JavaScript
│   │   ├── components/       # Componentes UI
│   │   ├── services/         # Serviços de negócio
│   │   ├── utils/           # Utilitários
│   │   └── main.js          # Ponto de entrada
│   ├── css/                  # Estilos
│   │   ├── main.css         # CSS principal
│   │   ├── components.css   # Estilos de componentes
│   │   └── responsive.css   # Media queries
│   └── img/                  # Imagens do projeto
├── docs/                     # Documentação
│   ├── prd.md               # Product Requirements
│   ├── stories/             # User Stories
│   └── technical/           # Documentação técnica
├── tests/                   # Testes
│   ├── unit/               # Testes unitários
│   ├── integration/        # Testes de integração
│   └── e2e/                # Testes end-to-end
├── .github/                # GitHub Actions
│   └── workflows/          # Workflows de CI/CD
├── firebase.json           # Configuração Firebase
├── vite.config.js          # Configuração Vite
├── package.json            # Dependências do projeto
└── README.md               # Documentação do projeto
```

## Componentes Principais

### RestaurantCard
- **Responsabilidade**: Exibir informações básicas do restaurante
- **Props**: restaurant (object), onClick (function)
- **Estado**: Local (loading states, image loading)
- **Dependências: ImageLoader, RatingDisplay**

### RestaurantModal
- **Responsabilidade**: Exibir detalhes completos do restaurante
- **Props**: restaurant (object), onClose (function)
- **Estado**: Local (active tab, loading states)
- **Dependências: RatingForm, PhotoGallery**

### RatingForm
- **Responsabilidade**: Coletar avaliação do usuário
- **Props**: restaurantId (string), onSubmit (function)
- **Estado**: Local (form data, validation)
- **Dependências: UserIdentifier, ImageUpload**

### UserIdentifier
- **Responsabilidade**: Identificar usuários de forma anônima
- **Métodos**: getUserId(), generateFingerprint()
- **Dependências: Nenhuma (browser APIs)**

## Serviços

### FirebaseService
- **Responsabilidade**: Gerenciar conexão com Firebase
- **Métodos**: initialize(), getRestaurants(), submitRating()
- **Cache**: LocalStorage para dados offline

### AnalyticsService
- **Responsabilidade**: Rastrear eventos do usuário
- **Métodos**: trackEvent(), trackPageView(), setUserProperties()
- **Integração**: Google Analytics, Firebase Analytics

### ImageOptimizer
- **Responsabilidade**: Otimizar imagens antes do upload
- **Métodos**: optimizeImage(), compressImage(), resizeImage()
- **Configuração**: Max size 1MB, quality 80%

## Fluxos de Dados

### 1. Cadastro de Restaurante
```
Usuário → Formulário → Validação → Firebase Storage → Firebase Firestore → UI Update
```

### 2. Avaliação do Restaurante
```
Usuário → Modal → RatingForm → Validação → Firebase Firestore → Real-time Update → UI Update
```

### 3. Sincronização Offline
```
Offline → IndexedDB → Service Worker → Background Sync → Firebase → UI Update
```

## Configuração de Ambiente

### Variáveis de Ambiente
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
VITE_API_BASE_URL=https://api.esplanadaeats.com
```

### Requisitos de Sistema
- Node.js >= 16.0.0
- npm >= 7.0.0
- Firebase CLI >= 11.0.0
- Conta Firebase com projetos configurados

## Segurança

### Firebase Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restaurants/{restaurant} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    match /ratings/{rating} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

### CORS Configuration
```javascript
// firebase.json hosting configuration
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
}
```

## Performance

### Otimizações Implementadas
- **Lazy Loading**: Imagens carregadas sob demanda
- **Code Splitting**: Divisão de código por rota
- **Cache Estratégico**: Service Workers com estratégia cache-first
- **Otimização de Imagens**: Compressão automática antes do upload
- **Minificação**: CSS e JavaScript minificados no build

### Métricas Alvo
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.0s
```

### Troubleshooting

### Problemas Comuns

1. **Firebase Connection Error**
   - Verificar chaves de API no .env
   - Confirmar projeto Firebase ativo
   - Verificar regras de segurança

2. **Build Errors**
   - Limpar pasta node_modules
   - Atualizar dependências com npm update
   - Verificar compatibilidade de versões

3. **Service Worker Issues**
   - Limpar cache do navegador
   - Verificar URL do service worker
   - Testar em modo anônimo

### Debug Tools
- Firebase Console para monitoramento
- Chrome DevTools para debugging
- Lighthouse para análise de performance
- Network tab para análise de requisições
```

### API Documentation
```markdown
# docs/api-documentation.md

# API Documentation - Esplanada Eats

## Overview

This document describes the RESTful API endpoints and data structures used in the Esplanada Eats application.

## Base URL
```
https://api.esplanadaeats.com/v1
```

## Authentication

Most endpoints require authentication using Firebase ID tokens. Include the token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Restaurants

#### Get All Restaurants
```http
GET /restaurants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "restaurant_1",
      "name": "Restaurante Exemplo",
      "photoUrls": ["https://..."],
      "averageQuality": 4.2,
      "totalRatings": 15,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Restaurant by ID
```http
GET /restaurants/{id}
```

#### Create Restaurant
```http
POST /restaurants
```

**Request Body:**
```json
{
  "name": "Novo Restaurante",
  "photoUrls": ["https://..."]
}
```

### Ratings

#### Get Restaurant Ratings
```http
GET /restaurants/{id}/ratings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rating_1",
      "restaurantId": "restaurant_1",
      "quality": 5,
      "comment": "Ótimo restaurante!",
      "photoUrls": ["https://..."],
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Submit Rating
```http
POST /ratings
```

**Request Body:**
```json
{
  "restaurantId": "restaurant_1",
  "quality": 5,
  "comment": "Ótimo restaurante!",
  "photoUrls": ["https://..."]
}
```

### Analytics

#### Track Event
```http
POST /analytics/events
```

**Request Body:**
```json
{
  "event": "page_view",
  "parameters": {
    "page": "/restaurants",
    "user_id": "user_123"
  }
}
```

#### Get Dashboard Data
```http
GET /analytics/dashboard
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters"
  }
}
```

### Error Codes
- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Build application
      run: npm run build

    - name: Run E2E tests
      run: npm run test:e2e
      if: github.event_name == 'pull_request'

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Deploy to Firebase
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

    - name: Run post-deploy tests
      run: npm run test:smoke
      if: always()

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Deployment Scripts
```javascript
# scripts/deploy.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.version = this.getVersion();
    this.environment = process.env.NODE_ENV || 'development';
  }

  getVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }

  async preDeploy() {
    console.log('🚀 Starting pre-deployment checks...');

    // Run tests
    console.log('🧪 Running tests...');
    execSync('npm test', { stdio: 'inherit' });

    // Build application
    console.log('🔨 Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Generate version info
    this.generateVersionInfo();

    console.log('✅ Pre-deployment checks completed');
  }

  async deploy() {
    console.log('🚀 Starting deployment...');

    try {
      // Deploy to Firebase
      console.log('📦 Deploying to Firebase...');
      execSync('firebase deploy --only hosting', { stdio: 'inherit' });

      // Run smoke tests
      console.log('🔍 Running smoke tests...');
      await this.runSmokeTests();

      // Notify team
      console.log('📧 Sending deployment notification...');
      await this.notifyTeam();

      console.log('✅ Deployment completed successfully');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      await this.notifyTeam(error);
      process.exit(1);
    }
  }

  generateVersionInfo() {
    const versionInfo = {
      version: this.version,
      environment: this.environment,
      deployedAt: new Date().toISOString(),
      commit: process.env.GITHUB_SHA || 'local',
      branch: process.env.GITHUB_REF || 'local'
    };

    fs.writeFileSync(
      path.join('dist', 'version.json'),
      JSON.stringify(versionInfo, null, 2)
    );
  }

  async runSmokeTests() {
    // Basic smoke tests to verify deployment
    const tests = [
      'https://esplanadaeats.com',
      'https://esplanadaeats.com/offline.html'
    ];

    for (const url of tests) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }
        console.log(`✅ ${url} - OK`);
      } catch (error) {
        console.error(`❌ ${url} - Failed:`, error.message);
        throw error;
      }
    }
  }

  async notifyTeam(error = null) {
    const webhookUrl = process.env.SLACK_WEBHOOK;
    if (!webhookUrl) return;

    const message = {
      text: error ? '❌ Deployment Failed' : '✅ Deployment Successful',
      attachments: [{
        color: error ? 'danger' : 'good',
        fields: [
          {
            title: 'Version',
            value: this.version,
            short: true
          },
          {
            title: 'Environment',
            value: this.environment,
            short: true
          },
          {
            title: 'Time',
            value: new Date().toLocaleString(),
            short: true
          }
        ]
      }]
    };

    if (error) {
      message.attachments[0].fields.push({
        title: 'Error',
        value: error.message,
        short: false
      });
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }

  async rollback() {
    console.log('🔄 Starting rollback...');

    try {
      // Rollback to previous version
      execSync('firebase deploy --only hosting --version=previous', { stdio: 'inherit' });

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const manager = new DeploymentManager();

  switch (command) {
    case 'pre-deploy':
      manager.preDeploy();
      break;
    case 'deploy':
      manager.deploy();
      break;
    case 'rollback':
      manager.rollback();
      break;
    default:
      console.log('Usage: node deploy.js [pre-deploy|deploy|rollback]');
      process.exit(1);
  }
}

module.exports = DeploymentManager;
```

### User Documentation
```markdown
# docs/user-guide.md

# Guia do Usuário - Esplanada Eats

## Bem-vindo ao Esplanada Eats!

O Esplanada Eats é um aplicativo para descobrir e avaliar restaurantes na sua região. Este guia vai ajudar você a aproveitar ao máximo todas as funcionalidades.

## Primeiros Passos

### Acessando o Aplicativo
1. Abra seu navegador e acesse: https://esplanadaeats.com
2. O aplicativo funciona diretamente no navegador - não precisa instalar nada!

### Navegação Básica
- **Página Inicial**: Lista todos os restaurantes cadastrados
- **Filtros**: Use os filtros para encontrar restaurantes específicos
- **Busca**: Procure por nome do restaurante

## Funcionalidades

### Visualizar Restaurantes
- **Cards**: Cada restaurante é mostrado em um card com foto e avaliação média
- **Detalhes**: Clique em qualquer card para ver informações completas
- **Fotos**: Veja fotos do ambiente e pratos

### Avaliar Restaurantes
1. Abra o restaurante que você quer avaliar
2. Role para baixo até encontrar o formulário de avaliação
3. Dê sua nota de 1 a 5 estrelas
4. (Opcional) Adicione um comentário sobre sua experiência
5. (Opcional) Adicione até 2 fotos
6. Clique em "Enviar avaliação"

#### Importante
- Você só pode avaliar cada restaurante uma vez
- Suas avaliações são anônimas
- As notas são calculadas em tempo real

### Adicionar Novos Restaurantes
1. Clique no botão "Adicionar Restaurante"
2. Preencha as informações básicas:
   - Nome do restaurante (mínimo 4 caracteres)
   - Fotos (opcional, máximo 4)
3. Clique em "Salvar"

## Funcionalidades Avançadas

### Modo Offline
- O aplicativo funciona mesmo sem internet!
- Restaurantes já visitados ficam disponíveis offline
- Avaliações feitas offline são sincronizadas quando você voltar a ter conexão

### Dispositivos Móveis
- O aplicativo é totalmente responsivo
- Funciona perfeitamente em celulares e tablets
- Toque duplo em fotos para ampliar
- Deslize para fechar modais

### Segurança e Privacidade
- Suas informações são protegidas
- Não coletamos dados pessoais identificáveis
- Avaliações são anônimas por padrão

## Dicas e Truques

### Economizando Dados
- Fotos são otimizadas automaticamente
- O aplicativo funciona bem mesmo com conexão lenta
- Você pode usar o modo offline para economizar dados

### Encontrando os Melhores Restaurantes
- Procure por restaurantes com muitas avaliações
- Leia os comentários para ter uma ideia melhor
- Fotos ajudam a conhecer o ambiente antes de visitar

## Problemas Comuns

### O Aplicativo Não Carrega
- Verifique sua conexão com a internet
- Tente recarregar a página (F5)
- Limpe o cache do navegador

### Não Consigo Avaliar
- Verifique se você já avaliou este restaurante antes
- Certifique-se de que deu uma nota (1-5 estrelas)
- Tente novamente em alguns minutos

### Fotos Não Carregam
- Verifique sua conexão
- Tente enviar fotos menores (menos de 1MB)
- Formatos suportados: JPG, PNG, WebP

## Contato e Suporte

Precisa de ajuda? Entre em contato:
- **Email**: suporte@esplanadaeats.com
- **Horário**: Segunda a Sexta, 9h às 18h
- **Tempo de resposta**: Até 24 horas úteis

## Atualizações

O aplicativo é atualizado regularmente com:
- Novos restaurantes
- Melhorias de performance
- Correção de bugs
- Novas funcionalidades

Fique atento às novidades!
```

### Final Configuration Files
```json
# firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions"
  }
}
```

```javascript
# vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['firebase'],
          utils: ['./src/js/utils/index.js'],
          components: ['./src/js/components/index.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/js/components'),
      '@services': resolve(__dirname, 'src/js/services'),
      '@utils': resolve(__dirname, 'src/js/utils')
    }
  },
  define: {
    'process.env': process.env,
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
});
```

## Dependencies
- **Story 4.4**: Analytics & Monitoring for deployment monitoring
- **Story 0.1**: Firebase Project Configuration for deployment setup
- **Story 1.1**: Project Setup & Basic Structure for project structure

## Testing Checklist
- [ ] All documentation is generated and accessible
- [ ] CI/CD pipeline runs successfully
- [ ] Deployment to staging works
- [ ] Deployment to production works
- [ ] Rollback procedure works
- [ ] Post-deploy tests pass
- [ ] Documentation is comprehensive
- [ ] All team members can deploy
- [ ] Monitoring is configured
- [ ] Security is configured

## Notes
- Esta história finaliza o projeto com documentação completa e processo de deployment
- A documentação cobre aspectos técnicos e de usuário
- O processo de CI/CD é automatizado e confiável
- O deploy é seguro e monitorado
- A equipe tem todos os recursos necessários para manter o projeto
- O projeto está pronto para produção