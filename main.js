document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const inputDisplay = document.getElementById('inputDisplay');
    const serviceModal = document.getElementById('serviceModal');
    const modalServiceName = document.getElementById('modalServiceName');
    const modalBody = document.getElementById('modalBody');
    const normalContainer = document.getElementById('normalContainer');
    const terminalContainer = document.getElementById('terminalContainer');
    const modeToggle = document.getElementById('modeToggle');
    const toggleNormal = document.getElementById('toggleNormal');
    const toggleTerminal = document.getElementById('toggleTerminal');
    const weatherBadge = document.getElementById('weatherBadge');
    const copyToast = document.getElementById('copyToast');

    let commandHistory = [];
    let historyIndex = -1;
    let isAnimating = false;
    let currentMode = localStorage.getItem('iindev-mode') || 'normal';

    body.className = `mode-${currentMode}`;

    // ─── MODE TOGGLE ───

    function switchMode(mode) {
        if (mode === currentMode) return;

        const outgoing = mode === 'normal' ? terminalContainer : normalContainer;
        const incoming = mode === 'normal' ? normalContainer : terminalContainer;

        gsap.to(outgoing, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                currentMode = mode;
                body.className = `mode-${mode}`;
                localStorage.setItem('iindev-mode', mode);
                window.scrollTo({ top: 0, behavior: 'instant' });
                gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.5 });
                if (mode === 'normal') {
                    initNormalAnimations();
                } else {
                    terminalOutput.innerHTML = '';
                    commandHistory = [];
                    historyIndex = -1;
                    bootSequence();
                }
            }
        });
    }

    toggleNormal.addEventListener('click', () => switchMode('normal'));
    toggleTerminal.addEventListener('click', () => switchMode('terminal'));

    // ─── SERVICES DATA ───

    const serviceInfo = {
        'ayan': {
            name: 'ayan',
            subtitle: 'Бардыбыт · Такси',
            description: 'Такси-сервис где пассажир предлагает цену, а водитель принимает. Без карт, без онлайн-оплаты — просто и быстро.'
        },
        'uus': {
            name: 'uus',
            subtitle: 'Мастера',
            description: 'Поиск мастеров на любую задачу — ремонт, монтаж, установка. Опишите задачу, мастера откликнутся.'
        },
        'aʃal': {
            name: 'aʃal',
            subtitle: 'Авиа-доставка',
            description: 'Отправка посылок по всему миру через авиа. Найдите попутчика для вашей посылки.'
        },
        'tal': {
            name: 'tal',
            subtitle: 'Онлайн-бронирование',
            description: 'Запись на услуги — салоны, клиники, мастерские. Бронируйте онлайн без звонков.'
        }
    };

    // ─── WEATHER ───

    let cachedWeather = null;

    async function fetchWeather() {
        if (cachedWeather) return cachedWeather;
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=62.0355&longitude=129.6755&current_weather=true');
            const data = await response.json();
            cachedWeather = `${Math.round(data.current_weather.temperature)}°C`;
            return cachedWeather;
        } catch {
            cachedWeather = '—71°C';
            return cachedWeather;
        }
    }

    // Weather badge for normal mode
    fetchWeather().then(temp => {
        weatherBadge.textContent = `→ Yakutsk ${temp}`;
    });

    // ─── CLIPBOARD (NORMAL MODE) ───

    document.querySelectorAll('.contact-value[data-copy]').forEach(el => {
        el.addEventListener('click', async () => {
            const text = el.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
                copyToast.textContent = `copied: ${text}`;
                copyToast.classList.add('show');
                setTimeout(() => copyToast.classList.remove('show'), 2000);
            } catch {}
        });
    });

    // ─── ANIMATIONS (NORMAL MODE) ───

    let normalAnimationsInitialized = false;

    function initNormalAnimations() {
        if (normalAnimationsInitialized) return;
        normalAnimationsInitialized = true;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('.service-card, .about-text, .about-col, .contacts-terminal').forEach((el, i) => {
            if (i < 4) el.classList.add(`fade-in-delay-${i + 1}`);
            observer.observe(el);
        });
    }

    if (currentMode === 'normal') {
        initNormalAnimations();
    }

    // ─── TERMINAL MODE ───

    terminalInput.addEventListener('input', () => {
        inputDisplay.textContent = terminalInput.value;
    });

    function addLine(content, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = content;
        terminalOutput.appendChild(line);
        scrollToBottom();
        return line;
    }

    let bootScrollLock = true;
    let scrollRaf = false;

    function scrollToBottom() {
        if (bootScrollLock) return;
        if (!scrollRaf) {
            scrollRaf = true;
            requestAnimationFrame(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                scrollRaf = false;
            });
        }
    }

    async function typeCommand(command, speed = 50) {
        isAnimating = true;
        terminalInput.disabled = true;

        for (let i = 0; i < command.length; i++) {
            terminalInput.value += command[i];
            inputDisplay.textContent = terminalInput.value;
            await new Promise(r => setTimeout(r, speed));
        }

        await new Promise(r => setTimeout(r, 300));
        await executeCommand(command, true);

        terminalInput.value = '';
        inputDisplay.textContent = '';
        terminalInput.disabled = false;
        isAnimating = false;
        terminalInput.focus();
    }

    async function executeCommand(input, isAuto = false) {
        const parts = input.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (!isAuto) {
            const escaped = input.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
            addLine(`<span class="prompt">user@iindev:~$</span> <span class="command">${escaped}</span>`);
            commandHistory.push(input);
            historyIndex = commandHistory.length;
        }

        if (cmd === '') return;

        const commands = {
            'help': () => {
                addLine(`<span class="output">Available commands:</span>`);
                addLine(``);
                addLine(`<span class="help-line"><span class="help-cmd">help</span><span class="help-desc">show this help</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">about</span><span class="help-desc">about iindev studio</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">services</span><span class="help-desc">list all services</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">open &lt;service&gt;</span><span class="help-desc">open service details</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">contact</span><span class="help-desc">show contact info</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">metrics</span><span class="help-desc">show performance metrics</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">weather</span><span class="help-desc">current Yakutsk weather</span></span>`);
                addLine(`<span class="help-line"><span class="help-cmd">clear</span><span class="help-desc">clear terminal</span></span>`);
            },
            'about': () => {
                addLine(`<span class="brand-inline"><span style="color: #A0F0E2;">iind</span>ev.</span>`);
                addLine(`<span class="output-muted">Modern solutions. Simply.</span>`);
                addLine(``);
                addLine(`<span class="output">Делаем сложное простым.</span>`);
                addLine(`<span class="output">Сайты, сервисы, платформы — от дизайна до запуска.</span>`);
                addLine(``);
                addLine(`<span class="output-muted">Services:</span>`);
                addLine(`<span class="output">  • iind.ayan — Такси</span>`);
                addLine(`<span class="output">  • iind.uus — Мастера</span>`);
                addLine(`<span class="output">  • iind.aʃal — Авиа-доставка</span>`);
                addLine(`<span class="output">  • iind.tal — Онлайн-бронирование</span>`);
            },
            'services': () => {
                addLine(`<span class="output-muted">iindev:~/services$ ls -la</span>`);
                addLine(``);
                Object.entries(serviceInfo).forEach(([key, info]) => {
                    const line = addLine(`<span class="service-item" data-service="${key}"><span class="arrow">→</span> <span class="service-name">${key}/</span> <span class="output-muted">${info.subtitle}</span></span>`);
                    line.querySelector('.service-item').addEventListener('click', () => {
                        openServiceModal(key);
                    });
                });
                addLine(``);
                addLine(`<span class="output-muted">Type 'open &lt;service&gt;' for details</span>`);
            },
            'open': (args) => {
                const service = args[0];
                if (service && serviceInfo[service]) {
                    openServiceModal(service);
                    addLine(`<span class="output-success">→ opened: ${service}</span>`);
                } else {
                    addLine(`<span class="output-error">service not found: ${service || '(none)'}</span>`);
                    addLine(`<span class="output-muted">Available: ${Object.keys(serviceInfo).join(', ')}</span>`);
                }
            },
            'contact': () => {
                addLine(`<span class="output-muted">iindev:~/contact$ cat info.txt</span>`);
                addLine(``);
                const tgLine = addLine(`<span class="contact-item" data-copy="@iindev"><span class="contact-label-terminal">telegram:</span> <span class="contact-value-terminal">@iindev</span></span>`);
                const emailLine = addLine(`<span class="contact-item" data-copy="iindev@tuta.io"><span class="contact-label-terminal">email:</span> <span class="contact-value-terminal">iindev@tuta.io</span></span>`);

                [tgLine, emailLine].forEach(line => {
                    const item = line.querySelector('.contact-item');
                    item.addEventListener('click', async () => {
                        const text = item.dataset.copy;
                        try {
                            await navigator.clipboard.writeText(text);
                            addLine(`<span class="output-success">→ copied: ${text}</span>`);
                        } catch {
                            addLine(`<span class="output-error">→ copy failed</span>`);
                        }
                    });
                });
            },
            'metrics': () => {
                addLine(`<span class="output-muted">System Performance Metrics</span>`);
                addLine(``);
                addLine(`<span class="metric-line"><span class="metric-label">QUALITY:</span> <span class="metric-bar-text">[████████████████████] 100%</span></span>`);
                addLine(`<span class="metric-line"><span class="metric-label">SPEED:</span>   <span class="metric-bar-text">[████████████████████] 100%</span></span>`);
                addLine(`<span class="metric-line"><span class="metric-label">UPTIME:</span>  <span class="metric-bar-text">[████████████████████] 99.9%</span></span>`);
                addLine(``);
                addLine(`<span class="output-muted">iindev.core v2.6 — stable kernel</span>`);
            },
            'weather': async () => {
                addLine(`<span class="output-muted">Fetching Yakutsk weather...</span>`);
                const temp = await fetchWeather();
                addLine(`<span class="output">→ YAKUTSK ${temp}</span>`);
            },
            'clear': () => {
                terminalOutput.innerHTML = '';
            }
        };

        if (commands[cmd]) {
            await commands[cmd](args);
        } else {
            addLine(`<span class="output-error">command not found: ${cmd}</span>`);
            addLine(`<span class="output-muted">Type 'help' for available commands</span>`);
        }

        scrollToBottom();
    }

    function openServiceModal(service) {
        const info = serviceInfo[service];
        if (info) {
            modalServiceName.textContent = `./${info.name}`;
            modalBody.textContent = info.description;
            serviceModal.classList.add('visible');
        }
    }

    // Terminal input handler
    terminalInput.addEventListener('keydown', async (e) => {
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            const input = terminalInput.value.trim();
            terminalInput.value = '';
            inputDisplay.textContent = '';
            if (input) {
                await executeCommand(input);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = terminalInput.value;
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = terminalInput.value;
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
                inputDisplay.textContent = '';
            }
        }
    });

    // Modal close handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && serviceModal.classList.contains('visible')) {
            serviceModal.classList.remove('visible');
        }
    });

    serviceModal.addEventListener('click', (e) => {
        if (e.target === serviceModal) {
            serviceModal.classList.remove('visible');
        }
    });

    // Focus input on click (terminal mode only)
    document.addEventListener('click', (e) => {
        if (currentMode === 'terminal' && !e.target.closest('.service-modal') && !isAnimating) {
            terminalInput.focus();
        }
    });

    // Boot sequence (only if starting in terminal mode)
    async function bootSequence() {
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 300));

        addLine(`<span class="output-muted">iindev:~$ ./boot --cold-start</span>`);
        await new Promise(r => setTimeout(r, 400));

        const weatherLine = addLine(`<span class="output">→ YAKUTSK <span class="temp-loader"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span></span></span>`);

        fetchWeather().then(temp => {
            weatherLine.innerHTML = `<span class="output">→ YAKUTSK ${temp}</span>`;
        });

        await new Promise(r => setTimeout(r, 800));
        addLine(`<span class="output-success">→ system ready</span>`);
        addLine(``);

        await new Promise(r => setTimeout(r, 400));
        await typeCommand('about', 40);

        await new Promise(r => setTimeout(r, 600));
        addLine(``);
        await typeCommand('services', 40);

        await new Promise(r => setTimeout(r, 600));
        addLine(``);
        await typeCommand('contact', 40);

        await new Promise(r => setTimeout(r, 600));
        addLine(``);
        addLine(`<span class="output-muted">Type 'help' for available commands</span>`);
        addLine(``);

        bootScrollLock = false;
        terminalInput.focus();
    }

    if (currentMode === 'terminal') {
        bootSequence();
    }
});
