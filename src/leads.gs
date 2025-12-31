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