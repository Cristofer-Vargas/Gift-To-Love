# Technical Log & AI Memory

Este documento serve como um cérebro técnico para mantermos o registro de todas as bibliotecas, mecânicas, lógicas CSS/JS e decisões arquiteturais implementadas na aplicação.

## 1. Arquitetura do Projeto
- **HTML5:** Estrutura semântica (`index.html`) modularizada. Marcadores de espaço (`<div id="header-placeholder"></div>`) utilizados para injeção dinâmica de componentes.
- **CSS Modular (Pasta `src/css/`):**
  - `reset.css`: Limpeza de estilos do navegador.
  - `typography.css`: Variáveis de cor (Dark Mode, Vermelhos neon), configurações de fontes (Great Vibes e Inter), e utilitários.
  - `layout.css`: Posicionamento estrutural responsivo e mecânica de backgrounds orgânicos em CSS.
  - `components.css`: Estilização de peças isoladas (botões, modais, header fixo *glassmorphism* e footer de créditos).
  - `images.css`: Central de controle de backgrounds fixos (imagens de galerias) para fácil manutenção.
- **JavaScript Modular (Pasta `src/js/`):**
  - `main.js`: Lógica base (Cronômetro preciso de anos até segundos injetado no Header/Hero), inicialização do Fancybox, injeção assíncrona (`fetch`) do `header.html` e `footer.html`, e cálculo autônomo do ano de *Copyright* no rodapé.
  - `giftmotion.js`: Animação inicial de UI (Caixa de presente interativa, suspensão do Lenis Smooth Scroll e explosão de corações via GSAP).
  - `animations.js`: Centro nervoso modularizado de GSAP. Todas as instâncias de ScrollTrigger operam isoladas por classe (`forEach`).

## 2. Bibliotecas Utilizadas (CDN)
1. **GSAP (GreenSock):** Motor de física principal para animações, timelines complexas e cursores brilhantes (`quickTo`).
2. **GSAP (GreenSock) e GSAP MatchMedia:** Motor principal de animações. `gsap.matchMedia()` é intensamente usado para destruir e reconstruir animações complexas baseadas na largura da janela (`768px`) on-the-fly, sem recarregamento.
3. **GSAP ScrollTrigger:** Usado para ancorar animações. `ScrollTrigger.refresh()` é **vital** após qualquer manipulação de `overflow: hidden` do corpo (como no fechamento da caixa de presente), para permitir o recálculo dos trilhos de scroll escondidos.
4. **Three.js + OBJLoader:** Usado nativamente para renderizar malhas (`.obj`) em `src/js/three-scene.js`. Utiliza `THREE.Box3` para Auto-Centering e Auto-Scaling universal de qualquer modelo externo importado, independentemente da escala original do arquivo.
5. **@fancyapps/ui (Fancybox v5):** Lightbox moderno.
6. **Lenis (Studio Freight):** Smooth scroll matemático. A propriedade nativa `window.lenis.velocity` foi hackeada pela engine 3D para gerar física vetorial.

## 3. Lógicas Críticas e Física Avançada (G-Force)
- **Física G-Force (Inércia Dinâmica):** Em `three-scene.js`, o `requestAnimationFrame` não apenas renderiza, ele calcula vetores de força baseado no atrito do scroll (`lenis.velocity`). Esse vetor é jogado num algoritmo de *Spring Physics* que aplica "Squash & Stretch" (esticamento) e inclina os corações agressivamente contra o "vento" do scroll.
- **Isolamento de Escopo GSAP no 3D:** Para impedir que o `ScrollTrigger` e o Yoyo conflitassem na mesma malha (`mesh`), a arquitetura adota um **Wrapper triplo**: `THREE.Group()` controla posição (GSAP Scroll), contendo um `gForceGroup` que controla a inclinação física (RenderLoop), que finalmente contém o `Mesh` que flutua (GSAP Yoyo).
- **Tooltips Responsivas via Atributo:** O uso engenhoso do CSS `content: attr(data-tooltip)` permite geração de mini-legendas sem poluir o DOM. Dispositivos `hover: none` (celulares) ativam `opacity: 1` por padrão na UI.
- **Grids e Leques (CSS Flex/Grid):** A arquitetura do "Leque" (Fan) suporta enfileiramento via `.decks-wrapper`, calculando via CSS Media Queries a transição entre 1 coluna em mobile e 2 colunas no desktop (`grid-template-columns: repeat(2, 1fr)`).
- **Bug da Altura Virtual (Pin Spacing + Imagens Assíncronas):** Resolvido usando `setTimeout(() => ScrollTrigger.refresh(), 1000)` para atualizar matemática após o fluxo de renderização das `<img>`.
