const input = document.getElementById("phone");
const button = document.querySelector("button");
const etapa1 = document.querySelector(".etapa01-telefone");
const etapa2 = document.querySelector(".etapa02-codigo-SMS");

button.disabled = true;

input.addEventListener("input", () => {
  let value = input.value.replace(/\D/g, ""); // só números

  value = value.substring(0, 11);

  if (value.length > 0) {
    value = "(" + value;
  }
  if (value.length > 3) {
    value = value.slice(0, 3) + ") " + value.slice(3);
  }
  if (value.length > 10) {
    value = value.slice(0, 10) + "-" + value.slice(10);
  }

  input.value = value;


  const numeros = value.replace(/\D/g, "");
  if (numeros.length === 10 || numeros.length === 11) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
});

button.addEventListener("click", () => {
  if (button.disabled) return;

  etapa1.style.display = "none";
  if (etapa2) {
    etapa2.style.display = "block";
  }
});