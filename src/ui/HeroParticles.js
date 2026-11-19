const randomBetween = (min, max) => min + Math.random() * (max - min);

export class HeroParticles {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hero-particles';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.context = this.canvas.getContext('2d');
    if (!this.context) return;

    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.time = 0;
    this.pointer = { x: -1, y: -1 };
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isVisible = true;
    this.frame = this.frame.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    container.append(this.canvas);
    container.addEventListener('pointermove', this.onPointerMove, { passive: true });
    container.addEventListener('pointerleave', this.onPointerLeave);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      this.updateAnimation();
    });
    this.intersectionObserver.observe(container);
    this.mutationObserver = new MutationObserver(() => {
      if (!container.isConnected) this.destroy();
    });
    const observationRoot = container.closest('#app') ?? document.body;
    this.mutationObserver.observe(observationRoot, { childList: true, subtree: true });

    this.resize();
    this.updateAnimation();
  }

  resize() {
    const bounds = this.container.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = bounds.width;
    this.height = bounds.height;
    this.canvas.width = Math.round(this.width * pixelRatio);
    this.canvas.height = Math.round(this.height * pixelRatio);
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    this.particles = [
      ...Array.from({ length: 9 }, () => ({
        type: 'smoke',
        x: randomBetween(0.35, 0.49),
        y: randomBetween(0.68, 0.83),
        drift: randomBetween(-0.15, 0.12),
        duration: randomBetween(2.4, 4.2),
        progress: randomBetween(0, 1),
        size: randomBetween(7, 17)
      })),
      ...Array.from({ length: 17 }, () => ({
        type: 'sparkle',
        x: randomBetween(0.08, 0.92),
        y: randomBetween(0.08, 0.68),
        velocityX: randomBetween(-0.008, 0.008),
        velocityY: randomBetween(-0.018, -0.005),
        phase: randomBetween(0, Math.PI * 2),
        size: randomBetween(1.2, 3.2)
      }))
    ];
    this.draw(0);
  }

  onPointerMove(event) {
    const bounds = this.container.getBoundingClientRect();
    this.pointer.x = (event.clientX - bounds.left) / bounds.width;
    this.pointer.y = (event.clientY - bounds.top) / bounds.height;
  }

  onPointerLeave() {
    this.pointer.x = -1;
    this.pointer.y = -1;
  }

  onVisibilityChange() {
    this.updateAnimation();
  }

  updateAnimation() {
    const shouldAnimate = !this.reducedMotion &&
      this.isVisible &&
      !document.hidden &&
      this.canvas.isConnected;
    if (shouldAnimate && !this.animationFrame) {
      this.lastTime = 0;
      this.animationFrame = requestAnimationFrame(this.frame);
    } else if (!shouldAnimate && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  frame(timestamp) {
    this.animationFrame = 0;
    if (this.reducedMotion || !this.isVisible || document.hidden || !this.canvas.isConnected) return;
    const delta = this.lastTime ? Math.min((timestamp - this.lastTime) / 1000, 0.05) : 0;
    this.lastTime = timestamp;
    this.time += delta;
    this.draw(delta);
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  draw(delta) {
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);

    for (const particle of this.particles) {
      if (particle.type === 'smoke') this.drawSmoke(particle, delta);
      else this.drawSparkle(particle, delta);
    }
  }

  drawSmoke(particle, delta) {
    particle.progress += delta / particle.duration;
    if (particle.progress >= 1) {
      particle.progress = 0;
      particle.x = randomBetween(0.35, 0.49);
      particle.y = randomBetween(0.72, 0.84);
      particle.drift = randomBetween(-0.15, 0.12);
    }

    const progress = particle.progress;
    const x = (particle.x + particle.drift * progress + Math.sin(this.time * 2 + particle.y * 10) * 0.012) * this.width;
    const y = (particle.y - progress * 0.2) * this.height;
    const radius = particle.size * (0.65 + progress * 1.15);
    const alpha = Math.sin(progress * Math.PI) * 0.13;
    const gradient = this.context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    this.context.fillStyle = gradient;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  drawSparkle(particle, delta) {
    particle.x += particle.velocityX * delta;
    particle.y += particle.velocityY * delta;
    if (particle.x < 0.04 || particle.x > 0.96) particle.velocityX *= -1;
    if (particle.y < 0.04 || particle.y > 0.75) particle.velocityY *= -1;

    const pointerDistance = Math.hypot(
      particle.x - this.pointer.x,
      particle.y - this.pointer.y
    );
    if (pointerDistance < 0.2) {
      particle.x += (particle.x - this.pointer.x) * delta * 0.12;
      particle.y += (particle.y - this.pointer.y) * delta * 0.12;
    }

    particle.phase += delta * 2.4;
    const opacity = 0.32 + (Math.sin(particle.phase) + 1) * 0.32;
    const size = particle.size * (1 + Math.max(0, 0.12 - pointerDistance) * 5);
    const x = particle.x * this.width;
    const y = particle.y * this.height;
    const arm = size * (1.7 + (Math.sin(particle.phase) + 1) * 0.35);

    this.context.strokeStyle = `rgba(255,255,255,${opacity})`;
    this.context.lineWidth = Math.max(1, size * 0.55);
    this.context.beginPath();
    this.context.moveTo(x - arm, y);
    this.context.lineTo(x + arm, y);
    this.context.moveTo(x, y - arm);
    this.context.lineTo(x, y + arm);
    this.context.stroke();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.canvas.remove();
  }
}
