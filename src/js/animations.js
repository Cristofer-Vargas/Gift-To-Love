document.addEventListener("DOMContentLoaded", () => {
  // Registrar ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // --- LENIS SMOOTH SCROLL ---
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de aceleração muito natural
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    // Sincroniza o Lenis com o GSAP ScrollTrigger para não haver travamentos no parallax
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Exporta a instância para escopo global para que possamos pausar o scroll no modal de presente
    window.lenis = lenis;
  }

  // 1. ANIMAÇÃO DA IMAGEM PRINCIPAL
  const mainImg = document.querySelector('.main-img');
  if (mainImg) {
    gsap.to(mainImg, {
      y: -15, // Flutua suavemente para cima
      rotation: '+=2', // Gira um pouquinho a mais do que o CSS já define
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  // 1.5. CORAÇÕES ANIMADOS (HERO SECTION)
  const heartsContainer = document.getElementById('hero-hearts');
  if (heartsContainer) {
    const heartSVG = `
      <svg viewBox="0 0 32 29.6" width="45" height="45">
        <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
      </svg>
    `;
    
    // Gerar 10 corações dinamicamente
    for (let i = 0; i < 10; i++) {
      let heart = document.createElement('div');
      heart.innerHTML = heartSVG;
      heart.style.position = 'absolute';
      heart.style.willChange = 'transform'; // Otimização pesada de GPU para animação contínua
      // z-index é controlado no CSS para ficar sob a imagem
      
      // Posição inicial espalhada (mas perto da imagem)
      // Alternar corações subindo e descendo
      const isGoingUp = i % 2 === 0;
      
      // X random entre -50px a 350px (imagem tem 300px largura)
      const randomX = gsap.utils.random(-50, 320);
      
      heart.style.left = `${randomX}px`;
      
      // Y inicial dependendo da direção
      let startY, endY;
      if (isGoingUp) {
        startY = gsap.utils.random(350, 450); // Base da imagem
        endY = gsap.utils.random(-100, 0);    // Topo
      } else {
        startY = gsap.utils.random(-100, 0);  // Topo
        endY = gsap.utils.random(350, 450);   // Base
      }

      heart.style.top = `${startY}px`;
      
      // Rotação inicial
      gsap.set(heart, { rotation: gsap.utils.random(-45, 45) });

      heartsContainer.appendChild(heart);

      // Animação infinita e alternada
      gsap.to(heart, {
        y: endY - startY,
        x: '+=random(-30, 30)', // Oscila pro lado
        rotation: '+=random(-90, 90)',
        duration: gsap.utils.random(3, 6),
        repeat: -1,
        yoyo: true, // Faz eles subirem e descerem continuamente
        ease: "sine.inOut",
        delay: gsap.utils.random(0, 3) // Descompasso
      });
    }
  }

  // 2. HUGE TEXT SCROLL (Modularizado)
  const hugeTextSections = document.querySelectorAll('.huge-text-section');
  hugeTextSections.forEach(section => {
    const hugeText = section.querySelector('.huge-text');
    if (hugeText) {
      gsap.fromTo(hugeText, 
        { x: "100vw" },
        {
          x: "-100%", ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom", end: "bottom top", scrub: 1
          }
        }
      );
    }
  });

  // 3. CARROSSEL SCROLL-MAPPED (Modularizado - MOVIDO PARA CIMA, POIS VEM ANTES NO HTML)
  // Como ele usa "pin: true", ele precisa ser criado antes dos elementos abaixo dele!
  const carouselSections = document.querySelectorAll('.carousel-section');
  carouselSections.forEach(section => {
    const carouselContainer = section.querySelector('.carousel-container');
    const carouselPanels = gsap.utils.toArray(section.querySelectorAll('.carousel-panel'));

    if (carouselContainer && carouselPanels.length > 0) {
      function getScrollAmount() {
        return -(carouselContainer.scrollWidth - window.innerWidth + 32); 
      }

      const tween = gsap.to(carouselContainer, { x: getScrollAmount, ease: "none" });

      ScrollTrigger.create({
        trigger: section,
        start: "top 5%", 
        end: () => `+=${Math.abs(getScrollAmount())}`, 
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true, 
      });
    }
  });

  // 4. ANIMAÇÕES DE SCROLL SIMPLES (Objetos Surgindo)
  // Agrupa coisas como grid e textos esporádicos
  const scrollElements = gsap.utils.toArray('.scroll-anim');
  scrollElements.forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el, start: "top 85%", toggleActions: "play none none reverse"
      },
      y: 50, opacity: 0, duration: 0.8, ease: "power2.out"
    });
  });

  // 5. GALERIA HORIZONTAL - DECK LEQUE (Modularizado e agora posicionado corretamente após o pino)
  const gallerySections = document.querySelectorAll('.horizontal-gallery-section');
  gallerySections.forEach(section => {
    const deckCards = gsap.utils.toArray(section.querySelectorAll('.deck-card'));
    const indicators = section.querySelectorAll('.indicator');
    
    if(deckCards.length === 0) return;

    // Posicionamento base
    gsap.set(deckCards, { 
      xPercent: -50, yPercent: -50, left: "50%", top: "50%", transformOrigin: "center bottom",
      x: 0, y: 0, rotation: 0, scale: 1
    });

    const activeStates = new Array(deckCards.length).fill(false);
    const middleIndex = Math.floor(deckCards.length / 2);

    function getSpreadX() {
      if (window.innerWidth <= 480) return 40; 
      if (window.innerWidth <= 768) return 55; 
      // Se estiverem agrupados lado a lado, reduz o spread para evitar sobreposição nas laterais
      if (section.parentElement && section.parentElement.classList.contains('decks-wrapper') && window.innerWidth >= 1024) return 60;
      return 80;
    }

    function dropAllCards() {
      deckCards.forEach((c, idx) => {
        if (activeStates[idx]) {
          const offset = idx - middleIndex;
          gsap.to(c, { 
            y: Math.abs(offset) * 10, scale: 1, boxShadow: "0 15px 35px rgba(255, 8, 68, 0.3)",
            duration: 0.3, ease: "power2.out", overwrite: true, zIndex: 1 
          });
          activeStates[idx] = false;
        }
      });
      indicators.forEach(ind => ind.classList.remove('active'));
    }

    function liftSpecificCard(i) {
      dropAllCards();
      const offset = i - middleIndex;
      activeStates[i] = true;
      if (indicators[i]) indicators[i].classList.add('active');
      gsap.to(deckCards[i], { 
        y: (Math.abs(offset) * 10) - 30, scale: 1.05, boxShadow: "0 25px 50px rgba(255, 8, 68, 0.6)",
        duration: 0.3, ease: "power2.out", overwrite: true, zIndex: 10 
      });
    }

    deckCards.forEach((card, i) => {
      card.onmouseenter = () => liftSpecificCard(i);
      card.onmouseleave = () => dropAllCards();
      if (indicators[i]) indicators[i].onclick = () => liftSpecificCard(i);
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      onEnter: () => {
        const spreadX = getSpreadX();
        deckCards.forEach((card, i) => {
          const offset = i - middleIndex; 
          gsap.to(card, {
            x: offset * spreadX, rotation: offset * 5, y: Math.abs(offset) * 10,
            duration: 1, ease: "back.out(1.2)", delay: i * 0.1, overwrite: true
          });
        });
      },
      onLeaveBack: () => {
        dropAllCards();
        gsap.to(deckCards, { x: 0, rotation: 0, y: 0, scale: 1, duration: 0.6, ease: "power2.inOut", overwrite: true });
      }
    });
  });

  // 6. GALERIA INFINITA (Modularizado)
  const infiniteSections = document.querySelectorAll('.infinite-slider-section');
  infiniteSections.forEach(section => {
    const infiniteSlider = section.querySelector('.infinite-slider');
    if (infiniteSlider) {
      const content = infiniteSlider.innerHTML;
      infiniteSlider.innerHTML = content + content; 
      
      const originalWidth = infiniteSlider.scrollWidth / 2;
      const dynamicDuration = originalWidth / 60; 

      const marqueeTween = gsap.to(infiniteSlider, { xPercent: -50, ease: "none", duration: dynamicDuration, repeat: -1 });

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          let velocity = Math.min(Math.abs(self.getVelocity() / 100), 10);
          let timeScale = 1 + velocity;
          if (self.direction === -1) timeScale = -timeScale;
          gsap.to(marqueeTween, { timeScale: timeScale, duration: 0.2, overwrite: "auto" });
        }
      });

      ScrollTrigger.addEventListener("scrollEnd", () => {
        gsap.to(marqueeTween, { timeScale: 1, duration: 1, ease: "power2.out", overwrite: "auto" });
      });

      if (typeof Draggable !== "undefined") {
        infiniteSlider.style.cursor = "grab";
        let wrapProgress = gsap.utils.wrap(0, 1);
        let proxy = document.createElement("div"); 
        
        Draggable.create(proxy, {
          trigger: infiniteSlider,
          type: "x",
          onPress: function() { infiniteSlider.style.cursor = "grabbing"; marqueeTween.pause(); },
          onDrag: function() {
            let progress = marqueeTween.progress();
            let amount = this.deltaX / (infiniteSlider.offsetWidth / 2);
            marqueeTween.progress(wrapProgress(progress - amount));
          },
          onRelease: function() { infiniteSlider.style.cursor = "grab"; marqueeTween.play(); }
        });
      }
    }
  });

  // 7. BACKGROUND SUTIS (Corações Pulsantes com Blur)
  const bgContainer = document.getElementById('bg-hearts-container');
  if (bgContainer) {
    const bgHeartSVG = `
      <svg viewBox="0 0 32 29.6" width="100%" height="100%">
        <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
      </svg>
    `;

    const numHearts = window.innerWidth < 768 ? 10 : 20; 
    for (let i = 0; i < numHearts; i++) {
      let heart = document.createElement('div');
      heart.innerHTML = bgHeartSVG;
      heart.classList.add('bg-heart');

      const size = gsap.utils.random(150, 450);
      heart.style.width = `${size}px`;
      heart.style.height = `${size}px`;
      
      heart.style.left = `${gsap.utils.random(-10, 100)}vw`;
      heart.style.top = `${gsap.utils.random(-10, 100)}vh`;
      
      heart.style.setProperty('--rot', `${gsap.utils.random(-45, 45)}deg`);
      heart.style.animationDelay = `-${gsap.utils.random(0, 10)}s`;
      heart.style.animationDuration = `${gsap.utils.random(8, 15)}s`;

      bgContainer.appendChild(heart);
    }
  }


  // 8. EFEITO DE GLOW NO MOUSE
  const mouseGlow = document.createElement('div');
  mouseGlow.classList.add('mouse-glow');
  document.body.appendChild(mouseGlow);

  let xTo = gsap.quickTo(mouseGlow, "left", {duration: 0.8, ease: "power3"});
  let yTo = gsap.quickTo(mouseGlow, "top", {duration: 0.8, ease: "power3"});
  window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });

  // Recalcular ScrollTrigger após 1 segundo para garantir que fontes/imagens carregaram
  setTimeout(() => ScrollTrigger.refresh(), 1000);

});
