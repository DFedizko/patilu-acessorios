# PRD — Patilu Kits (Backend e funcionalidades de produto)

> **Tipo de documento:** PRD de **produto**. Descreve _o que_ o sistema precisa fazer, as regras de negócio e os critérios de aceite. **Não** entra em decisões técnicas (modelagem de tabelas, ORM, DI, hospedagem, tempo real, integração de baixo nível com o TikTok) — isso é responsabilidade da **tech spec**, que será escrita a partir deste documento.
>
> **Contexto:** o front-end já está construído e funcional, porém roda 100% com dados de mentira (_seed_) guardados em memória no navegador (Zustand). Nada é persistido. Este PRD define as funcionalidades que faltam para o produto funcionar de verdade: persistência em banco, autenticação, sincronização entre aparelhos e a **integração com o TikTok (pedidos + anúncios)**, que passa a alimentar a fila de pedidos a empacotar.
>
> **Leituras de apoio:** [`CLAUDE.md`](../CLAUDE.md) (visão geral) e [`docs/Context.md`](./Context.md) (histórico das decisões).

---

## 1. Visão e objetivo

**Patilu Kits** é a ferramenta interna da **Patilu Acessórios**, papelaria que vende ao vivo em lives do TikTok. Durante a live, o cliente monta um kit personalizado (ex.: 3 canetas + 1 caderno). Como o sortimento muda toda semana, a loja **não sabe o custo nem a margem de cada kit** e acaba vendendo no escuro.

**Objetivo único do produto:** **mostrar o custo e a margem de cada kit no momento de empacotar**, e consolidar esses números em relatórios por período — descontando o gasto real com anúncios do TikTok.

A virada de chave do modelo: **não rastrear qual item, e sim a faixa de custo do item**. Conta-se quantos itens de cada faixa entraram na caixa; o sistema calcula o custo e a margem na hora.

### Métricas de sucesso (produto)

- O operador fecha uma caixa e vê a margem correta **antes** de finalizar, em segundos.
- Dois operadores em aparelhos diferentes veem o **mesmo histórico** atualizado.
- Nenhum dado de venda é perdido (sem dependência de cache do navegador).
- O dashboard mostra **lucro real** do período, já com o gasto de anúncios do TikTok descontado.

---

## 2. Personas e uso

- **Operador de empacotamento (persona principal):** 1 a 2 pessoas, empacotando caixas em ritmo rápido durante e depois da live. Usa principalmente **celular/tablet**. Precisa de telas rápidas, botões grandes e a margem em destaque. Todos os operadores têm o **mesmo poder** (sem papéis/permissões diferentes).
- **Dono/gestor:** olha o dashboard e o histórico para entender lucro e margem. É a mesma conta de operador (não há papel separado nesta fase).

**Volume:** ~30 kits por live em média; pico raro acima de 100. Em dias cheios, **dois operadores empacotam ao mesmo tempo, em aparelhos diferentes**, e precisam ver o mesmo histórico.

---

## 3. Modelo de domínio (em linguagem de produto)

Estas são as "coisas" que o sistema precisa lembrar. (A modelagem física fica para a tech spec.)

