function getAccessToken(CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN) {
  // URL do endpoint de autenticação do Podio
  const authUrl = "https://podio.com/oauth/token";

  // Payload que será enviado na requisição POST
  // Contém tipo de grant e credenciais da aplicação
  const payload = {
    grant_type: "app",          // Tipo de autenticação (App)
    client_id: CLIENT_ID,       // ID do cliente fornecido pelo Podio
    client_secret: CLIENT_SECRET, // Segredo do cliente
    app_id: APP_ID,             // ID do App no Podio
    app_token: APP_TOKEN        // Token do App
  };

  // Faz a requisição POST para o Podio com o payload
  // muteHttpExceptions: true permite tratar erros manualmente
  const response = UrlFetchApp.fetch(authUrl, {
    method: "POST",
    payload: payload,
    muteHttpExceptions: true
  });

  // Obtém o conteúdo da resposta como string
  const content = response.getContentText();
  let json;

  // Tenta converter a resposta em JSON
  // Se a resposta não for JSON válido, lança erro
  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error("Resposta inválida ao gerar token (não é JSON): " + content);
  }

  // Verifica se o JSON retornou o access_token
  if (!json.access_token) {
    throw new Error("Não foi possível gerar o token: " + content);
  }

  // Retorna o token de acesso válido
  return json.access_token;
}