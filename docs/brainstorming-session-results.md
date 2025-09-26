# 🎯 Sessão de Brainstorming - Esplanada Eats Web App

## Resumo Executivo

**Projeto:** Aplicativo web single-page para cadastro e avaliação de restaurantes
**Técnica Utilizada:** User Journey Mapping
**Duração:** Sessão focada em funcionalidades essenciais
**Escopo:** Solução simples com armazenamento local, execução no navegador
**Total de Funcionalidades Identificadas:** 9 (6 core + 3 secundárias)

## Contexto do Projeto
### **Objetivos Principais:**

1. Ajudar pessoas a encontrar melhores restaurantes (preço, qualidade, acesso)
2. Facilitar compartilhamento de impressões entre clientes
3. Resolver dificuldade em encontrar restaurantes com restrições dietéticas



### **Limitações Técnicas:**
- Solução simples e elegante
- Armazenamento local (localStorage)
- Single-page application
- Teste direto no navegador

## User Journey Mapping
### **👨‍🍳 Persona 1: Dono de Restaurante**
**1. Primeiro Contato**
- Entrada via indicação ou busca
- Landing page com CTA "Adicionar Meu Restaurante"
- Visualização de exemplos existentes

**2. Processo de Cadastro**
- Formulário com campos obrigatórios:
- Nome do restaurante
- Horário de funcionamento
- Preço (valor)
- Qualidade inicial (0-5 estrelas)
- Opções Vegetarianas (Muitas/Algumas/Poucas/Nenhuma)
- Acesso (Simples/Médio/Burocrático)
- Campos opcionais: Comentários, Fotos

**3. Pós-Cadastro**
- Restaurante aparece imediatamente na homepage
- Confirmação visual e instruções para compartilhamento


### **🍽️ Persona 2: Cliente Faminto**
**1. Descoberta**
- Busca ativa por restaurantes na região
- Navegação por cards com filtros (preço, qualidade, acesso, vegetariano)
- Ordenação por relevância, avaliação, proximidade

**2. Interação**
- Clique no card abre modal com detalhes completos
- Visualização de fotos, avaliações individuais, comentários
- Decisão sobre visita ao restaurante

**3. Avaliação Pós-Experiência**
- Retorno ao app após visita ao restaurante
- Identificação por nome + prevenção de duplicatas via cookie
- Avaliação nos mesmos critérios de cadastro

### **🔍 Persona 3: Cliente Curioso**
**1. Exploração Passiva**
- Navegação sem objetivo específico
- Descoberta por acaso de restaurantes interessantes
- Visualização de fotos e avalições

**2. Interação Leve**
- Comparação entre restaurantes
- Compartilhamento com amigos
- Avaliação eventual quando já conhece o estabelecimento


## Funcionalidades Identificadas
### **Core Features (MVP - Essenciais)**
#### **1. Homepage com Cards de Restaurantes**
- Layout responsivo com grade de cards
- Informações essenciais visuais:
- Nome do restaurante
- Nota média (estrelas)
- Número de avaliações
- Status de funcionamento (aberto/fechado)
- Horário de funcionamento
- Faixa de preço (💰💰💰)
- Tags de acesso (🟢🟡🔴)
- Indicador vegetariano (🥦🥕🌽❌)
- Miniatura de foto (se disponível)

#### **2. Modal de Detalhes do Restaurante**
- Abertura via clique no card
- Informações completas:
- Todas as informações do card (expandidas)
- Fotos em galeria
- Lista completa de avaliações individuais
- Comentários detalhados
- Horário de funcionamento detalhado
- Botão para avaliar restaurante

#### **3. Formulário de Cadastro de Restaurantes**
- Interface para donos adicionarem estabelecimentos
- Validação de campos obrigatórios
- Upload opcional de fotos
- Feedback visual em tempo real
- Preview do card antes de publicar

  #### **4. Sistema de Avaliação**
- Formulário para usuários avaliarem restaurantes
- Mesmos critérios do cadastro:
  - Qualidade (0-5 estrelas)
  - Preço (0-5 estrelas)
  - Acesso (Simples/Médio/Burocrático)
  - Opções Vegetarianas (escala)
