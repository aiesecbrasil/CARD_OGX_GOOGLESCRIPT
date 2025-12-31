function getAccessToken(CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN) {
  // URL do endpoint de autentica??o do Podio
  const authUrl = "https://podio.com/oauth/token";

  // Payload que ser? enviado na requisi??o POST
  // Cont?m tipo de grant e credenciais da aplica??o
  const payload = {
    grant_type: "app",          // Tipo de autentica??o (App)
    client_id: CLIENT_ID,       // ID do cliente fornecido pelo Podio
    client_secret: CLIENT_SECRET, // Segredo do cliente
    app_id: APP_ID,             // ID do App no Podio
    app_token: APP_TOKEN        // Token do App
  };

  // Faz a requisi??o POST para o Podio com o payload
  // muteHttpExceptions: true permite tratar erros manualmente
  const response = UrlFetchApp.fetch(authUrl, {
    method: "POST",
    payload: payload,
    muteHttpExceptions: true
  });

  // Obt?m o conte?do da resposta como string
  const content = response.getContentText();
  let json;

  // Tenta converter a resposta em JSON
  // Se a resposta n?o for JSON v?lido, lan?a erro
  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error("Resposta inv?lida ao gerar token (n?o ? JSON): " + content);
  }

  // Verifica se o JSON retornou o access_token
  if (!json.access_token) {
    throw new Error("N?o foi poss?vel gerar o token: " + content);
  }

  // Retorna o token de acesso v?lido
  return json.access_token;
}