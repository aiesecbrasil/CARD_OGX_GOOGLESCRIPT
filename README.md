# OGX · Podio · EXPA · GitHub  
**Integração de Leads – Google Apps Script**

Este projeto implementa uma **solução institucional de integração de leads** entre os sistemas **OGX**, **Podio** e **EXPA (AIESEC)**, utilizando **Google Apps Script** como camada de orquestração e automação, com **versionamento contínuo no GitHub**.

A arquitetura foi projetada com foco em **ambiente de produção**, adotando boas práticas de **engenharia de software**, como **separação de responsabilidades**, **baixo acoplamento**, **controle de dependências** e **facilidade de manutenção e evolução**.

O sistema atua como o **back-end responsável pela etapa final de execução e processamento dos cadastros de leads**, garantindo a **consistência dos dados**, **validação de duplicidade**, **integração segura entre plataformas** e a **padronização do fluxo de informações** utilizado no **processo de intercâmbio da AIESEC**.

Do ponto de vista técnico, a aplicação:
- Recebe leads via **endpoint HTTP**
- Realiza **validações e deduplicações** no Podio
- Cria ou atualiza registros no **EXPA**
- Sincroniza dados no **Podio**
- Mantém o **código versionado automaticamente no GitHub**, assegurando rastreabilidade e governança técnica

Esta solução contribui diretamente para a **eficiência operacional**, **confiabilidade dos dados** e **escalabilidade dos processos de captação e gestão de leads** dentro da AIESEC.

---

## 📌 Visão Geral

- 📥 Recebe leads via **HTTP POST**
- 🔄 Gera ou renova token de acesso Podio com cache
- 🔍 Verifica duplicidade no **Podio** usando Buscar
- 🌐 Cria ou atualiza lead no **EXPA**
- 🗂️ Cria ou atualiza item no **Podio**
- 📤 Versiona automaticamente o código no **GitHub**
- ✅ Padroniza respostas com a classe Resposta

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
- getAccessTokenCached() → retorna token válido do Podio  
- Auth → classe que encapsula cache e refresh automático  

### Regras
- ❌ Não criar ou atualizar dados  
- ✅ Apenas autenticação  

---

## 📄 utils.gs

### Responsabilidade
Funções utilitárias reutilizáveis.

### Contém
- Padronização de respostas via Resposta 
- Manipulação segura de objetos e campos Podio  

### Funções
- respostaJson(status, message, data) 
- getField(item, fieldName) → retorna campo específico de um item do Podio  
- PodioUtils → classe para consultas e filtros combinados (nome, email, telefone, deduplicação)  

### Regras
- ✅ Funções puras  
- ❌ Sem dependência direta de APIs externas  

---

## 📄 podioUtils.gs

### Responsabilidade
Centralizar **todas as consultas externas ao Podio**.

### Contém
- Classe PodioUtils  
- Busca combinada e deduplicação  
- Filtragem por campos: title, sobrenome-2, email, telefone

### Funções
- itemCompleto(dados) → retorna item correspondente ou null  
- campo(fieldName, valor, multi) → busca por campo específico  
- telefone(numero) → busca por telefone  

### Regras
- ❌ Não criar ou atualizar dados  
- ✅ Apenas leitura / consulta  

---

## 📄 cache.gs

### Responsabilidade
Gerenciamento de access_token para APIs externas (Podio/EXPA) utilizando cache, renovação automática e refresh_token.  

### Contém
- Busca de token no cache (buscaAcessToken)  
- Salvamento de token no cache (salvarToken)  
- Renovação automática via refresh_token (refreshAccessToken)  
- Função de alto nível para obter token válido (getAccessTokenCached)  

### Regras
- ✅ Sempre armazenar tokens válidos antes de retornar  
- ✅ Renovar automaticamente se estiver prestes a expirar  
- ❌ Nunca retornar token expirado  

---

## 📄 leads.gs

### Responsabilidade
Escrita de dados nos sistemas externos.

### Contém
- Classe Lead
- Criação ou atualização de lead no EXPA  
- Criação ou atualização de item no Podio  

### Funções
- Lead.criarNoPodio(email, telefone, podioUtils) 
- Lead.atualizarNoPodio(itemExistente, podioUtils)

### Regras
- ✅ Validar dados antes do envio  
- ❌ Nunca enviar valores inválidos  

---

## 📄 doPost.gs

### Responsabilidade
Ponto de entrada da aplicação (endpoint).

### Contém
- doPost(e) → fluxo completo de recebimento, validação, autenticação, deduplicação e criação/atualização de leads  

### Fluxo
1. Recebe JSON via HTTP POST  
2. Valida payload  
3. Autentica e obtém token Podio (Auth)  
4. Consulta duplicidade usando PodioUtils
5. Cria ou atualiza lead via Lead 
6. Retorna resposta JSON padronizada via Resposta

### Regras
- ❌ Não conter regras de integração externas  
- ❌ Não conter regras de autenticação complexa  

---

## 📄 github.gs

### Responsabilidade
- Integração com a API do GitHub.  
- Realizar push automático do projeto para o GitHub.

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
- ✅ Versionar apenas código válido  

---

## 🔄 Fluxo Geral

1. **doPost** → recebe payload JSON  
2. **Auth** → busca token válido ou renova automaticamente  
3. **PodioUtils** → consulta duplicidade, filtra por nome, email, telefone  
4. **Lead** → cria ou atualiza lead no EXPA e Podio  
5. **Resposta** → padroniza retorno JSON para o cliente  
6. **GitHub** → versiona alterações do projeto automaticamente  

---

## 👨‍💻 Autor  
- [Caio Marinho](https://github.com/Caio-Marinho)
