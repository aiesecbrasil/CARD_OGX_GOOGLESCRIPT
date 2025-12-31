function adicionarLeadOGX(access_token, APP_ID,tokenAcesso, data,email,telefone) {
  
  const idExpa = leadsExpa(tokenAcesso,data,email,telefone);
  Logger.log(idExpa)
  const url = `https://api.podio.com/item/app/${APP_ID}/`;
  const headers = {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  };

  // Campos b?sicos
  const cardOGX = {
    fields: {
      "di-ep-id-2": idExpa,
      "title": data.nome,
      "sobrenome-2": data.sobrenome,
      "email": data.emails.map(dado => ({
        type: dado.tipo,
        value: dado.email
      })),
      "telefone": data.telefones.map(dado => ({
        type: dado.tipo,
        value: dado.numero
      })),
      "data-de-nascimento-2": data.dataNascimento,
      "produto": data.idProduto,
      "aiesec-mais-proxima": data.idComite,
      "tag-origem-2": data.idCategoria,
      "eu-concordo-com-a-coleta-e-uso-dos-meus-dados-conforme-": data.idAutorizacao
    },
    tags: [] // ? j? inicializa aqui
  };

  if (data.idAnuncio) cardOGX.fields["tag-meio-2-2"] = data.idAnuncio;
  if (data.tag) {
    // se for string vira array; se for array, usa direto
    cardOGX.tags = Array.isArray(data.tag) ? data.tag : [data.tag];
  }


  // Requisi??o
  const response = UrlFetchApp.fetch(url, {
    method: "POST",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(cardOGX),
    muteHttpExceptions: true
  });

  try {
    return JSON.parse(response.getContentText());
  } catch (e) {
    throw new Error("Resposta inv?lida (n?o ? JSON): " + response.getContentText());
  }
}