# 🎯 Project Brief - Esplanada Eats

## Resumo Executivo

**Projeto:** Esplanada Eats - Aplicativo web single-page para cadastro e avaliação de restaurantes
**Tipo:** MVP (Minimum Viable Product)
**Plataforma:** Web application, roda no navegador
**Armazenamento:** LocalStorage (client-side)
**Complexidade:** Baixa/Média
**Timeline Estimada:** 2-4 semanas para MVP

## Visão do Projeto

### **Conceito**
Aplicativo multi-usuário que permite a qualquer pessoa adicionar restaurantes à plataforma e avaliá-los, criando um catálogo colaborativo e descentralizado de estabelecimentos gastronômicos.

### **Problema Solucionado**
1. **Dificuldade em descobrir restaurantes** que atendam critérios específicos (preço, qualidade, acesso, opções vegetarianas)
2. **Falta de um sistema compartilhado** para avaliações autênticas e confiáveis
3. **Barreiras para contribuição** - plataformas existentes exigem cadastros complexos ou são controladas por empresas

### **Proposta de Valor**
- **Simplicidade:** Cadastro e avaliação sem login complexo
- **Transparência:** Avaliações visíveis para todos os usuários
- **Acessibilidade:** Funciona em qualquer navegador com armazenamento local
- **Comunitário:** Construído e mantido pela comunidade de usuários

## Objetivos do Projeto

### **Objetivos Principais**
1. **Facilitar descoberta de restaurantes** com base em critérios múltiplos (preço, qualidade, acesso, vegetariano)
2. **Permitir contribuição colaborativa** sem barreiras técnicas
3. **Criar um sistema confiável** de avaliações com prevenção de fraudes
4. **Oferecer experiência mobile-friendly** para uso em qualquer dispositivo

### **Métricas de Sucesso**
- Número de restaurantes cadastrados
- Número de avaliações por restaurante
- Taxa de retenção de usuários
- Tempo médio de sessão
- Dispositivos mais utilizados

## Público-Alvo

### **Usuários Primários**
- **Clientes em busca de restaurantes** - Pessoas procurando novos lugares para comer
- **Donos de restaurantes** - Querem cadastrar seus estabelecimentos
- **Food enthusiasts** - Gostam de descobrir e avaliar novos lugares

### **Perfil do Usuário**
- Familiarizado com apps de avaliação (TripAdvisor, Google Reviews)
- Prefere simplicidade versus funcionalidades complexas
- Valoriza opiniões da comunidade versus avaliações pagas
- Usa smartphone para pesquisa local

## Escopo do Projeto

### **MVP - Funcionalidades Essenciais**

#### **1. Homepage com Cards de Restaurantes**
- Layout responsivo (4 cards desktop / 1 card mobile)
- Informações essenciais por card:
  - Nome do restaurante
  - Avaliação média de qualidade (estrelas)
  - Faixa de preço (💰💰💰)
- Ordenação padrão: "Mais bem avaliados"
- Estado vazio: Mensagem "Sem restaurantes cadastrados"
- Interação: Clique abre modal de detalhes

#### **2. Modal de Detalhes do Restaurante**
- Informações completas:
  - Horário de funcionamento
  - Status atual (aberto/fechado)
  - Descrição e endereço
  - Fotos em galeria
  - Lista completa de avaliações
- Avaliações ordenadas por mais recentes
- Botão "Avaliar Restaurante"
- Comportamento: Abre sobre homepage, fecha com X/clique fora/ESC

#### **3. Formulário de Cadastro de Restaurantes**
- Botão "Adicionar Restaurante" no topo direito
- Abre em modal
- Campos obrigatórios:
  - Nome (mínimo 4 caracteres)
  - Horário de funcionamento (formato: "12h30-18h")
  - Preço (valor único ou faixa "R$ 30-50")
  - Opções Vegetarianas (Muitas/Algumas/Poucas/Nenhuma)
  - Acesso (Simples/Médio/Burocrático)
- Campos opcionais:
  - Descrição do restaurante
  - Fotos (até 4, formatos JPG/PNG/WebP)
- Validação em tempo real com feedback visual
- Após sucesso: Mensagem de confirmação + card aparece primeiro na lista