| Conceito                            | O que é                                                                                                                                     | Dados que o sistema lembra                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoria**                       | Agrupamento livre de faixas, só para organizar a tela (ex.: Canetas, Cadernos, Estojos). Criada/renomeada/excluída sob demanda.             | nome; data de criação                                                                                                                                                                            |
| **Faixa de custo (tier)**           | Rótulo que representa um **preço de compra** (ex.: "Caneta R$1", "Caderno R$8"). Marca/cor/personagem não importam — só o que foi pago.     | nome; custo (R$); **código de barras gerado pelo sistema**; categoria a que pertence                                                                                                             |
| **Pedido (Order)**                  | Uma venda vinda do **TikTok**. É o que o operador empacota. Não é criado à mão.                                                             | id do pedido no TikTok; @cliente; valor da venda; frete; data/hora do pedido; **status de envio** (pendente/enviado, segundo o TikTok); **status de empacotamento** (empacotado ou não, interno) |
| **Empacotamento** (antes "Caixa")   | O detalhamento de custo que o operador atribui a um pedido (os itens que entraram na caixa). Um pedido → um empacotamento.                  | **detalhamento dos itens** (ver abaixo); itens avulsos; custo total; **quem empacotou (operador)**; data/hora do empacotamento                                                                   |
| **Item do empacotamento**           | Quantos itens de uma faixa entraram naquele pedido, com o **custo da faixa congelado** no momento do empacotamento.                         | faixa de origem (referência); quantidade; **custo unitário no momento** (snapshot); nome da faixa/categoria no momento (para o histórico não quebrar se a faixa for excluída)                    |
| **Item avulso**                     | Item pontual digitado na hora (nome + custo), para o que não cabe em faixa (ex.: pelúcia de R$28).                                          | nome; custo (R$) — pertence a um empacotamento específico                                                                                                                                        |
| **Dados do TikTok (Ads + Pedidos)** | Tudo que vem da integração: o gasto com anúncios do período **e** os pedidos (cliente, valor, frete, status). **Automático**, não digitado. | total de ads por período; lista de pedidos do período com seus campos; valor de ads manual de _fallback_ só quando a integração está indisponível                                                |
| **Custo fixo por pedido**           | Custo fixo do negócio por caixa (ex.: embalagem), hoje **R$3**. Configurável. Entra no cálculo de lucro no Histórico e no Dashboard.        | valor atual configurado (R$)                                                                                                                                                                     |
| **Operador (usuário)**              | Pessoa logada que empacota. Autenticação via **Clerk**.                                                                                     | identidade do usuário (vinda do Clerk)                                                                                                                                                           |

**Princípio de classificação de itens:** item **barato, repetitivo e variável** → vira **faixa** e é contado. Item **caro, raro e variável** → vira **item avulso** digitado na hora.

> **Decisão registrada — Taxa da plataforma:** o `Context.md` previa uma "taxa da plataforma (%)" no cálculo da margem. **Foi descartada.** O custo de vender pela plataforma será capturado pelo **gasto real com anúncios (Ads)**, puxado do TikTok, e não por um percentual fixo. A margem da caixa **não** desconta taxa nenhuma; o desconto de Ads acontece só nos relatórios agregados (dashboard/histórico).

---

## 4. Escopo

### 4.1 Dentro do escopo (a implementar)

1. Persistência real de **categorias e faixas** (CRUD) com código de barras gerado pelo sistema.
2. **Página "Pedidos"** (antes "Empacotar"): lista os pedidos do TikTok por período, com os **pendentes** no topo, e botão **"Empacotar"** que abre a tela de empacotamento daquele pedido.
3. **Empacotamento de um pedido**: atribuir o detalhamento de itens (faixas + avulsos) a um pedido, com **quem empacotou**; **editar** o empacotamento depois.
4. **Histórico** compartilhado entre aparelhos, com resumo do período, **coluna CPA por pedido** e **exportação para CSV/Excel**.
5. **Dashboard** com métricas por período (hoje/semana/mês/personalizado), gráfico de margem ao longo do tempo e **custo por categoria**.
6. **Integração com o TikTok** para puxar **automaticamente** o gasto com anúncios **e os pedidos** (cliente, valor, frete, status) do período.
7. **Autenticação** com Clerk (login obrigatório) + **modal de Configurações** na barra lateral (perfil + aba **"Custos fixos"**).
8. **Código de barras por faixa**: gerar o código, **imprimir a etiqueta conectando à impressora** e **bipar para somar a faixa** ao empacotamento (ver F6).

### 4.2 Fora do escopo (não é este produto)

- **Não** emite nota fiscal, **não** gera etiqueta dos Correios, **não** controla SKU individual (isso é de ferramentas de prateleira tipo Bling/Tiny).
- **Não** há controle de estoque.
- **Não** há papéis/permissões diferentes entre usuários nesta fase.
- **Não** há taxa percentual da plataforma (substituída por Ads do TikTok).
- **Não** há conceito de "live" como entidade — pedidos são organizados por data/hora (período).
- **Não** há criação de pedido manual nesta fase — todo pedido vem do TikTok (vendas fora da plataforma ficam fora do escopo por enquanto).
- O código de barras **é** um recurso do produto (gerar, imprimir e bipar — ver F6), mas como **forma de entrada nunca obrigatória**: bipar e tocar convivem e o toque nunca deixa de funcionar. Não se etiqueta cada unidade física — o código é **por faixa** (uma cartela na bancada).

---

## 5. Funcionalidades (requisitos detalhados)

