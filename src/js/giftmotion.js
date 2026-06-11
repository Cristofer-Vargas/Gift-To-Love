document.addEventListener("DOMContentLoaded", () => {
  const giftBox = document.querySelector('#gift-box');
  const giftLid = document.querySelector('#gift-lid');
  const giftBase = document.querySelector('#gift-base');

  if (!giftBox || !giftLid || !giftBase) return;

  // Bloquear o scroll da página enquanto o modal de presente estiver visível
  document.body.classList.add('no-scroll');
  
  // Como o Lenis roda paralelamente, forçamos a parada dele aqui.
  // Usamos setTimeout para garantir que o animations.js terminou de iniciá-lo.
  setTimeout(() => {
    if (window.lenis) window.lenis.stop();
  }, 100);

  // Garantir que a transformação da tampa aconteça a partir do centro
  gsap.set(giftLid, { transformOrigin: "center center" });

  let hoverAnim; 
  let isOpened = false;

  // Efeito de Hover (Caixa querendo abrir)
  giftBox.addEventListener('mouseenter', () => {
    if (isOpened) return;

    // Faz a tampa vibrar
    hoverAnim = gsap.to(giftLid, {
      y: -6,          
      rotation: 3,    
      duration: 0.5,  
      yoyo: true,     
      repeat: -1,     
      ease: "sine.inOut"
    });

    // Faz o corpo da caixa vibrar ligeiramente
    gsap.to(giftBase, {
      y: -2,
      duration: 0.5,
      yoyo: true,
      repeat: -1
    });
  });

  giftBox.addEventListener('mouseleave', () => {
    if (isOpened) return;
    
    // Mata a animação infinita
    if (hoverAnim) hoverAnim.kill();
    gsap.killTweensOf(giftBase); // Mata animação da base
    
    // Volta tudo pro lugar com uma animação suave
    gsap.to(giftLid, { y: 0, rotation: 0, duration: 0.3 });
    gsap.to(giftBase, { y: 0, duration: 0.3 });
  });

  // Efeito de Clique (Explosão e Abrir)
  giftBox.addEventListener('click', () => {
    if (isOpened) return;
    isOpened = true;

    // Para qualquer animação em andamento
    if (hoverAnim) hoverAnim.kill();
    gsap.killTweensOf(giftBase);

    // Anima a tampa voando pra fora
    gsap.to(giftLid, {
      y: -200,          
      rotation: -25,     
      opacity: 0,       
      duration: 1.2,
      ease: "power3.out"
    });

    // Pula a base uma vez pra dar peso à explosão
    gsap.to(giftBase, {
      y: 10,
      scaleY: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    createHearts();

    // Faz o fade-up do modal inteiro saindo da tela após a explosão
    gsap.to(giftBox, {
      y: "-100vh",      // Move tudo para cima (100% da altura da tela)
      opacity: 0,       // Esmaece
      duration: 1,    // Duração do movimento de subida
      delay: 1,         // Espera 2 segundos (o tempo para os corações saírem)
      ease: "power2.inOut",
      onComplete: () => {
        // Ao terminar, removemos o modal do caminho para poder clicar no resto do site
        giftBox.style.display = 'none'; 
        // Libera o scroll para o usuário explorar o site
        document.body.classList.remove('no-scroll');
        if (window.lenis) window.lenis.start();
        
        // RECALCULAR TODAS AS ANIMAÇÕES GSAP (Muito importante para os corações 3D rodarem pela tela inteira)
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }
    });
  });

  function createHearts() {
    // Usamos o container do presente para ficar relativo à ele
    const container = giftBox;
    
    const heartSVG = `
      <svg viewBox="0 0 32 29.6" width="30" height="30">
        <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" fill="#ff0844" style="filter: drop-shadow(0 0 5px rgba(255,8,68,0.8));"/>
      </svg>
    `;
    
    for (let i = 0; i < 40; i++) {
      let heart = document.createElement('div');
      heart.innerHTML = heartSVG;
      heart.style.position = 'absolute';
      heart.style.left = '50%'; 
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%)'; // Centraliza bem
      heart.style.fontSize = '24px';
      heart.style.pointerEvents = 'none'; // Impede o mouse de interagir com o coração
      heart.style.zIndex = '0'; // Tenta colocar atrás da caixa (depende do SVG)
      heart.style.willChange = 'transform, opacity'; // Aceleração de hardware

      container.appendChild(heart);

      gsap.to(heart, {
        x: gsap.utils.random(-300, 300), 
        y: gsap.utils.random(-400, -100), 
        opacity: 0,                      
        scale: gsap.utils.random(0.5, 2.5),
        rotation: gsap.utils.random(-90, 90),
        duration: gsap.utils.random(1.5, 3),
        ease: "power2.out",
        onComplete: () => heart.remove() 
      });
    }
  }
});
