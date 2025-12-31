class Auth {
  /**
   * Cria uma instância de Auth e já inicializa o token.
   * 
   * @param {string} chave - Chave do cache (default: "accessToken")
   */
  constructor(chave = "accessToken") {
    /** @type {string} Chave usada para armazenar token no cache */
    this.chave = chave;

    /** @type {GoogleAppsScript.Cache.Cache} Cache do Apps Script */
    this.cache = CacheService.getScriptCache();

    /** @type {string} Access token válido */
    this.token = this.getAccessToken(); // já inicializa token
  }

  /**
   * Obtém o access_token válido.
   * - Verifica o cache
   * - Renova se estiver prestes a expirar
   * - Gera novo token se não existir
   * 
   * @returns {string} access_token válido
   */
  getAccessToken() {
    let token = this._buscaCache();
    if (token) return token;

    const { CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN } = getEnv();
    const novoToken = this._gerarNovoToken(CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN);

    return this._salvarCache(novoToken);
  }

  _buscaCache() {
    const tokenCache = this.cache.get(this.chave);
    if (!tokenCache) return null;

    const data = JSON.parse(tokenCache);
    const agora = new Date().getTime();

    if (agora >= (data.expiracao - 5 * 60 * 1000)) {
      const novoToken = this._refreshToken(data.refresh_token);
      return this._salvarCache(novoToken);
    }

    return data.access_token;
  }

  _salvarCache(jsonAccessToken) {
    const data = {
      access_token: jsonAccessToken.access_token,
      refresh_token: jsonAccessToken.refresh_token,
      expiracao: new Date().getTime() + jsonAccessToken.expires_in * 1000
    };

    const tempoExpiracao = Math.min(jsonAccessToken.expires_in, 21600);
    this.cache.put(this.chave, JSON.stringify(data), tempoExpiracao);

    return data.access_token;
  }

  _refreshToken(refreshToken) {
    const { CLIENT_ID, CLIENT_SECRET } = getEnv();

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

    return json;
  }

  _gerarNovoToken(CLIENT_ID, CLIENT_SECRET, APP_ID, APP_TOKEN) {
    const payload = {
      grant_type: "app",
      app_id: APP_ID,
      app_token: APP_TOKEN,
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
      throw new Error("Erro ao gerar novo token: " + response.getContentText());
    }

    return json;
  }
}