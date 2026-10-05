/**
 * Cinematic Interactive Brain Web Element
 * High-performance 3D Parallax & Dual-Layer Particle Simulation Engine
 * Auto-disabled on mobile devices (<= 768px) for maximum performance and battery savings
 */

// ============================================================================
// 1. Particle Simulation Engine
// ============================================================================

class BrainParticleEngine {
  constructor({ bgCanvas, fgCanvas, options = {} }) {
    this.bgCanvas = bgCanvas;
    this.fgCanvas = fgCanvas;
    this.bgCtx = bgCanvas ? bgCanvas.getContext('2d', { alpha: true }) : null;
    this.fgCtx = fgCanvas ? fgCanvas.getContext('2d', { alpha: true }) : null;

    this.options = {
      particleDensity: options.particleDensity || 1.0,
      maxParticles: options.maxParticles || 240,
      mouseRepulsionRadius: options.mouseRepulsionRadius || 140,
      mouseRepulsionForce: options.mouseRepulsionForce || 1.8,
      reducedMotion: options.reducedMotion || false,
      ...options,
    };

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.brainBounds = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      scale: 1,
    };

    this.mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      active: false,
    };

    this.particles = [];
    this.orbitalParticles = [];
    this.lastTime = performance.now();
    this.isRunning = false;
    this.animId = null;

    // Fissure polyline nodes relative to brain bounds (0..1)
    this.fissurePoints = [
      { x: 0.28, y: 0.52 },
      { x: 0.35, y: 0.49 },
      { x: 0.42, y: 0.54 },
      { x: 0.48, y: 0.51 },
      { x: 0.55, y: 0.44 },
      { x: 0.62, y: 0.41 },
      { x: 0.70, y: 0.36 },
      { x: 0.76, y: 0.32 },
      { x: 0.81, y: 0.28 },
      { x: 0.40, y: 0.58 },
      { x: 0.45, y: 0.62 },
      { x: 0.52, y: 0.60 },
      { x: 0.60, y: 0.58 },
      { x: 0.66, y: 0.52 }
    ];

    this.colorPalette = [
      { r: 216, g: 180, b: 254 }, // Bright lavender white
      { r: 192, g: 132, b: 252 }, // Purple glow
      { r: 168, g: 85,  b: 247 }, // Electric violet
      { r: 147, g: 51,  b: 234 }, // Arcane magenta
      { r: 129, g: 140, b: 248 }, // Indigo spark
      { r: 56,  g: 189, b: 248 }, // Faint cyan shimmer
      { r: 255, g: 255, b: 255 }, // Pure star core
    ];

    this.initOrbitals();
  }

  initOrbitals() {
    this.orbitalParticles = [];
    const count = Math.floor(18 * this.options.particleDensity);
    for (let i = 0; i < count; i++) {
      this.orbitalParticles.push({
        angle: Math.random() * Math.PI * 2,
        speed: (0.003 + Math.random() * 0.005) * (Math.random() > 0.3 ? 1 : -1),
        radiusXFactor: 0.52 + Math.random() * 0.38,
        radiusYFactor: 0.28 + Math.random() * 0.26,
        tiltAngle: -0.35 + (Math.random() - 0.5) * 0.4,
        size: 1.2 + Math.random() * 1.8,
        color: this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)],
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        baseAlpha: 0.4 + Math.random() * 0.5,
      });
    }
  }

  resize(width, height, brainBounds) {
    this.width = width;
    this.height = height;
    this.brainBounds = brainBounds;

    const setupCanvas = (canvas, ctx) => {
      if (!canvas || !ctx) return;
      canvas.width = Math.floor(width * this.dpr);
      canvas.height = Math.floor(height * this.dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    };

    setupCanvas(this.bgCanvas, this.bgCtx);
    setupCanvas(this.fgCanvas, this.fgCtx);
  }

  updateBrainBounds(bounds) {
    this.brainBounds = bounds;
  }

  setMouse(x, y, active = true) {
    if (!active) {
      this.mouse.active = false;
      return;
    }
    this.mouse.targetX = x;
    this.mouse.targetY = y;
    this.mouse.active = true;
    if (this.mouse.x === -9999) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  setParticleDensity(multiplier) {
    this.options.particleDensity = multiplier;
    this.initOrbitals();
  }

  setReducedMotion(isReduced) {
    this.options.reducedMotion = isReduced;
  }

  spawnParticle() {
    const { width: bW, height: bH, x: bX, y: bY, centerX, centerY } = this.brainBounds;
    if (bW <= 0 || bH <= 0) return;

    const rand = Math.random();
    let type = 'crack';
    let x, y, vx, vy, zDepth, maxLife, size, color, isForeground;

    if (rand < 0.65) {
      // Crack Emitter: Emerges from purple fissures
      type = 'crack';
      const node = this.fissurePoints[Math.floor(Math.random() * this.fissurePoints.length)];
      const jitterX = (Math.random() - 0.5) * (bW * 0.06);
      const jitterY = (Math.random() - 0.5) * (bH * 0.06);
      
      x = bX + node.x * bW + jitterX;
      y = bY + node.y * bH + jitterY;

      const angle = -0.3 + (Math.random() - 0.4) * 1.6;
      const speed = 0.25 + Math.random() * 0.75;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed - 0.15;

      zDepth = (Math.random() - 0.3) * 40;
      isForeground = zDepth > 0;
      size = 0.8 + Math.random() * 2.2;
      maxLife = 160 + Math.random() * 180;
      color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];

    } else if (rand < 0.90) {
      // Silhouette Emitter: Distributed on outer contour
      type = 'silhouette';
      const theta = Math.random() * Math.PI * 2;
      const radiusX = (bW * 0.46) * (0.95 + Math.random() * 0.12);
      const radiusY = (bH * 0.42) * (0.95 + Math.random() * 0.12);

      x = centerX + Math.cos(theta) * radiusX;
      y = centerY + Math.sin(theta) * radiusY;

      const outwardSpeed = 0.15 + Math.random() * 0.5;
      vx = Math.cos(theta) * outwardSpeed + (Math.random() - 0.5) * 0.1;
      vy = Math.sin(theta) * outwardSpeed - 0.08;

      zDepth = (Math.random() - 0.5) * 60;
      isForeground = zDepth > 10;
      size = 0.7 + Math.random() * 1.8;
      maxLife = 180 + Math.random() * 220;
      color = this.colorPalette[Math.floor(Math.random() * 5)];

    } else {
      // Deep Background Mote
      type = 'depth_mote';
      const spreadX = bW * 0.9;
      const spreadY = bH * 0.8;
      x = centerX + (Math.random() - 0.5) * spreadX;
      y = centerY + (Math.random() - 0.5) * spreadY;
      vx = (Math.random() - 0.5) * 0.15;
      vy = -0.05 - Math.random() * 0.1;
      zDepth = -40 - Math.random() * 50;
      isForeground = false;
      size = 0.5 + Math.random() * 1.2;
      maxLife = 240 + Math.random() * 200;
      color = { r: 168, g: 85, b: 247 };
    }

    this.particles.push({
      x,
      y,
      originX: x,
      originY: y,
      vx,
      vy,
      zDepth,
      isForeground,
      type,
      size,
      currentSize: size,
      color,
      life: 0,
      maxLife,
      alpha: 0,
      sparkleFrequency: 0.03 + Math.random() * 0.05,
      sparklePhase: Math.random() * Math.PI * 2,
      isBrightBurst: Math.random() < 0.08,
      turbulenceOffset: Math.random() * 100,
    });
  }

  update(delta, time) {
    if (this.mouse.active) {
      this.mouse.vx = (this.mouse.targetX - this.mouse.x) * 0.12;
      this.mouse.vy = (this.mouse.targetY - this.mouse.y) * 0.12;
      this.mouse.x += this.mouse.vx;
      this.mouse.y += this.mouse.vy;
    }

    const effectiveMax = Math.floor(this.options.maxParticles * this.options.particleDensity);
    const spawnRate = this.options.reducedMotion ? 0.3 : (effectiveMax - this.particles.length > 30 ? 3 : 1);
    
    for (let s = 0; s < spawnRate; s++) {
      if (this.particles.length < effectiveMax) {
        this.spawnParticle();
      }
    }

    const repRadiusSq = this.options.mouseRepulsionRadius * this.options.mouseRepulsionRadius;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife;

      if (progress < 0.15) {
        p.alpha = (progress / 0.15);
      } else if (progress > 0.65) {
        p.alpha = (1 - (progress - 0.65) / 0.35);
      } else {
        p.alpha = 1.0;
      }

      const shimmer = Math.sin(time * p.sparkleFrequency + p.sparklePhase);
      p.alpha = Math.max(0, Math.min(1, p.alpha * (0.75 + 0.25 * shimmer)));

      if (p.isBrightBurst) {
        if (progress > 0.2 && progress < 0.5) {
          p.currentSize = p.size * (1.6 + 0.4 * shimmer);
          p.alpha = Math.min(1, p.alpha * 1.5);
        } else {
          p.currentSize = p.size;
        }
      }

      const turb = Math.sin(time * 0.002 + p.turbulenceOffset) * 0.12;
      p.x += p.vx + turb;
      p.y += p.vy;

      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < repRadiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / this.options.mouseRepulsionRadius) * this.options.mouseRepulsionForce;
          const nx = dx / dist;
          const ny = dy / dist;

          p.x += nx * force * 1.6 - ny * force * 0.8;
          p.y += ny * force * 1.6 + nx * force * 0.8;
        }
      }
    }

    if (!this.options.reducedMotion) {
      for (const orb of this.orbitalParticles) {
        orb.angle += orb.speed;
        orb.twinklePhase += orb.twinkleSpeed;
      }
    }
  }

  draw() {
    if (this.bgCtx) {
      this.bgCtx.clearRect(0, 0, this.width, this.height);
      this.bgCtx.globalCompositeOperation = 'lighter';
    }
    if (this.fgCtx) {
      this.fgCtx.clearRect(0, 0, this.width, this.height);
      this.fgCtx.globalCompositeOperation = 'lighter';
    }

    const { centerX, centerY, width: bW, height: bH } = this.brainBounds;

    // Draw 3D Orbital Particles
    if (bW > 0 && bH > 0) {
      for (const orb of this.orbitalParticles) {
        const cosA = Math.cos(orb.angle);
        const sinA = Math.sin(orb.angle);

        const radX = bW * orb.radiusXFactor;
        const radY = bH * orb.radiusYFactor;

        const localX = cosA * radX;
        const localY = sinA * radY;

        const cosTilt = Math.cos(orb.tiltAngle);
        const sinTilt = Math.sin(orb.tiltAngle);

        const rotatedX = localX * cosTilt - localY * sinTilt;
        const rotatedY = localX * sinTilt + localY * cosTilt;

        const posX = centerX + rotatedX;
        const posY = centerY + rotatedY;

        const z = sinA;
        const isFg = z > 0;
        const ctx = isFg ? this.fgCtx : this.bgCtx;
        if (!ctx) continue;

        const depthScale = isFg ? (1.0 + z * 0.35) : (0.7 + (z + 1) * 0.3);
        const twinkle = 0.8 + 0.2 * Math.sin(orb.twinklePhase);
        const alpha = Math.max(0.1, Math.min(1.0, orb.baseAlpha * twinkle * (isFg ? 0.95 : 0.45)));
        const finalSize = orb.size * depthScale;

        this.renderParticleDot(ctx, posX, posY, finalSize, orb.color, alpha, true);
      }
    }

    // Draw Emitter Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const ctx = p.isForeground ? this.fgCtx : this.bgCtx;
      if (!ctx) continue;

      this.renderParticleDot(
        ctx,
        p.x,
        p.y,
        p.currentSize,
        p.color,
        p.alpha * (p.isForeground ? 0.9 : 0.55),
        p.isBrightBurst || p.type === 'crack'
      );
    }
  }

  renderParticleDot(ctx, x, y, size, color, alpha, hasGlow = false) {
    if (alpha <= 0.01 || size <= 0.1) return;

    ctx.save();
    if (hasGlow && size > 1.2) {
      const glowRadius = size * 2.8;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.85})`);
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.35})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, size * 0.4), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime) => {
      if (!this.isRunning) return;
      const delta = Math.min((currentTime - this.lastTime) / 16.666, 3.0);
      this.lastTime = currentTime;

      this.update(delta, currentTime);
      this.draw();

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
    this.orbitalParticles = [];
  }
}

// ============================================================================
// 2. Main Hero UI Coordinator & Parallax Loop
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Page Transition Curtain Entry
  const curtain = document.getElementById('pageTransitionCurtain');
  if (curtain) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        curtain.classList.add('loaded');
      }, 50);
    });
  }

  // Smooth Page Transition on Navigation Links
  const transitionLinks = document.querySelectorAll('.transition-link');
  transitionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      if (!targetUrl || targetUrl.startsWith('#')) return;

      e.preventDefault();
      if (curtain) {
        curtain.classList.remove('loaded');
        curtain.classList.add('exiting');
      }
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 350);
    });
  });

  // DOM Elements
  const frontBrain = document.getElementById('frontBrain');
  const blurDepth = document.getElementById('blurDepth');
  const backGlow = document.getElementById('backGlow');
  const brainStage = document.getElementById('brainStage');
  const particlesWrapper = document.getElementById('particlesWrapper');
  const bgCanvas = document.getElementById('bgCanvas');
  const fgCanvas = document.getElementById('fgCanvas');

  // Check if device is a phone (<= 768px)
  const isPhoneScreen = () => window.innerWidth <= 768;

  let particleEngine = null;
  let animId = null;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    reducedMotion = e.matches;
    if (particleEngine) particleEngine.setReducedMotion(reducedMotion);
  });

  // Animation Physics State
  const animState = {
    targetRotX: 0,
    targetRotY: 0,
    targetTransX: 0,
    targetTransY: 0,
    targetScale: 1.0,

    currentRotX: 0,
    currentRotY: 0,
    currentTransX: 0,
    currentTransY: 0,
    currentScale: 1.0,

    time: 0,
    lastFrameTime: performance.now(),
  };

  const lerp = (start, end, factor) => start + (end - start) * factor;

  // 3D Physics Animation Loop
  const renderLoop = (currentTime) => {
    if (isPhoneScreen()) {
      animId = null;
      return;
    }

    const dt = Math.min((currentTime - animState.lastFrameTime) / 1000, 0.1);
    animState.lastFrameTime = currentTime;
    animState.time += dt;

    const t = animState.time;
    const isRed = reducedMotion;

    // Continuous floating & breathing
    const bobY = isRed ? 0 : Math.sin(t * 0.9) * 10 + Math.sin(t * 1.6) * 3;
    const bobX = isRed ? 0 : Math.cos(t * 0.7) * 5;
    const rollZ = isRed ? 0 : Math.sin(t * 0.6) * 1.8;
    const breatheScale = isRed ? 1.0 : 1.0 + Math.sin(t * 1.45) * 0.014;

    // Fluid damping interpolation
    const lerpFactor = 0.055;
    animState.currentRotX = lerp(animState.currentRotX, animState.targetRotX, lerpFactor);
    animState.currentRotY = lerp(animState.currentRotY, animState.targetRotY, lerpFactor);
    animState.currentTransX = lerp(animState.currentTransX, animState.targetTransX, lerpFactor);
    animState.currentTransY = lerp(animState.currentTransY, animState.targetTransY, lerpFactor);
    animState.currentScale = lerp(animState.currentScale, animState.targetScale, lerpFactor);

    const totalRotX = animState.currentRotX;
    const totalRotY = animState.currentRotY;
    const totalRotZ = rollZ + animState.currentRotY * 0.1;
    const totalTransX = animState.currentTransX + bobX;
    const totalTransY = animState.currentTransY + bobY;
    const finalScale = animState.currentScale * breatheScale;

    // Apply 3D Transforms to Layers
    if (frontBrain) {
      frontBrain.style.transform = `
        translate3d(${totalTransX.toFixed(2)}px, ${totalTransY.toFixed(2)}px, 0px)
        rotateX(${totalRotX.toFixed(2)}deg)
        rotateY(${totalRotY.toFixed(2)}deg)
        rotateZ(${totalRotZ.toFixed(2)}deg)
        scale(${finalScale.toFixed(4)})
      `;
    }

    if (blurDepth) {
      const backTransX = totalTransX * 0.85;
      const backTransY = totalTransY * 0.85;
      const backRotX = totalRotX * 0.9;
      const backRotY = totalRotY * 0.9;
      const backScale = finalScale * 1.04;

      blurDepth.style.transform = `
        translate3d(${backTransX.toFixed(2)}px, ${backTransY.toFixed(2)}px, -35px)
        rotateX(${backRotX.toFixed(2)}deg)
        rotateY(${backRotY.toFixed(2)}deg)
        rotateZ(${totalRotZ.toFixed(2)}deg)
        scale(${backScale.toFixed(4)})
      `;
    }

    if (backGlow) {
      const glowTransX = totalTransX * 0.6;
      const glowTransY = totalTransY * 0.6;
      const glowPulse = 0.85 + Math.sin(t * 1.8) * 0.15;

      backGlow.style.transform = `
        translate3d(${glowTransX.toFixed(2)}px, ${glowTransY.toFixed(2)}px, -60px)
        scale(${(finalScale * 1.15 * glowPulse).toFixed(3)})
      `;
      backGlow.style.opacity = '0.85';
    }

    animId = requestAnimationFrame(renderLoop);
  };

  const startBrainSystem = () => {
    if (isPhoneScreen()) return;

    if (!particleEngine) {
      particleEngine = new BrainParticleEngine({
        bgCanvas,
        fgCanvas,
        options: {
          particleDensity: 1.0,
          maxParticles: 240,
          reducedMotion,
        },
      });
    }

    particleEngine.start();
    updateSize();

    if (!animId) {
      animState.lastFrameTime = performance.now();
      animId = requestAnimationFrame(renderLoop);
    }
  };

  const stopBrainSystem = () => {
    if (particleEngine) {
      particleEngine.stop();
    }
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  // Resize Handler
  const updateSize = () => {
    if (isPhoneScreen()) {
      stopBrainSystem();
      return;
    }

    if (!particlesWrapper || !particleEngine) return;
    const rect = particlesWrapper.getBoundingClientRect();

    let brainBounds = {
      x: rect.width * 0.35,
      y: rect.height * 0.15,
      width: rect.width * 0.55,
      height: rect.height * 0.7,
      centerX: rect.width * 0.62,
      centerY: rect.height * 0.5,
    };

    if (brainStage) {
      const bRect = brainStage.getBoundingClientRect();
      brainBounds = {
        x: bRect.left - rect.left,
        y: bRect.top - rect.top,
        width: bRect.width,
        height: bRect.height,
        centerX: bRect.left - rect.left + bRect.width / 2,
        centerY: bRect.top - rect.top + bRect.height / 2,
      };
    }

    particleEngine.resize(rect.width, rect.height, brainBounds);
  };

  // Handle Resize across Phone / Desktop break
  window.addEventListener('resize', () => {
    if (isPhoneScreen()) {
      stopBrainSystem();
    } else {
      startBrainSystem();
      updateSize();
    }
  });

  // Mouse Parallax & Particle Tracking
  const handleMouseMove = (e) => {
    if (isPhoneScreen()) return;

    // 1. Particle interaction
    if (particlesWrapper && particleEngine) {
      const rect = particlesWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      particleEngine.setMouse(x, y, true);
    }

    // 2. 3D Parallax Tilt
    if (reducedMotion) return;
    const { innerWidth, innerHeight } = window;
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    const dist = Math.hypot(nx, ny);
    const depthFactor = 1.0 + Math.max(0, 0.4 - dist * 0.3);

    animState.targetRotX = -ny * 12 * depthFactor;
    animState.targetRotY = nx * 16 * depthFactor;
    animState.targetTransX = nx * 24;
    animState.targetTransY = ny * 18;
    animState.targetScale = 1.0 + (1 - Math.min(dist, 1)) * 0.025;
  };

  const handleMouseLeave = () => {
    if (particleEngine) particleEngine.setMouse(-9999, -9999, false);
    animState.targetRotX = 0;
    animState.targetRotY = 0;
    animState.targetTransX = 0;
    animState.targetTransY = 0;
    animState.targetScale = 1.0;
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mouseleave', handleMouseLeave);

  // IntersectionObserver to auto-pause loops when element is off-screen
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!isPhoneScreen()) {
          startBrainSystem();
        }
      } else {
        stopBrainSystem();
      }
    },
    { threshold: 0.05 }
  );

  if (particlesWrapper) observer.observe(particlesWrapper);

  // Initial startup on load if desktop
  if (!isPhoneScreen()) {
    startBrainSystem();
  }
});
