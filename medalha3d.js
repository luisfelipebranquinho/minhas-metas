// Minhas Metas — medalha 3D (joia), gerada por código com three.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const METAIS = {
  bronze: { cor: "#B87333", leve: "#E8B38A", rug: 0.26, acento: "#D9955B" },
  prata:  { cor: "#D6DCE2", leve: "#F4F7FA", rug: 0.16, acento: "#EEF2F5" },
  ouro:   { cor: "#E3B341", leve: "#FFE79A", rug: 0.18, acento: "#F2C94C" },
  negro:  { cor: "#2A2A2E", leve: "#55555C", rug: 0.12, acento: "#E3B341" },
  rose:   { cor: "#E2A285", leve: "#FFD9C6", rug: 0.17, acento: "#F0B89E" },
  rubi:   { cor: "#E3B341", leve: "#FFE79A", rug: 0.15, acento: "#F2C94C", esmalte: "#9E0B19" }
};

const PI = Math.PI;

/* ---------- texturas desenhadas em canvas (alta resolução para o zoom) ---------- */
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

function texturaFrente(spec, S) {
  const c = canvas(S, S), g = c.getContext("2d");
  const R = S / 2, px = v => v * R;           // coordenadas: disco de raio 1
  g.fillStyle = "#fff"; g.fillRect(0, 0, S, S);
  g.translate(R, R);

  // guilhochê no campo central (r < 0.66): ondas concêntricas + raios finos
  g.strokeStyle = "rgba(60,60,60,.55)"; g.lineWidth = Math.max(1, S / 1400);
  for (let k = 0; k < 110; k++) {
    const r0 = 0.06 + k * 0.0055; if (r0 > 0.655) break;
    g.beginPath();
    for (let i = 0; i <= 720; i++) {
      const t = i / 720 * 2 * PI;
      const r = r0 + 0.0045 * Math.sin(18 * t + k * 0.42);
      const x = px(r * Math.cos(t)), y = px(r * Math.sin(t));
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  g.strokeStyle = "rgba(90,90,90,.25)";
  for (let i = 0; i < 240; i++) {
    const t = i / 240 * 2 * PI;
    g.beginPath(); g.moveTo(px(0.05 * Math.cos(t)), px(0.05 * Math.sin(t))); g.lineTo(px(0.655 * Math.cos(t)), px(0.655 * Math.sin(t))); g.stroke();
  }

  // filetes que separam as faixas
  const anel = (r, w, cor) => { g.beginPath(); g.arc(0, 0, px(r), 0, 2 * PI); g.lineWidth = px(w); g.strokeStyle = cor; g.stroke(); };
  anel(0.665, 0.006, "#555"); anel(0.695, 0.003, "#777");
  anel(0.865, 0.003, "#777"); anel(0.885, 0.006, "#555");

  // microtexto (só aparece no zoom), entre 0.665 e 0.695
  const micro = `${spec.dono} · ${spec.codigo} · MINHAS METAS · `.toUpperCase();
  textoEmCirculo(g, micro.repeat(40), px(0.68), Math.round(px(0.0105)), "600", "#666", 0, 2 * PI, true);

  // texto principal da faixa (0.70 a 0.86), em quatro arcos separados por joias/estrelas
  const fs = Math.round(px(0.075));
  textoEmCirculo(g, "MINHAS METAS", px(0.775), fs, "800", "#3a3a3a", -PI / 2, 1.05);
  textoEmCirculo(g, spec.faixaNome.toUpperCase(), px(0.775), fs, "800", "#3a3a3a", PI, 1.15, false, true);
  textoEmCirculo(g, "OSS", px(0.775), fs, "800", "#3a3a3a", 0, 0.5, false, true);
  if (!spec.gemas) for (const a of [-PI / 4, -3 * PI / 4, PI / 4, 3 * PI / 4]) estrela(g, px(0.775 * Math.cos(a)), px(0.775 * Math.sin(a)), px(0.035), "#4a4a4a");

  // contas (pontilhado) na borda interna do aro
  g.fillStyle = "#666";
  for (let i = 0; i < 160; i++) { const t = i / 160 * 2 * PI; g.beginPath(); g.arc(px(0.935 * Math.cos(t)), px(0.935 * Math.sin(t)), px(0.006), 0, 2 * PI); g.fill(); }
  return c;
}

function texturaVerso(spec, S) {
  const c = canvas(S, S), g = c.getContext("2d"), R = S / 2, px = v => v * R;
  g.fillStyle = "#fff"; g.fillRect(0, 0, S, S); g.translate(R, R);
  // linhas concêntricas finas (acabamento escovado)
  g.strokeStyle = "rgba(80,80,80,.18)"; g.lineWidth = Math.max(1, S / 1600);
  for (let r = 0.02; r < 0.93; r += 0.004) { g.beginPath(); g.arc(0, 0, px(r), 0, 2 * PI); g.stroke(); }
  g.beginPath(); g.arc(0, 0, px(0.86), 0, 2 * PI); g.lineWidth = px(0.008); g.strokeStyle = "#555"; g.stroke();
  g.beginPath(); g.arc(0, 0, px(0.83), 0, 2 * PI); g.lineWidth = px(0.003); g.stroke();
  textoEmCirculo(g, `MEDALHA DE HONRA · ${spec.marcoNome.toUpperCase()} SEGUIDOS · `.repeat(3), px(0.9), Math.round(px(0.035)), "700", "#444", 0, 2 * PI, true);
  g.fillStyle = "#333"; g.textAlign = "center"; g.textBaseline = "middle";
  const linha = (t, y, tam, peso = "800", fonte = "Manrope") => { g.font = `${peso} ${Math.round(px(tam))}px ${fonte}, sans-serif`; g.fillText(t, 0, px(y)); };
  if (spec.bloqueada) {
    linha("AINDA NÃO", -0.12, 0.12, "700", "Fraunces");
    linha("CONQUISTADA", 0.04, 0.12, "700", "Fraunces");
    linha(`${spec.dias} dias seguidos em um desafio`, 0.24, 0.05, "600");
  } else {
    linha("CONQUISTADA POR", -0.38, 0.045, "700");
    linha(spec.dono, -0.24, 0.13, "700", "Fraunces");
    linha(`"${spec.titulo}"`.slice(0, 34), -0.06, 0.055, "600");
    linha(spec.data, 0.08, 0.06, "700");
    linha(spec.faixaNome.toUpperCase(), 0.22, 0.05, "800");
    linha(spec.codigo, 0.4, 0.06, "800");
  }
  return c;
}

function textoEmCirculo(g, txt, raio, tam, peso, cor, inicio, abertura, preencher, embaixo) {
  g.save(); g.fillStyle = cor; g.font = `${peso} ${tam}px Manrope, sans-serif`; g.textBaseline = "middle"; g.textAlign = "center";
  const letras = [...txt];
  const larg = letras.map(l => g.measureText(l).width + tam * 0.08);
  const total = larg.reduce((a, b) => a + b, 0);
  let ang = preencher ? 0 : total / raio;
  if (preencher) { const cabe = Math.floor(2 * PI * raio / (total / letras.length)); letras.length = Math.min(letras.length, cabe); }
  let a = preencher ? inicio : inicio + (embaixo ? ang / 2 : -ang / 2);
  for (let i = 0; i < letras.length; i++) {
    const w = larg[i] / raio;
    const m = embaixo ? a - w / 2 : a + w / 2;
    g.save(); g.rotate(m); g.translate(raio, 0); g.rotate(embaixo ? -PI / 2 : PI / 2);
    g.fillText(letras[i], 0, 0); g.restore();
    a = embaixo ? a - w : a + w;
  }
  g.restore();
}
function estrela(g, x, y, r, cor) {
  g.save(); g.translate(x, y); g.fillStyle = cor; g.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, t = -PI / 2 + i * PI / 5; i ? g.lineTo(rr * Math.cos(t), rr * Math.sin(t)) : g.moveTo(rr * Math.cos(t), rr * Math.sin(t)); }
  g.closePath(); g.fill(); g.restore();
}

// tecido do kimono/faixa: trama + cores (listras na faixa coral) + ponteira
function texturaTecido(cores, pont, ponteira, S = 512, vertical = true) {
  const c = canvas(S, S * 2), g = c.getContext("2d"), H = S * 2;
  const c1 = cores[0], c2 = cores[1] || cores[0];
  const blocos = cores.length > 1 ? 10 : 1;
  for (let i = 0; i < blocos; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(0, i * H / blocos, S, H / blocos + 1); }
  if (ponteira) {
    g.fillStyle = pont; g.fillRect(0, H * 0.58, S, H * 0.2);
  }
  // trama
  g.globalAlpha = 0.16;
  for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 0 : 3; x < S; x += 6) { g.fillStyle = "#000"; g.fillRect(x, y, 3, 3); }
  g.globalAlpha = 0.10; g.fillStyle = "#fff";
  for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < S; x += 6) g.fillRect(x, y + 1, 3, 1);
  // costuras
  g.globalAlpha = 0.35; g.strokeStyle = "#000"; g.setLineDash([10, 8]); g.lineWidth = 2;
  for (const x of [S * 0.12, S * 0.88]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.globalAlpha = 1;
  return c;
}

