async function carregarPerfil() {
  try {
    const data = await apiGet('/api/me');
    // Preenche os dados do perfil
    document.getElementById('nome').textContent = data.full_name || 'Usuário';
    document.getElementById('subtitulo').textContent = data.role || 'Participante';
    document.getElementById('numero_eventos_criou').textContent = data.created_events_count || 0;
    document.getElementById('numero_eventos_participou').textContent = data.participated_events_count || 0;

    // Mostra/esconde elementos baseado no role
    const isParticipante = data.role === 'participante';
    const elementosHide = document.querySelectorAll('.participante-hide');
    for (let el of elementosHide) {
      if (isParticipante) {
        el.style.display = 'none';
      } else {
        el.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    mostrar_msg_erro('Erro ao carregar perfil', '' + err);
  } finally {
    ocultarLoading();
  }
}

// 🔹 FUNÇÃO PARA OCULTAR LOADING
function ocultarLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

document.addEventListener('componentsReady', () => {
  carregarPerfil();
});