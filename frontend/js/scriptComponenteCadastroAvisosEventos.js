// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

async function reqCriarEvento(evento) {
  try {
    await apiPost('/api/acoes', evento);
    if (typeof carregarEventos === 'function') {
      await carregarEventos();
    }
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    mostrar_msg_erro('Erro ao criar evento', "" + err);
  }
}

function combineDateAndTime(dateString, timeString) {
  if (!dateString || !timeString) {
    throw new Error('Preencha a data e o horário corretamente.');
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    throw new Error('Data ou horário inválidos.');
  }
  const date = new Date(year, month - 1, day, hours, minutes);
  if (isNaN(date.getTime())) {
    throw new Error('Data ou horário inválidos.');
  }
  const now = new Date();
  now.setSeconds(0, 0);
  if (date < now) {
    throw new Error('A data e horário devem ser no futuro.');
  }
  return date;
}

// Máscara de telefone (formato (XX) XXXXX-XXXX)
function aplicarMascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    let formatado = '';
    if (valor.length > 0) {
        formatado = '(' + valor.slice(0, 2);
        if (valor.length > 2) {
            formatado += ') ' + valor.slice(2, 7);
            if (valor.length > 7) {
                formatado += '-' + valor.slice(7, 11);
            }
        }
    }
    input.value = formatado;
}

// ============================================================
// CONTROLE PRINCIPAL DO MODAL
// ============================================================

