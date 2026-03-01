class Leads {
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
  constructor(dados, access_token, APP_ID, TOKEN_EXPA) {
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
  criarNoPodio(email, telefone) {
    const resposta = new Resposta();
    const idExpa = this.criarNoExpa(email, telefone);
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
      tags: []
    };

    if (this.idAnuncio) cardOGX.fields["tag-meio-2-2"] = this.idAnuncio;
    if (this.tag) { // se for string vira array; se for array, usa direto 
      cardOGX.tags = Array.isArray(this.tag) ? this.tag : [this.tag];
    }
    const response = UrlFetchApp.fetch(url, {
      method: "POST",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(cardOGX),
      muteHttpExceptions: true
    });

    try {
      const novoLead = JSON.parse(response.getContentText());
      return resposta.sucesso("Lead de OGX criado com sucesso.", novoLead);
    } catch (e) {
      throw new Error("Resposta inválida (não é JSON): " + response.getContentText());
    }
  }

  qualificacaoLead(item) {
    const resposta = new Resposta();

    try {
      const itemID = Number(item.id);
      const headers = {
        "Authorization": `Bearer ${this.access_token}`,
        "Content-Type": "application/json"
      };

      // ----- 1️⃣ Atualiza campos do item -----
      const payload = { fields: {} };
      if (item.curso) payload.fields["qual-seu-curso"] = item.curso;
      if (item.idiomas) payload.fields["possui-outro-idioma"] = item.idiomas.map(id => parseInt(id, 10));
      if (item.semestre) payload.fields["qual-semestre-do-curso"] = parseInt(item.semestre, 10);
      if (item.area_atuacao) payload.fields["qual-sua-area-de-mercado"] = item.area_atuacao;
      if (item.nivel_mercado) payload.fields["qual-seu-nivel-de-atuacao"] = parseInt(item.nivel_mercado, 10);

      const urlItem = `https://api.podio.com/item/${itemID}`;
      const updateResponse = UrlFetchApp.fetch(urlItem, {
        method: "PUT",
        headers: headers,
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      Logger.log("PUT CODE (campos): " + updateResponse.getResponseCode());
      Logger.log("PUT BODY (campos): " + updateResponse.getContentText());

      // ----- 2️⃣ Upload do PDF (se houver) -----
      if (item.file && item.fileName) {
        const bytes = Utilities.base64Decode(item.file);
        const arquivoBlob = Utilities.newBlob(bytes, "application/pdf", item.fileName);

        const uploadResponse = UrlFetchApp.fetch("https://api.podio.com/file/", {
          method: "post",
          headers: { "Authorization": "Bearer " + this.access_token },
          payload: {
            source: arquivoBlob,
            filename: item.fileName // ⚠️ obrigatório
          },
          muteHttpExceptions: true
        });

        Logger.log("UPLOAD CODE: " + uploadResponse.getResponseCode());
        Logger.log("UPLOAD BODY: " + uploadResponse.getContentText());

        const uploadResult = JSON.parse(uploadResponse.getContentText());
        if (!uploadResult.file_id) throw new Error("Erro ao enviar arquivo: " + uploadResponse.getContentText());

        // ----- 3️⃣ Anexa ao item sem sobrescrever arquivos existentes -----
        const attachPayload = {
          ref_type: "item",
          ref_id: itemID
        };
        const attachResponse = UrlFetchApp.fetch(`https://api.podio.com/file/${uploadResult.file_id}/attach`, {
          method: "POST",
          headers: headers,
          payload: JSON.stringify(attachPayload),
          muteHttpExceptions: true
        });

        Logger.log("ATTACH CODE: " + attachResponse.getResponseCode());
        Logger.log("ATTACH BODY: " + attachResponse.getContentText());
      }

      return resposta.sucesso("Lead de OGX criado com sucesso.", itemID);

    } catch (error) {
      Logger.log("Erro: " + error.message);
      return resposta.erro(error.message);
    }
  }

  /**
   * Atualiza um lead existente no Podio
   * @param {string} access_token
   * @param {Object} item - item existente retornado pela busca
   * @returns {Object} item atualizado
   */
  atualizarNoPodio(item) {
    const resposta = new Resposta();
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

    const idAtualizado = item.app_item_id;
    return resposta.sucesso("sucesso", "Lead de OGX criado com sucesso.", idAtualizado);
  }

  /**
   * Cria um lead no EXPA e retorna o person_id
   * @param {string} tokenAcesso
   * @returns {string} person_id
   */
  criarNoExpa(email, telefone) {
    const url = 'https://auth.aiesec.org/users.json';
    const idIntenacionalCL = this.obterIdsComites(this.nomeCL);

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
      muteHttpExceptions: true // Mantido para capturarmos o erro manualmente
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      // 1. Verifica se retornou HTML (erro de servidor ou página de login)
      if (responseText.includes("<!DOCTYPE html>")) {
        throw new Error("Servidor EXPA retornou HTML inesperado.");
      }

      const responseData = JSON.parse(responseText);

      // 2. Tratamento de erro específico para e-mail duplicado ou campos inválidos (Erro 400-499)
      if (responseCode >= 400) {
        let mensagemErro = responseData.errors || responseData.message || "Erro desconhecido";

        // Se o erro for especificamente e-mail duplicado
        if (JSON.stringify(mensagemErro).toLowerCase().includes("email already exists") ||
          JSON.stringify(mensagemErro).toLowerCase().includes("taken")) {
          throw new Error("E-mail já cadastrado no sistema EXPA.");
        }

        throw new Error("Erro na API EXPA (" + responseCode + "): " + JSON.stringify(mensagemErro));
      }

      // 3. Verifica se o person_id existe no sucesso
      if (responseData && responseData.person_id) {
        return String(responseData.person_id).trim();
      } else {
        throw new Error("Sucesso aparente, mas person_id não foi retornado.");
      }

    } catch (error) {
      Logger.log("Erro ao criar lead: " + error.message);
      // Repassa o erro para ser tratado na interface ou log principal
      throw error;
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