> Ordem de construção sugerida (entrega valor antes): **(F7) Auth + Configurações → (F1) Categorias/Faixas → (F5) Integração TikTok (Pedidos+Ads) → (F2) Pedidos e empacotamento → (F3) Histórico + Export** primeiro (entregam a margem, que é o objetivo nº 1); **(F4) Dashboard** depois; **(F6) código de barras** por último — é o mais barato de acoplar (o catálogo já gera o código desde F1). É um recurso de primeira classe, só não bloqueia a entrega da margem. _Obs.: como os pedidos agora vêm do TikTok, a integração (F5) passa a ser pré-requisito da página de Pedidos (F2)._

### F1 — Categorias e faixas de custo (CRUD)

**História:** _Como operador, quero cadastrar e ajustar categorias e faixas de custo, para refletir o sortimento da semana e ter os custos prontos na hora de empacotar._

**Requisitos:**

- Criar categoria (só nome).
- Renomear e excluir categoria.
- Criar faixa dentro de uma categoria (nome + custo).
- Editar faixa (nome e/ou custo).
- Excluir faixa.
- Ao criar uma faixa, o **sistema gera automaticamente um código de barras único** para ela (o operador não digita código).
- A partir da faixa, **imprimir a etiqueta/cartela** do código de barras (fluxo de impressão detalhado em **F6**).

**Regras de negócio:**

- **RN-1.1** Excluir uma categoria que tem faixas **não bloqueia**: as faixas vão para **"Sem categoria"** (uma categoria implícita/padrão, sempre presente).
- **RN-1.2** O código de barras de cada faixa é **único** e gerado pelo sistema; não é editável pelo operador.
- **RN-1.3** Excluir ou editar uma faixa **nunca** altera caixas já fechadas (ver RN-3.3 — histórico congelado).
- **RN-1.4** Custo de faixa deve ser **maior que zero**.
- **RN-1.5** Nome de categoria e de faixa são obrigatórios (não vazios).

**Critérios de aceite:**

- Criei uma faixa "Caneta gel" custo R$3 → ela aparece na categoria, com um código de barras pronto para imprimir.
- Excluí a categoria "Gloss" que tinha 2 faixas → as 2 faixas aparecem agora em "Sem categoria"; nada se perde.
- Editei o custo de uma faixa de R$3 para R$4 → caixas antigas que usaram essa faixa **continuam mostrando R$3**.

---

### F2 — Pedidos e empacotamento (tela principal)

**História:** _Como operador, quero ver a fila de pedidos que vieram do TikTok, abrir um pedido pendente e contar os itens que coloquei na caixa, para registrar o custo e ver a margem sem precisar digitar cliente, valor ou frete._

#### F2a — Página "Pedidos" (lista)

**Requisitos:**

- Lista os **pedidos do TikTok** (F5), com **seletor de período** reaproveitando a lógica do Dashboard (hoje / semana / mês / personalizado).
- Por padrão, os **pedidos pendentes** (não enviados, segundo o TikTok) aparecem **no topo**, **em ordem de quando foram pedidos**.
- Cada pedido pendente mostra um botão **"Empacotar"**.
- A tabela **reaproveita o componente de tabela** já usado no Histórico. Se ele ainda não estiver componentizado, **componentizar** e usar nos dois lugares.
- Cada linha mostra os dados do pedido (cliente, valor, frete, hora) e o **status** (pendente / empacotado / enviado).

**Regras de negócio:**

- **RN-2.1 (origem dos pedidos):** a lista é alimentada **exclusivamente** pela integração TikTok (F5); não há criação manual de pedido.
- **RN-2.2 (ordenação padrão):** pendentes primeiro, ordenados pela data/hora do pedido (mais antigo no topo, para empacotar na ordem da fila).
- **RN-2.3 (após empacotar):** o pedido **permanece** na lista marcado como **"Empacotado"**, e o botão passa a ser **"Editar empacotamento"**. Ele só deixa a lista de pendentes quando o **TikTok** o marca como **enviado**.
- **RN-2.4 (navegação):** "Empacotar" abre a **tela de empacotamento** do pedido, usando o **id do pedido na URL** (rota dinâmica do Next).

#### F2b — Tela de empacotamento (de um pedido)

**Requisitos:**

- Aberta por URL com o **id do pedido**.
- **Cabeçalho somente leitura** com os dados vindos do TikTok: @cliente, **valor da venda** e **frete** (o operador **não digita** esses campos).
- Faixas agrupadas por categoria, com botões **−** e **+** grandes para contar.
- Adicionar **itens avulsos** (nome + custo).
- **Entrada por código de barras (opcional):** o leitor funciona como teclado; o código representa a **faixa**. Bipar incrementa a contagem da faixa (ver F6). Bipar e tocar convivem.
- **Painel de destaque fixo** mostrando, em tempo real: custo dos itens, contagem total e **margem em R$ e %**.
- Botão **"Concluir empacotamento"** que salva o empacotamento no pedido.

