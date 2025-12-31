function respostaJson(status, message, data) {
  // Monta o objeto de resposta JSON
  const resposta = {
    status: status,   // Status da operação
    message: message, // Mensagem detalhando o resultado
    data: data        // Dados adicionais
  };

  // Converte o objeto em string JSON e define o tipo MIME como application/json
  return ContentService
    .createTextOutput(JSON.stringify(resposta))
    .setMimeType(ContentService.MimeType.JSON);
}

function getField(item, fieldName) {
  // Validação inicial para garantir que o objeto é válido
  if (!item || !item.fields || !Array.isArray(item.fields)) return null;

  // Procura pelo campo cujo external_id corresponde ao fieldName
  const field = item.fields.find(f => f.external_id === fieldName);

  // Retorna o campo encontrado ou null caso não exista
  return field || null;
}

function conteudoEhIgual(conteudoLocal, conteudoGithubBase64) {
  const githubDecoded = Utilities.newBlob(
    Utilities.base64Decode(conteudoGithubBase64)
  ).getDataAsString();

  return conteudoLocal.trim() === githubDecoded.trim();
}