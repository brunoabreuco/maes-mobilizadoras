async function makeCadastroAvisosEventos(prop) {
  const comp = await make('componenteCadastroAvisosEventos', prop);
  await controlarCadastroAvisosEventos(comp);
}

async function controlarCadastroAvisosEventos(element) {

  const container = element.querySelector('#container-principal');

  const criarEvento = element.querySelector('#criar-evento');
  const criarAviso = element.querySelector('#criar-aviso');
  const adicionarMobilizadora = element.querySelector('#adicionar-mobilizadora');
  const detalhesEvento = element.querySelector('#detalhes-do-evento');

  const botaoFechar = element.querySelector('#header-botoes button:last-child');
  const tituloModal = element.querySelector('.header h2');
  const botaoAviso = element.querySelector('#botao-aviso');
  const botaoFooter = element.querySelector('#confirmar-presenca');



  // começa tudo fechado
  container.style.display = 'none';

  criarEvento.style.display = 'none';
  criarAviso.style.display = 'none';
  adicionarMobilizadora.style.display = 'none';
  detalhesEvento.style.display = 'none';

  let modalAtual = null;

  function abrirModal(tipo) {
    modalAtual = tipo;

    container.style.display = 'flex';

    criarEvento.style.display = 'none';
    criarAviso.style.display = 'none';
    adicionarMobilizadora.style.display = 'none';
    detalhesEvento.style.display = 'none';

    document.body.style.overflow = 'hidden';

    // título
    if (tituloModal) {
      if (tipo === 'detalhes-evento') tituloModal.innerText = 'Detalhes do Evento';
      if (tipo === 'criar-evento') tituloModal.innerText = 'Criar Evento';
      if (tipo === 'criar-aviso') tituloModal.innerText = 'Criar Aviso';
      if (tipo === 'adicionar-mobilizadora') tituloModal.innerText = 'Adicionar Mobilizadora';
    }

    // footer button text
    if (botaoFooter) {
      if (tipo === 'criar-evento') botaoFooter.innerText = 'Criar Evento';
      if (tipo === 'criar-aviso') botaoFooter.innerText = 'Enviar Aviso';
      if (tipo === 'adicionar-mobilizadora') botaoFooter.innerText = 'Adicionar Mobilizadora';
      if (tipo === 'detalhes-evento') botaoFooter.innerText = 'Confirmar Presença';
    }

    // mostrar seção certa
    if (tipo === 'criar-evento') criarEvento.style.display = 'block';
    if (tipo === 'criar-aviso') criarAviso.style.display = 'block';
    if (tipo === 'adicionar-mobilizadora') adicionarMobilizadora.style.display = 'block';
    if (tipo === 'detalhes-evento') detalhesEvento.style.display = 'block';
  }

  // para criar um novo evento (página de ações comunitárias)
  const nome_evento = element.querySelector('#nome-evento')
  const tipo_evento = element.querySelector('#tipo-evento')
  const data_evento = element.querySelector('#data')
  const horario_evento = element.querySelector('#horario')
  const local_evento = element.querySelector('#local-evento')
  const descricao_evento = element.querySelector('#descricao-novo-evento')

  // para criar novo aviso (página de perfil)
  const evento_escolhido = element.querySelector('#tipo-evento-ja-existente')
  const titulo_aviso_novo = element.querySelector('#titulo-novo-aviso')
  const mensagem_aviso_novo = element.querySelector('#descricao-novo-aviso')

  // para adicionar mobilizadora (página de perfil)
  const telefone_mobilizadora = element.querySelector('#telefone-mobilizadora')


  // vamos usar o botaoFooter, declarado no começo do documento.

  botaoFooter.addEventListener('click', async () => {

    switch (modalAtual) {
      case 'criar-evento':
        const novo_evento = {
          titulo: nome_evento.value,
          tipo: tipo_evento.value,
          data: data_evento.value,
          hora: horario_evento.value,
          local: local_evento.value,
          descricao: descricao_evento.value
        }
        await criarEvento(novo_evento);
        break;

      case 'criar-aviso':
        const path = `/acoes/${evento_escolhido.value}/notify`;
        try {
          await apiPost(path, {
            title: titulo_aviso_novo.value,
            message: mensagem_aviso_novo.value
          });
        } catch (error) {
          console.log(error);
          alert(error);
        }

        break;

      case 'adicionar-mobilizadora':
        const telefone_mobilizadora_value = telefone_mobilizadora.value
        break;

      default:
        break;
    }
    fecharModal();
  })

  function fecharModal() {
    container.style.display = 'none';

    criarEvento.style.display = 'none';
    criarAviso.style.display = 'none';
    adicionarMobilizadora.style.display = 'none';
    detalhesEvento.style.display = 'none';

    document.body.style.overflow = 'auto';
  }


  // BOTÃO X
  if (botaoFechar) {
    botaoFechar.addEventListener('click', fecharModal);
  }


  // BOTÃO AZUL
  const botaoAzul = document.getElementById('botao_azul');
  if (botaoAzul) {
    botaoAzul.addEventListener('click', () => abrirModal('criar-aviso'));
  }

  // BOTÃO VERMELHO
  const botaoVermelho = document.getElementById('botao_vermelho');
  if (botaoVermelho) {
    botaoVermelho.addEventListener('click', () => abrirModal('adicionar-mobilizadora'));
  }

  // BOTÃO +
  // ⚠️ IMPORTANTE: está fora do componente, então usamos document
  const botaoAdicionarEvento = document.querySelector('[style*="icone-adicionar-evento"]')
    || document.querySelector('button img[src*="icone-adicionar-evento"]')?.parentElement;

  if (botaoAdicionarEvento) {
    botaoAdicionarEvento.addEventListener('click', () => abrirModal('criar-evento'));
  }


  const pagina = window.location.pathname;
  // ESCONDE O BOTÃO DE AVISO NO MODAL NA TELA DE PERFIL
  if (pagina.includes('tela_meu_perfil')) {
    if (botaoAviso) {
      botaoAviso.style.display = 'none';
    }
  }

  document.addEventListener('click', (e) => {
    const evento = e.target.closest('.conteudo');

    if (!evento) return;

    // evita clicar em botões internos
    if (e.target.closest('button')) return;

    abrirModal('detalhes-evento');
  });

}
