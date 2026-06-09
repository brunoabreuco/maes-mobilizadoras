async function loadProfile() {
  const response = await fetch("http://localhost:5000/api/me");
  const data = await response.json();

  document.getElementById("nome").innerText = data.full_name;
  document.getElementById("subtitulo").innerText = data.role;

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
      break;
  }
}