function tex(c, renderer, cor = true) {
  const t = new THREE.CanvasTexture(c);
  if (cor) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

/* ---------- geometria da medalha ---------- */
function montarMedalha(spec, renderer, descartar) {
  const M = METAIS[spec.metal];
  const grupo = new THREE.Group();
  const add = (geo, mat, pai = grupo) => { const m = new THREE.Mesh(geo, mat); pai.add(m); descartar.push(geo); return m; };
  const mat = o => { const m = new THREE.MeshPhysicalMaterial(o); descartar.push(m); return m; };

  const metal = mat({ color: M.cor, metalness: 1, roughness: M.rug, clearcoat: 0.6, clearcoatRoughness: 0.08 });
  const metalLeve = mat({ color: M.leve, metalness: 1, roughness: M.rug * 0.7, clearcoat: 0.8, clearcoatRoughness: 0.05 });
  const acento = mat({ color: M.acento, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 });

  const ESP = 0.11; // espessura do disco
  // disco com borda serrilhada (como moeda)
  const forma = new THREE.Shape();
  const N = 180;
  for (let i = 0; i <= N; i++) { const t = i / N * 2 * PI, r = i % 2 ? 0.992 : 1.0; i ? forma.lineTo(r * Math.cos(t), r * Math.sin(t)) : forma.moveTo(r, 0); }
  const disco = new THREE.ExtrudeGeometry(forma, { depth: ESP, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 4, curveSegments: 4 });
  disco.translate(0, 0, -ESP / 2);
  add(disco, metal);

  // face da frente e verso com gravações (mapa de cor + relevo)
  const S = Math.min(4096, renderer.capabilities.maxTextureSize, 2048 * Math.min(2, Math.ceil(window.devicePixelRatio || 1)));
  const cf = texturaFrente(spec, S), cv = texturaVerso(spec, S);
  const tf = tex(cf, renderer), tfb = tex(cf, renderer, false), tv = tex(cv, renderer), tvb = tex(cv, renderer, false);
  descartar.push(tf, tfb, tv, tvb);
  const zFrente = ESP / 2 + 0.0185;
  const faceF = mat({ color: M.cor, metalness: 1, roughness: M.rug, map: tf, bumpMap: tfb, bumpScale: 3, clearcoat: 0.7, clearcoatRoughness: 0.06 });
  add(new THREE.CircleGeometry(0.985, 128), faceF).position.z = zFrente;
  const faceV = mat({ color: M.cor, metalness: 1, roughness: M.rug + 0.05, map: tv, bumpMap: tvb, bumpScale: 2.5, clearcoat: 0.5 });
  const v = add(new THREE.CircleGeometry(0.985, 128), faceV); v.position.z = -zFrente; v.rotation.y = PI;

  // esmalte vermelho translúcido sobre o guilhochê (medalha de 1 ano)
  if (M.esmalte) {
    const esm = mat({ color: M.esmalte, metalness: 0, roughness: 0.05, transmission: 0.55, thickness: 0.05, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.02, attenuationColor: M.esmalte, attenuationDistance: 0.2, transparent: true, opacity: 0.92 });
    add(new THREE.CircleGeometry(0.66, 128), esm).position.z = zFrente + 0.004;
  }

  // aros em relevo
  const aro = (r, tubo, z, m) => add(new THREE.TorusGeometry(r, tubo, 24, 220), m).position.z = z;
  aro(0.955, 0.022, zFrente + 0.004, metalLeve);
  aro(0.885, 0.010, zFrente + 0.002, metal);
  aro(0.665, 0.012, zFrente + 0.003, metalLeve);
  aro(0.955, 0.022, -zFrente - 0.004, metalLeve);

  // contas (bolinhas) em volta
  const conta = new THREE.SphereGeometry(0.012, 12, 8); descartar.push(conta);
  const contas = new THREE.InstancedMesh(conta, acento, 120); const d = new THREE.Object3D();
  for (let i = 0; i < 120; i++) { const t = i / 120 * 2 * PI; d.position.set(0.918 * Math.cos(t), 0.918 * Math.sin(t), zFrente + 0.004); d.updateMatrix(); contas.setMatrixAt(i, d.matrix); }
  grupo.add(contas);

  // ramos de louro
  const folha = new THREE.SphereGeometry(1, 20, 12); descartar.push(folha);
  const caule = (lado) => {
    const pts = []; for (let i = 0; i <= 30; i++) { const th = (12 + i * 4.6) * PI / 180; pts.push(new THREE.Vector3(lado * 0.55 * Math.sin(th), -0.55 * Math.cos(th), zFrente + 0.012)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.007, 8), acento);
  };
  caule(-1); caule(1);
  for (const lado of [-1, 1]) for (let i = 0; i < 10; i++) {
    const th = (16 + i * 13) * PI / 180;
    for (const lad of [-1, 1]) {
      const r = 0.55 + lad * 0.035;
      const f = add(folha, acento);
      f.scale.set(0.058 - i * 0.0018, 0.022, 0.012);
      f.position.set(lado * r * Math.sin(th), -r * Math.cos(th), zFrente + 0.018);
      f.rotation.z = (lado > 0 ? th : -th) + lad * lado * 0.55 + (lado > 0 ? 0 : PI);
      f.rotation.x = 0.25 * lad;
    }
  }

  // estrela no topo do campo
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? 0.034 : 0.085, t = PI / 2 + i * PI / 5; i ? sh.lineTo(rr * Math.cos(t), rr * Math.sin(t)) : sh.moveTo(rr * Math.cos(t), rr * Math.sin(t)); }
  const est = add(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3 }), acento);
  est.position.set(0, 0.47, zFrente + 0.004);

  // nó da faixa de jiu-jítsu, em tecido
  const tecido = (ponteira) => {
    const t = tex(texturaTecido(spec.cores, spec.pont, ponteira), renderer); descartar.push(t);
    return mat({ color: "#ffffff", map: t, roughness: 0.92, metalness: 0, sheen: 0.35, sheenRoughness: 0.6, sheenColor: "#9aa4b5", bumpMap: t, bumpScale: 2 });
  };
  const tecLiso = tecido(false), tecPonta = tecido(true);
  const zN = zFrente + 0.05;
  const faixa = add(new RoundedBoxGeometry(0.98, 0.14, 0.05, 4, 0.02), tecLiso); faixa.position.set(0, 0.02, zN);
  for (const lado of [-1, 1]) {
    const rabo = add(new RoundedBoxGeometry(0.13, 0.44, 0.045, 4, 0.018), tecPonta);
    rabo.position.set(lado * 0.1, -0.2, zN + 0.01); rabo.rotation.z = lado * 0.42;
    // graus (fitas brancas) na ponteira
    if (spec.graus) for (let k = 0; k < spec.graus; k++) {
      const gr = add(new RoundedBoxGeometry(0.135, 0.012, 0.05, 2, 0.004), mat({ color: "#f4f1ea", roughness: 0.7, sheen: 1 }), rabo);
      gr.position.set(0, -0.06 - k * 0.025, 0.002);
    }
  }
  const no = add(new RoundedBoxGeometry(0.2, 0.25, 0.09, 5, 0.04), tecLiso); no.position.set(0, 0.02, zN + 0.025);
  const volta = add(new RoundedBoxGeometry(0.21, 0.07, 0.1, 4, 0.03), tecLiso); volta.position.set(0, 0.06, zN + 0.035); volta.rotation.z = -0.35;

  // gemas lapidadas (brilhante) com engaste
  if (spec.gemas) {
    const perfil = [new THREE.Vector2(0, -0.05), new THREE.Vector2(0.046, -0.004), new THREE.Vector2(0.05, 0), new THREE.Vector2(0.05, 0.006), new THREE.Vector2(0.03, 0.022), new THREE.Vector2(0, 0.022)];
    const gema = new THREE.LatheGeometry(perfil, 16); descartar.push(gema);
    const rubi = mat({ color: "#ff1f3d", emissive: "#5a0010", emissiveIntensity: 0.6, metalness: 0, roughness: 0, transmission: 0.55, ior: 1.77, thickness: 0.05, attenuationColor: "#ff3048", attenuationDistance: 0.4, specularIntensity: 1, specularColor: "#ffffff", clearcoat: 1, clearcoatRoughness: 0, iridescence: 0.35, flatShading: true, envMapIntensity: 3 });
    for (const a of [PI / 4, 3 * PI / 4, -PI / 4, -3 * PI / 4]) {
      const x = 0.775 * Math.cos(a), y = 0.775 * Math.sin(a);
      const gm = add(gema, rubi); gm.rotation.x = PI / 2; gm.position.set(x, y, zFrente + 0.03);
      const eng = add(new THREE.TorusGeometry(0.055, 0.011, 12, 40), acento); eng.position.set(x, y, zFrente + 0.022);
      for (let k = 0; k < 4; k++) { const ga = add(new THREE.SphereGeometry(0.009, 8, 6), acento); const t = k * PI / 2 + PI / 4; ga.position.set(x + 0.052 * Math.cos(t), y + 0.052 * Math.sin(t), zFrente + 0.04); }
    }
  }

  // faixa (banner) com o marco
  const bn = new THREE.Shape();
  bn.moveTo(-0.62, 0.09); bn.lineTo(0.62, 0.09); bn.lineTo(0.54, 0); bn.lineTo(0.62, -0.09); bn.lineTo(-0.62, -0.09); bn.lineTo(-0.54, 0); bn.closePath();
  const ban = add(new THREE.ExtrudeGeometry(bn, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 }), metalLeve);
  ban.position.set(0, -0.79, zFrente + 0.01);
  const ct = canvas(1024, 160), cg = ct.getContext("2d");
  cg.fillStyle = "#2b2b2b"; cg.font = "800 104px Manrope, sans-serif"; cg.textAlign = "center"; cg.textBaseline = "middle";
  cg.fillText(spec.marcoNome.toUpperCase(), 512, 84);
  const tt = tex(ct, renderer); descartar.push(tt);
  const txt = add(new THREE.PlaneGeometry(1.0, 0.156), mat({ map: tt, transparent: true, metalness: 0.6, roughness: 0.3 }));
  txt.position.set(0, -0.79, zFrente + 0.045);

  // argola, passador e fita
  const arg = add(new THREE.TorusGeometry(0.075, 0.02, 20, 48), metalLeve); arg.position.set(0, 1.07, 0); arg.rotation.y = PI / 2;
  const pas = add(new RoundedBoxGeometry(0.62, 0.1, 0.06, 4, 0.025), metal); pas.position.set(0, 1.19, 0);
  const tFita = tex(texturaTecido(spec.cores, spec.pont, true, 512), renderer); descartar.push(tFita);
  tFita.wrapS = tFita.wrapT = THREE.RepeatWrapping;
  const matFita = mat({ map: tFita, color: "#ffffff", roughness: 0.75, sheen: 0.6, sheenRoughness: 0.35, sheenColor: "#c9c2b0", side: THREE.DoubleSide, bumpMap: tFita, bumpScale: 1.5 });
  for (const lado of [-1, 1]) {
    const geo = new THREE.PlaneGeometry(0.36, 1.35, 4, 24);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, 0.04 * Math.sin((y + 0.67) * 2.6) * lado - 0.02); }
    geo.computeVertexNormals();
    const fita = add(geo, matFita);
    fita.position.set(lado * 0.2, 1.8, -0.02 * lado); fita.rotation.z = lado * 0.3;
  }
  return grupo;
}

