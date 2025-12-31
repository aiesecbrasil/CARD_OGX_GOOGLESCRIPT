function doPost(e) {
  // Inicializa variáveis de ambiente
  Env();
  const resposta = new Resposta();
  try {
    // 1. Parse do body recebido
    if (!e?.postData?.contents) {
      throw new Error("Nenhum dado enviado no corpo da requisição.");
    }

    // 2. Parse do JSON recebido
    const dados = JSON.parse(e.postData.contents);

    // 3. Gera token de acesso do Podio com cache
    const accessToken = new Auth().token;

    // 4. Recupera variáveis de ambiente
    const { APP_ID, TOKEN_EXPA } = getEnv();

    // 5. Instancia a classe Lead
    const leads = new Leads(dados,accessToken, APP_ID, TOKEN_EXPA);

    // 6. Instancia do pesquisar
    const buscar = new Buscar(accessToken,APP_ID);
    
    // 7. Verifica se já existe um item correspondente
    const itemExistente = buscar.itemCompleto(dados);
    
    // 8. Monta listas para validação de duplicidade
    const listaEmails = dados.emails.map(e => e.email);
    const listaTelefones = dados.telefones.map(t => t.numero);
    
    // 9. Se item já existe → atualiza
    if (itemExistente) {
      return leads.atualizarNoPodio(accessToken, itemExistente);;
    }

    // 8. Verificação de duplicidade por email
    for (const email of listaEmails) {
      if (buscar.campo("email", email, true).length > 0) {
        throw new Error("Já existe cadastro com esse(s) email(s).");
      }
    }

    // 9. Verificação de duplicidade por telefone
    for (const telefone of listaTelefones) {
      if (buscar.telefone(telefone).length > 0) {
        throw new Error("Já existe cadastro com esse(s) telefone(s).");
      }
    }
    
    return leads.criarNoPodio(listaEmails[0],listaTelefones[0]);

  } catch (error) {
    // Retorna JSON padronizado em caso de erro
    return resposta.erro(error)
  }
}