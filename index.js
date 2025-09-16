(function() {
  'use strict';

  /**
   * Utility function to limit how often a function can run.
   * Useful for performance on scroll/resize events.
   */
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

  /**
   * Toggles the mobile navigation overlay.
   */
  function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-button');
    const mobileNav = document.getElementById('nav-links-mobile');
    
    if (!hamburgerBtn || !mobileNav) return;

    // Toggle nav on hamburger click
    hamburgerBtn.addEventListener('click', () => {
      const isOpened = document.body.classList.toggle('nav-open');
      hamburgerBtn.setAttribute('aria-expanded', isOpened);
    });

    // Close nav when a link inside it is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
          document.body.classList.remove('nav-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * Handles the light/dark theme switcher and persists the choice.
   */
  function initThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;
    
    const docBody = document.body;
    const savedTheme = localStorage.getItem('theme');

    // Default to dark theme if nothing is saved or if dark was saved
    if (savedTheme !== 'light') {
      docBody.setAttribute('data-theme', 'dark');
    }

    switcher.addEventListener('click', () => {
      const isDark = docBody.getAttribute('data-theme') === 'dark';
      if (isDark) {
        docBody.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        docBody.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  /**
   * Shows/hides the "back to top" button based on scroll position.
   */
  function initBackToTopButton() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    // Toggle visibility on scroll
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 300) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }, 200));

    // UPDATED: Handle click with smooth scroll and prevent hash in URL
    button.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
  }

  /**
   * Animates elements into view as the user scrolls.
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up');
    if (animatedElements.length === 0) return;

    // Use IntersectionObserver for performance
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Stop observing after animation
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
  }
  
  /**
   * Creates a starfield background using THREE.js.
   */
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

  /**
   * Initializes the THREE.js globe visualization.
   */
  function initGlobe() {
    // ADDED: Safety check to ensure THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error("THREE.js is not loaded. Cannot initialize globe.");
        return;
    }
    
    // There is no #globe-container in the HTML. This code won't run.
    // Leaving it in case you add the container later.
    const globeContainer = document.getElementById('globe-container'); 
    if (!globeContainer) return;

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

  /**
   * Main application starter.
   */
  document.addEventListener("DOMContentLoaded", function() {
    initMobileNav();
    initThemeSwitcher();
    initBackToTopButton();
    initScrollAnimations();
    initGlobe(); // This function looks for a #globe-container element
  });

})();