**Regras de negócio:**

- **RN-2.5 (margem ao vivo):** na tela de empacotamento, `margem R$ = valor da venda − custo dos itens − frete`. `margem % = (margem R$ ÷ valor da venda) × 100`. **Ao vivo não entram Ads/CPA nem custo fixo** — esses são de período e aparecem no Histórico/Dashboard (F3/F4). A margem ao vivo é o termômetro rápido "o conteúdo do kit cabe no preço?".
- **RN-2.6 (custo dos itens):** soma de (quantidade × custo da faixa) de todas as faixas contadas + soma dos custos dos itens avulsos.
- **RN-2.7 (concluir):** só é possível concluir com **pelo menos 1 item** (faixa contada ou avulso). O valor da venda já vem do TikTok (sempre presente). Sem itens, mensagem amigável impede a conclusão.
- **RN-2.8 (snapshot):** ao concluir, o empacotamento **congela** o custo de cada item (faixa e avulso), o detalhamento (faixa + quantidade), o **nome da faixa/categoria da época**, e registra **operador, data e hora**.
- **RN-2.9 (código de barras não encontrado):** código bipado sem faixa correspondente → mensagem amigável, **não** trava; segue pelo toque.
- **RN-2.10 (re-empacotar):** abrir "Editar empacotamento" de um pedido já empacotado recarrega o detalhamento; ao salvar, recalcula e regrava o snapshot.

**Critérios de aceite:**

- Abri a página Pedidos em "hoje" → vejo os pendentes no topo em ordem de chegada, cada um com "Empacotar".
- Cliquei "Empacotar" no pedido de @nina.kawaii (venda R$90, frete R$8, ambos travados) → contei 3 "Caneta R$1" e 1 "Caderno R$8" → painel mostra custo R$11, margem R$71, ~78,9%.
- Bipei o código de uma faixa → a contagem dela subiu em 1 e o campo de leitura limpou.
- Concluí o empacotamento → o pedido aparece como "Empacotado" na lista (e no aparelho do outro operador) e no Histórico; o botão virou "Editar empacotamento".
- Tentei concluir sem nenhum item → recebi aviso amigável e nada foi salvo.

---

### F3 — Histórico (por período)

**História:** _Como dono, quero ver os pedidos empacotados do período com a margem já líquida de anúncios e custo fixo, e exportar para Excel, para enxergar o lucro real de cada pedido._

**Requisitos:**

- Lista dos pedidos empacotados com: data, @cliente, hora, valor da venda, custo dos itens, **CPA**, **custo fixo**, **margem R$** e **margem %**.
- **Nova coluna "CPA"** por pedido (custo de anúncio por pedido — ver RN-3.2).
- **Resumo do período (cards):** nº de pedidos, receita, custo, **total de ads do período** (já existe e está correto), lucro e **margem média**.
- Seleção de período (hoje / semana / mês / personalizado) — mesma lógica do Dashboard.
- **Exportar para CSV/Excel** os pedidos do período.

**Regras de negócio:**

- **RN-3.1 (CPA por pedido):** `CPA = total de ads do período ÷ nº de pedidos vendidos no período`. É o mesmo valor para todos os pedidos do período; quanto mais pedidos, menor o CPA de cada um (é literalmente o **custo por aquisição**). O total de ads vem do TikTok (F5).
- **RN-3.2 (margem líquida por pedido):** `margem R$ = valor da venda − custo dos itens − frete − CPA − custo fixo por pedido`. `margem % = (margem R$ ÷ valor da venda) × 100`. (O custo fixo vem das Configurações — F7/RN-7.x; hoje R$3.)
- **RN-3.3 (lucro do período):** `lucro = receita − custo dos itens − frete − total de ads − (custo fixo × nº de pedidos)`. `margem média = (lucro ÷ receita) × 100`. Repare que `Σ CPA = total de ads`, então a soma das margens por pedido reconcilia com o lucro do período.
- **RN-3.4 (editar/excluir empacotamento):** é possível **editar** o empacotamento de um pedido (recontar itens/avulsos) e **excluir** o empacotamento (o pedido volta a "pendente / não empacotado"). Cliente, valor e frete **não** se editam aqui (vêm do TikTok). Ao editar, custo e margem são recalculados e o snapshot regravado.
- **RN-3.5 (histórico congelado):** editar/excluir **faixas ou categorias** depois **não altera** pedidos já empacotados. Cada empacotamento mantém o custo, o nome da faixa e a categoria **da época**.
- **RN-3.6 (export):** o arquivo contém, por pedido: Data, Cliente, Hora, Venda, Custo, CPA, Custo fixo, Margem R$, Margem %. (Formato CSV vs `.xlsx` formatado → tech spec.)
- **RN-3.7 (sincronização):** o histórico é **compartilhado** — empacotamentos feitos/editados/excluídos por um operador aparecem para o outro.

