# Project Concept & Narrative Context

Este documento centraliza as regras de negócio, a filosofia visual e o storytelling por trás da construção da aplicação "Gift To Love". Ele serve como guia para manter a consistência estética e de tom de voz.

## 1. O Objetivo Principal
Criar uma "Carta de Amor Digital" / Linha do Tempo interativa, onde Cristofer presenteia Érica. Não é apenas uma página de fotos, é uma experiência narrativa contínua e escalável.

## 2. Direção de Arte e Filosofia Visual
- **Tema Central:** Romântico, moderno, premium.
- **A Estética (Dark Mode Absoluto):** A cor de fundo é o preto puro (`#050202`). Cores vivas como Vermelho Paixão e gradientes Rubis/Neons existem apenas como luzes emissivas (text-shadows, box-shadows, overlays). A ideia é transmitir um ambiente noturno de cinema ou exposição artística.
- **Micro-interações e "Glassmorphism":** Elementos de Interface do Usuário (como o contador de dias e o header flutuante) utilizam "Glassmorphism" — a técnica visual de vidro fosco para que fiquem visíveis por cima das animações sem bloqueá-las totalmente.
- **Cenário Dinâmico:** Corações sutis flutuando desfocados ao fundo da página (implementado com animações CSS orgânicas) entregam vida ao ambiente sem poluir a leitura principal.

## 3. Estrutura Narrativa e Componentes (A Jornada do Usuário)
1. **The Gatekeeper (Tela de Loading Dinâmica):**
   - O site não entrega seu conteúdo enquanto baixa recursos. Uma tela global com um coração de néon carrega a aplicação de forma interativa. Só então, a Caixa de Presente é exibida. A caixa suspende o scroll (`overflow: hidden`), gerando enorme atrito e expectativa antes da revelação.
2. **A Arte da Profundidade (Objetos 3D e Física G-Force):**
   - Em toda a experiência, corações em 3D reais (malhas .obj com materiais premium) flutuam ao fundo. Eles não apenas reagem ao scroll via GSAP, mas possuem um simulador aerodinâmico brutal com molas físicas (*Spring Physics*) baseado na velocidade de rotação do mouse (Lenis Velocity).
   - Eles executam uma viagem "Scrollytelling" em monitores e se "ancoram" responsivamente às bordas no modo celular, preservando a leitura.
3. **O Momento Zero (A Hero Section):**
   - Assim que o presente explode (disparando o `ScrollTrigger.refresh()`), os nomes revelam-se num brilho em conjunto com o tempo cravado que estão juntos e a mensagem "Cada segundo ao seu lado é o meu momento favorito." A imagem principal (`<img src="...">`) dita a primeira impressão.
4. **O Sentimento (Texto Gigante):**
   - Um bloco imenso cruzando a tela que dita o tom da homenagem amorosa.
5. **Os Marcos Principais (Carrossel Pin/Imersivo):**
   - Painéis com tela inteira, focados na intensidade e descrição de poucos e fortes sentimentos/fases (O Início, Aventuras, Paz, Futuro). Imagens possuem Tooltips (Legendas interativas), que são sempre visíveis no celular por restrição de toque, mas ocultas até o hover no desktop.
6. **Eventos Chave (Memórias em Grid):**
   - Focado em acontecimentos (Primeiro Encontro, Aniversário). Clicar na imagem invoca a visualização full-screen via Lightbox (Fancybox).
7. **Deck em Leque (A Magia Expandida):**
   - Cartas empilhadas que, magicamente, se espalham como um leque perfeito de baralho ao usuário arrastar a tela até elas. Em monitores largos, o sistema acomoda de forma inteligente **até 2 Leques lado a lado**, fluindo para layout em coluna em dispositivos móveis.
8. **Galeria Infinita:**
   - Loop deslizante contínuo de lembranças para fechar o visual.
8. **Rodapé e Navegação (Injetados via JS):**
   - O crédito da autoria e o timer superior acompanham toda a experiência visualmente.

---

> **Atenção (Usuário):** A plataforma foi construída em módulos escaláveis! Você pode duplicar seções no HTML (como adicionar um novo `<section class="horizontal-gallery-section">`) com a tranquilidade de que o sistema entenderá a duplicação e criará lógicas independentes para cada cópia. Pode editar este arquivo para adicionar textos específicos, piadas internas ou momentos chave que quer que o sistema lembre no futuro.
