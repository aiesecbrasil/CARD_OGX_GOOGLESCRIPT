class Lead {
  /**
   * @param {Object} dados - Objeto com os dados do lead
   * @param {string} dados.nome
   * @param {string} dados.sobrenome
   * @param {Array<Object>} dados.emails - [{ tipo, email }]
   * @param {Array<Object>} dados.telefones - [{ tipo, numero }]
   * @param {string} dados.dataNascimento
   * @param {string|number} dados.idProduto
   * @param {string|number} dados.idComite
   * @param {string|number} dados.idCategoria
   * @param {string} dados.idAutorizacao
   * @param {string} [dados.idAnuncio]
   * @param {string|Array} [dados.tag]
   * @param {string} dados.senha
   * @param {string} dados.programa
   * @param {string} dados.nomeCL
   */
  constructor(dados,access_token,APP_ID,TOKEN_EXPA) {
    Object.assign(this, dados);
    this.access_token = access_token;
    this.APP_ID = APP_ID;
    this.TOKEN_EXPA = TOKEN_EXPA
  }

  /**
   * Cria o lead no Podio
   * @param {string} access_token
   * @param {string|number} APP_ID
   * @param {string} tokenAcesso - token EXPA
   * @returns {Object} Resposta do Podio
   */
  criarNoPodio(email,telefone) {
    const reposta = new Resposta();
    const idExpa = this.criarNoExpa(email,telefone);
    const url = `https://api.podio.com/item/app/${this.APP_ID}/`;
    const headers = {
      "Authorization": `Bearer ${this.access_token}`,
      "Content-Type": "application/json"
    };

    const cardOGX = {
      fields: {
        "di-ep-id-2": idExpa,
        "title": this.nome,
        "sobrenome-2": this.sobrenome,
        "email": this.emails.map(dado => ({ type: dado.tipo, value: dado.email })),
        "telefone": this.telefones.map(dado => ({ type: dado.tipo, value: dado.numero })),
        "data-de-nascimento-2": this.dataNascimento,
        "produto": this.idProduto,
        "aiesec-mais-proxima": this.idComite,
        "tag-origem-2": this.idCategoria,
        "eu-concordo-com-a-coleta-e-uso-dos-meus-dados-conforme-": this.idAutorizacao
      },
      tags: Array.isArray(this.tag) ? this.tag : (this.tag ? [this.tag] : [])
    };

    if (this.idAnuncio) cardOGX.fields["tag-meio-2-2"] = this.idAnuncio;

    const response = UrlFetchApp.fetch(url, {
      method: "POST",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(cardOGX),
      muteHttpExceptions: true
    });

    try {
      const novoLead = JSON.parse(response.getContentText());
      return reposta.successo("sucesso", "Lead de OGX criado com sucesso.", novoLead); 
    } catch (e) {
      throw new Error("Resposta inválida (não é JSON): " + response.getContentText());
    }
  }

  /**
   * Atualiza um lead existente no Podio
   * @param {string} access_token
   * @param {Object} item - item existente retornado pela busca
   * @returns {Object} item atualizado
   */
  atualizarNoPodio(item) {
    const itemID = item.item_id;
    const url = `https://api.podio.com/item/${itemID}`;
    const headers = {
      "Authorization": `Bearer ${this.access_token}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        "email": this.emails.map(dado => ({ type: dado.tipo, value: dado.email })),
        "telefone": this.telefones.map(dado => ({ type: dado.tipo, value: dado.numero })),
        "produto": this.idProduto,
        "aiesec-mais-proxima": this.idComite,
        "tag-origem-2": this.idCategoria,
        "status": 42
      },
      tags: Array.isArray(this.tag) ? this.tag : (this.tag ? [this.tag] : [])
    };

    if (this.idAnuncio) payload.fields["tag-meio-2-2"] = this.idAnuncio;

    UrlFetchApp.fetch(url, {
      method: "PUT",
      headers: headers,
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const idAtualizado =  item.app_item_id;
    return reposta.successo("sucesso", "Lead de OGX criado com sucesso.", idAtualizado);
  }

  /**
   * Cria um lead no EXPA e retorna o person_id
   * @param {string} tokenAcesso
   * @returns {string} person_id
   */
  criarNoExpa(email,telefone) {
    const url = 'https://auth.aiesec.org/users.json';
    const idIntenacionalCL = Lead.obterIdsComites(tokenAcesso, this.nomeCL);

    const payload = {
      user: {
        email: email,
        first_name: this.nome,
        last_name: this.sobrenome,
        password: this.senha,
        phone: telefone,
        country_code: "55",
        lc: idIntenacionalCL,
        referral_type: 'Other',
        allow_phone_communication: '0',
        allow_term_and_condition: '1',
        selected_programmes: [this.programa]
      }
    };

    const options = {
      method: 'POST',
      headers: { 'Authorization': this.TOKEN_EXPA, 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      followRedirects: true,
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseText = response.getContentText();

      if (responseText.includes("<!DOCTYPE html>")) {
        throw new Error("Resposta inesperada do servidor: HTML recebido");
      }

      const responseData = JSON.parse(response.getContentText());
      return String(responseData.person_id).trim();
    } catch (error) {
      Logger.log("Erro ao criar lead: " + error);
      throw new Error("Erro ao criar lead Expa: " + error.message);
    }
  }

  /**
   * Consulta GraphQL para obter IDs de comitês
   * @param {string} termoBusca
   * @returns {number} ID do comitê
   */
  obterIdsComites(termoBusca) {
    const url = "https://gis-api.aiesec.org/graphql";
    if (termoBusca !== "AIESEC no Brasil") {
      const termoLimpo = termoBusca.replace(/^AIESEC em /i, "").trim();
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
        headers: { "Authorization": this.TOKEN_EXPA },
        payload: payload,
        muteHttpExceptions: true
      };

      try {
        const resposta = UrlFetchApp.fetch(url, opcoes);
        const json = JSON.parse(resposta.getContentText());
        return json.data.committees.data.map(c => c.id)[0];
      } catch (erro) {
        throw new Error("Erro na consulta GraphQL: " + erro);
      }
    }
    return 1606;
  }
}