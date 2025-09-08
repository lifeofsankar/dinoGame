// Simple Dino runner clone
(() => {
  const dino = document.getElementById('dino');
  const game = document.getElementById('game');
  const scoreEl = document.getElementById('score');

  let isJumping = false;
  let velocity = 0;
  const gravity = 0.9;
  const jumpPower = 14;
  let obstacles = [];
  let lastTime = null;
  let spawnTimer = 0;
  let score = 0;
  let speed = 4;
  let running = true;

  function start() {
    lastTime = performance.now();
    obstacles = [];
    spawnTimer = 0;
    score = 0;
    speed = 4;
    running = true;
    dino.style.bottom = '32px';
    dino.classList.add('run');
    requestAnimationFrame(loop);
  }

  function gameOver() {
    running = false;
    dino.classList.remove('run');
    showOverlay('Game Over', 'Restart', start);
  }

  function showOverlay(title, btnText, btnAction) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div>${title}</div>`;
    const btn = document.createElement('button');
    btn.textContent = btnText;
    btn.onclick = () => {
      overlay.remove();
      btnAction();
    };
    overlay.appendChild(btn);
    const hint = document.createElement('small');
    hint.textContent = 'Press SPACE / UP to jump';
    overlay.appendChild(hint);
    game.appendChild(overlay);
  }

  function spawnObstacle() {
    const c = document.createElement('div');
    c.className = 'cactus';
    const size = 18 + Math.random() * 24;
    c.style.width = `${size}px`;
    c.style.height = `${18 + Math.random() * 36}px`;
    c.style.right = '-40px';
    game.appendChild(c);
    obstacles.push({el: c, x: game.clientWidth});
  }

  function loop(now) {
    if (!running) return;
    const dt = (now - lastTime) / 16.6667; // approx frames
    lastTime = now;

    // spawn logic
    spawnTimer += dt;
    if (spawnTimer > 80 + Math.random() * 120) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed * dt;
      o.el.style.right = `${game.clientWidth - o.x}px`;
      if (o.x < -60) {
        o.el.remove();
        obstacles.splice(i, 1);
        score += 10;
        if (score % 100 === 0) speed += 0.5;
      } else {
        // collision check
        const dinoRect = dino.getBoundingClientRect();
        const obsRect = o.el.getBoundingClientRect();
        if (rectsOverlap(dinoRect, obsRect)) {
          gameOver();
          return;
        }
      }
    }

    // jump physics
    if (isJumping) {
      velocity -= gravity * dt * 0.6;
      let bottom = parseFloat(dino.style.bottom);
      bottom += velocity;
      if (bottom <= 32) {
        bottom = 32;
        isJumping = false;
        velocity = 0;
      }
      dino.style.bottom = bottom + 'px';
    }

    scoreEl.textContent = Math.floor(score);

    requestAnimationFrame(loop);
  }

  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function jump() {
    if (!running) return;
    if (!isJumping) {
      isJumping = true;
      velocity = jumpPower;
      dino.classList.remove('run');
    }
  }

  // controls
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
    if (e.code === 'KeyR' && !running) {
      start();
    }
  });

  // touch for mobile
  game.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!running) start();
    jump();
  }, {passive:false});

  // initial overlay
  showOverlay('Dino Runner', 'Start', start);
})();
