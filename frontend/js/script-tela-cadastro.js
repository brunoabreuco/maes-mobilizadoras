// ============================================================
// INICIALIZAÇÃO
// Todo o código fica dentro de uma IIFE async para permitir await no topo.
// ============================================================
(async () => {

  const REDIRECT_APOS_LOGIN = '/tela_acoes_comunitarias.html';

  // ============================================================
  // UTILITÁRIOS DE UI
  // ============================================================
  function mostrarErro(id, mensagem) {
    const el = document.getElementById(id);
    if (el) el.textContent = mensagem;
  }

  function limparErro(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  function toE164(phoneFormatado) {
    // (11) 98765-4321  →  +5511987654321
    const digits = phoneFormatado.replace(/\D/g, '');
    return '+55' + digits;
  }

  // ============================================================
  // NAVEGAÇÃO ENTRE ETAPAS
  // ============================================================
  const etapas = document.querySelectorAll('section');
  let etapaAtual = 0;

  function mostrarEtapa(index) {
    etapas.forEach((etapa, i) => {
      etapa.style.display = i === index ? 'block' : 'none';
    });
  }

  mostrarEtapa(etapaAtual);

  // ============================================================
  // ESTADO COMPARTILHADO ENTRE ETAPAS
  // ============================================================
  let telefoneE164 = '';

  // ============================================================
  // ETAPA 1 — TELEFONE
  // ============================================================
  const inputTelefone = document.getElementById('phone');
  const botaoTelefone = document.querySelector('.etapa01-telefone button');

  botaoTelefone.disabled = true;

  inputTelefone.addEventListener('input', () => {
    let value = inputTelefone.value.replace(/\D/g, '').slice(0, 11);

    if (value.length > 0) value = '(' + value;
    if (value.length > 3) value = value.slice(0, 3) + ') ' + value.slice(3);
    if (value.length > 10) value = value.slice(0, 10) + '-' + value.slice(10);

    inputTelefone.value = value;
    limparErro('erro-telefone');

    const numeros = value.replace(/\D/g, '');
    botaoTelefone.disabled = !(numeros.length === 10 || numeros.length === 11);
  });

  botaoTelefone.addEventListener('click', async () => {
    limparErro('erro-telefone');

    telefoneE164 = toE164(inputTelefone.value);

    const textoOriginal = botaoTelefone.textContent;
    botaoTelefone.disabled = true;
    botaoTelefone.textContent = 'Aguarde...';

    try {
      await apiPost('/auth/otp/request', { phone: telefoneE164 });

      document.getElementById('telefone-display').textContent = inputTelefone.value;

      etapaAtual = 1;
      mostrarEtapa(etapaAtual);
      iniciarCooldownReenviar();
    } catch (err) {
      mostrarErro('erro-telefone', "" + err);

      // Restaura o botão apenas se o telefone ainda for válido
      const numeros = inputTelefone.value.replace(/\D/g, '');
      botaoTelefone.disabled = !(numeros.length === 10 || numeros.length === 11);
      botaoTelefone.textContent = textoOriginal;
    }
  });

  // ============================================================
  // ETAPA 2 — CÓDIGO SMS
  // ============================================================
  const inputsCodigo = document.querySelectorAll('.input-codigo');
  const botaoReenviar = document.querySelector('.botao-reenviar');
  let verificandoCodigo = false;
  let timerCooldown = null;

  function codigoCompleto() {
    return Array.from(inputsCodigo).every(i => i.value.trim().length === 1);
  }

  function getCodigo() {
    return Array.from(inputsCodigo).map(i => i.value.trim()).join('');
  }

  function limparInputsCodigo() {
    inputsCodigo.forEach(i => (i.value = ''));
    inputsCodigo[0].focus();
  }

  function bloquearInputsCodigo(bloquear) {
    inputsCodigo.forEach(i => (i.disabled = bloquear));
  }

  inputsCodigo.forEach((input, index) => {
    input.addEventListener('input', async () => {
      // Aceita apenas dígitos
      input.value = input.value.replace(/\D/g, '').slice(0, 1);

      if (input.value.length === 1 && inputsCodigo[index + 1]) {
        inputsCodigo[index + 1].focus();
      }

      if (!codigoCompleto() || verificandoCodigo) return;

      limparErro('erro-codigo');
      verificandoCodigo = true;
      bloquearInputsCodigo(true);

      // Pequeno delay para o usuário ver o último dígito preenchido
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const data = await apiPost('/auth/otp/verify', {
          phone: telefoneE164,
          code: getCodigo(),
        });

        tokenStorage.salvar(data);

        // Verifica se o usuário já tem cadastro completo.
        // get_or_create_profile cria com full_name="" para usuários novos.
        const perfil = await apiGet('/api/me');
        if (perfil.full_name && perfil.full_name.trim() !== '') {
          window.location.href = REDIRECT_APOS_LOGIN;
          return;
        }

        etapaAtual = 2;
        mostrarEtapa(etapaAtual);
      } catch (err) {
        mostrarErro('erro-codigo', "" + err);
        limparInputsCodigo();
        bloquearInputsCodigo(false);
        verificandoCodigo = false;
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && inputsCodigo[index - 1]) {
        inputsCodigo[index - 1].focus();
      }
    });

    // Impede colar mais de 1 caractere por campo
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const colado = (e.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/\D/g, '');

      // Distribui os dígitos colados a partir do campo atual
      [...colado].slice(0, inputsCodigo.length - index).forEach((digit, i) => {
        if (inputsCodigo[index + i]) inputsCodigo[index + i].value = digit;
      });

      // Foca o próximo campo vazio ou o último preenchido
      const proximoVazio = [...inputsCodigo].find(i => !i.value);
      if (proximoVazio) proximoVazio.focus();
      else inputsCodigo[inputsCodigo.length - 1].focus();

      // Dispara verificação se completou
      inputsCodigo[index].dispatchEvent(new Event('input'));
    });
  });

  // Cooldown de 60s alinhado com _OTP_COOLDOWN do backend
  function iniciarCooldownReenviar() {
    const COOLDOWN_S = 60;
    let restante = COOLDOWN_S;

    clearInterval(timerCooldown);
    botaoReenviar.disabled = true;
    botaoReenviar.textContent = `Reenviar código (${restante}s)`;

    timerCooldown = setInterval(() => {
      restante -= 1;
      botaoReenviar.textContent = `Reenviar código (${restante}s)`;

      if (restante <= 0) {
        clearInterval(timerCooldown);
        botaoReenviar.disabled = false;
        botaoReenviar.textContent = 'Reenviar código';
      }
    }, 1000);
  }

  botaoReenviar.addEventListener('click', async () => {
    limparErro('erro-codigo');

    const textoOriginal = botaoReenviar.textContent;
    botaoReenviar.disabled = true;
    botaoReenviar.textContent = 'Enviando...';

    try {
      await apiPost('/auth/otp/request', { phone: telefoneE164 });
      limparInputsCodigo();
      verificandoCodigo = false;
      iniciarCooldownReenviar();
    } catch (err) {
      mostrarErro('erro-codigo', "" + err);
      botaoReenviar.disabled = false;
      botaoReenviar.textContent = textoOriginal;
    }
  });

  // ============================================================
  // ETAPA 3 — NOME E BAIRRO
  // ============================================================
  const botaoFinal = document.querySelector('.etapa04-nome-bairro a');
  const inputNome = document.getElementById('name');
  const selectBairro = document.querySelector('.etapa04-nome-bairro select');
  let enviandoPerfil = false;

  botaoFinal.addEventListener('click', async (e) => {
    e.preventDefault();
    if (enviandoPerfil) return;

    limparErro('erro-perfil');

    const nome = inputNome.value.trim();
    const bairro = selectBairro.value;

    if (!nome) {
      mostrarErro('erro-perfil', 'Informe seu nome para continuar.');
      return;
    }

    enviandoPerfil = true;
    const textoOriginal = botaoFinal.textContent;
    botaoFinal.textContent = 'Aguarde...';
    botaoFinal.style.pointerEvents = 'none';

    try {
      await apiPatch('/api/me', { full_name: nome, neighborhood: bairro });
      window.location.href = REDIRECT_APOS_LOGIN;
    } catch (err) {
      mostrarErro('erro-perfil', "" + err);
      botaoFinal.textContent = textoOriginal;
      botaoFinal.style.pointerEvents = '';
      enviandoPerfil = false;
    }
  });

})();
