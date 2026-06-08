let eventos = [];

// 1. BUSCAR EVENTOS DO BACKEND
async function carregarEventos() {
  try {
    const res = await fetch('http://localhost:5000/api/eventos');
    eventos = await res.json();

    renderizarEventos();
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
  }
}

// 2. RENDERIZAR COMPONENTES NA TELA
async function renderizarEventos() {
  const mount = document.getElementById('lista-avisos');

  mount.innerHTML = '';

  for (let evento of eventos) {
    const el = await make('componenteEventoDetalhado', {
      data: evento.data,                 // exemplo: "2026-04-16"
      titulo: evento.titulo,
      tipo: evento.tipo,
      hora: evento.hora,
      local: evento.local,
      confirmados: evento.confirmados,
      organizador: evento.organizador
    });

    mount.appendChild(el);
  }
}

// 3. CRIAR EVENTO NO BACKEND
async function criarEvento(evento) {
  try {
    await fetch('http://localhost:5000/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evento)
    });

    await carregarEventos(); // atualiza tela
  } catch (err) {
    console.error('Erro ao criar evento:', err);
  }
}

// 4. INICIALIZAÇÃO DA PÁGINA
window.addEventListener('load', () => {
  carregarEventos();
});
