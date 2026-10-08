# Three.js Implementation Patterns & Boilerplates

## 1. Hero 3D Interactive Canvas Boilerplate (Production-Ready)

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeHeroScene {
  constructor(container) {
    this.container = container;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.targetRotation = new THREE.Vector2();

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0e18, 0.035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 6);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 2.5);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x14b8a6, 3, 20);
    accentLight.position.set(-4, -2, 2);
    this.scene.add(accentLight);

    // 5. Geometry / Mesh
    this.createObjects();

    // 6. Listeners & Observer
    this.bindEvents();

    // 7. Loop
    this.animate();
  }

  createObjects() {
    const geom = new THREE.IcosahedronGeometry(1.6, 64);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 1.2,
      specularColor: 0xddb7ff,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    this.mesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.mesh);
  }

  bindEvents() {
    this.onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.targetRotation.x = this.mouse.y * 0.4;
      this.targetRotation.y = this.mouse.x * 0.4;
    };

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });

    this.container.addEventListener('pointermove', this.onPointerMove);
    this.resizeObserver.observe(this.container);
  }

  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();

    if (this.mesh) {
      this.mesh.rotation.x += (this.targetRotation.x - this.mesh.rotation.x) * 0.05;
      this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.05;
      this.mesh.position.y = Math.sin(elapsed * 1.5) * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.container.removeEventListener('pointermove', this.onPointerMove);
    if (this.resizeObserver) this.resizeObserver.disconnect();

    this.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
```

---

## 2. Instanced Mesh Particle Cloud (High Performance 10k+ Units)

```javascript
import * as THREE from 'three';

export function createParticleCloud(scene, count = 2000) {
  const geom = new THREE.SphereGeometry(0.04, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
  const instancedMesh = new THREE.InstancedMesh(geom, mat, count);

  const dummy = new THREE.Object3D();
  const radius = 8;

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;

    dummy.position.set(
      radius * Math.cos(theta) * Math.sin(phi) + (Math.random() - 0.5) * 2,
      radius * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) * 2,
      radius * Math.cos(phi) + (Math.random() - 0.5) * 2
    );

    const scale = 0.5 + Math.random() * 0.8;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i, dummy.matrix);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  scene.add(instancedMesh);
  return instancedMesh;
}
```

---

## 3. GLTF Loader with Draco & Environment Maps

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export function loadPBRModel(scene, modelUrl, dracoDecoderPath = '/draco/') {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(dracoDecoderPath);

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        resolve(model);
      },
      undefined,
      reject
    );
  });
}
```
