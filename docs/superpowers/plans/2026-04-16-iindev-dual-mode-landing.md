# iindev Dual-Mode Landing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild iindev landing with dual-mode (normal + terminal), updated services, Cascadia Code font, and smooth mode switching.

**Architecture:** Single HTML file with two content layers. Body class `.mode-normal` / `.mode-terminal` controls visibility. Navbar toggle switches modes with GSAP transition. Terminal mode preserves existing functionality with updated service data. Normal mode adds Hero/Services/About/Contacts sections.

**Tech Stack:** Pure HTML/CSS/JS, GSAP 3.12+ (CDN), GSAP ScrollTrigger (CDN), Cascadia Code (Google Fonts CDN)

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | HTML structure with both mode layers, navbar, meta tags |
| `styles.css` | All CSS: variables, navbar, normal mode, terminal mode, responsive |
| `main.js` | All JS: mode toggle, terminal logic, GSAP animations, weather, clipboard |

---

## Chunk 1: HTML Structure + Navbar + Normal Mode Layout

### Task 1: Rebuild index.html

**Files:**
- Modify: `index.html` (full rewrite)

- [ ] **Step 1: Update head section**

Replace font import with Cascadia Code + add ScrollTrigger CDN:

```html
<link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:wght@300;350;400;500;600;700&display=swap" rel="stylesheet">
```

Add GSAP ScrollTrigger:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

- [ ] **Step 2: Add navbar with mode toggle**

Add navbar right after `<body>` opening, before background-pattern:

```html
<nav class="navbar" id="navbar">
    <div class="nav-brand"><span class="nav-brand-accent">iind</span>ev.</div>
    <div class="nav-toggle" id="modeToggle" title="Switch mode">
        <span class="toggle-option" data-mode="normal" id="toggleNormal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </span>
        <span class="toggle-slider" id="toggleSlider"></span>
        <span class="toggle-option" data-mode="terminal" id="toggleTerminal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        </span>
    </div>
</nav>
```

- [ ] **Step 3: Add normal mode container**

Add after navbar, before terminal-container:

```html
<div class="normal-container" id="normalContainer">
    <section class="hero" id="hero">
        <h1 class="hero-title"><span class="hero-accent">iind</span>ev.</h1>
        <p class="hero-subtitle">Студия разработки</p>
        <p class="hero-desc">Такси. Мастера. Доставка. Бронирование.</p>
        <div class="weather-badge" id="weatherBadge">
            <span class="weather-loader"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span></span>
        </div>
    </section>

    <section class="services-section" id="servicesSection">
        <h2 class="section-title">// services</h2>
        <div class="services-grid">
            <div class="service-card" data-service="ayan">
                <h3 class="service-card-name">iind.ayan</h3>
                <p class="service-card-subtitle">Бардыбыт · Такси</p>
                <p class="service-card-desc">Пассажир предлагает цену, водитель принимает</p>
            </div>
            <div class="service-card" data-service="uus">
                <h3 class="service-card-name">iind.uus</h3>
                <p class="service-card-subtitle">Мастера</p>
                <p class="service-card-desc">Найти мастера на любую задачу — ремонт, монтаж, установка</p>
            </div>
            <div class="service-card" data-service="aʃal">
                <h3 class="service-card-name">iind.aʃal</h3>
                <p class="service-card-subtitle">Авиа-доставка</p>
                <p class="service-card-desc">Отправка посылок по всему миру через авиа</p>
            </div>
            <div class="service-card" data-service="tal">
                <h3 class="service-card-name">iind.tal</h3>
                <p class="service-card-subtitle">Онлайн-бронирование</p>
                <p class="service-card-desc">Запись на услуги — салоны, клиники, мастерские</p>
            </div>
        </div>
    </section>

    <section class="about-section" id="aboutSection">
        <h2 class="section-title">// about</h2>
        <p class="about-text">Строим сервисы, которые работают. Простота, надёжность, скорость.</p>
        <div class="about-columns">
            <div class="about-col">
                <h3 class="about-col-title">Принципы</h3>
                <ul class="about-list">
                    <li>Простота</li>
                    <li>Надёжность</li>
                    <li>Скорость</li>
                </ul>
            </div>
            <div class="about-col">
                <h3 class="about-col-title">Стек</h3>
                <ul class="about-list">
                    <li>Telegram Mini Apps</li>
                    <li>Laravel</li>
                    <li>Nuxt</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="contacts-section" id="contactsSection">
        <h2 class="section-title">// connect</h2>
        <div class="contacts-terminal">
            <div class="contact-line">
                <span class="contact-label">telegram:</span>
                <span class="contact-value" data-copy="@iindev">@iindev</span>
            </div>
            <div class="contact-line">
                <span class="contact-label">email:</span>
                <span class="contact-value" data-copy="iindev@tuta.io">iindev@tuta.io</span>
            </div>
        </div>
    </section>

    <footer class="site-footer">--- session ended ---</footer>
</div>
```

