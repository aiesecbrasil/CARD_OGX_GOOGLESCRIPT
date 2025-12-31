function getField(item, fieldName) {
  // Valida??o inicial para garantir que o objeto ? v?lido
  if (!item || !item.fields || !Array.isArray(item.fields)) return null;

  // Procura pelo campo cujo external_id corresponde ao fieldName
  const field = item.fields.find(f => f.external_id === fieldName);

  // Retorna o campo encontrado ou null caso n?o exista
  return field || null;
}