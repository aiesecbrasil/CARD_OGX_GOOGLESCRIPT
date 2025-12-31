function buscarPorNome(access_token, APP_ID, nome) {
  // Endpoint de filtro do Podio para itens do app
  const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;

  // Payload para filtrar itens pelo campo "title"
  const payload = {
    filters: { "title": nome }, // filtro pelo t?tulo
    limit: 1                   // retorna no m?ximo 1 item
  };

  // Requisi??o POST para o Podio
  const response = UrlFetchApp.fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`, // token de autentica??o
      "Content-Type": "application/json"        // tipo de conte?do
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // permite tratar manualmente erros HTTP
  });

  // Converte a resposta em JSON
  try {
    const data = JSON.parse(response.getContentText());
    return data.items || []; // retorna os itens encontrados ou array vazio
  } catch (e) {
    throw new Error("Erro ao buscar por nome: " + response.getContentText());
  }
}