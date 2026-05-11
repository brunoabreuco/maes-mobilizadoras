const etapas = document.querySelectorAll("section");
let etapaAtual = 0;

// inicia mostrando só a primeira etapa
function mostrarEtapa(index) {
    etapas.forEach((etapa, i) => {
        etapa.style.display = i === index ? "block" : "none";
    });
}

mostrarEtapa(etapaAtual);

// -------------------- ETAPA 1 (telefone)
const inputTelefone = document.getElementById("phone");
const botaoTelefone = document.querySelector(".etapa01-telefone button");

botaoTelefone.disabled = true;

inputTelefone.addEventListener("input", () => {
    let value = inputTelefone.value.replace(/\D/g, "").slice(0, 11);

    if (value.length > 0) value = "(" + value;
    if (value.length > 3) value = value.slice(0, 3) + ") " + value.slice(3);
    if (value.length > 10) value = value.slice(0, 10) + "-" + value.slice(10);

    inputTelefone.value = value;

    const numeros = value.replace(/\D/g, "");
    botaoTelefone.disabled = !(numeros.length === 10 || numeros.length === 11);
});

botaoTelefone.addEventListener("click", () => {
    etapaAtual = 1;
    mostrarEtapa(etapaAtual);
});


// -------------------- ETAPA 2 (SMS)
const inputsCodigo = document.querySelectorAll(".input-codigo");
const botaoReenviar = document.querySelector(".botao-reenviar");

function codigoCompleto() {
    return Array.from(inputsCodigo).every(i => i.value.trim().length === 1);
}

inputsCodigo.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length === 1 && inputsCodigo[index + 1]) {
            inputsCodigo[index + 1].focus();
        }

        if (codigoCompleto()) {
            setTimeout(() => {
                etapaAtual = 2;
                mostrarEtapa(etapaAtual);
            }, 300);
        }
    });
});


// -------------------- ETAPA 3 (final)
const botaoFinal = document.querySelector(".etapa04-nome-bairro a");

botaoFinal.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Cadastro finalizado!");
});