**Critérios de aceite:**

- Em "hoje", o TikTok reporta R$60 de ads e 12 pedidos vendidos → a coluna **CPA** mostra R$5,00 em cada pedido.
- Um pedido de venda R$90, custo R$11, frete R$8, CPA R$5, custo fixo R$3 → margem R$63 (70%).
- Os cards mostram nº de pedidos, receita, custo, total de ads (R$60) e lucro já com ads e custo fixo descontados.
- Exportei "este mês" → baixou o arquivo com as colunas acima, incluindo CPA e Custo fixo.

---

### F4 — Dashboard

**História:** _Como dono, quero ver a performance do negócio por período, para entender lucro, margem e onde está o custo._

**Requisitos:**

- Seletor de período (hoje / semana / mês / personalizado).
- Indicadores: **receita, custo, lucro, margem média, nº de kits**.
- **Gasto com Ads do período** (vindo do TikTok — ver F5) descontado no lucro.
- **Custo fixo por pedido** (das Configurações — F7) descontado no lucro.
- **Gráfico de margem ao longo do tempo** (por hora no dia; por dia em períodos maiores).
- **Gráfico de custo por categoria** (exige o detalhamento dos itens dos empacotamentos — F2/RN-2.8).

**Regras de negócio:**

- **RN-4.1** Os indicadores usam as mesmas fórmulas de F3: `lucro = receita − custo dos itens − frete − total de ads − (custo fixo × nº de pedidos)`; `margem média = (lucro ÷ receita) × 100`.
- **RN-4.2 (custo por categoria):** soma, no período, o custo dos itens de cada empacotamento **agrupado pela categoria congelada** de cada item.
- **RN-4.3** O período "personalizado" aceita data inicial e final escolhidas pelo usuário.

**Critérios de aceite:**

- Selecionei "esta semana" → vejo receita, custo, lucro (com Ads da semana), margem média e nº de kits, além dos dois gráficos.
- O gráfico de custo por categoria mostra, por exemplo, Canetas R$X, Cadernos R$Y, somando o custo real das caixas da semana.

---

### F5 — Integração com o TikTok (Pedidos + Ads)

**História:** _Como dono, quero que os pedidos e o gasto com anúncios venham automaticamente do TikTok, para o operador não digitar cliente/valor/frete e o lucro refletir o custo real de mídia._

**Requisitos:**

- Conectar a conta do TikTok da loja (fluxo de conexão da integração).
- Puxar, por período, **os pedidos** com: id do pedido, @cliente, valor da venda, frete, data/hora do pedido e **status de envio** (pendente/enviado). Alimenta a página Pedidos (F2) e o Histórico (F3).
- Puxar, por período, o **total gasto com Ads**. Alimenta o CPA (F3) e o lucro (F3/F4).
- **Fallback de Ads:** quando a integração de Ads está indisponível/sem dado, mostrar Ads como **indisponível** e **permitir um valor manual** de anúncios para o período, para não travar a análise.

**Regras de negócio:**

- **RN-5.1 (pedidos automáticos):** cliente, valor da venda, frete e status vêm do TikTok; o operador **não digita** nem cria pedidos manualmente.
- **RN-5.2 (Ads automático):** havendo integração e dado, o Ads do período é **o valor do TikTok**.
- **RN-5.3 (fallback de Ads):** sem dado/conexão de Ads, o operador pode informar um **valor manual**, usado no cálculo de lucro/CPA daquele período. _(Os pedidos não têm fallback manual — sem integração, não há pedidos a empacotar.)_
- **RN-5.4 (uso dos números):** Ads/CPA e custo fixo entram **somente** nos agregados (F3/F4), **nunca** na margem ao vivo do empacotamento (RN-2.5).
- **RN-5.5 (resiliência):** falha da integração **nunca** quebra as telas — o que já foi sincronizado continua visível, com aviso amigável.

