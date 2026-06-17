async function carregarBotoesVoz() {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let mounts = document.getElementsByClassName('c-componenteBotaoVoz');
  console.log(mounts);
  while (mounts.length == 0) {
    mounts = document.getElementsByClassName('c-componenteBotaoVoz');
    await new Promise(resolve => setTimeout(resolve, 300));
  }


  for (let mount of mounts) {
    let isListening = false;
    const recordBtn = mount.querySelector('.record-btn');
    const targetId = mount.parentElement.getAttribute('data-prop-target');
    const target = document.getElementById(targetId);
    // Um objeto de SpeechRecognition por botão. Isso facilita reconhecer
    // qual foi o botão apertado.
    const recognition = new SpeechRecognition();
    if (!target) {
      console.error('especificação incorreta:', target);
    }
    if (!SpeechRecognition) {
      console.warn('Web Speech API (SpeechRecognition) is not supported in this browser.');
      recordBtn.disabled = true;
      recordBtn.classList.add('unsupported');
    }
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recordBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      console.log('click');
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error('Erro ao iniciar reconhecimento de voz:', err);
        }
      }
    });
    recognition.onstart = () => {
      isListening = true;
      recordBtn.classList.add('listening');
      console.log('Iniciou reconhecimento de voz.');
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      isListening = false;
      recordBtn.classList.remove('listening');
      console.log('Finalizou reconhecimento de voz.');
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log(`Texto reconhecido (confiança: ${confidence.toFixed(2)}):`, speechToText);
      target.value = speechToText;
    };

    recognition.onerror = (event) => {
      console.error('Ocorreu um erro no reconhecimento de voz:', event.error);
      if (statusText) {
        if (event.error === 'not-allowed') {
          alert('Permissão de microfone negada.');
        } else if (event.error === 'no-speech') {
          alert('Nenhuma fala detectada. Tente novamente.');
        } else {
          alert(`Erro: ${event.error}`);
        }
      }
      isListening = false;
      recordBtn.classList.remove('listening');
    };
  }
}

carregarBotoesVoz();
