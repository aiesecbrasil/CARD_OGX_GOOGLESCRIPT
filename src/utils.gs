function respostaJson(status, message, data) {
  // Monta o objeto de resposta JSON
  const resposta = {
    status: status,   // Status da opera??o
    message: message, // Mensagem detalhando o resultado
    data: data        // Dados adicionais
  };

  // Converte o objeto em string JSON e define o tipo MIME como application/json
  return ContentService
    .createTextOutput(JSON.stringify(resposta))
    .setMimeType(ContentService.MimeType.JSON);
}