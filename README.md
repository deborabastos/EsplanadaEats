1.Projeto: Quero criar um aplicativo multi-usuário em que seja possível adicionar restaurantes e avaliá-los.

Para adicionar os restaurantes, deve-se colocar, obrtigatoriamente, os seguintes campos: Nome, Horário de funcionamento, Preço (em valor), Qualidade (0 a 5 estrelas), Opções Vegetarianas (Muitas opções, Algumas opções, Poucas opções, Nenhuma opção), Acesso (Simples, Médio, Burocrático). E opcionalmente, Comentários e Fotos.

Uma vez cadastrado, outros usuários poderão avaliar o restaurante conforme Qualidade (0 a 5 estrelas), Preço (0 a 5 estrelas), Acesso (Simples, Médio, Burocrático), Opções Vegetarianas (Muitas opções, Algumas opções, Poucas opções, Nenhuma opção), Comentário (opcional) e fotos (opcional). 

Não é necessário fazer login, basta dar o nome para poder fazer a avaliação. O sistema deve prevenir, utilizando cookies, avaliações multiplas de um mesmo usuário em um mesmo restaurante. Cada usuário deve poder avaliar uma vez, cada um dos restaurantes cadastrados.

Os restaurantes devem aparecer na homepage, em cards, mostrando a média das avaliações e outras informações essenciais. Ao clicar no restaurante, deve-se abrir um modal onde é possível ver mais detalhes, como avaliações individuais e comentários. 


2.Limitações: deve ser uma solução simples e elegante, com armazenamento local, rode tipo web, página única, com teste no meu navegador.

3. Objetivo da sessão: elaborar um documento estruturado com as ideias apresentadas.
4.sim


1. ajudar as pessoas a encontrar os melhores restaurantes da região em termos de preço, qualidade, facilidade de acesso. 
2. compartilhar impressões com outros clientes potenciais
3. dificuldade em encontrar restaurantes que atendam restrições dietéticas específicas






Funcionalidade 1: Homepage com Cards de Restaurantes

  a) Layout e Visual:
  - Como os cards devem ser organizados lado a lado, de acordo com a responsividade do dispositivo do usuário
  - Quantos cards por linha em desktop (4) vs mobile (1)
  - São ABSOLUTAMENTE essenciais no card Nome, avaliação de qualidade média, preço

  b) Interação:
  - O que acontece quando não há restaurantes cadastrados? Mensagem: "Sem restaurantes cadastrados"
  - Os cards não aparecem se não tiverem restaurantes cadastrados

  c) Ordenação:
  - Ordenação padrão quando a página carrega: melhor avaliado



Funcionalidade 2: Modal de Detalhes do Restaurante

  Perguntas de elicitação:

  a) Conteúdo do Modal:
  - Quais informações do restaurante devem ser destacadas?
  - Como as avaliações individuais devem ser exibidas?

  b) Comportamento do Modal:
  - O modal abre sobre o conteúdo ou substitui a página?
  - Como o usuário fecha o modal?




  Funcionalidade 2: Modal de Detalhes do Restaurante
  a) Conteúdo do Modal:
  - Quais informações específicas do restaurante devem ser mostradas?
    - Horário de funcionamento, Status atual (aberto/fechado), Descrição do restaurante, Endereço, avaliações anteriores, comentários, fotos

  b) Avaliações no Modal:
  - Como exibir as avaliações individuais?
    - Lista simples com nome do avaliador + notas
    - Ordenação das avaliações (mais recentes primeiro)
    - Mostrar fotos das avaliações

  c) Comportamento do Modal:
  - O modal abre sobre a homepage
  - Como fechar o modal? (X no canto, clique fora ou ESC)
  - O que acontece quando clica em "Avaliar" dentro do modal? Abre a página para avaliação do restaurante

  d) Dados Dinâmicos:
  - O modal deve mostrar sempre dados atualizados? sim
  - Como calcular e exibir a média das avaliações? Média simples




  Funcionalidade 3: Formulário de Cadastro de Restaurantes
  a) Campos do Formulário:
  - Obrigatórios: Nome, Horário, Preço (valor), Qualidade (0-5), Opções Veg, Acesso
  - Opcionais: Comentários, Fotos
  - Como formatar cada campo?
    - Horário: "12h30 - 18h"
    - Preço: se preço por quilo, valor único, se for a la carte, faixa (ex: "R$ 30-50")?
    - Qualidade inicial: como o dono define isso? não define

  b) Validações:
  - Quais regras para cada campo?
    - Nome: mínimo de 4 caracteres
    - Horário: não importa
    - Preço: valor numérico positivo
    - Qualidade: 0-5 estrelas

  c) Upload de Fotos:
  - Quantas fotos podem ser enviadas? 4
  - Qual tamanho máximo por foto? o suficiente para visualização web. Diminuir o tamanho e qualidade se a foto original for grande.
  - Formatos permitidos? (JPG, PNG, WebP)

  d) Fluxo do Formulário:
  - Onde fica o botão "Adicionar Restaurante"? No topo da página, à direita
  - O formulário abre em modal ou página separada? Modal
  - O que acontece após salvar com sucesso? Mensagem de cadastrado com sucesso e surge um card no primeiro lugar com as informações prestadas

  e) Feedback Visual:
  - Como mostrar erros de validação? ficar vermelho e informar o requisito
  - Mensagem de sucesso após cadastro? sim
  - Preview do card antes de publicar? não



  Funcionalidade 4: Sistema de Avaliação
  a) Identificação do Usuário:
  - Como identificar que é a mesma pessoa avaliando?
    - Apenas por nome digitado? Não, podem haver nomes iguais
        - fingerprint do navegador? sim
        - armazenamento local? sim

  b) Prevenção de Duplicatas:
  - Como impedir múltiplas avaliações?
    - Cookie por restaurante? sim
    - localStorage por usuário+restaurante? sim
    - Por quanto tempo vale a restrição? enquanto for possível identificar

  c) Campos da Avaliação:
  - Mesmos campos do cadastro? Não: Qualidade 0-5, Preço 0-5, Acesso, Opções Veg
  - Opcionais: Comentário, Fotos
  - Como o usuário avalia qualidade e preço? (estrelas, variando de 0,5 em 0,5)

  d) Fluxo de Avaliação:
  - Onde fica o botão "Avaliar"? Embaixo do card ou no canto superior direito do modal do restaurante
  - Avaliação acontece em modal
  - O que acontece após avaliar com sucesso? mensagem de avaliação enviada com sucesso

  e) Feedback Visual:
  - Como mostrar que usuário já avaliou? Destacar a avaliação feita pelo usuário
  - Mensagem de avaliação duplicada? se do mesmo usuário, não permitir
  - Preview da avaliação antes de enviar? Não

  f) Dados da Avaliação:
  - Como armazenar nome do avaliador? localstorage
  - Como associar avaliação ao restaurante? localstorage
  - Timestamp da avaliação? localstorage



  1. Arquitetura de Dados:
  - Como estruturar o localStorage para restaurantes vs avaliações vs usuários? não sei, me sugira
  - Qual o limite de armazenamento estimado? não sei, me sugira

  2. Performance:
  - Como garantir performance com muitos dados em localStorage? a princípio, não há preocupação com performance
  - Estratégia para limpeza de dados antigos? não

  3. Segurança Básica:
  - Como prevenir XSS nos comentários? não sei, me sugira
  - Validação de uploads de imagens? sim, impedir conteúdo sensível

  4. Prioridade de Implementação:
  - Qual funcionalidade implementar primeiro? homepage
  - Qual ordem de desenvolvimento? cadastro, avaliações



  