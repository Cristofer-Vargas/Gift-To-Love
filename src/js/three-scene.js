document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;

  // Otimização Extrema para Mobile: Desativar a engine 3D em telas menores que 780px
  if (window.innerWidth < 780) {
    canvas.style.display = 'none';
    return; // Aborta a inicialização do Three.js economizando bateria e memória
  }
  
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 1. Configuração Básica do Three.js
  const scene = new THREE.Scene();
  
  // Usando Câmera Ortográfica para que 1 unidade no 3D seja exatamente 1 pixel na tela
  const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2, window.innerWidth / 2, 
    window.innerHeight / 2, window.innerHeight / -2, 
    1, 1000
  );
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: true,
    powerPreference: "high-performance" // Otimização de GPU
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Capar o pixel ratio em 1.5 reduz o custo de processamento em telas Retina em até 40%
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Iluminação para dar o volume 3D
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(100, 100, 100);
  scene.add(directionalLight1);
  
  const directionalLight2 = new THREE.DirectionalLight(0xff0844, 0.8);
  directionalLight2.position.set(-100, -100, 50);
  scene.add(directionalLight2);

  // Material Premium Metálico/Aveludado para o Coração
  const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0844,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x3a000b,
    side: THREE.FrontSide // FrontSide é mais rápido que DoubleSide (menos cálculos)
  });

  const hearts = [];

  // 2. Carregar o Arquivo .obj
  const objLoader = new THREE.OBJLoader();
  objLoader.load('./src/models/heart.obj', (object) => {
    // 2.1. Centralizar a Origem do Objeto (Corrige rotações bizarras)
    // Muitos arquivos .obj da internet vêm com o centro de massa deslocado.
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Desloca o objeto na direção inversa do seu centro para cravá-lo no eixo 0,0,0
    object.position.set(-center.x, -center.y, -center.z);
    
    // Cria uma "embalagem" limpa perfeitamente alinhada que guardará o objeto deslocado
    const wrapperObject = new THREE.Group();
    wrapperObject.add(object);

    // 2.2. Escala Dinâmica (Auto-Scale Inteligente)
    // Descobre o tamanho real do modelo original importado
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Força o objeto a ter exatamente o tamanho visual de 80 pixels de diâmetro na tela
    const targetSizeInPixels = 80; 
    const dynamicScale = targetSizeInPixels / maxDim;
    wrapperObject.scale.set(dynamicScale, dynamicScale, dynamicScale);

    // 2.3. Aplicar o material premium
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = heartMaterial;
      }
    });

    // 2.4. Iniciar a criação das rotas passando a "embalagem"
    createJourneyHearts(wrapperObject);
    
  }, undefined, (error) => {
    console.error('Erro ao carregar o modelo 3D (.obj):', error);
  });

  function createJourneyHearts(baseObject) {
    // Nós vamos preencher isso em initGSAPScrollJourney
    // Apenas instanciamos os grupos aninhados para não haver conflito no GSAP
    for (let i = 0; i < 4; i++) {
      // 1. Grupo Master que cuida apenas da Fase 1 (Drift para baixo)
      const driftGroup = new THREE.Group();

      // 2. Grupo Secundário que cuida apenas da Fase 2 (Sair para cima)
      const pinGroup = new THREE.Group();
      driftGroup.add(pinGroup);

      // 3. Grupo Terciário que sofre o impacto leve do scroll (G-Force)
      const gForceGroup = new THREE.Group();
      pinGroup.add(gForceGroup);

      // 4. A Malha em si (Roda apenas no eixo Y)
      const clone = baseObject.clone();
      
      // Inicia sempre em pé
      clone.rotation.x = 0;
      clone.rotation.y = (Math.random() - 0.5) * 0.5; 
      clone.rotation.z = 0;
      
      gForceGroup.add(clone);
      scene.add(driftGroup);
      
      hearts.push({ driftGroup, pinGroup, gForceGroup, mesh: clone });

      // Flutuação orgânica isolada no objeto interno (yoyo contínuo)
      gsap.to(clone.position, {
        y: 12,
        duration: 2 + Math.random(),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    setTimeout(() => initGSAPScrollJourney(), 500);
  }

  function initGSAPScrollJourney() {
    if(hearts.length < 4) return;

    let mm = gsap.matchMedia();

    const sections = [
      ".carousel-section",
      ".memory-grid-section",
      ".decks-wrapper",
      ".infinite-slider-section"
    ];

    mm.add("all", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w <= 768;

      hearts.forEach((hObj, i) => {
        const targetSection = document.querySelector(sections[i]);
        if (!targetSection) return;

        // Escala
        if (isMobile) {
          gsap.set(hObj.driftGroup.scale, { x: 0.65, y: 0.65, z: 0.65 });
        } else {
          const randomScale = 0.7 + Math.random() * 0.4;
          gsap.set(hObj.driftGroup.scale, { x: randomScale, y: randomScale, z: randomScale });
        }

        // Reset das posições dos subgrupos caso o matchMedia rode novamente
        gsap.set(hObj.pinGroup.position, { y: 0, x: 0 });

        // Posição Inicial: Todos visíveis no topo da página
        const sideMult = i % 2 === 0 ? -1 : 1;
        const xSpread = isMobile ? (w/4) : (w/5 + i * 40);
        const startX = sideMult * xSpread;
        const startY = h/2 - (isMobile ? 100 : 150) - (i * 30);
        
        gsap.set(hObj.driftGroup.position, { x: startX, y: startY });

        // Fase 1: Viajar com o usuário (DriftGroup)
        const driftX = startX + (sideMult * (isMobile ? 30 : 60)); 
        
        gsap.to(hObj.driftGroup.position, {
          y: 0, 
          x: driftX,
          ease: "power2.inOut", // Curva suave na largada e na chegada
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            endTrigger: targetSection,
            end: "center center", 
            scrub: 2
          }
        });

        // Fase 2: "Estacionar" na seção e subir (PinGroup)
        gsap.to(hObj.pinGroup.position, {
          y: h/2 + 250, 
          ease: "power2.inOut", // Curva suave ao começar a subir
          scrollTrigger: {
            trigger: targetSection,
            start: "center center",
            end: "bottom top", 
            scrub: 2
          }
        });

        // Rotação: Estritamente em Y (como um pião) para não deitar
        gsap.to(hObj.mesh.rotation, {
          y: (i % 2 === 0 ? "+=6" : "-=6"), 
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5
          }
        });
      });

      return () => {}; 
    });
  }

  // 3. Loop de Renderização e Física G-Force Suavizada
  let lastScrollY = window.scrollY;
  let currentTiltX = 0;
  let currentStretch = 1;

  function animate() {
    requestAnimationFrame(animate);
    
    // Otimização pesada: Pausar o renderizador 3D inteiramente se a aba do navegador estiver oculta
    // ou se a tela for redimensionada para um tamanho mobile (ex: girar tablet)
    if (document.hidden || window.innerWidth < 780) {
      canvas.style.display = 'none';
      return;
    } else {
      canvas.style.display = 'block';
    }
    
    let velocity = 0;
    if (window.lenis && window.lenis.velocity !== undefined) {
      velocity = window.lenis.velocity;
    } else {
      const scrollY = window.scrollY;
      velocity = scrollY - lastScrollY;
      lastScrollY = scrollY;
    }
    
    // G-Force extremamente sutil para não deixar o coração "deitado"
    const maxGForce = 0.15; // Apenas ~8 graus de inclinação
    const targetTiltX = THREE.MathUtils.clamp(velocity * 0.01, -maxGForce, maxGForce);
    
    const targetStretch = 1 + Math.abs(velocity * 0.001);
    const clampedStretch = THREE.MathUtils.clamp(targetStretch, 1, 1.05);
    
    currentTiltX += (targetTiltX - currentTiltX) * 0.1;
    currentStretch += (clampedStretch - currentStretch) * 0.1;
    
    hearts.forEach(h => {
      if(h.gForceGroup) {
        h.gForceGroup.rotation.x = currentTiltX;
        h.gForceGroup.scale.set(1 / currentStretch, currentStretch, 1 / currentStretch);
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // 4. Responsividade Contínua
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    renderer.setSize(w, h);
    camera.left = w / -2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / -2;
    camera.updateProjectionMatrix();
    
    if(window.ScrollTrigger) ScrollTrigger.refresh();
  });

});
