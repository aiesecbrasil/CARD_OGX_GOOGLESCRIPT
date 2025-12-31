function getREADME() {
  return `# OGX ? Podio ? EXPA ? GitHub  
**Integra??o de Leads ? Google Apps Script**

Este projeto implementa uma integra??o completa entre **OGX**, **Podio** e **EXPA (AIESEC)** utilizando **Google Apps Script**, com **versionamento autom?tico no GitHub**.

A arquitetura foi desenhada para **produ??o**, com separa??o clara de responsabilidades, baixo acoplamento e facilidade de manuten??o.

---

## ? Vis?o Geral

- ? Recebe leads via **HTTP POST**
- ? Verifica duplicidade no **Podio**
- ? Cria pessoa no **EXPA**
- ?? Cria ou atualiza item no **Podio**
- ? Versiona automaticamente o c?digo no **GitHub**

---

## ? Arquitetura do Projeto

Escopo fechado **apenas** para os arquivos listados abaixo.

---

## ? env.gs

### Responsabilidade
Gerenciar vari?veis de ambiente do projeto.

### Cont?m
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

### Fun??es
- Env() ? grava vari?veis no Script Properties  
- getEnv() ? retorna as vari?veis de ambiente  

### Regras
- ? N?o conter l?gica de neg?cio  
- ? N?o realizar chamadas HTTP  
- ? N?o versionar no GitHub  

---

## ? auth.gs

### Responsabilidade
Autentica??o com servi?os externos.

### Cont?m
- OAuth do Podio

### Fun??es
- getAccessToken(clientId, clientSecret, appId, appToken)

### Regras
- ? N?o criar ou atualizar dados  
- ? Apenas autentica??o  

---

## ? utils.gs

### Responsabilidade
Fun??es utilit?rias reutiliz?veis.

### Cont?m
- Padroniza??o de respostas
- Manipula??o segura de objetos

### Fun??es
- respostaJson(status, message, data)
- getField(item, fieldName)

### Regras
- ? Fun??es puras  
- ? Sem depend?ncia direta de APIs externas  

---

## ? buscar.gs

### Responsabilidade
Centralizar **todas as consultas externas**.

### Cont?m

#### ? Podio (REST)
- Buscar por nome
- Buscar por sobrenome
- Buscar por e-mail
- Buscar por telefone
- Busca combinada e deduplica??o

#### ? EXPA / AIESEC (GraphQL)
- Consulta de comit?s (LC)
- Normaliza??o de nomes (ex: remover "AIESEC in")
- Resolu??o de IDs internacionais

### Fun??es
- buscarPorNome(accessToken, appId, nome)
- buscarPorSobreNome(accessToken, appId, sobrenome)
- buscarPorEmail(accessToken, appId, email)
- buscarPorTelefone(accessToken, appId, telefone)
- buscarItemCompleto(accessToken, appId, dados)
- obterIdsComites(tokenExpa, nomeCL)

### Regras
- ? N?o criar ou atualizar dados  
- ? Apenas leitura / consulta  

---

## ? leads.gs

### Responsabilidade
Escrita de dados nos sistemas externos.

### Cont?m
- Cria??o de lead no EXPA
- Cria??o de lead no Podio
- Atualiza??o de lead existente

### Fun??es
- leadsExpa(tokenExpa, dados, email, telefone)
- adicionarLeadOGX(accessToken, appId, tokenExpa, dados, email, telefone)
- atualizarLead(accessToken, itemExistente, dados)

### Regras
- ? Validar dados antes do envio  
- ? Nunca enviar valores inv?lidos (0, null, string errada)  

---

## ? doPost.gs

### Responsabilidade
Ponto de entrada da aplica??o (endpoint).

### Cont?m
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
- ? N?o conter regras de integra??o  
- ? N?o conter regras de autentica??o  

---

## ? github.gs

### Responsabilidade
Integra??o com a API do GitHub.

### Cont?m
- Comunica??o com GitHub Contents API

### Fun??es
- githubPushFile(path, content, message)

### Regras
- ? N?o acessar vari?veis sens?veis diretamente  
- ? Usar apenas dados do env.gs

---

## ? push.gs

### Responsabilidade
Realizar o push autom?tico do projeto para o GitHub.

### Cont?m
- Leitura dos arquivos do Apps Script
- Filtro de arquivos sens?veis
- Commit autom?tico

### Fun??es
- pushProjetoParaGithub()

### Regras
- ? Ignorar env, testes e arquivos locais  
- ? Versionar apenas c?digo v?lido  

---

## ? Fluxo Geral

text
doPost
  ?
auth ? token Podio
  ?
buscar ? REST + GraphQL
  ?
leads ? EXPA + Podio
  ?
utils ? respostaJson
`
}