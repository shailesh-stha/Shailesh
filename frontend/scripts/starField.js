import * as THREE from 'three';

export default function getStarfield({ numStars = 500 } = {}) {
  // Generates a random point on a sphere
  function randomSpherePoint() {
    const radius = Math.random() * 25 + 25; // Distance from the center
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u; // Azimuthal angle
    const phi = Math.acos(2 * v - 1); // Polar angle
    
    // Spherical to Cartesian coordinates conversion
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);

    return {
      pos: new THREE.Vector3(x, y, z),
      // hue: 0.6, // Hue is currently fixed in the loop
      // minDist: radius, // minDist is not used in the current logic
    };
  }

  const verts = [];
  const colors = [];
  const positions = []; // Although positions is created, it's not used later. Can be removed if not needed for future extensions.
  
  const color = new THREE.Color();

  // Generate stars
  for (let i = 0; i < numStars; i += 1) {
    let p = randomSpherePoint();
    const { pos } = p;
    // positions.push(p); // Removed as positions array is not used
    
    // Set star color (random lightness, fixed hue and saturation)
    color.setHSL(0.6, 0.2, Math.random()); 

    verts.push(pos.x, pos.y, pos.z);
    colors.push(color.r, color.g, color.b);
  }

  // Create buffer geometry and set attributes
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // Create points material
  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    // Corrected path for the star texture
    map: new THREE.TextureLoader().load("./../data/textures/starsCircle.png"),
    transparent: true, // Make texture background transparent
    depthWrite: false // Improves rendering when stars overlap
  });

  // Create points object and return
  const points = new THREE.Points(geo, mat);
  return points;
}
