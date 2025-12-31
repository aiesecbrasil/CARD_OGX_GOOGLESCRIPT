class Buscar {
  /**
   * Inicializa a instância com token e ID do app.
   * 
   * @param {string} accessToken - Token válido do Podio.
   * @param {number|string} appId - ID do App no Podio.
   */
  constructor(accessToken, APP_ID) {
    this.accessToken = accessToken;
    this.appId = APP_ID;
  }

  /**
   * Retorna um campo específico de um item do Podio.
   * 
   * @param {Object} item - Item do Podio
   * @param {string} fieldName - Nome do campo (external_id)
   * @returns {Object|null} - Campo encontrado ou null
   */
  getField(item, fieldName) {
    if (!item?.fields || !Array.isArray(item.fields)) return null;
    return item.fields.find(f => f.external_id === fieldName) || null;
  }

  /**
   * Consulta itens por campo (ex.: title, sobrenome-2, email).
   * 
   * @param {string} campo - Nome do campo (external_id)
   * @param {any} valor - Valor a ser filtrado
   * @param {boolean} isMultiple - Se o campo é múltiplo (como email)
   * @returns {Array<Object>} - Itens encontrados
   */
  campo(campo, valor, isMultiple = false) {
    const url = `https://api.podio.com/item/app/${this.appId}/filter/`;
    const filtros = {};
    filtros[campo] = isMultiple ? [valor] : valor;

    const payload = { filters: filtros, limit: 1 };

    const response = UrlFetchApp.fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    try {
      const data = JSON.parse(response.getContentText());
      return data.items || [];
    } catch (e) {
      throw new Error(`Erro ao consultar campo "${campo}": ${response.getContentText()}`);
    }
  }

  /**
   * Consulta itens pelo telefone (campo múltiplo especial).
   * 
   * @param {string} telefone
   * @returns {Array<Object>}
   */
  telefone(telefone) {
    const url = `https://api.podio.com/item/app/${this.appId}/`;
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { "Authorization": `Bearer ${this.accessToken}` },
      muteHttpExceptions: true
    });

    try {
      const data = JSON.parse(response.getContentText());
      const itens = data.items || [];

      return itens.filter(item => item.fields?.some(field =>
        field.type === "phone" && field.values?.some(v => v.value === telefone)
      ));
    } catch (e) {
      throw new Error("Erro ao filtrar por telefone: " + response.getContentText());
    }
  }

  /**
   * Retorna um item completo combinando nome, sobrenome, emails e telefones.
   * Remove duplicados e valida correspondência detalhada.
   * 
   * @param {Object} data - Dados do lead
   * @param {string} data.nome
   * @param {string} data.sobrenome
   * @param {Array<{email: string}>} data.emails
   * @param {Array<{numero: string}>} data.telefones
   * @returns {Object|null} - Item correspondente ou null
   */
  itemCompleto(data) {
    const emails = data.emails.map(e => e.email);
    const telefones = data.telefones.map(t => t.numero);
    let resultados = [];

    // Consultas por campo
    resultados = resultados.concat(this.campo("title", data.nome));
    resultados = resultados.concat(this.campo("sobrenome-2", data.sobrenome));
    emails.forEach(e => resultados = resultados.concat(this.campo("email", e, true)));
    telefones.forEach(t => resultados = resultados.concat(this.telefone(t)));

    // Remove duplicados
    resultados = resultados.filter(
      (item, idx, arr) => arr.findIndex(i => i.item_id === item.item_id) === idx
    );

    // Validação detalhada
    for (let item of resultados) {
      if (!item?.fields) continue;

      const titulo = this.getField(item, "title")?.values?.[0]?.value || "";
      const sobrenomeTitle = this.getField(item, "sobrenome-2")?.values?.[0]?.value || "";
      const itemEmails = (this.getField(item, "email")?.values || []).map(v => v.value);
      const itemTelefones = (this.getField(item, "telefone")?.values || []).map(v => v.value);

      const emailMatch = emails.some(e => itemEmails.includes(e));
      const telefoneMatch = telefones.some(t => itemTelefones.includes(t));
      const nomeMatch = titulo === data.nome;
      const sobrenomeMatch = sobrenomeTitle === data.sobrenome;

      if ((emailMatch || telefoneMatch) && nomeMatch && sobrenomeMatch) return item;
    }

    return null;
  }
}