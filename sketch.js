let jogador;
let tiros = [];
let obstaculos = [];
let chefe;
let vidaJogador = 100;
let jogoVencido = false;
let tirosInimigos = [];

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  jogador = new Jogador();
  chefe = new Chefe();
}

function draw() {
  // FUNDO RGB DINÂMICO
  let r = map(sin(frameCount * 0.05), -1, 1, 100, 255);
  let g = map(sin(frameCount * 0.05 + TWO_PI / 3), -1, 1, 100, 255);
  let b = map(sin(frameCount * 0.05 + (2 * TWO_PI) / 3), -1, 1, 100, 255);
  background(r, g, b);

  if (jogoVencido) {
    fill(0, 255, 0);
    textSize(32);
    text("Você venceu, parabéns! 🎉", width / 2, height / 2);
    return;
  }

  if (!chefe.estaMorto()) {
    chefe.atualizar();
    chefe.mostrar();
    chefe.mostrarBarraVida();
  } else {
    jogoVencido = true;
  }

  jogador.atualizar();
  jogador.mostrar();
  desenharBarraVidaJogador();

  if (frameCount % 20 === 0) {
    obstaculos.push(new Obstaculo());
  }

  if (frameCount % 5 === 0 && !chefe.estaMorto()) {
    tirosInimigos.push(new TiroInimigo(chefe.x, chefe.y + chefe.altura / 2));
  }

  for (let i = obstaculos.length - 1; i >= 0; i--) {
    let obs = obstaculos[i];
    obs.atualizar();
    obs.mostrar();

    if (obs.acerta(jogador)) {
      vidaJogador -= 10;
      obstaculos.splice(i, 1);
      continue;
    }

    for (let j = tiros.length - 1; j >= 0; j--) {
      if (obs.acertaTiro(tiros[j])) {
        tiros.splice(j, 1);
        break;
      }
    }
  }

  for (let i = tirosInimigos.length - 1; i >= 0; i--) {
    tirosInimigos[i].atualizar();
    tirosInimigos[i].mostrar();

    if (tirosInimigos[i].foraDaTela()) {
      tirosInimigos.splice(i, 1);
      continue;
    }

    if (tirosInimigos[i].acerta(jogador)) {
      vidaJogador -= 20;
      tirosInimigos.splice(i, 1);
    }

    for (let j = tiros.length - 1; j >= 0; j--) {
      if (tirosInimigos[i].acertaTiro(tiros[j])) {
        tiros.splice(j, 1);
        break;
      }
    }
  }

  for (let i = tiros.length - 1; i >= 0; i--) {
    tiros[i].atualizar();
    tiros[i].mostrar();

    if (tiros[i].foraDaTela()) {
      tiros.splice(i, 1);
      continue;
    }

    if (!chefe.estaMorto() && tiros[i].acertaChefe(chefe)) {
      chefe.receberDano(10);
      tiros.splice(i, 1);
      continue;
    }
  }

  if (!chefe.estaMorto() && chefe.acerta(jogador)) {
    vidaJogador -= 20;
    if (vidaJogador <= 0) {
      vidaJogador = 0;
      noLoop();
      fill(255, 0, 0);
      textSize(32);
      text("Fim de Jogo 💀", width / 2, height / 2);
    }
  }

  if (vidaJogador <= 0) {
    vidaJogador = 0;
    noLoop();
    fill(255, 0, 0);
    textSize(32);
    text("Fim de Jogo 💀", width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === 'R' || key === 'r') {
    tiros.push(new Tiro(jogador.x, jogador.y));
  }
}

function desenharBarraVidaJogador() {
  fill(255);
  rect(20, height - 30, 200, 20);

  if (vidaJogador <= 0) {
    fill(255);
  } else {
    fill(0, 255, 0);
  }
  rect(20, height - 30, map(vidaJogador, 0, 100, 0, 200), 20);
}

// ---------------------- CLASSES ----------------------

class Jogador {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.largura = 40;
    this.altura = 50;
    this.velocidade = 5;
  }

  atualizar() {
    if (keyIsDown(LEFT_ARROW) && this.x - this.largura / 2 > 0) this.x -= this.velocidade;
    if (keyIsDown(RIGHT_ARROW) && this.x + this.largura / 2 < width) this.x += this.velocidade;
    if (keyIsDown(UP_ARROW) && this.y - this.altura / 2 > 0) this.y -= this.velocidade;
    if (keyIsDown(DOWN_ARROW) && this.y + this.altura / 2 < height) this.y += this.velocidade;
  }

  mostrar() {
    textSize(32);
    text("🍇", this.x, this.y);
  }
}

