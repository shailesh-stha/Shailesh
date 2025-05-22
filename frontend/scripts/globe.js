import getStarfield from "./starField.js";
import * as THREE from 'three';

// Get the container for the globe
const globeContainer = document.getElementById('globe-container');

// Check if the container exists before initializing the globe
if (globeContainer) {

    const scene = new THREE.Scene();
    const width = globeContainer.clientWidth;
    const height = globeContainer.clientHeight;

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 7;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({
        // Add antialiasing for smoother edges (optional)
        antialias: true
    });
    renderer.setSize(width, height);
    // Add the renderer's output to the container
    globeContainer.appendChild(renderer.domElement);

    // Create a group to hold the earth and lights meshes, and tilt it
    const earthGroup = new THREE.Group();
    // Tilt the earth to simulate axial tilt (approx 23.4 degrees)
    earthGroup.rotation.z = -23.4 * Math.PI / 180;
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    // Earth geometry
    const geometry = new THREE.SphereGeometry(3, 32, 32);

    // Earth material with texture
    const material = new THREE.MeshStandardMaterial({
        map: loader.load("./data/textures/8081_earthmap4k.jpg"),
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    earthGroup.add(earthMesh);

    // Atmosphere geometry and material
    const atmosphereGeometry = new THREE.SphereGeometry(3.75, 32, 32);
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

    // Glow effect geometry and material
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

    // Satellite geometry and material
    const satelliteGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    scene.add(satellite);

    // Satellite orbit parameters
    const orbitRadius = 3.75;
    satellite.position.set(orbitRadius, 0, 0);
    let satelliteAngle = 0;
    const satelliteOrbitSpeed = 0.01;

    // Earth lights material with texture
    const lightMat = new THREE.MeshBasicMaterial({
        map: loader.load("./data/textures/8081_earthlights4k.jpg"),
        blending: THREE.AdditiveBlending,
    });
    const lightsMesh = new THREE.Mesh(geometry, lightMat);
    // Add lights mesh to the earth group so it rotates with the earth
    earthGroup.add(lightsMesh);

    // Add stars to the scene
    const stars = getStarfield(2500);
    scene.add(stars);

    // Add sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff);
    sunLight.position.set(-2, -0.5, 2);
    scene.add(sunLight);

    // Earth rotation speed (2 rotations per day)
    const earthRotationSpeed = (2 * Math.PI) / (86400 / (24 * 2));

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the earth and lights
        earthMesh.rotation.y += earthRotationSpeed;
        lightsMesh.rotation.y += earthRotationSpeed;

        // Animate satellite orbit
        satelliteAngle += satelliteOrbitSpeed;
        satellite.position.x = orbitRadius * Math.cos(satelliteAngle);
        satellite.position.z = orbitRadius * Math.sin(satelliteAngle);

        // Optionally, make the satellite rotate around its axis
        satellite.rotation.y += 0.05;

        // Render the scene from the camera's perspective
        renderer.render(scene, camera);
    }

    // Start the animation
    animate();

    // Handle window resize to maintain aspect ratio and renderer size
    window.addEventListener('resize', () => {
        const updatedWidth = globeContainer.clientWidth;
        const updatedHeight = globeContainer.clientHeight;
        renderer.setSize(updatedWidth, updatedHeight);
        camera.aspect = updatedWidth / updatedHeight;
        camera.updateProjectionMatrix();
    });

} else {
    console.error('Globe container element not found!');
}
