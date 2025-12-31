function buscarPorTelefone(access_token, APP_ID, telefone) {
  const url = `https://api.podio.com/item/app/${APP_ID}/`;

  // Faz a requisi??o GET para listar itens do app
  const response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      "Authorization": `Bearer ${access_token}`
    },
    muteHttpExceptions: true
  });

  try {
    const data = JSON.parse(response.getContentText());
    const itens = data.items || [];

    // Filtra os itens que possuem o telefone informado
    const encontrados = itens.filter(item => {
      if (!item.fields) return false;

      // Verifica cada campo do item
      return item.fields.some(field => {
        if (field.type === "phone" && field.values) {
          return field.values.some(f => f.value === telefone);
        }
        return false;
      });
    });

    return encontrados;

  } catch (e) {
    throw new Error("Erro ao buscar por telefone: " + response.getContentText());
  }
}