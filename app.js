// Fungsi untuk handle "required" field pada form dinamis
const typeEl = document.getElementById('materialType');
const requireds = [
  // Circle
  ['idInput', 'odInput', 'thicknessCircleInput'],
  // Square
  ['lengthSqInput', 'widthSqInput', 'heightSqInput'],
  // Rectangle
  ['lengthRectInput', 'widthRectInput', 'heightRectInput']
];
// Atur 'required' hanya field yang tampil
function setRequiredFields(mat) {
  requireds.flat().forEach(id => document.getElementById(id).required = false);
  if (mat === "circle") requireds[0].forEach(id => document.getElementById(id).required = true);
  if (mat === "square") requireds[1].forEach(id => document.getElementById(id).required = true);
  if (mat === "rectangle") requireds[2].forEach(id => document.getElementById(id).required = true);
}
typeEl.addEventListener('change', function() {
  document.getElementById('circleFields').style.display = this.value === 'circle' ? 'block' : 'none';
  document.getElementById('squareFields').style.display = this.value === 'square' ? 'block' : 'none';
  document.getElementById('rectangleFields').style.display = this.value === 'rectangle' ? 'block' : 'none';
  setRequiredFields(this.value)
});

setRequiredFields(typeEl.value); // default aktifkan

function clear3D() {
  const prev = document.getElementById("threejs-scene");
  if (prev) prev.remove();
}

document.getElementById('materialForm').addEventListener('submit', function(event){
  event.preventDefault();
  clear3D();
  const type = document.getElementById('materialType').value;

  let data = {type, spiling: Number(document.getElementById('spilingInput').value)};

  if (type === 'circle') {
    data.id = Number(document.getElementById('idInput').value);
    data.od = Number(document.getElementById('odInput').value);
    data.thickness = Number(document.getElementById('thicknessCircleInput').value);
  } else if (type === 'square') {
    data.length = Number(document.getElementById('lengthSqInput').value);
    data.width = Number(document.getElementById('widthSqInput').value);
    data.height = Number(document.getElementById('heightSqInput').value);
  } else if (type === 'rectangle') {
    data.length = Number(document.getElementById('lengthRectInput').value);
    data.width = Number(document.getElementById('widthRectInput').value);
    data.height = Number(document.getElementById('heightRectInput').value);
  }
  render3D(data);
});

// 3D preview with Three.js
function render3D(material) {
  const container = document.getElementById('preview3d');
  const width = container.clientWidth || 350;
  const height = 320;
  
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdde6ee);

  // Camera
  const camera = new THREE.PerspectiveCamera(55, width/height, 1, 1000);
  camera.position.set(0, 90, 300);
  camera.lookAt(0,0,0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(width, height);
  renderer.domElement.id = "threejs-scene";
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.7));

  const mat = new THREE.MeshPhongMaterial({color: "#0c77e2", opacity:0.92, transparent: true});

  let mesh;
  if (material.type === "circle") {
    let od = material.od, id = material.id, t = material.thickness;
    let radius = (od + id) / 4;
    let tube = Math.max((od - id) / 4, 0.1);
    if (radius > 0 && tube > 0 && t > 0) {
      mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 40, 132),
        mat
      );
      mesh.scale.z = t/(tube*2.2);
      mesh.rotation.x = Math.PI/2;
      scene.add(mesh);
    }
  }
  if ((material.type === "square" || material.type === "rectangle")
      && material.length > 0 && material.width > 0 && material.height > 0) {
    let l = material.length, w = material.width, h = material.height;
    mesh = new THREE.Mesh(new THREE.BoxGeometry(
      l, w, h
    ), mat);
    scene.add(mesh);
  }

  // Optional: Spiling (tampilkan frame)
  if (material.spiling>0 && mesh) {
    const box = new THREE.BoxHelper(mesh, 0xFF6600);
    scene.add(box);
  }

  // Animate
  function animate() {
    if(mesh) mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}