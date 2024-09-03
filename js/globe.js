import getStarfield from "./starField.js";

const globeContainer = document.getElementById('globe-container');

const scene = new THREE.Scene();
const width = globeContainer.clientWidth;
const height = globeContainer.clientHeight;


const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
globeContainer.appendChild(renderer.domElement);

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);

const loader = new THREE.TextureLoader();
const geometry = new THREE.SphereGeometry(3, 32, 32);
const material = new THREE.MeshStandardMaterial({
  map: loader.load("./data/textures/8081_earthmap4k.jpg"),
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const atmosphereGeometry = new THREE.SphereGeometry(3.75,32,32);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: `
      varying vec3 vNormal;
      void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      varying vec3 vNormal;
      void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
  `,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

const glowGeometry = new THREE.SphereGeometry(3.3, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

const satelliteGeometry = new THREE.SphereGeometry(0.01, 16, 16);
const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000});
const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
scene.add(satellite);

const orbitRadius = 3.75;
satellite.position.set(orbitRadius, 0, 0);
let satelliteAngle = 0;
const satelliteOrbitSpeed = 0.01; 

const lightMat = new THREE.MeshBasicMaterial({
  map: loader.load("./data/textures/8081_earthlights4k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightMat);
earthGroup.add(lightsMesh)

const stars = getStarfield(2500);
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2,-0.5,2);
scene.add(sunLight);

const earthRotationSpeed = (2 * Math.PI) / (86400/(24*2));

function animate() {
    requestAnimationFrame(animate);
    earthMesh.rotation.y += earthRotationSpeed;
    lightsMesh.rotation.y += earthRotationSpeed;

    satelliteAngle += satelliteOrbitSpeed;
    satellite.position.x = orbitRadius * Math.cos(satelliteAngle);
    satellite.position.z = orbitRadius * Math.sin(satelliteAngle);

    // Optionally, make the satellite rotate around its axis
    satellite.rotation.y += 0.05;
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  width = globeContainer.clientWidth;
  height = globeContainer.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});