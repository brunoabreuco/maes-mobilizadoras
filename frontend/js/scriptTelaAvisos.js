async function carregarAvisos() {
  let resp = null;
  try {
    resp = await apiGet('/api/notifications');
  } catch (error) {
    mostrar_msg_erro('Erro ao carregar os avisos', '' + error);
    return;
  }
  let avisos = [];
  for (let dat of resp.data) {
    avisos.push({
      id: dat.id,
      lido: dat.is_read,
      titulo: dat.title,
      mensagem: dat.message,
      imagem: dat.cover_image_url || '/images/icone-mensagem-fundo-verde.png',
      quando: dat.sent_at ? formatToLocalDate(dat.sent_at) : ''
    });
  }
  const mount = document.getElementById('lista-avisos');
  mount.innerHTML = "";
  for (let aviso of avisos) {
    const comp = await make('componenteAviso', aviso);
    if (aviso.lido) {
      comp.querySelector('img.novo').style.display = 'none';
    }
    comp.addEventListener('click', function () {
      if (!aviso.lido) {
        apiPost(`/api/notifications/${aviso.id}/read`, {}).then(() => {
          setTimeout(() => {
            carregarAvisos();
          }, 500);
        });
      }
      if (localStorage.getItem('access_token')) {
        requestPermissionAndGetToken();
      }
    });
    mount.appendChild(comp);
  }
}

carregarAvisos();