- [ ] **Step 4: Keep terminal container as-is but add class for hiding**

Change `<main class="terminal-container">` to `<main class="terminal-container" id="terminalContainer">` — already has id, no change needed. But wrap it in a div for mode switching:

```html
<div class="terminal-container" id="terminalContainer">
    <!-- existing terminal content stays -->
</div>
```

- [ ] **Step 5: Add toast notification element**

Before closing `</body>`:

```html
<div class="copy-toast" id="copyToast">copied to clipboard</div>
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add dual-mode HTML structure with navbar and normal mode sections"
```

---

## Chunk 2: CSS — Variables, Navbar, Normal Mode, Responsive

### Task 2: Rewrite styles.css

**Files:**
- Modify: `styles.css` (full rewrite)

- [ ] **Step 1: Update CSS variables and body font**

Replace `:root` variables — keep existing, add new ones:

```css
:root {
    --bg-absolute: #0a0c0e;
    --bg-terminal: #0f1113;
    --bg-surface: #10131699;
    --text-primary: #eff3f5;
    --accent-cyan: #a0f0e2;
    --text-muted: #7d8d95;
    --border-teal: #2a3a42;
    --border-accent: rgba(160, 240, 226, 0.08);
    --bar-track: #1e2e36;
    --pattern-color: #1f2e36;
    --error-red: #f07272;
    --success-green: #90ee90;
    --nav-height: 60px;
}
```

Change body font-family to Cascadia Code:

```css
body {
    font-family: "Cascadia Code", "JetBrains Mono", "SF Mono", monospace;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.6;
    letter-spacing: 0.02em;
    color: var(--text-primary);
    background-color: var(--bg-absolute);
    min-height: 100vh;
    overflow-x: hidden;
    min-width: 320px;
    padding-top: var(--nav-height);
}
```

- [ ] **Step 2: Add mode switching CSS**

```css
.mode-normal .normal-container { display: block; }
.mode-normal .terminal-container { display: none; }

.mode-terminal .normal-container { display: none; }
.mode-terminal .terminal-container { display: block; }

.mode-normal .toggle-option[data-mode="normal"] svg,
.mode-terminal .toggle-option[data-mode="terminal"] svg {
    color: var(--accent-cyan);
}

.mode-normal .toggle-slider { transform: translateX(0); }
.mode-terminal .toggle-slider { transform: translateX(100%); }
```

- [ ] **Step 3: Add navbar styles**

```css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    background: rgba(10, 12, 14, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 0.5px solid var(--border-accent);
    z-index: 50;
}

.nav-brand {
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: var(--text-primary);
}

.nav-brand-accent {
    color: var(--accent-cyan);
}

.nav-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(160, 240, 226, 0.05);
    border: 0.5px solid var(--border-accent);
    border-radius: 20px;
    padding: 4px 8px;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
}

.nav-toggle:hover {
    background: rgba(160, 240, 226, 0.1);
}

.toggle-option {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    transition: color 0.2s;
    z-index: 1;
}

.toggle-slider {
    position: absolute;
    width: 50%;
    height: calc(100% - 6px);
    background: rgba(160, 240, 226, 0.1);
    border-radius: 16px;
    left: 4px;
    transition: transform 0.3s ease;
}
```

- [ ] **Step 4: Add normal mode Hero styles**

```css
.normal-container {
    position: relative;
    z-index: 2;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px;
}

.hero {
    padding: 80px 0 60px;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hero-title {
    font-weight: 700;
    font-size: 80px;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 24px;
}

.hero-accent {
    color: var(--accent-cyan);
}

.hero-subtitle {
    color: var(--text-muted);
    font-weight: 350;
    font-size: 18px;
    margin-bottom: 12px;
}

.hero-desc {
    color: var(--text-primary);
    font-weight: 400;
    font-size: 16px;
    margin-bottom: 24px;
}

.weather-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border-accent);
    border-radius: 6px;
    font-size: 12px;
    color: var(--text-muted);
    backdrop-filter: blur(12px);
}
```

