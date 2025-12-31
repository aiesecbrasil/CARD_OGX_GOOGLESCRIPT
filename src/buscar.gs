function buscarItemCompleto(access_token, APP_ID, data) {
  const nome = data.nome;
  const sobrenome = data.sobrenome;
  const emails = data.emails.map(e => e.email);
  const telefones = data.telefones.map(t => t.numero);

  let resultados = [];

  // 1 ? Busca por nome
  resultados = resultados.concat(buscarPorNome(access_token, APP_ID, nome));
  resultados = resultados.concat(buscarPorSobreNome(access_token, APP_ID, sobrenome));

  // 2 ? Busca por cada email
  emails.forEach(e => {
    resultados = resultados.concat(buscarPorEmail(access_token, APP_ID, e));
  });

  // 3 ? Busca por cada telefone
  telefones.forEach(t => {
    resultados = resultados.concat(buscarPorTelefone(access_token, APP_ID, t));
  });

  // 4 ? Remove duplicados pelo item_id
  resultados = resultados.filter(
    (item, index, arr) => arr.findIndex(i => i.item_id === item.item_id) === index
  );

  // 5 ? Valida??o detalhada dos dados encontrados
  for (let item of resultados) {
    if (!item || !item.fields) continue;

    const tituloField = getField(item, "title"); // campo do nome
    const sobrenomeField = getField(item, "sobrenome-2"); // campo do sobrenome
    const emailField = getField(item, "email"); // campo de emails
    const telefoneField = getField(item, "telefone"); // campo de telefones

    const titulo = tituloField?.values?.[0]?.value || "";
    const sobrenomeTitle = sobrenomeField?.values?.[0]?.value || "";

    const itemEmails = (emailField?.values || []).map(v => v.value);
    const itemTelefones = (telefoneField?.values || []).map(v => v.value);

    const emailMatch = emails.some(e => itemEmails.includes(e));
    const telefoneMatch = telefones.some(t => itemTelefones.includes(t));
    const nomeMatch = titulo === nome;
    const sobrenomeMatch = sobrenomeTitle === sobrenome;

    // Se pelo menos email ou telefone bate e nome + sobrenome batem ? retorna item
    if ((emailMatch || telefoneMatch) && nomeMatch && sobrenomeMatch) {
      return item;
    }
  }

  // Nenhum item corresponde aos dados
  return null;
}