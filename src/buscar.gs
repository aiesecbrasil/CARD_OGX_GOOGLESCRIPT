function buscarPorSobreNome(access_token, APP_ID, sobrenome) {
  const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;
  const payload = {
    filters: { "sobrenome-2": sobrenome },
    limit: 1
  };

  const response = UrlFetchApp.fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  try {
    const data = JSON.parse(response.getContentText());
    return data.items || [];
  } catch (e) {
    throw new Error("Erro ao buscar por sobrenome: " + response.getContentText());
  }
}