import * as THREE from "https://esm.sh/three@0.178.0";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

let scene, camera, renderer, material;
let clock,
  mouse = { x: 0, y: 0 };
let cursorSphere3D = new THREE.Vector3(0, 0, 0);
let activeMerges = 0;
let targetMousePosition = new THREE.Vector2(0.5, 0.5);
let mousePosition = new THREE.Vector2(0.5, 0.5);
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let interactionLevel = 0,
  targetInteractionLevel = 0;

// Enhanced device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isLowPowerDevice = isMobile || navigator.hardwareConcurrency <= 4;
const devicePixelRatio = Math.min(
  window.devicePixelRatio || 1,
  isMobile ? 1.5 : 2
);

const presets = {
  holographic: {
    sphereCount: isMobile ? 4 : 6,
    ambientIntensity: 0.12,
    diffuseIntensity: 1.2,
    specularIntensity: 2.5,
    specularPower: 3,
    fresnelPower: 0.8,
    backgroundColor: new THREE.Color(0x0a0a15),
    sphereColor: new THREE.Color(0x050510),
    lightColor: new THREE.Color(0xccaaff),
    lightPosition: new THREE.Vector3(0.9, 0.9, 1.2),
    smoothness: 0.8,
    contrast: 1.6,
    fogDensity: 0.06,
    cursorGlowIntensity: 1.2,
    cursorGlowRadius: 2.2,
    cursorGlowColor: new THREE.Color(0xaa77ff)
  }
};

const settings = {
  preset: "holographic",
  ...presets.holographic,
  fixedTopLeftRadius: 0.8,
  fixedBottomRightRadius: 0.9,
  smallTopLeftRadius: 0.3,
  smallBottomRightRadius: 0.35,
  cursorRadiusMin: 0.08,
  cursorRadiusMax: 0.15,
  animationSpeed: 0.6,
  movementScale: 1.2,
  mouseSmoothness: 0.1,
  mergeDistance: 1.5,
  mouseProximityEffect: true,
  minMovementScale: 0.3,
  maxMovementScale: 1.0
};

function getStoryText(x, y, radius, merges, fps) {
  if (isMobile) {
    return `vessel: (${x}, ${y})<br>field: ${radius}u<br>merges: ${merges}<br>flux: ${fps}hz`;
  }
  return `our vessel drifts at coordinates (${x}, ${y})<br>gravitational field extends ${radius} units into quantum foam<br>currently merging with ${merges} other entities<br>temporal flux: ${fps} cycles per second`;
}

// Verifica a preferência de movimento reduzido do usuário e desativa a animação se necessário
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  init();
  animate();
}