/* ---------- visualizador ---------- */
export function abrirVisualizador(alvo, spec, aoFechar) {
  const descartar = [];
  const renderer = new THREE.WebGLRenderer({ canvas: alvo, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  cena.environment = ambiente;
  const luz = new THREE.DirectionalLight("#fff6e0", 1.6); luz.position.set(2, 3, 4); cena.add(luz);
  const luz2 = new THREE.DirectionalLight("#cfe2ff", 0.6); luz2.position.set(-3, -1, 2); cena.add(luz2);
  const brilho = new THREE.PointLight("#ffffff", 3, 6); brilho.position.set(0.8, 0.9, 1.6); cena.add(brilho);

  const medalha = montarMedalha(spec, renderer, descartar);
  cena.add(medalha);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
  camera.position.set(0, 0.35, 5.6);
  const ctr = new OrbitControls(camera, alvo);
  ctr.target.set(0, 0.35, 0);
  ctr.enableDamping = true; ctr.dampingFactor = 0.08;
  ctr.enablePan = false; ctr.minDistance = 1.15; ctr.maxDistance = 9;
  ctr.rotateSpeed = 0.8; ctr.zoomSpeed = 1.1;
  ctr.autoRotate = true; ctr.autoRotateSpeed = 1.6;
  ctr.addEventListener("start", () => { ctr.autoRotate = false; });

  function ajustar() {
    const w = alvo.clientWidth, h = alvo.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 0.7 ? 6.6 : 5.6;
    camera.updateProjectionMatrix();
  }
  ajustar();
  const ro = new ResizeObserver(ajustar); ro.observe(alvo);

  let vivo = true;
  renderer.setAnimationLoop(() => { if (!vivo) return; ctr.update(); renderer.render(cena, camera); });

  return {
    resetar() { ctr.reset(); camera.position.set(0, 0.35, camera.position.z); ctr.target.set(0, 0.35, 0); ctr.autoRotate = true; },
    fechar() {
      vivo = false; renderer.setAnimationLoop(null); ro.disconnect(); ctr.dispose();
      descartar.forEach(x => x.dispose && x.dispose()); ambiente.dispose(); pmrem.dispose();
      renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
      aoFechar && aoFechar();
    }
  };
}