**Critérios de aceite:**

- Com a conta conectada, a página Pedidos de "hoje" lista os pedidos do TikTok, já com cliente/valor/frete preenchidos.
- O dashboard de "hoje" mostra o gasto com Ads automático e o lucro já descontando ads e custo fixo.
- Sem dado de Ads, o dashboard mostra "Ads indisponível" e um campo manual; ao digitar R$60, lucro e CPA recalculam.

> **Pendências para a tech spec (F5):** qual(is) API(s) do TikTok (TikTok Shop para pedidos, TikTok Ads para gasto), como autenticar/autorizar, qual conta/loja/anunciante, mapeamento de período/fuso (São Paulo), frequência de sincronização e cache, modelo de status de envio, e granularidade do valor manual de _fallback_ de Ads.

---

### F6 — Código de barras (gerar, imprimir e bipar)

**História:** _Como operador, quero imprimir uma cartela de código de barras por faixa e deixá-la na bancada, para bipar e somar +1 daquela faixa ao pedido sem precisar procurar o botão na tela._

**Modelo:** o código é **por faixa de custo**, não por unidade física. Cada faixa tem **um** código (gerado na F1). Imprime-se **uma cartela por faixa** (ex.: "Caneta R$1", "Caderno R$8") que fica na bancada; **bipar a cartela equivale a apertar +** daquela faixa. Não se etiqueta produto a produto.

**Requisitos:**

- **Gerar** o código de barras visual da faixa (a partir do código único criado na F1), pronto para impressão como etiqueta/cartela.
- **Imprimir** a etiqueta da faixa **conectando-se à impressora**, com dois modos **configuráveis**:
    - **Impressão direta** numa impressora de etiquetas (térmica) já configurada — idealmente sem diálogo a cada impressão, para gerar várias cartelas rápido.
    - **Diálogo do navegador** como alternativa, quando não há impressora configurada (serve para qualquer impressora).
- **Bipar (entrada por leitor):** o leitor funciona como teclado e digita o código no campo de leitura da tela de empacotar (F2). Ao reconhecer o código, **soma +1 da faixa correspondente** ao pedido — **a faixa da categoria que foi cadastrada na página de Categorias (F1)**.
- O leitor é um acessório de hardware a ser adquirido ("bipador" _keyboard wedge_); o produto precisa funcionar com ele **sem driver/SDK** (digita o código + Enter).

**Regras de negócio:**

- **RN-6.1 (um código por faixa):** cada faixa tem exatamente um código de barras único; bipá-lo soma **+1** daquela faixa (igual ao botão **+**).
- **RN-6.2 (origem do item bipado):** o item somado é o da **faixa cujo código foi bipado**, com a **categoria e o custo daquela faixa** no momento — entra no empacotamento como qualquer item contado (e congela ao concluir, RN-2.8).
- **RN-6.3 (código não encontrado):** se o código não corresponder a nenhuma faixa, mostrar mensagem amigável e **não** travar — o operador continua pelo toque (mesma regra de RN-2.9).
- **RN-6.4 (impressão configurável):** o modo de impressão (direta vs diálogo do navegador) é uma configuração; sem impressora configurada, cai no diálogo do navegador.
- **RN-6.5 (nunca obrigatório):** bipar é **opcional** e convive com o toque; o toque (botões − / +) nunca deixa de funcionar.

**Critérios de aceite:**

- Na faixa "Caneta R$1", cliquei em imprimir → saiu a cartela com o código de barras na impressora de etiquetas configurada (ou abriu o diálogo do navegador, se não houver impressora configurada).
- Na tela de empacotar, bipei a cartela "Caderno R$8" → entrou +1 item da faixa "Caderno R$8" (categoria Cadernos), e o custo/margem recalcularam.
- Bipei um código inexistente → recebi aviso amigável e nada foi adicionado; continuei contando pelo toque normalmente.

---

### F7 — Autenticação (Clerk) e Configurações

**História:** _Como dono, quero que só pessoas autorizadas usem o sistema, que cada empacotamento registre quem o fez, e ter um lugar para ajustar parâmetros do negócio como o custo fixo por pedido._

**Requisitos (auth):**

