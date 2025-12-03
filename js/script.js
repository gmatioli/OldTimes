document.addEventListener('DOMContentLoaded', () => {
    // Referências do DOM
    const body = document.body;
    const btnTheme = document.getElementById('btn-theme');
    const btnAccess = document.getElementById('btn-accessibility');
    const menuAccess = document.getElementById('accessibility-menu');
    const checkContrast = document.getElementById('toggle-contrast');
    const zoomRadios = document.querySelectorAll('input[name="zoom"]');
    
    // Controles do Timer
    const display = document.getElementById('display');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnReset = document.getElementById('btn-reset');
    const imgPlayPause = document.getElementById('img-play-pause');
    
    // Estado
    let isRunning = false;
    let isDarkMode = false;
    let isHighContrast = false;
    let timerInterval;
    let seconds = 0;

    // --- Acessibilidade: Navegação por Teclado e Menus ---

    // Toggle Menu de Acessibilidade
    btnAccess.addEventListener('click', () => {
        const isHidden = menuAccess.classList.contains('hidden');
        if (isHidden) {
            menuAccess.classList.remove('hidden');
            menuAccess.setAttribute('aria-hidden', 'false');
            // Foca no primeiro item do menu para facilitar navegação
            checkContrast.focus();
        } else {
            closeAccessMenu();
        }
    });

    function closeAccessMenu() {
        menuAccess.classList.add('hidden');
        menuAccess.setAttribute('aria-hidden', 'true');
        btnAccess.focus(); // Retorna o foco para o botão que abriu
    }

    // Fechar menu se clicar fora ou apertar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuAccess.classList.contains('hidden')) {
            closeAccessMenu();
        }
    });

    // --- Lógica Visual e Temas ---

    // Toggle Dark Mode
    btnTheme.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        body.classList.toggle('dark-mode', isDarkMode);
        
        // Troca o ícone (opcional, se tiver ícone de sol/lua separados)
        const img = btnTheme.querySelector('img');
        img.src = isDarkMode ? 'img/light-mode.png' : 'img/dark-mode.png';
    });

    // Toggle Alto Contraste (O que não estava funcionando no seu anterior)
    checkContrast.addEventListener('change', (e) => {
        isHighContrast = e.target.checked;
        if (isHighContrast) {
            body.classList.add('high-contrast');
            // Força desligar dark mode visualmente se entrar em alto contraste
            body.classList.remove('dark-mode'); 
        } else {
            body.classList.remove('high-contrast');
            // Restaura dark mode se estava ativo
            if (isDarkMode) body.classList.add('dark-mode');
        }
    });

    // ... (resto do código anterior)

    // Referência ao novo wrapper
    const appWrapper = document.getElementById('app-wrapper');

    // Lógica de Zoom Corrigida
    zoomRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const zoomVal = parseInt(e.target.value); // ex: 100, 110, 120
            const scale = zoomVal / 100; // ex: 1, 1.1, 1.2

            // 1. Aplica o zoom visual no conteúdo
            appWrapper.style.transform = `scale(${scale})`;

            // 2. Redimensiona a janela da extensão fisicamente para caber o zoom
            // Largura base (200) * escala
            document.body.style.width = `${200 * scale}px`;
            // Altura base (250) * escala
            document.body.style.height = `${250 * scale}px`;
        });
    });

    // ... (resto do código)

    // --- Lógica do Cronômetro (Simples) ---

    function updateDisplay() {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        display.textContent = `${mins}:${secs}`;
    }

    btnPlayPause.addEventListener('click', () => {
        if (isRunning) {
            // Pausar
            clearInterval(timerInterval);
            imgPlayPause.src = 'img/start.png'; // Volta para play
            // Se tiver imagem separada de pause: imgPlayPause.src = 'play.png'
        } else {
            // Iniciar
            timerInterval = setInterval(() => {
                seconds++;
                updateDisplay();
                // Animação do anel de progresso pode ser adicionada aqui
            }, 1000);
            imgPlayPause.src = 'img/pause.png'; 
        }
        isRunning = !isRunning;
    });

    btnReset.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        seconds = 0;
        updateDisplay();
        imgPlayPause.src = 'img/start.png';
        
        // Reseta o anel SVG
        document.querySelector('.progress-ring').style.strokeDashoffset = 0;
    });
});