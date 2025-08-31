/* ===== Modal “Ver boceto” ===== */
const openBtn = document.getElementById('verBoceto');
const modal = document.getElementById('modalBoceto');

function openModal() {
  modal.setAttribute('aria-hidden', 'false');
  // Bloqueo de scroll del body mientras el modal está abierto
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

openBtn.addEventListener('click', openModal);
modal.addEventListener('click', (e) => {
  if (e.target.dataset.close !== undefined || e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ===== Fondo con partículas suaves (Canvas) ===== */
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, DPR;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.width = Math.floor(innerWidth * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
}
resize();
addEventListener('resize', resize);

// Partículas
const N = 80;
const dots = [];
function rand(min, max) { return Math.random() * (max - min) + min; }

for (let i = 0; i < N; i++) {
  dots.push({
    x: rand(0, W),
    y: rand(0, H),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    r: rand(1.2, 2.4)
  });
}

let mouse = { x: W/2, y: H/2, active: false };
addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * DPR;
  mouse.y = (e.clientY - rect.top) * DPR;
  mouse.active = true;
});
addEventListener('mouseleave', () => mouse.active = false);

function step() {
  ctx.clearRect(0, 0, W, H);

  // Fondo degradado suave animado
  const t = Date.now() * 0.0002;
  const grad = ctx.createRadialGradient(
    W*0.3 + Math.sin(t)*80, H*0.3 + Math.cos(t)*60, 50,
    W*0.7, H*0.8, Math.max(W,H)
  );
  grad.addColorStop(0, 'rgba(255, 245, 230, 0.65)');
  grad.addColorStop(1, 'rgba(210, 230, 255, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Actualiza y dibuja partículas
  for (const p of dots) {
    p.x += p.vx; p.y += p.vy;

    // Repulsión leve del mouse
    if (mouse.active) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx*dx + dy*dy;
      const force = Math.min(60_000 / (d2 + 10), 0.8);
      p.vx += (dx / Math.sqrt(d2 + 0.1)) * force * 0.002;
      p.vy += (dy / Math.sqrt(d2 + 0.1)) * force * 0.002;
    }

    // Rebotan en bordes
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    // Arrastre suave
    p.vx *= 0.995; p.vy *= 0.995;

    // Dibujo
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
  }

  // Conectar puntos cercanos
  ctx.lineWidth = 1 * DPR;
  for (let i = 0; i < N; i++) {
    for (let j = i+1; j < N; j++) {
      const a = dots[i], b = dots[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 * DPR) {
        ctx.strokeStyle = `rgba(0,0,0,${1 - dist/(120*DPR)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}
step();