async function controlarCadastroAvisosEventos(element) {
  const usuarioAtual = await apiGet('/api/me', undefined);

  window.ccaeAbrirModal = async function(tipo, evento) {
    await abrirModal(tipo, evento);
  };

  const container = document.getElementById("container-principal");
  const confirmacaoDelete = document.getElementById('confirmacao-delete');

  const criarEvento = element.querySelector('#criar-evento');
  const criarAviso = element.querySelector('#criar-aviso');
  const adicionarMobilizadora = element.querySelector('#adicionar-mobilizadora');
  const detalhesEvento = element.querySelector('#detalhes-do-evento');
  const detalhesAviso = element.querySelector('#detalhes-aviso');

  const botaoFechar = element.querySelector('#fechar-modal');
  const botaoDeletar = element.querySelector('#deletar-evento');
  const tituloModal = element.querySelector('.header h2');
  const botaoFooter = element.querySelector('#confirmar-presenca');
  const hrFooter = document.getElementById('hr-footer');
  const footerDiv = document.getElementById('footer'); // div inteira

  const cancelarDelete = document.getElementById('cancelar-delete');
  const confirmarDelete = document.getElementById('confirmar-delete');
  const confirmacaoTitulo = document.getElementById('confirmacao-titulo');
  const confirmacaoMensagem = document.getElementById('confirmacao-mensagem');

  const listaContainer = document.getElementById('lista-mobilizadoras-container');
  const nenhumMsg = document.getElementById('nenhuma-mobilizadora');
  const inputTelefone = document.getElementById('telefone-mobilizadora');
  const btnAdicionar = document.getElementById('btn-adicionar-mobilizadora');

  container.style.display = 'none';
  if (confirmacaoDelete) confirmacaoDelete.style.display = 'none';

  criarEvento.style.display = 'none';
  criarAviso.style.display = 'none';
  adicionarMobilizadora.style.display = 'none';
  detalhesEvento.style.display = 'none';
  if (detalhesAviso) detalhesAviso.style.display = 'none';
  if (botaoDeletar) botaoDeletar.style.display = 'none';

  window.MEModal = {
    tipo: null,
    evento: null
  };

  // ============================================================
  // FUNÇÃO PARA MODAL DE CONFIRMAÇÃO GENÉRICO (reutilizável)
  // ============================================================
  function abrirConfirmacaoGenerica(titulo, mensagem, onConfirm, onCancel) {
    const modal = document.getElementById('confirmacao-delete');
    if (!modal) return;

    confirmacaoTitulo.innerText = titulo;
    confirmacaoMensagem.innerText = mensagem;

    // Remove listeners antigos clonando e substituindo os botões
    const confirmBtn = document.getElementById('confirmar-delete');
    const cancelBtn = document.getElementById('cancelar-delete');

    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    // Adiciona novos listeners
    newConfirm.addEventListener('click', function() {
      modal.style.display = 'none';
      if (onConfirm) onConfirm();
    });
    newCancel.addEventListener('click', function() {
      modal.style.display = 'none';
      if (onCancel) onCancel();
    });

    // Fecha ao clicar fora
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        if (onCancel) onCancel();
      }
    };

    modal.style.display = 'flex';
  }

  // Expor globalmente para uso em outros lugares (se necessário)
  window.abrirConfirmacaoGenerica = abrirConfirmacaoGenerica;

  // ============================================================
  // FUNÇÃO PARA CARREGAR A LISTA DE MOBILIZADORAS (APENAS ORGANIZADORAS)
  // ============================================================
  async function carregarListaMobilizadoras() {
    if (!listaContainer) return;
    try {
      const resp = await apiGet('/admin/users', { role: 'organizadora' });
      console.log('Resposta da API (mobilizadoras):', resp);
      const mobilizadoras = resp.items || [];
      console.log('Mobilizadoras encontradas:', mobilizadoras.length);

      // Remove apenas os itens adicionados dinamicamente, mantendo a mensagem padrão
      const children = listaContainer.children;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.id !== 'nenhuma-mobilizadora') {
          child.remove();
        }
      }

      if (mobilizadoras.length === 0) {
        if (nenhumMsg) nenhumMsg.style.display = 'block';
        return;
      }
      if (nenhumMsg) nenhumMsg.style.display = 'none';

      for (let mob of mobilizadoras) {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        `;
        const info = document.createElement('div');
        info.innerHTML = `<strong>${mob.full_name || 'Sem nome'}</strong> <span style="color: #888; font-size: 14px;">${mob.phone || ''}</span>`;
        info.style.cssText = 'font-family: "Inter", sans-serif; font-size: 14px;';

        const btnRemover = document.createElement('button');
        btnRemover.innerText = 'Remover';
        btnRemover.style.cssText = `
          background-color: #D35746;
          border: none;
          border-radius: 8px;
          padding: 4px 12px;
          color: white;
          font-family: "Inter", sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        `;
        btnRemover.onmouseover = () => btnRemover.style.backgroundColor = '#b94332';
        btnRemover.onmouseout = () => btnRemover.style.backgroundColor = '#D35746';

        btnRemover.addEventListener('click', async function(e) {
          e.stopPropagation();
          if (mob.id === usuarioAtual.id) {
            mostrar_msg_erro('Você não pode remover a si mesmo(a) da lista.', '');
            return;
          }
          const titulo = 'Remover mobilizadora';
          const mensagem = `Deseja remover "${mob.full_name}" (${mob.phone}) da lista de mobilizadoras? Ela voltará a ser participante.`;
          abrirConfirmacaoGenerica(titulo, mensagem, async function() {
            try {
              await apiPatch(`/admin/users/${mob.id}/role`, { role: 'participante' });
              mostrar_msg_erro('Sucesso', `${mob.full_name} foi rebaixada para participante.`);
              await carregarListaMobilizadoras();
            } catch (error) {
              console.error('Erro ao remover mobilizadora:', error);
              mostrar_msg_erro('Erro ao remover mobilizadora', error.message || '');
            }
          });
        });

        item.appendChild(info);
        item.appendChild(btnRemover);
        listaContainer.appendChild(item);
      }
    } catch (error) {
      console.error('Erro ao carregar mobilizadoras:', error);
      // Remove itens antigos e mostra erro
      const children = listaContainer.children;
      for (let i = children.length - 1; i >= 0; i--) {
        if (children[i].id !== 'nenhuma-mobilizadora') {
          children[i].remove();
        }
      }
      if (nenhumMsg) nenhumMsg.style.display = 'none';
      const errorMsg = document.createElement('p');
      errorMsg.style.color = '#D35746';
      errorMsg.style.fontFamily = "'Inter', sans-serif";
      errorMsg.innerText = 'Erro ao carregar lista.';
      listaContainer.appendChild(errorMsg);
    }
  }

  // ============================================================
  // FUNÇÃO PARA ADICIONAR MOBILIZADORA POR TELEFONE
  // ============================================================
  async function adicionarMobilizadoraPorTelefone(telefone) {
    const phoneValue = telefone.trim().replace(/\D/g, '');
    if (phoneValue.length < 10 || phoneValue.length > 11) {
      mostrar_msg_erro('Erro', 'Telefone inválido. Use DDD + número (ex: 11999999999)');
      return;
    }

    // Monta o número no formato internacional (+55 + DDD + número)
    const phoneInternational = `+55${phoneValue}`;

    try {
      const searchResult = await apiGet('/admin/users', { phone: phoneInternational });
      const users = searchResult.items || [];

      if (users.length === 0) {
        mostrar_msg_erro('Erro', 'Nenhuma usuária encontrada com este telefone.');
        return;
      }

      const userToPromote = users[0];

      if (userToPromote.role === 'organizadora' || userToPromote.role === 'coordenadora') {
        mostrar_msg_erro('Aviso', 'Esta usuária já é mobilizadora (ou coordenadora).');
        return;
      }

      const titulo = 'Promover a mobilizadora';
      const mensagem = `Deseja promover "${userToPromote.full_name}" (${userToPromote.phone}) a mobilizadora?`;
      abrirConfirmacaoGenerica(titulo, mensagem, async function() {
        try {
          await apiPatch(`/admin/users/${userToPromote.id}/role`, { role: 'organizadora' });
          mostrar_msg_erro('Sucesso', 'Mobilizadora adicionada com sucesso!');
          await carregarListaMobilizadoras();
          if (inputTelefone) inputTelefone.value = '';
        } catch (error) {
          console.error('Erro ao adicionar mobilizadora:', error);
          mostrar_msg_erro('Erro', 'Não foi possível adicionar mobilizadora: ' + error.message);
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar mobilizadora:', error);
      mostrar_msg_erro('Erro', 'Não foi possível adicionar mobilizadora: ' + error.message);
    }
  }

  // ============================================================
  // ABRIR / FECHAR MODAL
  // ============================================================

  async function abrirModal(tipo, evento) {
    window.MEModal.tipo = tipo;
    window.MEModal.evento = evento || null;

    container.style.display = 'flex';
    if (confirmacaoDelete) confirmacaoDelete.style.display = 'none';

    // Oculta todas as seções primeiro
    criarEvento.style.display = 'none';
    criarAviso.style.display = 'none';
    adicionarMobilizadora.style.display = 'none';
    detalhesEvento.style.display = 'none';
    if (detalhesAviso) detalhesAviso.style.display = 'none';
    if (botaoDeletar) botaoDeletar.style.display = 'none';

    // Restaura footer e hr (visíveis por padrão)
    if (footerDiv) footerDiv.style.display = 'block';
    if (hrFooter) hrFooter.style.display = 'block';

    document.body.style.overflow = 'hidden';

    // Título do modal
    if (tituloModal) {
      if (tipo === 'detalhes-evento') tituloModal.innerText = 'Detalhes do Evento';
      else if (tipo === 'detalhes-aviso') tituloModal.innerText = 'Detalhes do Aviso';
      else if (tipo === 'criar-evento') tituloModal.innerText = 'Criar Evento';
      else if (tipo === 'criar-aviso') tituloModal.innerText = 'Criar Aviso';
      else if (tipo === 'adicionar-mobilizadora') tituloModal.innerText = 'Gerenciar Mobilizadoras';
    }

    // Configura o botão do footer (quando visível)
    if (botaoFooter) {
      if (tipo === 'criar-evento') {
        botaoFooter.innerText = 'Criar Evento';
        botaoFooter.style.display = 'block';
      } else if (tipo === 'criar-aviso') {
        botaoFooter.innerText = 'Enviar Aviso';
        botaoFooter.style.display = 'block';
      } else if (tipo === 'adicionar-mobilizadora') {
        // Oculta o footer inteiro e o hr
        if (footerDiv) footerDiv.style.display = 'none';
        if (hrFooter) hrFooter.style.display = 'none';
        botaoFooter.style.display = 'none';
      } else if (tipo === 'detalhes-aviso') {
        botaoFooter.style.display = 'none';
        if (hrFooter) hrFooter.style.display = 'none';
      } else if (tipo === 'detalhes-evento') {
        botaoFooter.style.display = 'block';
        if (hrFooter) hrFooter.style.display = 'block';
        if (botaoDeletar) {
          const evt = window.MEModal.evento;
          if (evt) {
            const isOrganizer = evt.organizer_id === usuarioAtual.id;
            const isCoordinator = usuarioAtual.role === 'coordenadora';
            if (isOrganizer || isCoordinator) {
              botaoDeletar.style.display = 'block';
            } else {
              botaoDeletar.style.display = 'none';
            }
          }
        }
      }
    }

    // Exibe a seção correspondente
    if (tipo === 'criar-evento') criarEvento.style.display = 'block';
    else if (tipo === 'criar-aviso') criarAviso.style.display = 'block';
    else if (tipo === 'adicionar-mobilizadora') {
      adicionarMobilizadora.style.display = 'block';
      await carregarListaMobilizadoras();
      if (inputTelefone) inputTelefone.value = '';
    }
    else if (tipo === 'detalhes-evento') detalhesEvento.style.display = 'block';
    else if (tipo === 'detalhes-aviso' && detalhesAviso) detalhesAviso.style.display = 'block';

    // Recarrega botões de voz (se for criação)
    if (tipo === 'criar-evento' || tipo === 'criar-aviso') {
      setTimeout(() => {
        if (typeof carregarBotoesVoz === 'function') {
          carregarBotoesVoz(5);
        }
      }, 500);
    }

    // Carrega eventos no select de aviso
    if (tipo === 'criar-aviso') {
      const resp = await apiGet('/api/acoes', { responsavel: usuarioAtual.id });
      const sel = document.getElementById("tipo-evento-ja-existente");
      sel.innerHTML = '';
      for (let ac of resp.data) {
        const opt = document.createElement("option");
        opt.setAttribute('value', ac.id);
        opt.innerText = ac.title;
        sel.appendChild(opt);
      }
    }

    // Preenche detalhes do evento
    if (tipo === 'detalhes-evento') {
      try {
        const evt = window.MEModal.evento;
        const dataFmt = new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const horaFmt = new Intl.DateTimeFormat('pt-BR', {
          hour: 'numeric',
          minute: '2-digit'
        });
        const eData = dateTimeParseUTC(evt.event_datetime);
        if (evt.is_participating) {
          botaoFooter.innerText = 'Cancelar Participação';
        } else {
          botaoFooter.innerText = 'Confirmar Presença';
        }

        document.getElementById("det-tipo-evento").innerText = evt.category_name || '';
        document.getElementById("det-titulo-evento").innerText = evt.title;
        document.getElementById("det-descricao-evento").innerText = evt.description || '';
        document.getElementById("det-data-evento").innerText = dataFmt.format(eData);
        document.getElementById("det-horario-evento").innerText = horaFmt.format(eData);
        document.getElementById("det-endereco-evento").innerText = evt.location_name;
        document.getElementById("det-organizadora").innerText = evt.organizer_name || '<desconhecido>';
        document.getElementById("det-numero-pessoas-confirmadas").innerText = evt.participant_count;
      } catch (error) {
        console.log(error);
        mostrar_msg_erro('Não foi possível carregar mais detalhes do evento', '' + error);
        fecharModal();
      }
    }

    // Preenche detalhes do aviso
    if (tipo === 'detalhes-aviso' && detalhesAviso) {
      try {
        const aviso = window.MEModal.evento;
        document.getElementById("det-aviso-titulo").innerText = aviso.titulo || 'Sem título';
        document.getElementById("det-aviso-mensagem").innerText = aviso.mensagem || '';
        const dataFormatada = aviso.quando || (aviso.sent_at ? formatToLocalDate(aviso.sent_at) : '');
        document.getElementById("det-aviso-data").innerText = dataFormatada || 'Data não disponível';
        document.getElementById("det-aviso-remetente").innerText = 'Administração';
      } catch (error) {
        console.log(error);
        mostrar_msg_erro('Não foi possível carregar detalhes do aviso', '' + error);
        fecharModal();
      }
    }
  }

  function fecharModal() {
    console.log('fecharModal chamado');
    container.style.display = 'none';
    if (confirmacaoDelete) confirmacaoDelete.style.display = 'none';
    criarEvento.style.display = 'none';
    criarAviso.style.display = 'none';
    adicionarMobilizadora.style.display = 'none';
    detalhesEvento.style.display = 'none';
    if (detalhesAviso) detalhesAviso.style.display = 'none';
    if (hrFooter) hrFooter.style.display = 'block';
    if (footerDiv) footerDiv.style.display = 'block';
    if (botaoDeletar) botaoDeletar.style.display = 'none';

    document.body.style.overflow = 'auto';
    window.MEModal.tipo = null;
    window.MEModal.evento = null;
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  if (botaoFechar) botaoFechar.addEventListener('click', fecharModal);
  if (botaoDeletar) botaoDeletar.addEventListener('click', function() {
    const evt = window.MEModal.evento;
    if (!evt) return;
    const titulo = 'Deletar evento';
    const mensagem = `Tem certeza que deseja deletar o evento "${evt.title}"? Esta ação não pode ser desfeita.`;
    abrirConfirmacaoGenerica(titulo, mensagem, async function() {
      try {
        await apiDelete(`/api/acoes/${evt.id}`);
        fecharModal();
        setTimeout(() => window.location.reload(), 200);
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
        mostrar_msg_erro('Não foi possível deletar o evento', '' + error);
      }
    });
  });

  // Máscara de telefone
  if (inputTelefone) {
    inputTelefone.addEventListener('input', function() {
      aplicarMascaraTelefone(this);
    });
  }

  // Botão adicionar mobilizadora
  if (btnAdicionar) {
    btnAdicionar.addEventListener('click', async function() {
      if (!inputTelefone) return;
      await adicionarMobilizadoraPorTelefone(inputTelefone.value);
    });
    if (inputTelefone) {
      inputTelefone.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnAdicionar.click();
        }
      });
    }
  }

  // ============================================================
  // BOTÃO FOOTER (ações principais)
  // ============================================================

  if (botaoFooter) {
    botaoFooter.addEventListener('click', async () => {
      switch (window.MEModal.tipo) {
        case 'criar-evento': {
          const nome_evento = document.getElementById('nome-evento');
          const tipo_evento = document.getElementById('tipo-evento');
          const data_evento = document.getElementById('data');
          const horario_evento = document.getElementById('horario');
          const local_evento = document.getElementById('local-evento');
          const descricao_evento = document.getElementById('descricao-novo-evento');

          if (!nome_evento.value || !tipo_evento.value || !data_evento.value || !horario_evento.value || !local_evento.value) {
            mostrar_msg_erro('Preencha todos os campos obrigatórios (Nome, Tipo, Data, Horário e Local).', '');
            return;
          }

          try {
            const dataCombinada = combineDateAndTime(data_evento.value, horario_evento.value);
            const novo_evento = {
              title: nome_evento.value,
              event_datetime: dataCombinada.toISOString(),
              location_name: local_evento.value,
              description: descricao_evento.value || '',
              organizer_id: usuarioAtual.id,
              status: 'active',
              category_id: tipo_evento.value
            };
            await reqCriarEvento(novo_evento);
            window.location.reload();
          } catch (error) {
            console.error(error);
            mostrar_msg_erro('Erro ao criar evento', error.message || 'Verifique a data e horário.');
          }
          break;
        }

        case 'criar-aviso': {
          const evento_escolhido = document.getElementById('tipo-evento-ja-existente');
          const titulo_aviso = document.getElementById('titulo-novo-aviso');
          const mensagem_aviso = document.getElementById('descricao-novo-aviso');
          if (!evento_escolhido.value || !titulo_aviso.value || !mensagem_aviso.value) {
            mostrar_msg_erro('Preencha todos os campos do aviso.', '');
            return;
          }
          try {
            await apiPost(`/api/acoes/${evento_escolhido.value}/notify`, {
              title: titulo_aviso.value,
              message: mensagem_aviso.value
            });
            mostrar_msg_erro('Aviso enviado com sucesso!', '');
          } catch (error) {
            console.error(error);
            mostrar_msg_erro('Não foi possível criar o aviso', '' + error);
          }
          break;
        }

        case 'detalhes-evento': {
          const evt = window.MEModal.evento;
          try {
            await apiPost(`/api/acoes/${evt.id}/participate`, {});
            window.location.reload();
          } catch (error) {
            console.error(error);
            mostrar_msg_erro('Não foi possível confirmar a presença', '' + error);
          }
          break;
        }

        default:
          break;
      }
      fecharModal();
    });
  }

  // ============================================================
  // CARREGAR CATEGORIAS
  // ============================================================

  (async function carregarCategorias() {
    const tipo_evento = document.getElementById('tipo-evento');
    if (!tipo_evento) return;
    try {
      const res = await apiGet("/api/categories");
      const categorias = res.data || [];
      tipo_evento.innerHTML = '';
      for (let cat of categorias) {
        const opt = document.createElement('option');
        opt.setAttribute('value', cat.id);
        opt.innerText = cat.name;
        tipo_evento.appendChild(opt);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  })();

  window.ccaeAbrirModal = abrirModal;
}