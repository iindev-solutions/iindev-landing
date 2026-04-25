document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const inputDisplay = document.getElementById('inputDisplay');
    const normalContainer = document.getElementById('normalContainer');
    const terminalContainer = document.getElementById('terminalContainer');
    const modeToggle = document.getElementById('modeToggle');
    const toggleNormal = document.getElementById('toggleNormal');
    const toggleTerminal = document.getElementById('toggleTerminal');
    const weatherBadge = document.getElementById('weatherBadge');
    const copyToast = document.getElementById('copyToast');
    const detailModal = document.getElementById('detailModal');
    const modalLabel = document.getElementById('modalLabel');
    const modalTitle = document.getElementById('modalTitle');
    const modalLead = document.getElementById('modalLead');
    const modalList = document.getElementById('modalList');
    const modalCloseButton = document.getElementById('modalCloseButton');

    const capabilityInfo = {
        automation: {
            name: 'automation',
            label: 'AI automation',
            title: 'AI automation & agents',
            description: 'Строим AI-first процессы, в которых команда тратит меньше времени на рутину, а бизнес получает понятный рабочий контур.',
            bullets: [
                'Аудит ручных процессов, проектирование сценариев, ассистенты, агенты и AI-воркфлоу.',
                'Интеграции с CRM, Telegram, документами, базой знаний, API и внутренними системами.',
                'Фокус не на “эффекте вау”, а на скорости цикла, чистых данных и реальной пользе.'
            ],
            terminal: 'AI automation / agents / CRM flows'
        },
        telegram: {
            name: 'telegram',
            label: 'Telegram',
            title: 'Telegram bots & Mini Apps',
            description: 'Делаем Telegram как полноценную продуктовую поверхность: от быстрых ботов до Mini Apps с логикой, кабинетами и оплатами.',
            bullets: [
                'Боты продаж, поддержки, внутренних процессов, заявок и онбординга.',
                'Mini Apps с нормальным UX, а не просто обёрткой вокруг страницы.',
                'Подключение к оплатам, CRM, каталогам, аналитике, складу и кастомным API.'
            ],
            terminal: 'bots / mini apps / support / commerce'
        },
        bitrix: {
            name: 'bitrix',
            label: 'Bitrix',
            title: 'Bitrix & corporate sites',
            description: 'Собираем сайты и Bitrix-проекты, где бизнесу нужна управляемая CMS, быстрые обновления, адекватная структура и интеграции.',
            bullets: [
                'Лендинги, корпсайты, каталоги, промостраницы и контентные разделы.',
                'Интеграция с формами, CRM, аналитикой, заявками, email и внешними сервисами.',
                'Редизайн без шаблонного мусора: сильная подача, понятная структура и нормальный продакшен.'
            ],
            terminal: 'landing pages / corporate web / CMS / admin'
        },
        platforms: {
            name: 'platforms',
            label: 'Platforms',
            title: 'Web platforms & internal tools',
            description: 'Делаем веб-сервисы, кабинеты, CRM-связки и внутренние панели, которые живут дольше одного красивого релиза.',
            bullets: [
                'Личные кабинеты, дашборды, B2B/B2C платформы, порталы и внутренние интерфейсы.',
                'Интеграции между сайтом, Bitrix, Telegram, AI-инструментами и существующей инфраструктурой.',
                'Запуск, развитие и поддержка с прицелом на масштабирование, а не на одноразовый MVP.'
            ],
            terminal: 'dashboards / portals / custom systems / integrations'
        }
    };

    const capabilityAliases = {
        ai: 'automation',
        agents: 'automation',
        bot: 'telegram',
        bots: 'telegram',
        tma: 'telegram',
        miniapp: 'telegram',
        miniapps: 'telegram',
        website: 'bitrix',
        websites: 'bitrix',
        web: 'platforms',
        platform: 'platforms',
        dashboards: 'platforms'
    };

    let commandHistory = [];
    let historyIndex = -1;
    let isAnimating = false;
    let bootScrollLock = true;
    let scrollRaf = false;
    let cachedWeather = null;
    let normalAnimationsInitialized = false;
    let bootSequenceId = 0;
    let lastFocusedElement = null;
    let currentMode = localStorage.getItem('iindev-mode') || 'normal';

    function escapeHtml(value) {
        return String(value).replace(/[<>&"']/g, (char) => ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function setModeClass(mode) {
        body.classList.remove('mode-normal', 'mode-terminal');
        body.classList.add(`mode-${mode}`);
        toggleNormal.setAttribute('aria-pressed', String(mode === 'normal'));
        toggleTerminal.setAttribute('aria-pressed', String(mode === 'terminal'));
        modeToggle.setAttribute('data-active-mode', mode);
    }

    setModeClass(currentMode);

    function resolveCapabilityKey(input) {
        if (!input) return null;
        const normalized = input.toLowerCase();
        return capabilityInfo[normalized] ? normalized : capabilityAliases[normalized] || null;
    }

    function showToast(text) {
        copyToast.textContent = text;
        copyToast.classList.add('show');
        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(() => {
            copyToast.classList.remove('show');
        }, 2000);
    }

    async function copyText(text) {
        if (!navigator.clipboard?.writeText) return false;
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    }

    async function fetchWeather() {
        if (cachedWeather) return cachedWeather;
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=62.0355&longitude=129.6755&current_weather=true');
            const data = await response.json();
            cachedWeather = `${Math.round(data.current_weather.temperature)}°C`;
            return cachedWeather;
        } catch {
            cachedWeather = '—°C';
            return cachedWeather;
        }
    }

    fetchWeather().then((temp) => {
        weatherBadge.textContent = `Yakutsk ${temp}`;
    });

    document.querySelectorAll('.contact-value[data-copy]').forEach((element) => {
        element.addEventListener('click', async () => {
            const copied = await copyText(element.dataset.copy);
            if (copied) {
                showToast(`copied: ${element.dataset.copy}`);
            }
        });
    });

    document.querySelectorAll('.capability-card[data-capability]').forEach((card) => {
        card.addEventListener('click', () => {
            openCapabilityModal(card.dataset.capability);
        });
    });

    function openCapabilityModal(key) {
        const capabilityKey = resolveCapabilityKey(key);
        if (!capabilityKey) return;

        const info = capabilityInfo[capabilityKey];
        lastFocusedElement = document.activeElement;
        modalLabel.textContent = `./${info.name}`;
        modalTitle.textContent = info.title;
        modalLead.textContent = info.description;
        modalList.innerHTML = info.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
        detailModal.classList.add('visible');
        modalCloseButton.focus();
    }

    function closeCapabilityModal() {
        if (!detailModal.classList.contains('visible')) return;
        detailModal.classList.remove('visible');
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    modalCloseButton.addEventListener('click', closeCapabilityModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeCapabilityModal();
        }
    });

    detailModal.addEventListener('click', (event) => {
        if (event.target === detailModal) {
            closeCapabilityModal();
        }
    });

    function resetTerminal() {
        terminalOutput.innerHTML = '';
        terminalInput.value = '';
        inputDisplay.textContent = '';
        terminalInput.disabled = false;
        commandHistory = [];
        historyIndex = -1;
        isAnimating = false;
        bootScrollLock = true;
    }

    function switchMode(mode) {
        if (mode === currentMode) return;

        bootSequenceId += 1;
        const outgoing = mode === 'normal' ? terminalContainer : normalContainer;
        const incoming = mode === 'normal' ? normalContainer : terminalContainer;

        const completeSwitch = () => {
            currentMode = mode;
            setModeClass(mode);
            localStorage.setItem('iindev-mode', mode);
            window.scrollTo(0, 0);

            if (window.gsap) {
                gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power3.out' });
            } else {
                incoming.style.opacity = '1';
            }

            if (mode === 'normal') {
                initNormalAnimations();
                if (window.ScrollTrigger) {
                    window.setTimeout(() => ScrollTrigger.refresh(), 60);
                }
            } else {
                resetTerminal();
                bootSequence();
            }
        };

        if (window.gsap) {
            gsap.to(outgoing, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.out',
                onComplete: completeSwitch
            });
        } else {
            outgoing.style.opacity = '0';
            completeSwitch();
        }
    }

    toggleNormal.addEventListener('click', () => switchMode('normal'));
    toggleTerminal.addEventListener('click', () => switchMode('terminal'));

    function initNormalAnimations() {
        if (!window.gsap) return;
        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (normalAnimationsInitialized) {
            return;
        }

        normalAnimationsInitialized = true;

        const heroTimeline = gsap.timeline();
        heroTimeline
            .from('.eyebrow', {
                y: 18,
                opacity: 0,
                duration: 0.65,
                ease: 'power3.out'
            })
            .from('.hero-title', {
                y: 48,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.45')
            .from('.hero-lead', {
                y: 28,
                opacity: 0,
                duration: 0.75,
                ease: 'power3.out'
            }, '-=0.55')
            .from('.hero-actions', {
                y: 24,
                opacity: 0,
                duration: 0.65,
                ease: 'power3.out'
            }, '-=0.45')
            .from('.hero-tags li', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out'
            }, '-=0.35')
            .from('.hero-panel', {
                y: 42,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out'
            }, '-=0.85');

        if (!window.ScrollTrigger) return;

        gsap.utils.toArray('.section-heading').forEach((section) => {
            gsap.from(section, {
                y: 26,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 84%',
                    once: true
                }
            });
        });

        gsap.from('.capability-card', {
            y: 34,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.capability-grid',
                start: 'top 82%',
                once: true
            }
        });

        gsap.from('.workflow-manifesto', {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.workflow-layout',
                start: 'top 82%',
                once: true
            }
        });

        gsap.from('.workflow-step', {
            y: 24,
            opacity: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.workflow-steps',
                start: 'top 82%',
                once: true
            }
        });

        gsap.from('.cta-panel', {
            y: 26,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.cta-panel',
                start: 'top 84%',
                once: true
            }
        });
    }

    terminalInput.addEventListener('input', () => {
        inputDisplay.textContent = terminalInput.value;
    });

    function addLine(content, className = '') {
        const line = document.createElement('div');
        line.className = className ? `terminal-line ${className}` : 'terminal-line';
        line.innerHTML = content;
        terminalOutput.appendChild(line);
        scrollToBottom();
        return line;
    }

    function scrollToBottom() {
        if (currentMode !== 'terminal' || bootScrollLock) return;
        if (scrollRaf) return;

        scrollRaf = true;
        requestAnimationFrame(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            scrollRaf = false;
        });
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function isActiveBoot(sequenceId) {
        return sequenceId === bootSequenceId && currentMode === 'terminal';
    }

    async function typeCommand(command, speed = 32, sequenceId = bootSequenceId) {
        if (!isActiveBoot(sequenceId)) return;

        isAnimating = true;
        terminalInput.disabled = true;

        for (const char of command) {
            if (!isActiveBoot(sequenceId)) {
                terminalInput.disabled = false;
                isAnimating = false;
                return;
            }
            terminalInput.value += char;
            inputDisplay.textContent = terminalInput.value;
            await sleep(speed);
        }

        await sleep(180);
        if (!isActiveBoot(sequenceId)) {
            terminalInput.disabled = false;
            isAnimating = false;
            return;
        }

        await executeCommand(command, true);
        terminalInput.value = '';
        inputDisplay.textContent = '';
        terminalInput.disabled = false;
        isAnimating = false;
    }

    function renderCapabilitiesOutput() {
        addLine('<span class="output-muted">iindev:~/capabilities$ ls -la</span>');
        addLine('');

        Object.entries(capabilityInfo).forEach(([key, info]) => {
            const line = addLine(`<span class="service-item" data-capability="${key}"><span class="arrow">→</span> <span class="service-name">${key}/</span> <span class="output-muted">${escapeHtml(info.terminal)}</span></span>`);
            line.querySelector('.service-item')?.addEventListener('click', () => {
                openCapabilityModal(key);
            });
        });

        addLine('');
        addLine('<span class="output-muted">Type \"open &lt;name&gt;\" for details</span>');
    }

    const commands = {
        help: () => {
            addLine('<span class="output">Available commands:</span>');
            addLine('');
            addLine('<span class="help-line"><span class="help-cmd">help</span><span class="help-desc">show this help</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">about</span><span class="help-desc">about iindev</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">capabilities</span><span class="help-desc">list expertise areas</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">open &lt;name&gt;</span><span class="help-desc">open capability details</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">stack</span><span class="help-desc">show build stack</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">process</span><span class="help-desc">show delivery model</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">contact</span><span class="help-desc">show contact info</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">metrics</span><span class="help-desc">show studio profile</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">weather</span><span class="help-desc">current Yakutsk weather</span></span>');
            addLine('<span class="help-line"><span class="help-cmd">clear</span><span class="help-desc">clear terminal</span></span>');
        },
        about: () => {
            addLine('<span class="brand-inline"><span style="color: #8fdccf;">iind</span>ev.</span>');
            addLine('<span class="output-muted">AI automation studio</span>');
            addLine('');
            addLine('<span class="output">Делаем AI-автоматизацию, Telegram боты, TMA, сайты на Bitrix и веб-платформы.</span>');
            addLine('<span class="output">Заходим в задачу как продуктовая команда: диагностика, UX, код, интеграции, запуск.</span>');
            addLine('<span class="output">Нам приносят хаос — мы возвращаем понятную систему.</span>');
        },
        capabilities: () => {
            renderCapabilitiesOutput();
        },
        expertise: () => {
            renderCapabilitiesOutput();
        },
        services: () => {
            addLine('<span class="output-muted">legacy alias → capabilities</span>');
            renderCapabilitiesOutput();
        },
        open: (args) => {
            const capabilityKey = resolveCapabilityKey(args[0]);
            if (capabilityKey) {
                openCapabilityModal(capabilityKey);
                addLine(`<span class="output-success">→ opened: ${escapeHtml(capabilityKey)}</span>`);
                return;
            }

            addLine(`<span class="output-error">capability not found: ${escapeHtml(args[0] || '(none)')}</span>`);
            addLine(`<span class="output-muted">Available: ${Object.keys(capabilityInfo).join(', ')}</span>`);
        },
        stack: () => {
            addLine('<span class="output-muted">iindev:~/stack$ cat profile.txt</span>');
            addLine('');
            addLine('<span class="output">frontend   :: HTML / CSS / JS / React / Next / Nuxt</span>');
            addLine('<span class="output">backend    :: Node / Laravel / Bitrix / custom API</span>');
            addLine('<span class="output">surfaces   :: web / corporate sites / Telegram / Mini Apps</span>');
            addLine('<span class="output">automation :: AI providers / CRM / docs / bots / internal flows</span>');
        },
        process: () => {
            addLine('<span class="output-muted">iindev:~/process$ ./delivery-model</span>');
            addLine('');
            addLine('<span class="output">01 → diagnose business flow and bottlenecks</span>');
            addLine('<span class="output">02 → design architecture, interface, and integrations</span>');
            addLine('<span class="output">03 → build product, automation, and admin tools</span>');
            addLine('<span class="output">04 → launch, support, and scale without chaos</span>');
        },
        contact: () => {
            addLine('<span class="output-muted">iindev:~/contact$ cat info.txt</span>');
            addLine('');
            const telegramLine = addLine('<span class="contact-item" data-copy="@iindev"><span class="contact-label-terminal">telegram:</span> <span class="contact-value-terminal">@iindev</span></span>');
            const emailLine = addLine('<span class="contact-item" data-copy="iindev@tuta.io"><span class="contact-label-terminal">email:</span> <span class="contact-value-terminal">iindev@tuta.io</span></span>');
            addLine('');
            addLine('<span class="output-muted">Telegram responds fastest.</span>');

            [telegramLine, emailLine].forEach((line) => {
                const item = line.querySelector('.contact-item');
                if (!item) return;

                item.addEventListener('click', async () => {
                    const text = item.dataset.copy;
                    const copied = await copyText(text);
                    if (copied) {
                        addLine(`<span class="output-success">→ copied: ${escapeHtml(text)}</span>`);
                    } else {
                        addLine('<span class="output-error">→ copy failed</span>');
                    }
                });
            });
        },
        metrics: () => {
            addLine('<span class="output-muted">Studio profile</span>');
            addLine('');
            addLine('<span class="metric-line"><span class="metric-label">mode</span><span class="metric-bar-text">build → automate → ship</span></span>');
            addLine('<span class="metric-line"><span class="metric-label">focus</span><span class="metric-bar-text">AI / Bitrix / Telegram / web systems</span></span>');
            addLine('<span class="metric-line"><span class="metric-label">style</span><span class="metric-bar-text">high taste / clean code / no template noise</span></span>');
            addLine('<span class="metric-line"><span class="metric-label">result</span><span class="metric-bar-text">working product instead of slideware</span></span>');
        },
        weather: async () => {
            addLine('<span class="output-muted">Fetching Yakutsk weather...</span>');
            const temp = await fetchWeather();
            addLine(`<span class="output">→ YAKUTSK ${escapeHtml(temp)}</span>`);
        },
        clear: () => {
            terminalOutput.innerHTML = '';
        }
    };

    async function executeCommand(input, isAuto = false) {
        const raw = input.trim();
        const parts = raw.split(/\s+/);
        const cmd = (parts[0] || '').toLowerCase();
        const args = parts.slice(1);

        if (!isAuto && raw) {
            addLine(`<span class="prompt">operator@iindev:~$</span> <span class="command">${escapeHtml(raw)}</span>`);
            commandHistory.push(raw);
            historyIndex = commandHistory.length;
        }

        if (!cmd) return;

        const handler = commands[cmd];
        if (handler) {
            await handler(args);
        } else {
            addLine(`<span class="output-error">command not found: ${escapeHtml(cmd)}</span>`);
            addLine('<span class="output-muted">Type \"help\" for available commands</span>');
        }

        scrollToBottom();
    }

    terminalInput.addEventListener('keydown', async (event) => {
        if (isAnimating) {
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            const value = terminalInput.value.trim();
            terminalInput.value = '';
            inputDisplay.textContent = '';
            if (value) {
                await executeCommand(value);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                terminalInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = terminalInput.value;
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex += 1;
                terminalInput.value = commandHistory[historyIndex];
                inputDisplay.textContent = terminalInput.value;
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
                inputDisplay.textContent = '';
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (
            currentMode === 'terminal' &&
            !event.target.closest('.detail-modal') &&
            !event.target.closest('.nav-toggle') &&
            !event.target.closest('.toggle-option') &&
            !isAnimating
        ) {
            terminalInput.focus();
        }
    });

    async function bootSequence() {
        const sequenceId = ++bootSequenceId;
        bootScrollLock = true;
        window.scrollTo(0, 0);
        await sleep(220);
        if (!isActiveBoot(sequenceId)) return;

        addLine('<span class="output-muted">iindev:~$ ./boot --studio</span>');
        await sleep(280);
        if (!isActiveBoot(sequenceId)) return;

        const weatherLine = addLine('<span class="output">→ YAKUTSK <span class="temp-loader"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span></span></span>');
        fetchWeather().then((temp) => {
            if (isActiveBoot(sequenceId)) {
                weatherLine.innerHTML = `<span class="output">→ YAKUTSK ${escapeHtml(temp)}</span>`;
            }
        });

        await sleep(620);
        if (!isActiveBoot(sequenceId)) return;

        addLine('<span class="output-success">→ system ready</span>');
        addLine('');
        await sleep(240);
        if (!isActiveBoot(sequenceId)) return;

        await typeCommand('about', 28, sequenceId);
        if (!isActiveBoot(sequenceId)) return;

        await sleep(360);
        addLine('');
        await typeCommand('capabilities', 24, sequenceId);
        if (!isActiveBoot(sequenceId)) return;

        await sleep(360);
        addLine('');
        await typeCommand('contact', 24, sequenceId);
        if (!isActiveBoot(sequenceId)) return;

        await sleep(220);
        addLine('');
        addLine('<span class="output-muted">Type \"help\" for available commands</span>');
        addLine('');

        bootScrollLock = false;
        terminalInput.focus();
        scrollToBottom();
    }

    if (currentMode === 'normal') {
        initNormalAnimations();
    } else {
        resetTerminal();
        bootSequence();
    }
});
