function buscarPorEmail(access_token, APP_ID, email) {
  const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;
  const payload = {
    filters: { "email": [email] }, // filtro por e-mail (campo m?ltiplo)
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
    throw new Error("Erro ao buscar por email: " + response.getContentText());
  }
}