- Login obrigatório via **Clerk** para acessar qualquer tela.
- **Sem papéis** — todos os usuários logados têm o mesmo poder.
- Cada empacotamento registra **qual usuário** o concluiu (autoria — RN-2.8).
- Dados são **compartilhados** entre todos os usuários da loja (todos veem o mesmo catálogo, pedidos e histórico).

**Requisitos (Configurações):**

- **Modal de Configurações** acessível no **rodapé da barra lateral**, onde também fica o **perfil do usuário logado**.
- O modal tem abas; a primeira a entregar é **"Custos fixos"**, com o campo **custo fixo por pedido** (hoje **R$3**), editável.
- O valor configurado é **único para a loja** (compartilhado) e usado nos cálculos de lucro do Histórico (F3) e Dashboard (F4).

**Regras de negócio:**

- **RN-7.1** Sem login, nenhuma tela é acessível.
- **RN-7.2** O custo fixo por pedido é um valor **≥ 0**, único e compartilhado; alterá-lo passa a valer para os cálculos de período.
- **RN-7.3** Outras configurações futuras (conexão TikTok, impressora de etiquetas) podem morar no mesmo modal, em abas próprias. _(Se congelar ou não o custo fixo por pedido no momento do empacotamento fica como pendência da tech spec — ver §8.)_

**Critérios de aceite:**

- Sem login, não acesso nenhuma tela.
- Logado como operador A, concluí um empacotamento → fica registrado como feito por A; o operador B o vê no histórico.
- Abri o modal de Configurações pela barra lateral, aba "Custos fixos", mudei o custo fixo de R$3 para R$4 → o lucro do período no Histórico/Dashboard passa a usar R$4.

---

## 6. Requisitos não-funcionais (de produto)

- **Velocidade e simplicidade na tela de empacotamento:** é o coração do produto. Áreas de toque grandes, fluxo mobile-first, margem em destaque. Empacotar um pedido deve ser questão de segundos.
- **Reúso de componentes:** a tabela do Histórico e a de Pedidos compartilham o mesmo componente de tabela; padronizar/componentizar em vez de duplicar (ver F2a).
- **Dados sempre num banco de verdade, com backup.** Nunca em storage do navegador: dado de venda não pode sumir ao limpar cache, e dois operadores em aparelhos diferentes precisam ver o mesmo histórico.
- **Sincronização entre aparelhos:** um empacotamento feito por um operador aparece para o outro (o mecanismo — _polling_, tempo real etc. — fica para a tech spec).
- **Idioma e moeda:** tudo em **PT-BR**, valores em **Real (R$)**, fuso de São Paulo.
- **Mensagens amigáveis:** erros e avisos sempre claros e em português, via toast — nunca texto técnico.
- **Disponibilidade em horário de live:** o sistema precisa estar responsivo durante as lives (tratamento de _cold start_ do banco fica para a tech spec).
- **Código de barras é entrada opcional:** existe (gerar, imprimir, bipar — F6), mas o toque nunca deixa de funcionar.

---

## 7. Decisões registradas (deste PRD)

