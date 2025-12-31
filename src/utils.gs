function getField(item, fieldName) {
  // Validação inicial para garantir que o objeto é válido
  if (!item || !item.fields || !Array.isArray(item.fields)) return null;

  // Procura pelo campo cujo external_id corresponde ao fieldName
  const field = item.fields.find(f => f.external_id === fieldName);

  // Retorna o campo encontrado ou null caso não exista
  return field || null;
}