#### **4. Sistema de Avaliação**
- Botão "Avaliar" embaixo do card ou no modal do restaurante
- Avaliação em modal
- Campos obrigatórios:
  - Nome do avaliador
  - Qualidade (0-5 estrelas, meio pontos)
  - Preço (0-5 estrelas, meio pontos)
  - Acesso (Simples/Médio/Burocrático)
  - Opções Vegetarianas (Muitas/Algumas/Poucas/Nenhuma)
- Campos opcionais:
  - Comentário
  - Fotos
- Prevenção de duplicatas via fingerprint + localStorage
- Destaque visual para avaliação do próprio usuário

### **Funcionalidades Fora do Escopo (V2)**
- Sistema de login/contas de usuário
- Busca por localização/geolocalização
- Sistema de favoritos ou listas personalizadas
- Integração com redes sociais
- Sistema de notificações
- Comentários em avaliações
- Edição/deleção de avaliações
- Administração de conteúdo
- API externa

## Requisitos Técnicos

### **Arquitetura**
- **Single Page Application** - Todo o conteúdo em uma página HTML
- **Client-side only** - Nenhum servidor necessário
- **LocalStorage** - Armazenamento persistente no navegador
- **Vanilla JavaScript** - Sem frameworks externos
- **Responsive Design** - Mobile-first approach

### **Estrutura de Dados**

#### **Restaurantes**
```javascript
{
  id: string,
  name: string,
  hours: string,
  price: string,
  vegetarianOptions: string,
  access: string,
  description?: string,
  photos?: string[],
  createdAt: string,
  updatedAt: string
}
```

#### **Avaliações**
```javascript
{
  id: string,
  restaurantId: string,
  userName: string,
  userFingerprint: string,
  quality: number,
  price: number,
  access: string,
  vegetarianOptions: string,
  comment?: string,
  photos?: string[],
  createdAt: string
}
```

#### **Controle de Duplicatas**
```javascript
{
  restaurantId: string,
  userFingerprint: string,
  timestamp: string
}
```

### **Segurança e Validação**
- **XSS Prevention:** Sanitização de inputs e comentários
- **Image Validation:** Tipos permitidos (JPG/PNG/WebP), tamanho máximo 2MB
- **Input Validation:** Validação client-side de todos os campos
- **Fingerprinting:** Identificação básica de navegador para prevenção de fraudes

### **Performance**
- **Image Optimization:** Redimensionamento e compressão de imagens
- **LocalStorage Management:** Monitoramento de espaço disponível (~5MB limite)
- **Debouncing:** Para buscas e filtros em tempo real
- **Lazy Loading:** Para imagens em listas longas

## Design e User Experience

### **Princípios de Design**
- **Simplicidade:** Interface limpa e intuitiva
- **Consistência:** Mesmos padrões em toda a aplicação
- **Acessibilidade:** Cores contrastantes, texto legível, navegação por teclado
- **Feedback Visual:** Respostas claras para todas as ações do usuário
- **Mobile-first:** Otimizado para uso em smartphones

### **Identidade Visual**
- **Cores Primárias:** Verde (acesso fácil), Amarelo (médio), Vermelho (difícil)
- **Iconografia:** Ícones intuitivos para cada categoria de informação
- **Tipografia:** Fontes legíveis em diferentes tamanhos de tela
- **Imagens:** Foco em fotos reais dos restaurantes

## Plano de Implementação

### **Fase 1 - Estrutura Básica (Semana 1)**
1. Setup do projeto (HTML, CSS, JavaScript básico)
2. Estrutura do localStorage e funções de CRUD
3. Homepage com layout responsivo
4. Sistema de cards básico (com dados mock)

### **Fase 2 - Cadastro de Restaurantes (Semana 2)**
1. Modal de formulário de cadastro
2. Validação de campos em tempo real
3. Upload e otimização de imagens
4. Salvar restaurantes no localStorage
5. Atualizar dinamicamente a homepage

### **Fase 3 - Sistema de Avaliação (Semana 3)**
1. Modal de avaliação
2. Sistema de fingerprint do usuário
3. Prevenção de avaliações duplicadas
4. Cálculo de médias de avaliação
5. Interface de listagem de avaliações

