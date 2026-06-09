function titleCase(s) {
  // https://www.geeksforgeeks.org/javascript/convert-string-to-title-case-in-javascript/
  return s.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function loadProfile() {
  const data = await apiGet('/api/me', undefined);

  document.getElementById("nome").innerText = data.full_name;
  document.getElementById("subtitulo").innerText = titleCase(data.role);
  document.getElementById("numero_eventos_criou").innerText = data.created_events_count;
  document.getElementById("numero_eventos_participou").innerText = data.participated_events_count;

  const botaoAviso = document.getElementById("botao_azul");
  const botaoMobilizadora = document.getElementById("botao_vermelho");

  switch (data.role) {

    case "coordenadora":
      break;

    case "organizadora":
      if (botaoMobilizadora) {
        botaoMobilizadora.style.display = "none";
      }
      break;

    case "participante":
      if (botaoAviso) {
        botaoAviso.style.display = "none";
      }

      if (botaoMobilizadora) {
        botaoMobilizadora.style.display = "none";
      }

      for (let e of document.querySelectorAll('.participante-hide')) {
        console.log(e);
        e.style.display = 'none';
      }
      break;
  }
}

document.getElementById('texto_sair').addEventListener('click', (evt) => {
  evt.preventDefault();
  localStorage.clear();
  window.location.reload();
});

// BOTÃO AZUL
const botaoAzul = document.getElementById('botao_azul');
if (botaoAzul) {
  botaoAzul.addEventListener('click', () => ccaeAbrirModal('criar-aviso'));
}

// BOTÃO VERMELHO
const botaoVermelho = document.getElementById('botao_vermelho');
if (botaoVermelho) {
  botaoVermelho.addEventListener('click', () => ccaeAbrirModal('adicionar-mobilizadora'));
}

loadProfile();