- [ ] **Step 5: Add service cards styles**

```css
.section-title {
    color: var(--text-muted);
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 32px;
    margin-top: 80px;
}

.services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.service-card {
    background: var(--bg-surface);
    border: 0.5px solid var(--border-accent);
    border-radius: 8px;
    padding: 24px;
    backdrop-filter: blur(12px);
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
    opacity: 0.2;
}

.service-card:hover {
    transform: translateY(-2px);
    border-color: rgba(160, 240, 226, 0.2);
    box-shadow: 0 4px 20px rgba(160, 240, 226, 0.05);
}

.service-card-name {
    color: var(--accent-cyan);
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 4px;
}

.service-card-subtitle {
    color: var(--text-muted);
    font-size: 12px;
    margin-bottom: 12px;
}

.service-card-desc {
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 350;
    line-height: 1.6;
}
```

- [ ] **Step 6: Add about + contacts + footer styles**

```css
.about-text {
    color: var(--text-muted);
    font-weight: 350;
    font-size: 18px;
    line-height: 1.8;
    max-width: 640px;
    margin-bottom: 32px;
}

.about-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    max-width: 640px;
}

.about-col-title {
    color: var(--accent-cyan);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.about-list {
    list-style: none;
    padding: 0;
}

.about-list li {
    color: var(--text-primary);
    font-weight: 350;
    font-size: 14px;
    padding: 4px 0;
}

.contacts-terminal {
    background: var(--bg-surface);
    border: 0.5px solid var(--border-accent);
    border-radius: 8px;
    padding: 24px;
    backdrop-filter: blur(12px);
    max-width: 400px;
}

.contact-line {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
}

.contact-label {
    color: var(--text-muted);
    font-size: 13px;
    min-width: 80px;
}

.contact-value {
    color: var(--accent-cyan);
    cursor: pointer;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.contact-value:hover {
    border-bottom-color: var(--accent-cyan);
}

.copy-toast {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--accent-cyan);
    color: var(--bg-absolute);
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    opacity: 0;
    pointer-events: none;
    z-index: 10000;
    transition: opacity 0.3s, transform 0.3s;
}

.copy-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.site-footer {
    text-align: center;
    padding: 60px 0 40px;
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 2px;
    opacity: 0.5;
}
```

- [ ] **Step 7: Update terminal mode brand-inline font**

```css
.brand-inline {
    font-family: "Cascadia Code", monospace;
    font-weight: 700;
    font-size: 48px;
    letter-spacing: -0.02em;
    display: block;
    margin: 8px 0;
}
```

- [ ] **Step 8: Add responsive styles for normal mode**

```css
@media (max-width: 768px) {
    body {
        font-size: 13px;
    }

    .hero-title {
        font-size: 48px;
    }

    .services-grid {
        grid-template-columns: 1fr;
    }

    .about-columns {
        grid-template-columns: 1fr;
    }

    .normal-container {
        padding: 0 16px;
    }
}

@media (max-width: 480px) {
    body {
        font-size: 12px;
    }

    .hero-title {
        font-size: 36px;
    }

    .navbar {
        padding: 0 16px;
    }
}
```

- [ ] **Step 9: Commit**

```bash
git add styles.css
git commit -m "feat: add dual-mode CSS with navbar, normal mode layout, and responsive styles"
```

---

## Chunk 3: JavaScript — Mode Toggle, Updated Services, GSAP Animations

### Task 3: Rewrite main.js

**Files:**
- Modify: `main.js` (full rewrite)

- [ ] **Step 1: Add mode toggle logic at top of DOMContentLoaded**

```js
const body = document.body;
const modeToggle = document.getElementById('modeToggle');
const toggleNormal = document.getElementById('toggleNormal');
const toggleTerminal = document.getElementById('toggleTerminal');
const normalContainer = document.getElementById('normalContainer');
const terminalContainer = document.getElementById('terminalContainer');

let currentMode = localStorage.getItem('iindev-mode') || 'normal';
body.classList.add(`mode-${currentMode}`);

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
            gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            if (mode === 'normal') {
                initNormalAnimations();
            } else {
                terminalInput.focus();
            }
        }
    });
}

toggleNormal.addEventListener('click', () => switchMode('normal'));
toggleTerminal.addEventListener('click', () => switchMode('terminal'));
```

