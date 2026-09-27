import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function smoothRectangle(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = width / 2 - radius;
  const y = height / 2 - radius;
  // Superellipse corners equivalent to CSS corner-shape: superellipse(1.5).
  // Their curvature eases into the straight edges instead of meeting a circle.
  const power = 2 / 2 ** 1.5;
  const signedPower = (value: number) => Math.sign(value) * Math.abs(value) ** power;
  const centers = [[x, y], [-x, y], [-x, -y], [x, -y]];
  centers.forEach(([cx, cy], corner) => {
    for (let step = 0; step <= 48; step++) {
      const angle = (corner + step / 48) * Math.PI / 2;
      const px = cx + radius * signedPower(Math.cos(angle));
      const py = cy + radius * signedPower(Math.sin(angle));
      if (corner === 0 && step === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    }
  });
  shape.closePath();
  return shape;
}

export function createPhoneScene(
  canvas: HTMLCanvasElement,
  callbacks: { onReady: () => void; onError: () => void },
) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.5, 3.5, 3.5, -3.5, 0.1, 100);
  camera.position.z = 12;
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentMap.texture;
  environment.dispose();
  pmrem.dispose();

  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(-3, 5, 8);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xe5edff, 2);
  rimLight.position.set(4, 1, -2);
  scene.add(rimLight);

  const phone = new THREE.Group();
  scene.add(phone);
  const casing = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.3,
    envMapIntensity: 0.8,
  });
  const bodyGeometry = new THREE.ExtrudeGeometry(smoothRectangle(2.93, 6.17, 0.76), {
    depth: 0.24,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 8,
    steps: 1,
    curveSegments: 24,
  });
  bodyGeometry.translate(0, 0, -0.12);
  phone.add(new THREE.Mesh(bodyGeometry, casing));

  const bezel = new THREE.Mesh(
    new THREE.ShapeGeometry(smoothRectangle(2.85, 6.09, 0.72)),
    new THREE.MeshBasicMaterial({ color: 0x090a0c }),
  );
  bezel.position.z = 0.158;
  phone.add(bezel);

  // Keep the supplied screenshot's aspect ratio; only its black corners are masked.
  const screenHeight = 6;
  const screenWidth = screenHeight * (1206 / 2622);
  const screenGeometry = new THREE.ShapeGeometry(smoothRectangle(screenWidth, screenHeight, 0.675));
  const positions = screenGeometry.getAttribute("position");
  const uv = screenGeometry.getAttribute("uv");
  for (let i = 0; i < positions.count; i++) {
    uv.setXY(i, positions.getX(i) / screenWidth + 0.5, positions.getY(i) / screenHeight + 0.5);
  }

  let disposed = false;
  let loaded = false;
  let visible = true;
  let frame = 0;
  let previousTime = 0;
  const rest = { x: -0.035, y: -0.19 };
  const target = { ...rest };
  phone.rotation.set(rest.x, rest.y, -0.025);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const texture = new THREE.TextureLoader().load(
    "/images/cmra-screen.png",
    () => {
      if (disposed) return;
      loaded = true;
      render();
      callbacks.onReady();
    },
    undefined,
    () => { if (!disposed) callbacks.onError(); },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const screen = new THREE.Mesh(screenGeometry, new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  screen.position.z = 0.164;
  phone.add(screen);

  function render() {
    if (!disposed && visible && !document.hidden) renderer.render(scene, camera);
  }

  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = time;
    const ease = 1 - Math.exp(-7 * delta);
    phone.rotation.x += (target.x - phone.rotation.x) * ease;
    phone.rotation.y += (target.y - phone.rotation.y) * ease;
    render();
    if (Math.abs(target.x - phone.rotation.x) + Math.abs(target.y - phone.rotation.y) > 0.0001) {
      frame = requestAnimationFrame(tick);
    }
  }

  function schedule() {
    if (!frame && loaded && visible && !document.hidden && !disposed) {
      previousTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function move(event: PointerEvent) {
    if (motion.matches || !pointer.matches || event.pointerType !== "mouse") return;
    const x = THREE.MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
    const y = THREE.MathUtils.clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
    target.y = rest.y + x * 0.23;
    target.x = rest.x + y * 0.09;
    schedule();
  }

  function reset() {
    target.x = rest.x;
    target.y = rest.y;
    if (motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      phone.rotation.x = rest.x;
      phone.rotation.y = rest.y;
      render();
    } else schedule();
  }

  const container = canvas.parentElement!;
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    // Fit the entire phone at either aspect ratio, leaving space for its tilt.
    const halfView = Math.max(3.5, 1.95 / aspect);
    camera.left = -halfView * aspect;
    camera.right = halfView * aspect;
    camera.top = halfView;
    camera.bottom = -halfView;
    camera.updateProjectionMatrix();
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { render(); schedule(); }
  });
  intersection.observe(container);
  function visibility() {
    if (!document.hidden) { render(); schedule(); }
  }
  function contextLost(event: Event) {
    event.preventDefault();
    callbacks.onError();
  }
  function contextRestored() {
    resize();
    if (loaded) callbacks.onReady();
  }

  resize();
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", visibility);
  motion.addEventListener("change", reset);
  pointer.addEventListener("change", reset);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    intersection.disconnect();
    window.removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", reset);
    window.removeEventListener("blur", reset);
    document.removeEventListener("visibilitychange", visibility);
    motion.removeEventListener("change", reset);
    pointer.removeEventListener("change", reset);
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", contextRestored);
    const materials = new Set<THREE.Material>();
    phone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => materials.add(material));
      }
    });
    materials.forEach((material) => material.dispose());
    texture.dispose();
    environmentMap.dispose();
    renderer.dispose();
  };
}
