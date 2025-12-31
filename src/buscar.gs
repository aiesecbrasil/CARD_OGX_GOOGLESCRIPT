function obterIdsComites(tokenAcesso,termoBusca) {
  const url = "https://gis-api.aiesec.org/graphql"; // Substitua pelo endpoint real
  if (termoBusca !== "AIESEC no Brasil") {
    // Remove "AIESEC in " do in?cio do termo de busca
    const termoLimpo = termoBusca.replace(/^AIESEC em /i, "").trim();
    // Monta a query GraphQL
    const queryGraphQLComiteLocal = `
    query {
      committees(filters: { parent: [1606], q: "${termoLimpo}" }) {
        data {
          id
        }
      }
    }
  `;

    const payload = JSON.stringify({ query: queryGraphQLComiteLocal });

    const opcoes = {
      method: "POST",
      contentType: "application/json",
      headers: {
        "Authorization": tokenAcesso
      },
      payload: payload,
      muteHttpExceptions: true
    };

    try {
      const resposta = UrlFetchApp.fetch(url, opcoes);
      const json = JSON.parse(resposta.getContentText());

      // Retorna apenas os IDs dos comit?s encontrados
      return json.data.committees.data.map(c => c.id)[0];

    } catch (erro) {
      Logger.log("Erro na consulta GraphQL: " + erro);
      return [];
    }
  }
  return 1606;
}