- [ ] **Step 2: Update serviceInfo with actual services**

Replace the entire `serviceInfo` object:

```js
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
```

- [ ] **Step 3: Update terminal about command**

Replace the `about` command handler:

```js
'about': () => {
    addLine(`<span class="brand-inline"><span style="color: #A0F0E2;">iind</span>ev.</span>`);
    addLine(`<span class="output-muted">Development Studio</span>`);
    addLine(``);
    addLine(`<span class="output">Строим сервисы, которые работают.</span>`);
    addLine(`<span class="output">Простота, надёжность, скорость.</span>`);
    addLine(``);
    addLine(`<span class="output-muted">Services:</span>`);
    addLine(`<span class="output">  • iind.ayan — Такси</span>`);
    addLine(`<span class="output">  • iind.uus — Мастера</span>`);
    addLine(`<span class="output">  • iind.aʃal — Авиа-доставка</span>`);
    addLine(`<span class="output">  • iind.tal — Онлайн-бронирование</span>`);
},
```

- [ ] **Step 4: Update terminal services command**

Replace `services` command handler:

```js
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
```

- [ ] **Step 5: Update modal to show subtitle**

Replace `openServiceModal`:

```js
function openServiceModal(service) {
    const info = serviceInfo[service];
    if (info) {
        modalServiceName.textContent = `./${info.name}`;
        modalBody.textContent = info.description;
        serviceModal.classList.add('visible');
    }
}
```

- [ ] **Step 6: Add normal mode GSAP animations**

```js
function initNormalAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-title', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out'
    });

    gsap.from('.hero-desc', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out'
    });

    gsap.from('.service-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '#servicesSection',
            start: 'top 80%'
        }
    });

    gsap.from('.about-text', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: '#aboutSection',
            start: 'top 80%'
        }
    });

    gsap.from('.about-col', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.about-columns',
            start: 'top 80%'
        }
    });

    gsap.from('.contacts-terminal', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: '#contactsSection',
            start: 'top 80%'
        }
    });
}
```

- [ ] **Step 7: Add weather badge + clipboard for normal mode**

```js
// Weather badge for normal mode
const weatherBadge = document.getElementById('weatherBadge');
fetchWeather().then(temp => {
    weatherBadge.innerHTML = `→ YAKUTSK ${temp}`;
});

// Clipboard for normal mode contacts
document.querySelectorAll('.contact-value[data-copy]').forEach(el => {
    el.addEventListener('click', async () => {
        const text = el.dataset.copy;
        try {
            await navigator.clipboard.writeText(text);
            const toast = document.getElementById('copyToast');
            toast.textContent = `copied: ${text}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        } catch {
            // fallback
        }
    });
});
```

- [ ] **Step 8: Init normal mode on first load (if default)**

At the end of DOMContentLoaded, after boot sequence logic:

```js
if (currentMode === 'normal') {
    initNormalAnimations();
}
```

- [ ] **Step 9: Update click handler to respect mode**

Change the global click handler:

```js
document.addEventListener('click', (e) => {
    if (currentMode === 'terminal' && !e.target.closest('.service-modal') && !isAnimating) {
        terminalInput.focus();
    }
});
```

- [ ] **Step 10: Commit**

```bash
git add main.js
git commit -m "feat: add mode toggle, updated services, GSAP animations for normal mode"
```

---

## Chunk 4: Polish + Verify

### Task 4: Final polish and testing

**Files:**
- May modify: `index.html`, `styles.css`, `main.js` for minor fixes

- [ ] **Step 1: Open index.html in browser and verify both modes**

Check:
- Normal mode shows Hero / Services / About / Contacts
- Terminal mode shows boot sequence + interactive terminal
- Toggle in navbar switches with animation
- `localStorage` remembers mode on refresh
- Service names updated (ayan, uus, aʃal, tal)
- Weather loads in both modes
- Clipboard works in both modes
- Responsive on mobile

- [ ] **Step 2: Fix any visual issues found during testing**

Common things to check:
- Font loads correctly (Cascadia Code)
- Card hover effects work
- ScrollTrigger fires at correct position
- Terminal boot sequence still works after mode switch
- No layout shift on mode toggle

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: polish dual-mode landing visual details"
```
