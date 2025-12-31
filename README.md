# OGX · Podio · EXPA · GitHub  
**Integração de Leads – Google Apps Script**

Este projeto implementa uma integração completa entre **OGX**, **Podio** e **EXPA (AIESEC)** utilizando **Google Apps Script**, com **versionamento automático no GitHub**.

A arquitetura foi desenhada para **produção**, com separação clara de responsabilidades, baixo acoplamento e facilidade de manutenção.

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
Integração com a API do GitHub.

### Contém
- Comunicação com GitHub Contents API

### Funções
- githubPushFile(path, content, message)

### Regras
- ❌ Não acessar variáveis sensíveis diretamente  
- ✅ Usar apenas dados do env.gs

---

## 📄 push.gs

### Responsabilidade
Realizar o push automático do projeto para o GitHub.

### Contém
- Leitura dos arquivos do Apps Script
- Filtro de arquivos sensíveis
- Commit automático

### Funções
- pushProjetoParaGithub()

### Regras
- ❌ Ignorar env, testes e arquivos locais  
- ✅ Versionar apenas código válido  

---

## 🔄 Fluxo Geral

text
doPost
  ↓
auth → token Podio
  ↓
buscar → REST + GraphQL
  ↓
leads → EXPA + Podio
  ↓
utils → respostaJson