- Campos opcionais: Comentário, Fotos
- Identificação por nome + prevenção via cookie


#### **5. Sistema de Filtros e Busca**
- Filtros combináveis:
  - Faixa de preço
  - Nota mínima
  - Facilidade de acesso
  - Opções vegetarianas
  - Status (aberto/fechado)
- Busca por nome do restaurante
- Ordenação por: mais bem avaliados, mais recentes, preço

#### **6. Sistema de Prevenção de Avaliações Duplicadas**
- Identificação por nome de usuário
- Armazenamento de cookie por restaurante
- Mensagem informativa se usuário já avaliou
- Permite visualização de avaliação anterior

### **Funcionalidades Secundárias**
#### **7. Upload de Fotos**
- Para cadastro de restaurantes
- Para avaliações de usuários
- Preview antes de upload
- Otimização para armazenamento local

#### **8. Sistema de Validação de Formulários**
- Validação em tempo real
- Mensagens de erro claras
- Formatação automática de campos
- Indicação de campos obrigatórios

#### **9. Design Responsivo**
- Adaptável para mobile, tablet e desktop
- Cards que se ajustam ao tamanho da tela
- Modal funcional em todos os dispositivos
- Formulários usáveis em mobile

## Estrutura de Dados
### **Restaurantes**
```javascript
{
  id: string,
  name: string,
  hours: string,
  price: number,
  initialQuality: number,
  vegetarianOptions: string,
  access: string,
  description?: string,
  photos?: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Avaliações**
```javascript
{
  id: string,
  restaurantId: string,
  userName: string,
  quality: number,
  price: number,
  access: string,
  vegetarianOptions: string,
  comment?: string,
  photos?: string[],
  createdAt: timestamp
}
```

### **Prevenção de Duplicatas**
```javascript
{
  restaurantId: string,
  userName: string,
  userAgent: string,
  timestamp: timestamp
}
```

## Considerações Técnicas

### **Armazenamento Local**
- localStorage para dados persistentes
- Limite de ~5MB por domínio
- Estrutura JSON para serialização
- Sistema de backup/restore opcional

### **Performance**
- Renderização client-side
- Carregamento lazy das imagens
- Debounce para buscas e filtros
- Otimização para dispositivos móveis

### **Segurança Básica**
- Validação de inputs no frontend
- Sanitização de dados
- Proteção contra XSS básica
- Limitação de tamanho de uploads

## Fluxo de Navegação Principal

```
Homepage (Cards) → Modal Detalhes → Formulário Avaliação
    ↓
Formulário Cadastro → Homepage (atualizada)
```

## Próximos Passos Recomendados

### **Fase 1: MVP Essencial**
1. Implementar estrutura básica HTML/CSS
2. Criar sistema de armazenamento localStorage
3. Desenvolver formulário de cadastro
4. Implementar exibição de cards na homepage
5. Criar modal de detalhes

### **Fase 2: Sistema de Avaliação**
1. Implementar formulário de avaliação
2. Criar sistema de prevenção de duplicatas
3. Desenvolver cálculo de médias
4. Adicionar interface para avaliações individuais

### **Fase 3: Recursos Avançados**
1. Implementar sistema de filtros e busca
2. Adicionar upload de fotos
3. Otimizar design responsivo
4. Adicionar validações avançadas

## Pontos de Atenção

### **Validações Necessárias**
- Campos obrigatórios no cadastro
- Formato de horários de funcionamento
- Valores numéricos para preços e avaliações
- Tamanho e formato de imagens

### **Experiência do Usuário**
- Feedback visual para todas as ações
- Indicadores de loading para operações
- Mensagens de sucesso/erro claras
- Navegação intuitiva entre telas

### **Limitações Conhecidas**
- Dados perdidos ao limpar cache do navegador
- Sem sincronização entre dispositivos
- Limitação de armazenamento do localStorage
- Funcionalidade offline limitada

*Documento gerado em 13/09/2025 - Sessão de Brainstorming com User Journey Mapping*