# OGX · Podio · EXPA · GitHub  
**Integração de Leads – Google Apps Script**

Este projeto implementa uma **solução institucional de integração de leads** entre os sistemas **OGX**, **Podio** e **EXPA (AIESEC)**, utilizando **Google Apps Script** como camada de orquestração e automação, com **versionamento contínuo no GitHub**.

A arquitetura foi projetada com foco em **ambiente de produção**, adotando boas práticas de **engenharia de software**, como **separação de responsabilidades**, **baixo acoplamento**, **controle de dependências** e **facilidade de manutenção e evolução**.

O sistema atua como o **back-end responsável pela etapa final de execução e processamento dos cadastros de leads**, garantindo a **consistência dos dados**, **validação de duplicidade**, **integração segura entre plataformas** e a **padronização do fluxo de informações** utilizado no **processo de intercâmbio da AIESEC**.

Do ponto de vista técnico, a aplicação:
- Recebe leads via **endpoint HTTP**
- Realiza **validações e deduplicações** no Podio
- Cria registros no **EXPA**
- Sincroniza dados no **Podio**
- Mantém o **código versionado automaticamente no GitHub**, assegurando rastreabilidade e governança técnica

Esta solução contribui diretamente para a **eficiência operacional**, **confiabilidade dos dados** e **escalabilidade dos processos de captação e gestão de leads** dentro da AIESEC.

---

## 📌 Visão Geral

- 📥 Recebe leads via **HTTP POST**
- 🔍 Verifica duplicidade no **Podio**
- 🌐 Cria pessoa no **EXPA**
- 🗂️ Cria ou atualiza item no **Podio**
- 📤 Versiona automaticamente o código no **GitHub**

---

## 🧱 Arquitetura do Projeto

Escopo fechado **apenas** para os arquivos listados abaixo.

---

## 📄 env.gs

### Responsabilidade
Gerenciar variáveis de ambiente do projeto.

### Contém
**Podio**
- CLIENT_ID  
- CLIENT_SECRET  
- APP_ID  
- APP_TOKEN  

**EXPA**
- TOKEN_EXPA  

**GitHub**
- GITHUB_TOKEN  
- GITHUB_OWNER  
- GITHUB_REPO  
- GITHUB_BRANCH  

### Funções
- Env() → grava variáveis no Script Properties  
- getEnv() → retorna as variáveis de ambiente  

### Regras
- ❌ Não conter lógica de negócio  
- ❌ Não realizar chamadas HTTP  
- ❌ Não versionar no GitHub  

---

## 📄 auth.gs

### Responsabilidade
Autenticação com serviços externos.

### Contém
- OAuth do Podio

### Funções
- getAccessToken(clientId, clientSecret, appId, appToken)

### Regras
- ❌ Não criar ou atualizar dados  
- ✅ Apenas autenticação  

---

## 📄 utils.gs

### Responsabilidade
Funções utilitárias reutilizáveis.

### Contém
- Padronização de respostas
- Manipulação segura de objetos

### Funções
- respostaJson(status, message, data)
- getField(item, fieldName)

### Regras
- ✅ Funções puras  
- ❌ Sem dependência direta de APIs externas  

---

## 📄 buscar.gs

### Responsabilidade
Centralizar **todas as consultas externas**.

### Contém

#### ▶ Podio (REST)
- Buscar por nome
- Buscar por sobrenome
- Buscar por e-mail
- Buscar por telefone
- Busca combinada e deduplicação

#### ▶ EXPA / AIESEC (GraphQL)
- Consulta de comitês (LC)
- Normalização de nomes (ex: remover "AIESEC in")
- Resolução de IDs internacionais

### Funções
- buscarPorNome(accessToken, appId, nome)
- buscarPorSobreNome(accessToken, appId, sobrenome)
- buscarPorEmail(accessToken, appId, email)
- buscarPorTelefone(accessToken, appId, telefone)
- buscarItemCompleto(accessToken, appId, dados)
- obterIdsComites(tokenExpa, nomeCL)