| #   | Decisão                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Margem **ao vivo** do empacotamento = **venda − custo dos itens − frete**. Sem taxa, sem Ads, sem custo fixo (esses são de período).                                                       |
| D2  | Custo de mídia entra **só nos agregados** (dashboard/histórico) via **Ads do TikTok**.                                                                                                     |
| D3  | Cada **empacotamento** guarda o **detalhamento completo** (faixas + quantidades + avulsos), com custo **congelado** ao concluir.                                                           |
| D4  | Histórico é **imutável a mudanças de catálogo**: editar/excluir faixa ou categoria não mexe em pedidos já empacotados.                                                                     |
| D5  | O empacotamento de um pedido pode ser **editado e excluído** (excluir devolve o pedido a "pendente"). Cliente/valor/frete vêm do TikTok e **não** se editam.                               |
| D6  | Código de barras da faixa é **gerado pelo sistema** e único.                                                                                                                               |
| D7  | **Clerk** desde já; **sem papéis**; cada empacotamento registra **quem o fez**.                                                                                                            |
| D8  | Ads vem do **TikTok**; com **fallback manual** só para o valor de Ads quando indisponível.                                                                                                 |
| D9  | **Sem conceito de "live"**; pedidos são organizados por data/hora (período).                                                                                                               |
| D10 | Excluir categoria com faixas → faixas vão para **"Sem categoria"** (não bloqueia).                                                                                                         |
| D11 | **Sem conceito de "saúde da margem"** (boa/atenção/baixa, cores/limiares): mostra-se apenas a **margem em R$ e %**. A tela de Categorias oferece **apenas CRUD de categorias e faixas** (+ etiquetas).                                   |
| D12 | Código de barras é **por faixa** (uma cartela na bancada), não por unidade física; **bipar = +1** daquela faixa.                                                                           |
| D13 | Impressão da etiqueta é **configurável**: **impressão direta** numa impressora de etiquetas conectada **ou** o **diálogo do navegador** como alternativa.                                  |
| D14 | **Pedidos vêm do TikTok** (cliente, valor, frete, status de envio). **Sem criação manual** de pedido nesta fase.                                                                           |
| D15 | A página "Empacotar" vira **"Pedidos"**: lista por período (lógica do Dashboard), **pendentes no topo** em ordem de pedido; "Empacotar" abre a tela com o **id do pedido na URL**.         |
| D16 | Após empacotar, o pedido fica **"Empacotado"** (botão vira "Editar empacotamento") e só sai dos pendentes quando o **TikTok marca como enviado**.                                          |
| D17 | Na tela de empacotamento, **cliente, valor e frete são somente leitura** (TikTok é a fonte da verdade).                                                                                    |
| D18 | Histórico ganha coluna **CPA** = `total de ads do período ÷ nº de pedidos do período`; a **margem por pedido** desconta **CPA + custo fixo**.                                              |
| D19 | **Custo fixo por pedido** (R$3, configurável) fica no **modal de Configurações** (rodapé da barra lateral, com o perfil), aba **"Custos fixos"**; entra no lucro de Histórico e Dashboard. |

---

## 8. Pendências para a tech spec (não resolver no produto)

- Hospedagem: caminho **A (Cloudflare, melhor performance)** vs **B (Netlify, mais simples)**.
- Modelagem do banco (categorias, faixas, pedidos, empacotamentos, itens, avulsos, Ads/fallback, custo fixo) e estratégia de _snapshot_.
- **Custo fixo por pedido:** decidir se o valor **congela** no momento do empacotamento (como o custo dos itens) ou se é sempre o **valor atual** aplicado ao período. (Este PRD assume "valor atual aplicado ao período" até decisão contrária.)
- Mecanismo de sincronização entre aparelhos (_polling_ via React Query vs tempo real) — relevante para a fila de Pedidos atualizar entre operadores.
- Tratamento do _cold start_ do banco em horário de live (warm-up agendado?).
- Formato do export (CSV simples vs `.xlsx` formatado).
- Integração TikTok: **API de pedidos** (TikTok Shop) e **API de Ads** são produtos distintos — auth, contas/loja/anunciante, sincronização (push/webhook vs _polling_), modelo de status de envio, mapeamento de período/fuso (São Paulo) e cache.
- Geração técnica do código de barras único (formato, padrão Code128 etc.).
- Impressão da etiqueta (F6): como fazer a **impressão direta** numa impressora de etiquetas térmica a partir de um web app (agente local, protocolo ZPL/ESC-POS, WebUSB/WebPrint etc.) e o _fallback_ pelo diálogo do navegador; modelo de impressora recomendado e como guardar a configuração de impressora.
- Especificação do leitor ("bipador") _keyboard wedge_ a adquirir e o comportamento de foco do campo de leitura na tela de empacotar.

---

## 9. Resumo do estado atual (gap front × back)

- **Front-end:** completo e funcional, mas usa **dados de mentira em memória** (Zustand) — catálogo, caixas e Ads são _seed_, e a tela de empacotar cria a caixa "do zero" com cliente/venda/frete digitados. Nada persiste; nada sincroniza; não há login.
- **Mudança de fluxo deste PRD:** o empacotamento passa a partir de um **pedido vindo do TikTok** (a página "Empacotar" vira "Pedidos"), com cliente/venda/frete somente leitura; a margem do Histórico passa a ser **líquida** (CPA + custo fixo). Isso exige ajustes também no **front** (renomear/reestruturar a página, rota com id do pedido, campos read-only, coluna CPA, modal de Configurações), além de todo o back-end.
- **Back-end:** **inexistente** hoje — sem persistência, sem API de domínio, sem integração TikTok (pedidos + ads), sem auth.
- **Este PRD** define o produto-alvo a ser implementado para fechar esse gap. A **tech spec** traduz isto em arquitetura e implementação.