function init() {
  const container = document.getElementById("container");
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({
    antialias: !isMobile && !isLowPowerDevice,
    alpha: true,
    powerPreference: isMobile ? "default" : "high-performance",
    preserveDrawingBuffer: false,
    premultipliedAlpha: false
  });

  // FIXED: Proper pixel ratio handling
  const pixelRatio = Math.min(devicePixelRatio, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);

  // Get actual viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Enhanced canvas styling
  const canvas = renderer.domElement;
  canvas.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 0 !important;
    display: block !important;
  `;
  container.appendChild(canvas);

  // Create material with improved shader
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(viewportWidth, viewportHeight) },
      uActualResolution: {
        value: new THREE.Vector2(
          viewportWidth * pixelRatio,
          viewportHeight * pixelRatio
        )
      },
      uPixelRatio: { value: pixelRatio },
      uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
      uCursorSphere: { value: new THREE.Vector3(0, 0, 0) },
      uCursorRadius: { value: settings.cursorRadiusMin },
      uSphereCount: { value: settings.sphereCount },
      uFixedTopLeftRadius: { value: settings.fixedTopLeftRadius },
      uFixedBottomRightRadius: { value: settings.fixedBottomRightRadius },
      uSmallTopLeftRadius: { value: settings.smallTopLeftRadius },
      uSmallBottomRightRadius: { value: settings.smallBottomRightRadius },
      uMergeDistance: { value: settings.mergeDistance },
      uSmoothness: { value: settings.smoothness },
      uAmbientIntensity: { value: settings.ambientIntensity },
      uDiffuseIntensity: { value: settings.diffuseIntensity },
      uSpecularIntensity: { value: settings.specularIntensity },
      uSpecularPower: { value: settings.specularPower },
      uFresnelPower: { value: settings.fresnelPower },
      uBackgroundColor: { value: settings.backgroundColor },
      uSphereColor: { value: settings.sphereColor },
      uLightColor: { value: settings.lightColor },
      uLightPosition: { value: settings.lightPosition },
      uContrast: { value: settings.contrast },
      uFogDensity: { value: settings.fogDensity },
      uAnimationSpeed: { value: settings.animationSpeed },
      uMovementScale: { value: settings.movementScale },
      uMouseProximityEffect: { value: settings.mouseProximityEffect },
      uMinMovementScale: { value: settings.minMovementScale },
      uMaxMovementScale: { value: settings.maxMovementScale },
      uCursorGlowIntensity: { value: settings.cursorGlowIntensity },
      uCursorGlowRadius: { value: settings.cursorGlowRadius },
      uCursorGlowColor: { value: settings.cursorGlowColor },
      uIsSafari: { value: isSafari ? 1.0 : 0.0 },
      uIsMobile: { value: isMobile ? 1.0 : 0.0 },
      uIsLowPower: { value: isLowPowerDevice ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${
        isMobile || isSafari || isLowPowerDevice
          ? "precision mediump float;"
          : "precision highp float;"
      }
      
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uActualResolution;
      uniform float uPixelRatio;
      uniform vec2 uMousePosition;
      uniform vec3 uCursorSphere;
      uniform float uCursorRadius;
      uniform int uSphereCount;
      uniform float uFixedTopLeftRadius;
      uniform float uFixedBottomRightRadius;
      uniform float uSmallTopLeftRadius;
      uniform float uSmallBottomRightRadius;
      uniform float uMergeDistance;
      uniform float uSmoothness;
      uniform float uAmbientIntensity;
      uniform float uDiffuseIntensity;
      uniform float uSpecularIntensity;
      uniform float uSpecularPower;
      uniform float uFresnelPower;
      uniform vec3 uBackgroundColor;
      uniform vec3 uSphereColor;
      uniform vec3 uLightColor;
      uniform vec3 uLightPosition;
      uniform float uContrast;
      uniform float uFogDensity;
      uniform float uAnimationSpeed;
      uniform float uMovementScale;
      uniform bool uMouseProximityEffect;
      uniform float uMinMovementScale;
      uniform float uMaxMovementScale;
      uniform float uCursorGlowIntensity;
      uniform float uCursorGlowRadius;
      uniform vec3 uCursorGlowColor;
      uniform float uIsSafari;
      uniform float uIsMobile;
      uniform float uIsLowPower;
      
      varying vec2 vUv;
      
      const float PI = 3.14159265359;
      const float EPSILON = 0.001;
      const float MAX_DIST = 100.0;
      
      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * k * 0.25;
      }
      
      float sdSphere(vec3 p, float r) {
        return length(p) - r;
      }
      
      vec3 screenToWorld(vec2 normalizedPos) {
        vec2 uv = normalizedPos * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;
        return vec3(uv * 2.0, 0.0);
      }
      
      float getDistanceToCenter(vec2 pos) {
        float dist = length(pos - vec2(0.5, 0.5)) * 2.0;
        return smoothstep(0.0, 1.0, dist);
      }
      
      float sceneSDF(vec3 pos) {
        float result = MAX_DIST;
        
        vec3 topLeftPos = screenToWorld(vec2(0.08, 0.92));
        float topLeft = sdSphere(pos - topLeftPos, uFixedTopLeftRadius);
        
        vec3 smallTopLeftPos = screenToWorld(vec2(0.25, 0.72));
        float smallTopLeft = sdSphere(pos - smallTopLeftPos, uSmallTopLeftRadius);
        
        vec3 bottomRightPos = screenToWorld(vec2(0.92, 0.08));
        float bottomRight = sdSphere(pos - bottomRightPos, uFixedBottomRightRadius);
        
        vec3 smallBottomRightPos = screenToWorld(vec2(0.72, 0.25));
        float smallBottomRight = sdSphere(pos - smallBottomRightPos, uSmallBottomRightRadius);
        
        float t = uTime * uAnimationSpeed;
        
        float dynamicMovementScale = uMovementScale;
        if (uMouseProximityEffect) {
          float distToCenter = getDistanceToCenter(uMousePosition);
          float mixFactor = smoothstep(0.0, 1.0, distToCenter);
          dynamicMovementScale = mix(uMinMovementScale, uMaxMovementScale, mixFactor);
        }
        
        int maxIter = uIsMobile > 0.5 ? 4 : (uIsLowPower > 0.5 ? 6 : min(uSphereCount, 10));
        for (int i = 0; i < 10; i++) {
          if (i >= uSphereCount || i >= maxIter) break;
          
          float fi = float(i);
          float speed = 0.4 + fi * 0.12;
          float radius = 0.12 + mod(fi, 3.0) * 0.06;
          float orbitRadius = (0.3 + mod(fi, 3.0) * 0.15) * dynamicMovementScale;
          float phaseOffset = fi * PI * 0.35;
          
          float distToCursor = length(vec3(0.0) - uCursorSphere);
          float proximityScale = 1.0 + (1.0 - smoothstep(0.0, 1.0, distToCursor)) * 0.5;
          orbitRadius *= proximityScale;
          
          vec3 offset;
          if (i == 0) {
            offset = vec3(
              sin(t * speed) * orbitRadius * 0.7,
              sin(t * 0.5) * orbitRadius,
              cos(t * speed * 0.7) * orbitRadius * 0.5
            );
          } else if (i == 1) {
            offset = vec3(
              sin(t * speed + PI) * orbitRadius * 0.5,
              -sin(t * 0.5) * orbitRadius,
              cos(t * speed * 0.7 + PI) * orbitRadius * 0.5
            );
          } else {
            offset = vec3(
              sin(t * speed + phaseOffset) * orbitRadius * 0.8,
              cos(t * speed * 0.85 + phaseOffset * 1.3) * orbitRadius * 0.6,
              sin(t * speed * 0.5 + phaseOffset) * 0.3
            );
          }
          
          vec3 toCursor = uCursorSphere - offset;
          float cursorDist = length(toCursor);
          if (cursorDist < uMergeDistance && cursorDist > 0.0) {
            float attraction = (1.0 - cursorDist / uMergeDistance) * 0.3;
            offset += normalize(toCursor) * attraction;
          }
          
          float movingSphere = sdSphere(pos - offset, radius);
          
          float blend = 0.05;
          if (cursorDist < uMergeDistance) {
            float influence = 1.0 - (cursorDist / uMergeDistance);
            blend = mix(0.05, uSmoothness, influence * influence * influence);
          }
          
          result = smin(result, movingSphere, blend);
        }
        
        float cursorBall = sdSphere(pos - uCursorSphere, uCursorRadius);
        
        float topLeftGroup = smin(topLeft, smallTopLeft, 0.4);
        float bottomRightGroup = smin(bottomRight, smallBottomRight, 0.4);
        
        result = smin(result, topLeftGroup, 0.3);
        result = smin(result, bottomRightGroup, 0.3);
        result = smin(result, cursorBall, uSmoothness);
        
        return result;
      }
      
      vec3 calcNormal(vec3 p) {
        float eps = uIsLowPower > 0.5 ? 0.002 : 0.001;
        return normalize(vec3(
          sceneSDF(p + vec3(eps, 0, 0)) - sceneSDF(p - vec3(eps, 0, 0)),
          sceneSDF(p + vec3(0, eps, 0)) - sceneSDF(p - vec3(0, eps, 0)),
          sceneSDF(p + vec3(0, 0, eps)) - sceneSDF(p - vec3(0, 0, eps))
        ));
      }
      
      float ambientOcclusion(vec3 p, vec3 n) {
        if (uIsLowPower > 0.5) {
          float h1 = sceneSDF(p + n * 0.03);
          float h2 = sceneSDF(p + n * 0.06);
          float occ = (0.03 - h1) + (0.06 - h2) * 0.5;
          return clamp(1.0 - occ * 2.0, 0.0, 1.0);
        } else {
          float occ = 0.0;
          float weight = 1.0;
          for (int i = 0; i < 6; i++) {
