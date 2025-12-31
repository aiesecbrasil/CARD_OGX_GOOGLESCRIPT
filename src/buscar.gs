function buscarPorNome(access_token, APP_ID, nome) {
  // Endpoint de filtro do Podio para itens do app
  const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;

  // Payload para filtrar itens pelo campo "title"
  const payload = {
    filters: { "title": nome }, // filtro pelo título
    limit: 1                   // retorna no máximo 1 item
  };

  // Requisição POST para o Podio
  const response = UrlFetchApp.fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`, // token de autenticação
      "Content-Type": "application/json"        // tipo de conteúdo
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

function buscarPorEmail(access_token, APP_ID, email) {
  const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;
  const payload = {
    filters: { "email": [email] }, // filtro por e-mail (campo múltiplo)
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
function buscarPorTelefone(access_token, APP_ID, telefone) {
  const url = `https://api.podio.com/item/app/${APP_ID}/`;

  // Faz a requisição GET para listar itens do app
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

function buscarItemCompleto(access_token, APP_ID, data) {
  const nome = data.nome;
  const sobrenome = data.sobrenome;
  const emails = data.emails.map(e => e.email);
  const telefones = data.telefones.map(t => t.numero);

  let resultados = [];

  // 1 — Busca por nome
  resultados = resultados.concat(buscarPorNome(access_token, APP_ID, nome));
  resultados = resultados.concat(buscarPorSobreNome(access_token, APP_ID, sobrenome));

  // 2 — Busca por cada email
  emails.forEach(e => {
    resultados = resultados.concat(buscarPorEmail(access_token, APP_ID, e));
  });

  // 3 — Busca por cada telefone
  telefones.forEach(t => {
    resultados = resultados.concat(buscarPorTelefone(access_token, APP_ID, t));
  });

  // 4 — Remove duplicados pelo item_id
  resultados = resultados.filter(
    (item, index, arr) => arr.findIndex(i => i.item_id === item.item_id) === index
  );

  // 5 — Validação detalhada dos dados encontrados
  for (let item of resultados) {
    if (!item || !item.fields) continue;

    const tituloField = getField(item, "title"); // campo do nome
    const sobrenomeField = getField(item, "sobrenome-2"); // campo do sobrenome
    const emailField = getField(item, "email"); // campo de emails
    const telefoneField = getField(item, "telefone"); // campo de telefones

    const titulo = tituloField?.values?.[0]?.value || "";
    const sobrenomeTitle = sobrenomeField?.values?.[0]?.value || "";

    const itemEmails = (emailField?.values || []).map(v => v.value);
    const itemTelefones = (telefoneField?.values || []).map(v => v.value);

    const emailMatch = emails.some(e => itemEmails.includes(e));
    const telefoneMatch = telefones.some(t => itemTelefones.includes(t));
    const nomeMatch = titulo === nome;
    const sobrenomeMatch = sobrenomeTitle === sobrenome;

    // Se pelo menos email ou telefone bate e nome + sobrenome batem → retorna item
    if ((emailMatch || telefoneMatch) && nomeMatch && sobrenomeMatch) {
      return item;
    }
  }

  // Nenhum item corresponde aos dados
  return null;
}

function obterIdsComites(tokenAcesso,termoBusca) {
  const url = "https://gis-api.aiesec.org/graphql"; // Substitua pelo endpoint real
  if (termoBusca !== "AIESEC no Brasil") {
    // Remove "AIESEC in " do início do termo de busca
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

      // Retorna apenas os IDs dos comitês encontrados
      return json.data.committees.data.map(c => c.id)[0];

    } catch (erro) {
      Logger.log("Erro na consulta GraphQL: " + erro);
      return [];
    }
  }
  return 1606;
}