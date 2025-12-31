class Resposta {
  static sucesso(message, data = null) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "sucesso", message, data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  static erro(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}