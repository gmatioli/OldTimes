document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // 1. REFERÊNCIAS DO DOM (ELEMENTOS)
  // =========================================
  const elements = {
    body: document.body,
    appWrapper: document.getElementById("app-wrapper"),

    // Menu e Acessibilidade
    btnAccess: document.getElementById("btn-accessibility"),
    menuAccess: document.getElementById("accessibility-menu"),
    checkContrast: document.getElementById("toggle-contrast"),
    zoomRadios: document.querySelectorAll('input[name="zoom"]'),
    btnTheme: document.getElementById("btn-theme"),
    imgTheme: document.getElementById("img-theme"),

    // Display e Inputs
    display: document.getElementById("display"),
    inputWrapper: document.getElementById("input-wrapper"),
    inputMin: document.getElementById("input-min"),
    inputSec: document.getElementById("input-sec"),
    progressRing: document.querySelector(".progress-ring"),

    // Botões de Controle
    btnPlayPause: document.getElementById("btn-play-pause"),
    btnReset: document.getElementById("btn-reset"),
    imgPlayPause: document.getElementById("img-play-pause"),

    // Botões de Modo
    btnModeChrono: document.getElementById("mode-chrono"),
    btnModeTimer: document.getElementById("mode-timer"),

    // FAQ
    btnFaq: document.getElementById("btn-faq"),
    faqView: document.getElementById("faq-view"),
    btnCloseFaq: document.getElementById("btn-close-faq"),
    mainView: document.getElementById("main-view"), // Referência ao container principal
  };

  // =========================================
  // 2. CONFIGURAÇÃO E ESTADO
  // =========================================
  const CONFIG = {
    baseWidth: 200,
    baseHeight: 250,
  };

  let state = {
    mode: "CHRONO", // 'CHRONO' ou 'TIMER'
    isRunning: false,
    isDarkMode: false,
    isHighContrast: false,
    timerInterval: null,
    totalSeconds: 0,
    initialTimerSeconds: 0, // Usado para resetar o timer ao valor original
  };

  // =========================================
  // 3. FUNÇÕES LÓGICAS (HELPERS)
  // =========================================

  // Formata segundos em MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Atualiza o texto do display
  const updateDisplay = () => {
    elements.display.textContent = formatTime(state.totalSeconds);
  };

  // Alterna visibilidade do Menu de Acessibilidade
  const toggleAccessMenu = (show) => {
    if (show) {
      elements.menuAccess.classList.remove("hidden");
      elements.menuAccess.setAttribute("aria-hidden", "false");
      // Tenta focar no primeiro item do menu
      if (elements.checkContrast) elements.checkContrast.focus();
    } else {
      elements.menuAccess.classList.add("hidden");
      elements.menuAccess.setAttribute("aria-hidden", "true");
      elements.btnAccess.focus();
    }
  };

  // Aplica o Zoom (escala visual + redimensionamento físico da janela)
  const applyZoom = (zoomValue) => {
    const scale = zoomValue / 100;

    // 1. Zoom visual (Aumenta o conteúdo interno)
    elements.appWrapper.style.transform = `scale(${scale})`;

    // 2. Redimensionamento FÍSICO da Janela (HTML e BODY)
    // Calcula o novo tamanho baseado na escala
    const newWidth = `${CONFIG.baseWidth * scale}px`;
    const newHeight = `${CONFIG.baseHeight * scale}px`;

    // Aplica no Body
    elements.body.style.width = newWidth;
    elements.body.style.height = newHeight;

    // CORREÇÃO CRÍTICA: Aplica no HTML também (obrigatório para extensões Chrome)
    document.documentElement.style.width = newWidth;
    document.documentElement.style.height = newHeight;
  };

  // Reseta o Timer/Cronômetro
  const resetTimer = () => {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    elements.imgPlayPause.src = "img/start.png";

    // Se for Cronômetro, zera. Se for Timer, volta para a tela de input.
    if (state.mode === "CHRONO") {
      state.totalSeconds = 0;
      updateDisplay();
    } else {
      elements.display.classList.add("hidden");
      elements.inputWrapper.classList.remove("hidden");
      state.totalSeconds = 0;
      // Limpa os inputs para nova digitação
      elements.inputMin.value = "";
      elements.inputSec.value = "";
    }

    // Reseta anel de progresso (se existir lógica visual futura)
    if (elements.progressRing) {
      elements.progressRing.style.strokeDashoffset = 0;
    }
  };

  // Alterna entre Modos (Cronômetro vs Temporizador)
  const switchMode = (newMode) => {
    // 1. Para tudo imediatamente
    clearInterval(state.timerInterval);
    state.isRunning = false;
    elements.imgPlayPause.src = "img/start.png";

    // 2. Define o novo modo
    state.mode = newMode;

    // 3. Zera as variáveis de tempo (RESET FORÇADO)
    state.totalSeconds = 0;
    state.initialTimerSeconds = 0;

    if (newMode === "CHRONO") {
      // Visual dos botões
      elements.btnModeChrono.classList.add("active-mode");
      elements.btnModeTimer.classList.remove("active-mode");

      // Mostra Display, Esconde Inputs
      elements.display.classList.remove("hidden");
      elements.inputWrapper.classList.add("hidden");

      // Reseta visualmente o display para 00:00
      updateDisplay();
    } else {
      // Visual dos botões
      elements.btnModeTimer.classList.add("active-mode");
      elements.btnModeChrono.classList.remove("active-mode");

      // Esconde Display, Mostra Inputs
      elements.display.classList.add("hidden");
      elements.inputWrapper.classList.remove("hidden");

      // Limpa os inputs visualmente
      elements.inputMin.value = "";
      elements.inputSec.value = "";

      // Foca no primeiro campo
      elements.inputMin.focus();
    }

    // Reseta o anel SVG se houver progresso anterior
    if (elements.progressRing) {
      elements.progressRing.style.strokeDashoffset = 0;
    }
  };

  // Lógica de Finalização do Timer
  const handleTimerFinish = () => {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    elements.imgPlayPause.src = "img/start.png";
    state.totalSeconds = 0;
    updateDisplay();

    setTimeout(() => {
      alert("O TEMPO ACABOU!");
      resetTimer(); // Volta para seleção de tempo
    }, 100);
  };

  // =========================================
  // 4. EVENTOS (LISTENERS)
  // =========================================

  // --- Controle do Menu ---
  elements.btnAccess.addEventListener("click", () => {
    const isHidden = elements.menuAccess.classList.contains("hidden");
    toggleAccessMenu(isHidden);
  });

  // Fechar menu com ESC
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !elements.menuAccess.classList.contains("hidden")
    ) {
      toggleAccessMenu(false);
    }
  });

  // --- Controles de Acessibilidade (LIGHT MODE AQUI) ---
  elements.btnTheme.addEventListener("click", () => {
    state.isDarkMode = !state.isDarkMode;
    elements.body.classList.toggle("dark-mode", state.isDarkMode);

    // Troca ícone se necessário (Sol/Lua)
    const iconPath = state.isDarkMode
      ? "img/light-mode.png"
      : "img/dark-mode.png";
    elements.imgTheme.src = iconPath;
  });

  elements.checkContrast.addEventListener("change", (e) => {
    state.isHighContrast = e.target.checked;
    if (state.isHighContrast) {
      elements.body.classList.add("high-contrast");
      elements.body.classList.remove("dark-mode"); // Prioridade ao alto contraste
    } else {
      elements.body.classList.remove("high-contrast");
      if (state.isDarkMode) elements.body.classList.add("dark-mode");
    }
  });

  elements.zoomRadios.forEach((radio) => {
    radio.addEventListener("change", (e) =>
      applyZoom(parseInt(e.target.value))
    );
  });

  // --- Controles de Navegação (Modos) ---
  elements.btnModeChrono.addEventListener("click", () => switchMode("CHRONO"));
  elements.btnModeTimer.addEventListener("click", () => switchMode("TIMER"));

  // --- Controles de Tempo (Play/Pause/Reset) ---
  elements.btnReset.addEventListener("click", resetTimer);

  elements.btnPlayPause.addEventListener("click", () => {
    if (state.isRunning) {
      // PAUSAR
      clearInterval(state.timerInterval);
      state.isRunning = false;
      elements.imgPlayPause.src = "img/start.png";
    } else {
      // INICIAR

      // Validação do modo Timer (precisa ter tempo definido)
      if (state.mode === "TIMER" && state.totalSeconds === 0) {
        const mins = parseInt(elements.inputMin.value) || 0;
        const secs = parseInt(elements.inputSec.value) || 0;
        const total = mins * 60 + secs;

        if (total <= 0) return; // Não inicia se for zero

        state.initialTimerSeconds = total;
        state.totalSeconds = total;

        // Prepara interface: Esconde input, mostra display
        elements.inputWrapper.classList.add("hidden");
        elements.display.classList.remove("hidden");
        updateDisplay();
      }

      state.isRunning = true;
      elements.imgPlayPause.src = "img/pause.png";

      state.timerInterval = setInterval(() => {
        if (state.mode === "CHRONO") {
          state.totalSeconds++;
          updateDisplay();
        } else {
          state.totalSeconds--;
          updateDisplay();

          if (state.totalSeconds <= 0) {
            handleTimerFinish();
          }
        }
      }, 1000);
    }
  });

  // --- Lógica do FAQ ---

  // Abrir FAQ
  elements.btnFaq.addEventListener("click", () => {
    // Esconde a tela principal (Relógio)
    elements.mainView.classList.add("hidden");
    elements.mainView.setAttribute("aria-hidden", "true");

    // Mostra o FAQ
    elements.faqView.classList.remove("hidden");
    elements.faqView.setAttribute("aria-hidden", "false");

    // Foca no botão de fechar para acessibilidade
    elements.btnCloseFaq.focus();
  });

  // Fechar FAQ (Voltar)
  elements.btnCloseFaq.addEventListener("click", () => {
    // Esconde o FAQ
    elements.faqView.classList.add("hidden");
    elements.faqView.setAttribute("aria-hidden", "true");

    // Volta a tela principal
    elements.mainView.classList.remove("hidden");
    elements.mainView.setAttribute("aria-hidden", "false");

    // Retorna foco ao botão que abriu
    elements.btnFaq.focus();
  });
});
