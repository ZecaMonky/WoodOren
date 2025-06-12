document.addEventListener('DOMContentLoaded', function() {
  const leftArrow = document.querySelector('.collections-scroll-arrow.left');
  const rightArrow = document.querySelector('.collections-scroll-arrow.right');
  const scrollContainer = document.querySelector('.collections-scroll');

  if (leftArrow && rightArrow && scrollContainer) {
    leftArrow.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    rightArrow.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const dust = document.querySelector('.hero-dust');
  if (!dust) return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  dust.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particles = Array.from({length: 18}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.7,
    r: Math.random() * 2 + 1,
    a: Math.random() * 2 * Math.PI,
    s: Math.random() * 0.5 + 0.2
  }));
  function resize() {
    canvas.width = dust.offsetWidth;
    canvas.height = dust.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let p of particles) {
      ctx.save();
      ctx.globalAlpha = 0.18 + Math.sin(Date.now()/800 + p.a) * 0.12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
      p.x += Math.sin(p.a) * p.s;
      p.y -= p.s * 0.5;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
}); 