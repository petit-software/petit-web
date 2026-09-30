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
    roughness: 1,
    envMapIntensity: 0.35,
  });
  const bodyGeometry = new THREE.ExtrudeGeometry(smoothRectangle(2.93, 6.17, 0.67), {
    depth: 0.16,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 8,
    steps: 1,
    curveSegments: 24,
  });
  bodyGeometry.translate(0, 0, -0.08);
  phone.add(new THREE.Mesh(bodyGeometry, casing));

  // Positive local X is the left side when looking at the phone's back.
  const rearCamera = new THREE.Group();
  rearCamera.position.set(0.94, 2.5, -0.115);
  rearCamera.rotation.x = -Math.PI / 2;
  const cameraRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.265, 0.28, 0.095, 64),
    new THREE.MeshStandardMaterial({ color: 0xbfc2c8, metalness: 0.85, roughness: 0.23 }),
  );
  cameraRing.position.y = 0.045;
  rearCamera.add(cameraRing);
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.215, 0.215, 0.015, 64),
    new THREE.MeshStandardMaterial({ color: 0x080c16, metalness: 0.35, roughness: 0.12 }),
  );
  lens.position.y = 0.1;
  rearCamera.add(lens);
  const innerLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.005, 64),
    new THREE.MeshStandardMaterial({ color: 0x172c46, metalness: 0.6, roughness: 0.08 }),
  );
  innerLens.position.y = 0.11;
  rearCamera.add(innerLens);
  phone.add(rearCamera);

  let failed = false;
  const loading = new THREE.LoadingManager();
  loading.onLoad = () => {
    if (disposed || failed) return;
    loaded = true;
    render();
    callbacks.onReady();
  };
  loading.onError = () => {
    failed = true;
    if (!disposed) callbacks.onError();
  };

  // Rasterize the SVG at 4× its intrinsic size for a sharp WebGL texture.
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 229 * 4;
  labelCanvas.height = 51 * 4;
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  new THREE.ImageLoader(loading).load(
    "/images/cmra-label.svg",
    (image) => {
      if (disposed) return;
      const context = labelCanvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0, labelCanvas.width, labelCanvas.height);
        labelTexture.needsUpdate = true;
      }
      render();
    },
  );
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const backLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4 * 51 / 229),
    new THREE.MeshStandardMaterial({
      map: labelTexture,
      transparent: true,
      roughness: 0.6,
      depthWrite: false,
    }),
  );
  backLabel.rotation.y = Math.PI;
  backLabel.position.set(0, -2.45, -0.118);
  phone.add(backLabel);

  const bezel = new THREE.Mesh(
    new THREE.ShapeGeometry(smoothRectangle(2.89, 6.13, 0.65)),
    new THREE.MeshBasicMaterial({ color: 0x090a0c }),
  );
  bezel.position.z = 0.118;
  phone.add(bezel);

  // Keep the supplied screenshot's aspect ratio; only its black corners are masked.
  const screenHeight = 6;
  const screenWidth = screenHeight * (1206 / 2622);
  const screenGeometry = new THREE.ShapeGeometry(smoothRectangle(screenWidth, screenHeight, 0.585));
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
  const rest = { x: -0.335, y: -0.19 };
  const target = { ...rest };
  let rotation = 0;
  let showingBack = false;
  let returnTimer: ReturnType<typeof setTimeout> | undefined;
  const raycaster = new THREE.Raycaster();
  const pointerPosition = new THREE.Vector2();
  phone.rotation.set(rest.x, rest.y, 0);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const texture = new THREE.TextureLoader(loading).load("/images/cmra-screen.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.124;
  phone.add(screen);

  // The screen recording replaces the still once its first frame decodes. It stays
  // out of the loading manager, so a slow or blocked video just leaves the still up.
  const video = document.createElement("video");
  const frameCallbacks = "requestVideoFrameCallback" in video;
  video.muted = true;
  video.playsInline = true;
  video.preload = frameCallbacks && !motion.matches ? "auto" : "none";
  video.src = "/images/cmra-screen.mp4";
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.generateMipmaps = true;
  videoTexture.minFilter = THREE.LinearMipmapLinearFilter;
  videoTexture.anisotropy = texture.anisotropy;
  let revealed = false;
  let videoFrame = 0;
  // Yaw at which a finished recording restarts: halfway through its closing spin.
  let replayAt: number | undefined;

  function render() {
    if (!disposed && visible && !document.hidden) renderer.render(scene, camera);
  }

  function paintVideoFrame() {
    videoTexture.needsUpdate = true;
    // The tilt loop already paints every frame while it runs.
    if (!frame) render();
    videoFrame = video.requestVideoFrameCallback(paintVideoFrame);
  }

  function showVideo() {
    if (disposed) return;
    screenMaterial.map = videoTexture;
    paintVideoFrame();
  }

  function syncVideo() {
    if (disposed) return;
    if (frameCallbacks && revealed && visible && !showingBack && replayAt === undefined && !document.hidden && !motion.matches) {
      // Rejects when autoplay is blocked or a pause lands first; the screen keeps its last frame.
      // Playing a finished recording restarts it, which is what loops it.
      video.play().catch(() => {});
    } else video.pause();
  }

  // The recording ends with a full turn, front to front. It restarts while the
  // back is facing, so the screen comes round already on its first frames.
  function videoEnded() {
    rotation += Math.PI * 2;
    target.y += Math.PI * 2;
    replayAt = phone.rotation.y + Math.PI;
    schedule();
  }

  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = time;
    const ease = 1 - Math.exp(-8 * delta);
    phone.rotation.x += (target.x - phone.rotation.x) * ease;
    phone.rotation.y += (target.y - phone.rotation.y) * ease;
    if (replayAt !== undefined && phone.rotation.y >= replayAt) {
      replayAt = undefined;
      syncVideo();
    }
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
    target.y = rest.y + rotation + x * 0.5;
    target.x = rest.x + y * 0.3;
    schedule();
  }

  function reset() {
    target.x = rest.x;
    target.y = rest.y + rotation;
    if (motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      phone.rotation.x = rest.x;
      phone.rotation.y = target.y;
      render();
    } else schedule();
  }

  function rotate() {
    if (!loaded || disposed) return;
    clearTimeout(returnTimer);
    returnTimer = undefined;
    showingBack = !showingBack;
    rotation += Math.PI;
    target.y += Math.PI;
    if (motion.matches) {
      phone.rotation.y = target.y;
      render();
    } else schedule();
    if (showingBack) returnTimer = setTimeout(rotate, 500);
    syncVideo();
  }

  function click(event: MouseEvent) {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    pointerPosition.set(
      (event.clientX - left) / width * 2 - 1,
      -(event.clientY - top) / height * 2 + 1,
    );
    phone.updateMatrixWorld(true);
    raycaster.setFromCamera(pointerPosition, camera);
    if (raycaster.intersectObject(phone, true).length) rotate();
  }

  function keydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!event.repeat) rotate();
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
    syncVideo();
  });
  intersection.observe(container);
  function visibility() {
    if (!document.hidden) { render(); schedule(); }
    syncVideo();
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
  motion.addEventListener("change", syncVideo);
  pointer.addEventListener("change", reset);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  canvas.addEventListener("click", click);
  canvas.addEventListener("keydown", keydown);
  video.addEventListener("loadeddata", showVideo, { once: true });
  video.addEventListener("ended", videoEnded);

  function setRevealed(value: boolean) {
    revealed = value;
    syncVideo();
  }

  function dispose() {
    disposed = true;
    clearTimeout(returnTimer);
    cancelAnimationFrame(frame);
    if (videoFrame) video.cancelVideoFrameCallback(videoFrame);
    video.removeEventListener("loadeddata", showVideo);
    video.removeEventListener("ended", videoEnded);
    video.pause();
    video.removeAttribute("src");
    video.load();
    observer.disconnect();
    intersection.disconnect();
    window.removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", reset);
    window.removeEventListener("blur", reset);
    document.removeEventListener("visibilitychange", visibility);
    motion.removeEventListener("change", reset);
    motion.removeEventListener("change", syncVideo);
    pointer.removeEventListener("change", reset);
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", contextRestored);
    canvas.removeEventListener("click", click);
    canvas.removeEventListener("keydown", keydown);
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
    videoTexture.dispose();
    labelTexture.dispose();
    environmentMap.dispose();
    renderer.dispose();
  }

  return { setRevealed, dispose };
}
