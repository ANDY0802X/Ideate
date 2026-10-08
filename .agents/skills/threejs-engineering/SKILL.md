---
name: threejs-engineering
description: >-
  Architects, builds, and optimizes high-performance 3D web experiences using Three.js, WebGL, WebGPU, and GLSL shaders. Covers scene lifecycles, responsive camera/renderers, PBR lighting & HDRI, GLTF/Draco asset loading, raycasting interactions, particle systems, instanced rendering, post-processing, and GPU memory disposal.
---

# Three.js & WebGL Engineering

## Objective
Create visually stunning, smooth 60+ FPS interactive 3D experiences, spatial UI hero sections, particle networks, and WebGL visualizations without memory leaks or frame drops.

## Core Architecture Sequence
Canvas initialization -> Scene & Camera -> PBR Renderer setup -> Lighting & Environment -> Asset/Mesh loading -> Materials & Shaders -> Event Listeners & Raycasting -> RAF Animation Loop -> Resize & Cleanup Handlers.

---

## 1. Renderer & Canvas Standards
- **Pixel Ratio Clamping**: Always clamp pixel ratio to avoid rendering bottlenecks on Retina/4K displays:
  ```javascript
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ```
- **Color Space & Tone Mapping**:
  ```javascript
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ```
- **Power Preference**: Use `powerPreference: 'high-performance'` and `antialias: true` for clean geometric edges.
- **Alpha & Background**: Set `alpha: true` when integrating 3D scenes over DOM HTML backgrounds.

---

## 2. Responsive Resizing & Lifecycles
- Update camera aspect ratio and projection matrix immediately on container/window resize:
  ```javascript
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  ```
- Use `ResizeObserver` on the mounting element rather than only global window `resize`.

---

## 3. Memory Management & Zero-Leak Disposal
Every dynamic scene change or component unmount MUST recursively traverse and dispose of all resources:
```javascript
function disposeHierarchy(node) {
  if (!node) return;
  node.traverse((child) => {
    if (child.isMesh || child.isPoints || child.isLine) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => disposeMaterial(mat));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

function disposeMaterial(mat) {
  Object.keys(mat).forEach((prop) => {
    if (mat[prop] && typeof mat[prop].dispose === 'function') {
      mat[prop].dispose();
    }
  });
  mat.dispose();
}
```

---

## 4. Performance & Draw Call Optimization
- **InstancedMesh**: Use `THREE.InstancedMesh` whenever rendering hundreds or thousands of repeated meshes (particles, cards, floating debris, nodes) in a single draw call.
- **BufferGeometry**: Always use `BufferGeometry` and typed arrays (`Float32Array`) for particle positions, colors, and UV attributes.
- **Frustum Culling**: Ensure `frustumCulled = true` on off-screen assets.
- **Texture Sizes**: Constrain textures to power-of-two resolutions (512x512, 1024x1024, 2048x2048) with compressed formats (KTX2 / Basis Universal / WebP).
- **Draco Compression**: Use `DRACOLoader` with `GLTFLoader` for 3D model delivery to reduce network payload by up to 80%.

---

## 5. Lighting & Atmosphere
- **HDRI / Environment Maps**: Use `RGBELoader` with `PMREMGenerator` for realistic PBR reflections and ambient lighting.
- **Light Budgets**: Restrict real-time shadow-casting lights to 1 or 2 directional/spot lights. Use `AmbientLight` or `HemisphereLight` for fill.
- **Depth & Fog**: Use `THREE.FogExp2(color, density)` or `THREE.Fog(color, near, far)` to blend 3D depth smoothly into UI page backgrounds.

---

## 6. Interaction & Raycasting
- Normalize pointer coordinates: `pointer.x = (e.clientX / width) * 2 - 1`, `pointer.y = -(e.clientY / height) * 2 + 1`.
- Avoid raycasting on every `mousemove` without throttling or spatial partitioning.
- Use lerping / damping for smooth camera and mesh rotations:
  ```javascript
  mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.05;
  ```

---

## 7. Shaders & Visual Effects
- Custom GLSL Shaders via `ShaderMaterial` or `RawShaderMaterial`.
- Pass uniforms (`uTime`, `uResolution`, `uMouse`, `uProgress`) updated per frame in the animation loop.
- Post-processing with `EffectComposer` (UnrealBloomPass, BokehPass, FXAAShader, SMAAPass, GlitchPass, LUTPass).

---

## 8. Anti-Patterns to Avoid
- ❌ Calling `new THREE.Vector3()` or `new THREE.Matrix4()` inside the render/animation loop (causes GC stutter).
- ❌ Loading duplicate textures without caching texture references.
- ❌ Not disposing geometries, textures, render targets, or materials on route changes.
- ❌ Unconstrained device pixel ratios (`window.devicePixelRatio > 2` kills mobile GPU).
- ❌ Relying on heavy polycount meshes when normal/bump maps can achieve identical visual fidelity.
