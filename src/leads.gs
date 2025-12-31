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
      selected_programmes: [dados.programa] // j? ? array
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

    // Verifica se a resposta n?o ? HTML inesperado
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