### **Fase 4 - Detalhes e Polimento (Semana 4)**
1. Modal de detalhes completo
2. Galeria de imagens
3. Filtros e ordenação
4. Testes em diferentes dispositivos
5. Otimizações de performance e UX

### **Milestones**
- **Semana 1:** Estrutura básica funcional
- **Semana 2:** Cadastro de restaurantes operacional
- **Semana 3:** Sistema de avaliação funcionando
- **Semana 4:** MVP completo e pronto para teste

## Riscos e Mitigação

### **Riscos Técnicos**
- **Limite do localStorage:** ~5MB pode ser insuficiente para muitos dados
  - *Mitigação:* Monitoramento de uso, compressão de dados, alertas ao usuário
- **Perda de dados:** Limpeza de cache pelo usuário perde todos os dados
  - *Mitigação:* Avisos claros, opção de exportar dados
- **Segurança:** Dados vulneráveis no cliente
  - *Mitigação:* Sanitização de inputs, sem dados sensíveis

### **Riscos de Usuário**
- **Baixa adoção:** Poucos usuários cadastrando/avaliando
  - *Mitigação:* Interface intuitiva, feedback positivo ao contribuir
- **Spam/fake content:** Restaurantes ou avaliações falsas
  - *Mitigação:* Validação básica, sistema de fingerprint
- **Experiência mobile pobre:** Usabilidade ruim em smartphones
  - *Mitigação:* Mobile-first design, testes extensivos

### **Riscos de Escopo**
- **Feature creep:** Tendência a adicionar mais funcionalidades
  - *Mitigação:* Manter foco no MVP, documentar ideias para V2
- **Complexidade não prevista:** Requisitos surgindo durante desenvolvimento
  - *Mitigação:** Revisões semanais de escopo, comunicação clara

## Orçamento e Recursos

### **Recursos Necessários**
- **Desenvolvedor Frontend:** 1 pessoa, tempo integral
- **Designer UI/UX:** Meio período para Fase 1 e 4
- **Testers:** 3-5 pessoas para testes de usabilidade
- **Ferramentas:** Editor de código, navegador, ferramentas de debug

### **Custos Estimados**
- **Desenvolvimento:** ~160 horas (4 semanas × 40 horas)
- **Design:** ~40 horas
- **Testes:** ~20 horas
- **Total:** ~220 horas de esforço

### **Infraestrutura**
- **Hospedagem:** Qualquer serviço estático (GitHub Pages, Netlify, Vercel)
- **Domínio:** Opcional, pode usar subdomínio gratuito
- **Custo:** Próximo de zero para MVP

## Sucesso e Métricas

### **Métricas de Lançamento**
- [ ] Homepage responsiva funcional
- [ ] Cadastro de restaurantes operacional
- [ ] Sistema de avaliação funcionando
- [ ] Modal de detalhes completo
- [ ] Validações e segurança implementadas
- [ ] Testes em 3+ dispositivos diferentes

### **Métricas de Uso (Pós-Lançamento)**
- Número de restaurantes cadastrados (meta: 50+)
- Número de avaliações por restaurante (meta: 2+ por restaurante)
- Taxa de novos usuários (semanal)
- Dispositivos mais utilizados
- Tempo médio de sessão

### **Critérios de Sucesso**
- Usuários conseguem cadastrar restaurantes sem ajuda
- Sistema de prevenção de duplicatas funciona corretamente
- Interface é usável em dispositivos mobile
- Não há perda significativa de dados em operações normais

## Apêndice

### **Tecnologias Sugeridas**
- **HTML5:** Estrutura semântica
- **CSS3:** Flexbox/Grid para layout responsivo
- **Vanilla JavaScript:** ES6+ para funcionalidades
- **LocalStorage:** Armazenamento de dados
- **Canvas API:** Processamento de imagens

### **Referências de Design**
- Material Design guidelines
- Apple Human Interface Guidelines
- Google Maps interface patterns
- Airbnb design system

### **Notas Importantes**
- Este é um projeto educacional/demonstração
- Dados são voláteis e podem ser perdidos
- Não substitui sistemas profissionais de avaliação
- Escalabilidade limitada pelo localStorage

---
*Documento gerado em 13/09/2025 - Mary (Business Analyst)*