### Regras
- ❌ Não criar ou atualizar dados  
- ✅ Apenas leitura / consulta  

## 📄 cache.gs

### Responsabilidade
Gerenciamento de access_token para APIs externas (Podio/EXPA) utilizando cache, renovação automática e refresh_token.  
Evita múltiplas requisições desnecessárias e mantém tokens válidos sempre que possível.

### Contém
- Busca de token no cache (buscaAcessToken)  
- Salvamento de token no cache (salvarToken)  
- Renovação automática via refresh_token (refreshAccessToken)  
- Função de alto nível para obter token válido (getAccessTokenCached)  

### Funções e Parâmetros

- buscaAcessToken(chave)  
  - Parâmetros: chave (string) — chave do cache  
  - Retorno: string|null — token válido ou null  
  - Descrição: Busca no cache e renova se estiver prestes a expirar.

- salvarToken(jsonAccessToken)  
  - Parâmetros: jsonAccessToken (Object) — { access_token, refresh_token, expires_in }  
  - Retorno: string — token válido  
  - Descrição: Salva token no cache com expiração, máximo 6h.

- refreshAccessToken(refreshToken)  
  - Parâmetros: refreshToken (string) — token para gerar novo access_token  
  - Retorno: Object — { access_token, refresh_token, expires_in }  
  - Descrição: Renova token usando refresh_token via API OAuth.

- getAccessTokenCached()  
  - Parâmetros: nenhum  
  - Retorno: string — token válido  
  - Descrição: Retorna sempre um token válido, usando cache ou renovando.

### Regras
- ✅ Sempre armazenar tokens válidos antes de retornar  
- ✅ Renovar automaticamente se estiver prestes a expirar  
- ✅ Limitar tempo de cache ao máximo permitido pelo Apps Script (6h)  
- ❌ Nunca retornar token expirado  
- ❌ Nunca armazenar dados sensíveis fora do cache temporário  
- ❌ Não usar cache como fonte de verdade — apenas otimizaç

---

## 📄 leads.gs

### Responsabilidade
Escrita de dados nos sistemas externos.

### Contém
- Criação de lead no EXPA
- Criação de lead no Podio
- Atualização de lead existente

### Funções
- leadsExpa(tokenExpa, dados, email, telefone)
- adicionarLeadOGX(accessToken, appId, tokenExpa, dados, email, telefone)
- atualizarLead(accessToken, itemExistente, dados)

### Regras
- ✅ Validar dados antes do envio  
- ❌ Nunca enviar valores inválidos (0, null, string errada) 

---

## 📄 doPost.gs

### Responsabilidade
Ponto de entrada da aplicação (endpoint).

### Contém
- doPost(e)
- executarComJSON()

### Fluxo
1. Recebe JSON  
2. Valida payload  
3. Autentica  
4. Consulta duplicidade  
5. Cria ou atualiza lead  
6. Retorna resposta JSON  

### Regras
- ❌ Não conter regras de integração  
- ❌ Não conter regras de autenticação  

---

## 📄 github.gs

### Responsabilidade
- Integração com a API do GitHub.
- Realizar o push automático do projeto para o GitHub.

### Contém
- Comunicação com GitHub Contents API
- Leitura dos arquivos do Apps Script
- Filtro de arquivos sensíveis
- Commit automático

### Funções
- githubPushFile(path, content, message)
- pushProjetoParaGithub()

### Regras
- ❌ Não acessar variáveis sensíveis diretamente  
- ✅ Usar apenas dados do env.gs
- ❌ Ignorar env, testes e arquivos locais  
- ✅ Versionar apenas código válido  


---

## 🔄 Fluxo Geral

doPost  
  ↓  
auth → token Podio  
  ↓  
buscar → REST + GraphQL  
  ↓  
leads → EXPA + Podio  
  ↓  
utils → respostaJson  
