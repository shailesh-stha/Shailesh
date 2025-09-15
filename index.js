(function() {
  'use strict';

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100));
  }

  function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-button');
    const navMenu = document.getElementById('nav-menu');
    if (!hamburgerBtn || !navMenu) return;
    hamburgerBtn.addEventListener('click', () => {
      const isOpened = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      document.body.classList.toggle('nav-open');
      hamburgerBtn.setAttribute('aria-expanded', !isOpened);
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
          document.body.classList.remove('nav-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * ===================================================================
   * DARK MODE THEME SWITCHER (MODIFIED FOR DARK DEFAULT)
   * ===================================================================
   */
  function initThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;
    
    const docBody = document.body;
    const savedTheme = localStorage.getItem('theme');

    // MODIFIED: Default to dark mode unless the user has explicitly chosen light mode.
    if (savedTheme !== 'light') {
      docBody.setAttribute('data-theme', 'dark');
    }

    switcher.addEventListener('click', () => {
      // MODIFIED: Toggle logic now explicitly saves 'light' or 'dark'.
      if (docBody.getAttribute('data-theme') === 'dark') {
        docBody.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        docBody.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }


  function initBackToTopButton() {
    const button = document.getElementById('back-to-top');
    if (!button) return;
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 300) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }, 200));
  }

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up');
    if (animatedElements.length === 0) return;
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
  }

  // ... (Your existing functions: getStarfield, initGlobe, etc. remain the same)
  function getStarfield({ numStars = 2500 } = {}) {
    function randomSpherePoint() {
      const radius = Math.random() * 25 + 25; const u = Math.random(); const v = Math.random();
      const theta = 2 * Math.PI * u; const phi = Math.acos(2 * v - 1);
      let x = radius * Math.sin(phi) * Math.cos(theta);
      let y = radius * Math.sin(phi) * Math.sin(theta);
      let z = radius * Math.cos(phi);
      return { pos: new THREE.Vector3(x, y, z) };
    }
    const verts = []; const colors = []; const color = new THREE.Color();
    for (let i = 0; i < numStars; i += 1) {
      let p = randomSpherePoint(); const { pos } = p; color.setHSL(0.6, 0.2, Math.random());
      verts.push(pos.x, pos.y, pos.z); colors.push(color.r, color.g, color.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.2, vertexColors: true, map: new THREE.TextureLoader().load("./assets/starsCircle.png"),
      transparent: true, depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }
  function initGlobe() {
    const globeContainer = document.getElementById('globe-container'); if (!globeContainer) return;
    const scene = new THREE.Scene(); const width = globeContainer.clientWidth; const height = globeContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000); camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(width, height); renderer.setClearColor(0x000000, 0);
    globeContainer.appendChild(renderer.domElement); const earthGroup = new THREE.Group();
    earthGroup.rotation.z = -23.4 * Math.PI / 180; scene.add(earthGroup);
    const loader = new THREE.TextureLoader(); const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: loader.load("./assets/8081_earthmap4k.jpg") });
    const earthMesh = new THREE.Mesh(geometry, material); earthGroup.add(earthMesh);
    const atmosphereGeometry = new THREE.SphereGeometry(3.75, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vNormal; void main() { float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0); gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity; }`,
      blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial); scene.add(atmosphere);
    const lightMat = new THREE.MeshBasicMaterial({ map: loader.load("./assets/8081_earthlights4k.jpg"), blending: THREE.AdditiveBlending });
    const lightsMesh = new THREE.Mesh(geometry, lightMat); earthGroup.add(lightsMesh);
    const stars = getStarfield(); scene.add(stars);
    const sunLight = new THREE.DirectionalLight(0xffffff); sunLight.position.set(-2, -0.5, 2); scene.add(sunLight);
    const earthRotationSpeed = (2 * Math.PI) / (86400 / (24 * 2));
    function animate() { requestAnimationFrame(animate); earthMesh.rotation.y += earthRotationSpeed; lightsMesh.rotation.y += earthRotationSpeed; renderer.render(scene, camera); }
    animate();
    window.addEventListener('resize', () => {
        const updatedWidth = globeContainer.clientWidth; const updatedHeight = globeContainer.clientHeight;
        renderer.setSize(updatedWidth, updatedHeight); camera.aspect = updatedWidth / updatedHeight; camera.updateProjectionMatrix();
    });
  }
  function initNavHighlighter() {
    const activePage = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      if (activePage === '/' && (linkPath === '/index.html' || linkPath === '/')) {
        if(link.closest('li')) link.closest('li').classList.add("active");
      } else if (linkPath === activePage && linkPath !== '/') {
        if(link.closest('li')) link.closest('li').classList.add("active");
      }
    });
  }
  function initQuoteDisplay() {
    const quoteElement = document.getElementById("quote"); if (!quoteElement) return;
    const quotes = ['"Everything is related to everything else, but near things are more related than distant things." : Waldo Tobler', '"Geography is destiny." : Napoleon Bonaparte', '"The map is not the territory." : Alfred Korzybski', '"GIS is the only technology that actually integrates many different subjects using geography as its common framework." : Jack Dangermond', '"Knowing where things are, and why, is essential to rational decision making." : Jack Dangermond', '"Without data, you’re just another person with an opinion." : W. Edwards Deming', '"Maps codify the miracle of existence." : Nicholas Crane'];
    const quote = quotes[Math.floor(Math.random() * quotes.length)]; quoteElement.innerText = quote;
  }
  function initOpenLayersMap() {
    const mapElement = document.getElementById("map"); if (!mapElement) return;
    const map = new ol.Map({
        target: "map", layers: [ new ol.layer.Tile({ source: new ol.source.OSM() }) ],
        view: new ol.View({ center: ol.proj.fromLonLat([9.1829, 48.7758]), zoom: 12 }),
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initHeaderScrollEffect();
    initMobileNav();
    initThemeSwitcher();
    initBackToTopButton();
    initScrollAnimations();
    initNavHighlighter();
    initQuoteDisplay();
    initGlobe();
    initOpenLayersMap();
  });

})();