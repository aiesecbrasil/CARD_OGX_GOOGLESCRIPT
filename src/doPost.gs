function doPost(e) {
  // Inicializa variáveis de ambiente
  Env();
  const reposta = new Resposta();
  try {
    // 1. Parse do body recebido
    if (!e?.postData?.contents) {
      throw new Error("Nenhum dado enviado no corpo da requisição.");
    }

    // 2. Parse do JSON recebido
    const dados = JSON.parse(e.postData.contents);

    // 3. Gera token de acesso do Podio com cache
    const accessToken = new Auth();

    // 4. Recupera variáveis de ambiente
    const { APP_ID, TOKEN_EXPA } = getEnv();

    // 5. Instancia a classe Lead
    const lead = new Lead(dados,accessToken, APP_ID, TOKEN_EXPA,);

    // 6. Instancia do pesquisar
    const buscar = new Buscar(accessToken,APP_ID);
    
    // 7. Verifica se já existe um item correspondente
    const itemExistente = buscar.itemCompleto(dados);

    // 8. Monta listas para validação de duplicidade
    const listaEmails = lead.emails.map(e => e.email);
    const listaTelefones = lead.telefones.map(t => t.numero);

    // 9. Se item já existe → atualiza
    if (itemExistente) {
      const idAtualizado = lead.atualizarNoPodio(accessToken, itemExistente);
      return respostaJson("sucesso", "Lead de OGX atualizado com sucesso.", idAtualizado);
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
    return lead.criarNoPodio(listaEmails[0],listaTelefones[0]);

  } catch (error) {
    // Retorna JSON padronizado em caso de erro
    return reposta.erro()
  }
}