class Tiro {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.raio = 5;
    this.velocidade = 7;
  }

  atualizar() {
    this.y -= this.velocidade;
  }

  mostrar() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.raio * 2);
  }

  foraDaTela() {
    return this.y < 0;
  }

  acertaChefe(chefe) {
    return (
      this.x > chefe.x - chefe.largura / 2 &&
      this.x < chefe.x + chefe.largura / 2 &&
      this.y > chefe.y - chefe.altura / 2 &&
      this.y < chefe.y + chefe.altura / 2
    );
  }
}

class Obstaculo {
  constructor() {
    this.x = random(30, width - 30);
    this.y = -40;
    this.largura = 50;
    this.altura = 50;
    this.velocidade = 5;
  }

  atualizar() {
    this.y += this.velocidade;
  }

  mostrar() {
    textSize(32);
    text("🦠", this.x, this.y);
  }

  acerta(jogador) {
    return (
      jogador.x + jogador.largura / 2 > this.x - this.largura / 2 &&
      jogador.x - jogador.largura / 2 < this.x + this.largura / 2 &&
      jogador.y + jogador.altura / 2 > this.y - this.altura / 2 &&
      jogador.y - jogador.altura / 2 < this.y + this.altura / 2
    );
  }

  acertaTiro(tiro) {
    return (
      tiro.x > this.x - this.largura / 2 &&
      tiro.x < this.x + this.largura / 2 &&
      tiro.y > this.y - this.altura / 2 &&
      tiro.y < this.y + this.altura / 2
    );
  }
}

class Chefe {
  constructor() {
    this.x = width / 2;
    this.y = 50;
    this.largura = 200;
    this.altura = 80;
    this.velocidade = 5;
    this.direcao = 1;
    this.vida = 300;

    setInterval(() => {
      this.velocidade = random(5, 8);
    }, 2000);
  }

  atualizar() {
    this.x += this.velocidade * this.direcao;
    if (this.x + this.largura / 2 > width || this.x - this.largura / 2 < 0) {
      this.direcao *= -1;
    }
  }

  mostrar() {
    textSize(64);
    text("👾", this.x, this.y);
  }

  mostrarBarraVida() {
    fill(255);
    rect(width / 2 - 100, 10, 200, 10);
    fill(255, 0, 0);
    rect(width / 2 - 100, 10, map(this.vida, 0, 300, 0, 200), 10);
  }

  receberDano(dano) {
    this.vida -= dano;
  }

  estaMorto() {
    return this.vida <= 0;
  }

  acerta(jogador) {
    return (
      jogador.x + jogador.largura / 2 > this.x - this.largura / 2 &&
      jogador.x - jogador.largura / 2 < this.x + this.largura / 2 &&
      jogador.y + jogador.altura / 2 > this.y - this.altura / 2 &&
      jogador.y - jogador.altura / 2 < this.y + this.altura / 2
    );
  }
}

class TiroInimigo {
  constructor(x, y) {
    this.x = x + random(-80, 80);
    this.y = y;
    this.raio = 8;
    this.velocidade = 6;
  }

  atualizar() {
    this.y += this.velocidade;
  }

  mostrar() {
    textSize(24);
    text("🦠", this.x, this.y);
  }

  foraDaTela() {
    return this.y > height;
  }

  acerta(jogador) {
    return (
      this.x > jogador.x - jogador.largura / 2 &&
      this.x < jogador.x + jogador.largura / 2 &&
      this.y > jogador.y - jogador.altura / 2 &&
      this.y < jogador.y + jogador.altura / 2
    );
  }

  acertaTiro(tiro) {
    return dist(this.x, this.y, tiro.x, tiro.y) < this.raio + tiro.raio;
  }
}
