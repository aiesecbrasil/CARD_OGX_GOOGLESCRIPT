class Resposta {
  sucesso(message, data = null) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "sucesso", message, data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  erro(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}