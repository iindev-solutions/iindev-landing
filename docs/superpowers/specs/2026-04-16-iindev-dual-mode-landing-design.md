# Design Spec: iindev Landing — Dual Mode

## 1. Overview

iindev landing page with two display modes:
- **Normal mode** — minimalist premium landing with sections
- **Terminal mode** — interactive terminal (current functionality)

Toggle in navbar switches between modes. Single HTML file, CSS switching via body class.

## 2. Services (actual)

| Key | Name | Subtitle | Description |
|---|---|---|---|
| ayan | **iind.ayan** | Бардыбыт · Такси | Пассажир предлагает цену, водитель принимает |
| uus | **iind.uus** | Мастера | Найти мастера на любую задачу — ремонт, монтаж, установка |
| aʃal | **iind.aʃal** | Авиа-доставка | Отправка посылок по всему миру через авиа |
| tal | **iind.tal** | Онлайн-бронирование | Запись на услуги — салоны, клиники, мастерские |

## 3. Visual System

### Colors (same for both modes)
- Background: `#0A0C0E`
- Terminal surface: `#10131699`
- Primary text: `#EFF3F5`
- Accent: `#A0F0E2`
- Muted: `#7D8D95`
- Borders: `rgba(160,240,226,0.08)`

### Fonts
- **Primary:** Cascadia Code (Google Fonts CDN, with ligatures)
- Landing headings: weight 600-700
- Terminal: weight 350
- Body text: weight 400

### Background
- Sakha ornamental patterns (diamond pattern) — 2% opacity
- Scanlines — 0.1% opacity
- Both modes

## 4. Navbar

Fixed, backdrop-blur, shared for both modes:
- Left: `iindev.` (Cascadia Code, `iind` in #A0F0E2)
- Right: pill toggle with two icons:
  - Eye icon → normal mode
  - `>_` icon → terminal mode
- Toggle saves choice in `localStorage`
- Active mode highlighted

## 5. Normal Mode — Structure

### 5.1 Hero
- Heading: `iindev.` (~80px, Cascadia Code w700)
- Subheading: «Студия разработки» (Cascadia Code, #7D8D95)
- Descriptor: «Такси. Мастера. Доставка. Бронирование.»
- Yakutsk weather — small badge, decorative element
- Animation: heading slide-up + fade-in

### 5.2 Services
- 4 cards in grid: 2x2 desktop, 1 column mobile
- Card:
  - Dark background `#10131699`, thin border `rgba(160,240,226,0.08)`
  - Heading (iind.ayan) in #A0F0E2
  - Subtitle (Бардыбыт · Такси) in #7D8D95
  - Description in #EFF3F5
  - Hover: glow-border + translateY(-2px)
- Animation: stagger fade-in on scroll (GSAP ScrollTrigger)

### 5.3 About
- Text: «Строим сервисы, которые работают. Простота, надёжность, скорость.»
- Two columns:
  - Left: principles (Простота, Надёжность, Скорость)
  - Right: stack (Telegram Mini Apps, Laravel, Nuxt)

### 5.4 Contacts
- Terminal-style (simplified):
  - Telegram: @iindev
  - Email: iindev@tuta.io
  - Click = clipboard + toast notification

### 5.5 Footer
- «--- session ended ---» at 10px, opacity 0.5

## 6. Terminal Mode

Current functionality preserved:
- Boot sequence with auto-type `about`, `services`, `contact`
- Commands: `help`, `about`, `services`, `open <service>`, `contact`, `metrics`, `weather`, `clear`
- Services updated to actual (ayan, uus, aʃal, tal)
- Weather via Open-Meteo API
- Modal windows for services
- Command history (up/down arrows)

## 7. Mode Switching

- Body classes: `.mode-normal` / `.mode-terminal`
- Default: `.mode-normal` (normal landing)
- If `localStorage` has saved preference — use it
- Switch animation: GSAP timeline
  1. Fade-out current content (0.3s)
  2. Switch body class
  3. Fade-in new content (0.5s)

## 8. Animations

- Mode switch: GSAP fade transition
- Hero: heading slide-up + fade-in
- Services: stagger fade-in on scroll (ScrollTrigger)
- Cards hover: glow-border + translateY(-2px)
- Weather: async loading with dot animation
- Terminal: typing effect, cursor blink (as is)

## 9. Responsive

- Desktop (>768px): 2x2 service grid, horizontal navbar
- Tablet (≤768px): 2 columns, reduced fonts
- Mobile (≤480px): 1 column, compact navbar, reduced hero

## 10. Technical

- Pure HTML/CSS/JS
- GSAP 3.12+ (CDN)
- GSAP ScrollTrigger (CDN)
- Cascadia Code (Google Fonts CDN)
- No bundler, no framework
- Deploy via gh-pages branch
