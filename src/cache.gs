function buscaAcessToken(chave) {
  const cache = CacheService.getScriptCache();
  const tokenCache = cache.get(chave);

  if (!tokenCache) return null;

  const data = JSON.parse(tokenCache);
  const agora = new Date().getTime();

  // Se expirar em até 5 minutos, renova
  if (agora >= (data.expiracao - 5 * 60 * 1000)) {
    const novoToken = refreshAccessToken(data.refresh_token);
    return salvarToken(novoToken); // salva e retorna o novo token
  }

  return data.access_token;
}
      

function salvarToken(jsonAccessToken) {
  const cache = CacheService.getScriptCache();
  const chave = "accessToken";
  
  const data = {
    access_token: jsonAccessToken.access_token,
    refresh_token: jsonAccessToken.refresh_token,
    expiracao: new Date().getTime() + jsonAccessToken.expires_in * 1000
  };

  // Salva no cache, tempo máximo permitido pelo Apps Script é 6h (21600s)
  const tempoExpiracao = Math.min(jsonAccessToken.expires_in, 21600);
  cache.put(chave, JSON.stringify(data), tempoExpiracao);

  return data.access_token;
}
      

function refreshAccessToken(refreshToken) {
  const { CLIENT_ID, CLIENT_SECRET } = getEnv(); // Buscar credenciais do ambiente

  const payload = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  };

  const response = UrlFetchApp.fetch("https://podio.com/oauth/token", {
    method: "POST",
    payload: payload,
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  if (!json.access_token) {
    throw new Error("Erro ao atualizar token: " + response.getContentText());
  }

  return json; // Retorna { access_token, refresh_token, expires_in }
}
      

function getAccessTokenCached() {
  const chave = "accessToken";

  // Busca no cache
  let token = buscaAcessToken(chave);
  if (token) return token;

  // Se não existir, gera novo token via app credentials
  const { CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN } = getEnv();
  const novoToken = getAccessToken(CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN);

  return salvarToken(novoToken); // salva e retorna
}