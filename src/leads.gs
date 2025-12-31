function adicionarLeadOGX(access_token, APP_ID,tokenAcesso, data,email,telefone) {
  
  const idExpa = leadsExpa(tokenAcesso,data,email,telefone);
  Logger.log(idExpa)
  const url = `https://api.podio.com/item/app/${APP_ID}/`;
  const headers = {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  };

  // Campos básicos
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
    tags: [] // 👈 já inicializa aqui
  };

  if (data.idAnuncio) cardOGX.fields["tag-meio-2-2"] = data.idAnuncio;
  if (data.tag) {
    // se for string vira array; se for array, usa direto
    cardOGX.tags = Array.isArray(data.tag) ? data.tag : [data.tag];
  }


  // Requisição
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
    throw new Error("Resposta inválida (não é JSON): " + response.getContentText());
  }
}
function atualizarLead(access_token, item, data) {

  const itemID = item.item_id;
  const url = `https://api.podio.com/item/${itemID}`;

  const headers = {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  };

  const payload = {
    fields: {
      "email": data.emails.map(dado => ({
        type: dado.tipo,
        value: dado.email
      })),
      "telefone": data.telefones.map(dado => ({
        type: dado.tipo,
        value: dado.numero
      })),
      "produto": data.idProduto,
      "aiesec-mais-proxima": data.idComite,
      "tag-origem-2": data.idCategoria,
      "status": 42
    },
    tags: [] // 👈 já inicializa aqui
  };
  if (data.idAnuncio) payload.fields["tag-meio-2-2"] = data.idAnuncio;
  if (data.tag) {
    // se for string vira array; se for array, usa direto
    payload.tags = Array.isArray(data.tag) ? data.tag : [data.tag];
  }
  const response = UrlFetchApp.fetch(url, {
    method: "PUT",
    headers,
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return item.app_item_id;
}
function leadsExpa(tokenAcesso, dados,email,telefone) {
  
  const url = 'https://auth.aiesec.org/users.json';
  const idIntenacionalCL = obterIdsComites(tokenAcesso,dados.nomeCL)
  const payload = {
    user: {
      email: email,
      first_name: dados.nome,
      last_name: dados.sobrenome,
      password: dados.senha,
      phone: telefone,
      country_code: "55",
      lc: idIntenacionalCL,
      referral_type: 'Other',
      allow_phone_communication: '0',
      allow_term_and_condition: '1',
      selected_programmes: [dados.programa] // já é array
    }
  };

  const options = {
    method: 'POST',
    headers: {
      'Authorization': tokenAcesso,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    followRedirects: true,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(response)
    const responseText = response.getContentText();

    // Verifica se a resposta não é HTML inesperado
    if (responseText.includes("<!DOCTYPE html>")) {
      throw new Error("Resposta inesperada do servidor: HTML recebido");
    }
    const responseData = JSON.parse(response)
    return String(responseData.person_id).trim();

  } catch (error) {
    Logger.log("Erro ao criar lead: " + error);
    throw new Error("Erro ao criar lead Expa: " + error.message);
  }
}