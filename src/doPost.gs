function doPost(e) {
  //inicializa as variaveis de ambiente
  Env();
  try {
    // 1. Parse do body recebido
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nenhum dado enviado no corpo da requisição.");
    }
    
    const dados = JSON.parse(e.postData.contents);
  
    // 2. Recupera variáveis de ambiente
    const {APP_ID, TOKEN_EXPA } = getEnv();

    // 3. Gera token de acesso do Podio
    const accessToken = getAccessTokenCached();
    
    // 4. Verifica se já existe um item correspondente
    const itemExistente = buscarItemCompleto(accessToken, APP_ID, dados);
    
    // 5. Monta listas para validação de duplicidade
    const listaEmails = dados.emails.map(e => e.email);
    const listaTelefones = dados.telefones.map(t => t.numero);
    
    // 6. Se item já existe → atualiza
    if (itemExistente) {
      const idAtualizado = atualizarLead(accessToken, itemExistente, dados);
      return respostaJson("sucesso", "Lead de OGX atualizado com sucesso.", idAtualizado);
    }
    // 7. Verificação de duplicidade por email
    for (const email of listaEmails) {
      if (buscarPorEmail(accessToken, APP_ID, email).length > 0) {
        throw new Error("Já existe cadastro com esse(s) email(s).");
      }
    }
  
    // 8. Verificação de duplicidade por telefone
    for (const telefone of listaTelefones) {
      if (buscarPorTelefone(accessToken, APP_ID, telefone).length > 0) {
        throw new Error("Já existe cadastro com esse(s) telefone(s).");
      }
    }
    
    // 9. Cria novo lead no Podio
    const novoLead = adicionarLeadOGX(accessToken, APP_ID, TOKEN_EXPA, dados, listaEmails[0], listaTelefones[0]);
    // 10. Retorna resposta de sucesso
    return respostaJson("sucesso", "Lead de OGX criado com sucesso.", novoLead);

  } catch (error) {
    // Retorna JSON padronizado em caso de erro
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}