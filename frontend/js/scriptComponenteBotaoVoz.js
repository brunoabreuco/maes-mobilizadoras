// scriptComponenteBotaoVoz.js
// Gerencia botões de reconhecimento de voz (Speech-to-Text)

// Armazena instâncias de reconhecimento para evitar conflitos
const reconhecimentosAtivos = new Map();

/**
 * Inicializa todos os botões de voz encontrados na página.
 * Deve ser chamada sempre que novos elementos com data-spec="componenteBotaoVoz" forem adicionados.
 * @param {number} tentativas - Número de tentativas para aguardar a DOM ficar pronta (opcional)
 */
function carregarBotoesVoz(tentativas = 5) {
    // Aguarda um pequeno delay para garantir que os elementos foram renderizados
    if (tentativas <= 0) {
        console.warn('carregarBotoesVoz: número máximo de tentativas excedido');
        return;
    }

    const botoes = document.querySelectorAll('[data-spec="componenteBotaoVoz"]');
    if (botoes.length === 0 && tentativas > 1) {
        // Se ainda não há botões, tenta novamente após 300ms
        setTimeout(() => carregarBotoesVoz(tentativas - 1), 300);
        return;
    }

    botoes.forEach(container => {
        // Evita duplicar o botão caso o script seja chamado várias vezes
        if (container.querySelector('.btn-voz')) {
            return;
        }

        const targetId = container.getAttribute('data-prop-target');
        if (!targetId) {
            console.warn('Botão de voz sem target definido:', container);
            return;
        }

        const input = document.getElementById(targetId);
        if (!input) {
            console.warn(`Campo alvo #${targetId} não encontrado para o botão de voz.`);
            return;
        }

        // Cria o botão de microfone
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn-voz';
        botao.setAttribute('aria-label', 'Ativar reconhecimento de voz');
        botao.title = 'Clique para falar e preencher o campo';

        // Ícone do microfone (SVG inline para não depender de arquivo externo)
        botao.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
        `;

        // Estado do reconhecimento
        let reconhecimento = null;
        let ouvindo = false;

        // Função para iniciar/parar a escuta
        function toggleEscuta() {
            if (ouvindo) {
                pararEscuta();
            } else {
                iniciarEscuta();
            }
        }

        function iniciarEscuta() {
            // Verifica se o navegador suporta a API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                mostrar_msg_erro('Seu navegador não suporta reconhecimento de voz.', '');
                return;
            }

            // Cria uma nova instância
            reconhecimento = new SpeechRecognition();
            reconhecimento.lang = 'pt-BR';
            reconhecimento.continuous = false;
            reconhecimento.interimResults = true;
            reconhecimento.maxAlternatives = 1;

            // Evento: quando obtém um resultado
            reconhecimento.onresult = (event) => {
                const resultado = event.results[event.results.length - 1];
                if (resultado.isFinal) {
                    const texto = resultado[0].transcript.trim();
                    if (texto) {
                        // Preenche o campo alvo
                        input.value = texto;
                        // Dispara evento de input para que outros scripts saibam da alteração
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        // Fecha o reconhecimento após preencher
                        pararEscuta();
                        // Feedback visual: pisca o campo
                        input.style.backgroundColor = '#e6f7e6';
                        setTimeout(() => { input.style.backgroundColor = ''; }, 1000);
                    }
                } else {
                    // Resultado parcial: exibe no campo com fundo diferente (opcional)
                    const textoParcial = resultado[0].transcript;
                    input.value = textoParcial;
                }
            };

            // Evento: fim do reconhecimento (pode ser por erro ou conclusão)
            reconhecimento.onend = () => {
                if (ouvindo) {
                    // Se ainda está ouvindo, pode ter sido interrompido por erro
                    // Vamos garantir que o estado seja resetado
                    pararEscuta();
                }
            };

            // Evento: erro
            reconhecimento.onerror = (event) => {
                console.warn('Erro no reconhecimento de voz:', event.error);
                if (event.error === 'not-allowed') {
                    mostrar_msg_erro('Permissão de microfone negada. Por favor, permita o acesso.', '');
                } else if (event.error === 'no-speech') {
                    // Silêncio, apenas reseta
                } else {
                    // Outros erros
                    mostrar_msg_erro(`Erro no reconhecimento: ${event.error}`, '');
                }
                pararEscuta();
            };

            // Inicia o reconhecimento
            try {
                reconhecimento.start();
                ouvindo = true;
                botao.classList.add('ouvindo');
                botao.title = 'Parar escuta';
                // Altera ícone para um indicador de gravação (opcional: pode usar animação)
                botao.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor"/>
                        <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                `;
            } catch (err) {
                console.error('Erro ao iniciar reconhecimento:', err);
                mostrar_msg_erro('Não foi possível iniciar o microfone.', '');
                ouvindo = false;
            }
        }

        function pararEscuta() {
            if (reconhecimento) {
                try {
                    reconhecimento.stop();
                } catch (e) {
                    // Ignora erros ao parar
                }
                reconhecimento = null;
            }
            ouvindo = false;
            botao.classList.remove('ouvindo');
            botao.title = 'Clique para falar e preencher o campo';
            // Restaura o ícone do microfone
            botao.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
            `;
        }

        // Adiciona evento de clique ao botão
        botao.addEventListener('click', toggleEscuta);

        // Adiciona o botão ao container
        container.appendChild(botao);

        // Se o campo for textarea, ajusta o posicionamento
        if (input.tagName === 'TEXTAREA') {
            container.style.alignItems = 'flex-start';
        }
    });
}

// Inicializa automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Chama com um pequeno delay para garantir que tudo foi carregado
    setTimeout(() => carregarBotoesVoz(), 500);
});

// Também expõe a função globalmente para ser chamada por outros scripts
window.carregarBotoesVoz = carregarBotoesVoz;