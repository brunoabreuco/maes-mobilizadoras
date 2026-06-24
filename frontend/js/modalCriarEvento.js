const botaoAdicionar = document.getElementById("icone-adicionar-evento");

const modalContainer = document.getElementById("modal-container");

botaoAdicionar.addEventListener("click", () => {

    modalContainer.innerHTML = `
    
        <div class="overlay">

            <div class="modal">

                ${document.getElementById("criar-evento-template").innerHTML}

            </div>

        </div>

    `;

});