import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import TouchTexture from "./js/TouchTexture";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

let isAndroid = false;
if (/Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isAndroid = true;
}

let canvas, scene, camera;
let pointMaterial, materialPlane, meshSphere;
let clock, mouse, touch;
let renderer, effectcomposer;

let size_sphere = 0.8;
if (isAndroid === true) {
  size_sphere = 0.6;
}
let scrollable1 = document.querySelector(".hero");
let scrollable3 = document.querySelector(".footer");
let store = 0;
let current = 0;
let target = 0;
let ease = 0.075;

const textureLoader = new THREE.TextureLoader();
const noiseTexture = textureLoader.load(noise);
const noiseTex = textureLoader.load(noiseT);

let currentPositionX = 0;
let currentPositionY = 0;

const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  px,
  nx,
  py,
  ny,
  pz,
  nz,
]);

class HeroThree {
  constructor() {
    canvas = document.querySelector("canvas.webgl");
    scene = new THREE.Scene();

    //Objects
    this.Sphere();
    this.Plane();
    if (isAndroid === false) {
      this.Points();
    }
    this.Picture();
    this.Mouse();
    this.Resize();
    this.Settings();
    this.PostProcessing();
    clock = new THREE.Clock();
    this.Tick();
  }

  rand(a, b) {
    return a + (b - a) * Math.random();
  }

  onTransitionEnd(event) {
    const element = event.target;
    element.remove();
  }

  Sphere() {
    this.parameters = {
      count: 9102,
      objects: [],
    };

    this.materialSphere = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightPos: { value: new THREE.Vector3(0, 15, 10) },
        uAmbientLight: { value: new THREE.Color("#110f2b") },
        uSpecular: { value: 1 },
        uEnvIntensity: { value: 0.1 },
        uFresnelIntensity: { value: 0.2 },
        uCubeTexture: { value: environmentMapTexture },
        uNoiseMap: { value: noiseTex },
        uColor: { value: new THREE.Color("white") },
        uElevation: { value: 1 },
        uScroll: { value: 0 },
        uLightMouse: { value: 0 },
      },
      defines: {
        USE_TANGENT: "",
      },
      vertexShader: document.getElementById("sphereShaderVertex").innerHTML,
      fragmentShader: document.getElementById("sphereShaderFragment").innerHTML,
    });

    const sphereGeo = new THREE.SphereGeometry(size_sphere, 32, 32);
    sphereGeo.computeTangents();
    sphereGeo.computeVertexNormals();
    meshSphere = new THREE.Mesh(sphereGeo, this.materialSphere);
    scene.add(meshSphere);
    this.parameters.objects.push(meshSphere);
  }

  Plane() {
    let colorPLane = "black";
    materialPlane = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorPLane),
    });
    this.planeGeometry = new THREE.PlaneGeometry(10.3, 5.7);
    const plane = new THREE.Mesh(this.planeGeometry, materialPlane);
    plane.position.set(0, 0.2, -1);
    scene.add(plane);
    this.parameters.objects.push(plane);
  }

  Points() {
    pointMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 25 },
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color("black") },
        uColor2: { value: new THREE.Color("#737373") },
        uTouch: { value: null },
        uScroll: { value: 0 },
        uClick: { value: 0 },
        uTexture: { value: noiseTexture },
        uProgress: { value: 0 },
        uTransition: { value: 0 },
      },
      vertexShader: document.getElementById("pointShadervertex").innerHTML,
      fragmentShader: document.getElementById("pointShaderFragment").innerHTML,
    });

    touch = new TouchTexture();
    pointMaterial.uniforms.uTouch.value = touch.texture;

    this.particlesBufferGeometry = new THREE.BufferGeometry();
    const particlesOnX = 200;
    const particlesOnY = 110;
    const positionArray = new THREE.BufferAttribute(
      new Float32Array(particlesOnX * particlesOnY * 3),
      3
    );
    const coordinatesArray = new THREE.BufferAttribute(
      new Float32Array(particlesOnX * particlesOnY * 3),
      3
    );
    const randomArray = new THREE.BufferAttribute(
      new Float32Array(particlesOnX * particlesOnY),
      1
    );
    const speedArray = new THREE.BufferAttribute(
      new Float32Array(particlesOnX * particlesOnY),
      1
    );
    const offsetArray = new THREE.BufferAttribute(
      new Float32Array(particlesOnX * particlesOnY),
      1
    );
    let index = 0;
    for (let i = 0; i < particlesOnX; i++) {
      let posX = i - 100;
      for (let j = 0; j < particlesOnY; j++) {
        positionArray.setXYZ(
          index,
          posX * 0.05,
          (j - particlesOnY / 2) * 0.05,
          -0.8
        );
        coordinatesArray.setXYZ(
          index,
          i / particlesOnX,
          j / particlesOnY,
          -0.8
        );
        randomArray.setX(index, Math.random() > 0.5 ? 1 : -1);
        speedArray.setX(index, this.rand(0.1, 1));
        offsetArray.setXYZ(index, this.rand(-1, 2));
        index++;
      }
    }

    this.particlesBufferGeometry.setAttribute("position", positionArray);
    this.particlesBufferGeometry.setAttribute("aCoordinates", coordinatesArray);
    this.particlesBufferGeometry.setAttribute("aRandom", randomArray);
    this.particlesBufferGeometry.setAttribute("aSpeed", speedArray);
    this.particlesBufferGeometry.setAttribute("aOffset", offsetArray);

    let particlesPoints = new THREE.Points(
      this.particlesBufferGeometry,
      pointMaterial
    );
    if (isAndroid === false) {
      scene.add(particlesPoints);
    }
  }

  Picture() {
    const planeMaterial = new THREE.ShaderMaterial({
      vertexShader: document.getElementById("planeShadervertex").innerHTML,
      fragmentShader: document.getElementById("planeShaderFragment").innerHTML,
      transparent: true,
    });
    const planeFocus = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 1.7, 30, 30),
      planeMaterial
    );
    planeFocus.position.set(0, 0, 1.5);
    scene.add(planeFocus);
  }

  Mouse() {
    let intersected = 0;
    mouse = new THREE.Vector3(0, 0, 2);
    const raycaster = new THREE.Raycaster();
    window.addEventListener("mousemove", (event) => {
      mouse.x = 3 * ((event.clientX / this.sizes.width) * 2 - 1);
      mouse.y = 3 * (-(event.clientY / this.sizes.height) * 2 + 1);
      raycaster.setFromCamera(
        new THREE.Vector2(mouse.x, mouse.y).multiplyScalar(0.333),
        camera
      );
      const intersects = raycaster.intersectObjects(this.parameters.objects);
      if (intersects.length > 0) {
        if (intersects[0].distance < 2 && intersected === 0) {
          intersected = 1;
          gsap.to(this.materialSphere.uniforms.uElevation, {
            duration: 3,
            ease: "power4.out",
            value: 2,
          });
          if (isAndroid === false) {
            gsap.to(pointMaterial.uniforms.uProgress, {
              duration: 3,
              ease: "power4.out",
              value: 1,
            });
          }
        } else if (intersects[0].distance > 3 && intersected == 1) {
          intersected = 0;
          gsap.to(this.materialSphere.uniforms.uElevation, {
            duration: 3,
            ease: "power4.out",
            value: 1,
          });
          if (isAndroid === false) {
            gsap.to(pointMaterial.uniforms.uProgress, {
              duration: 3,
              ease: "power4.out",
              value: 0,
            });
          }
        }
        let planeInter = intersects[0].distance > 3 ? intersects[0] : intersects[1]
        if (touch) touch.addTouch(planeInter.uv);
      }
    });
  }

  Resize() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = this.sizes.width / this.sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(this.sizes.width, this.sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Update Composer
      effectcomposer.setSize(this.sizes.width, this.sizes.height);
      effectcomposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  Scroll() {
    let rect1 = scrollable1.getBoundingClientRect();
    let rect3 = scrollable3.getBoundingClientRect();
    if (store < rect3.top) {
      store = rect3.top;
    }
    target = rect1.top;
    current = this.lerp(current, target, ease);
    let scaleParticle = -current * 0.005 + 1;
    if (scaleParticle < 4 && isAndroid === false) {
      pointMaterial.uniforms.uScroll.value = current * 0.0005;
    }
  }
  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  smoothstep(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  Settings() {
    camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 0, 1.9);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.setSize(this.sizes.width, this.sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  Tick() {
    this.Scroll();

    const elapsedTime = clock.getElapsedTime();

    if (isAndroid === false) {
      currentPositionX = this.lerp(currentPositionX, mouse.x, ease);
      currentPositionY = this.lerp(currentPositionY, mouse.y, ease);
      // Update camera
      camera.position.x = (currentPositionX * 0.1) / 2;
      camera.position.y = (currentPositionY * 0.1) / 2;
      // Update points
      touch.update();
      pointMaterial.uniforms.uTime.value = elapsedTime;
    }

    // Update sphere
    this.materialSphere.uniforms.uTime.value = elapsedTime;
    this.materialSphere.uniforms.uScroll.value = current * 0.007;
    this.materialSphere.uniforms.uLightMouse.value = mouse;

    // Update finalPass
    this.finalPass.uniforms.uCurrent.value = current * 0.01;

    // Update Post-processing
    effectcomposer.render();

    // Call Tick again on the next frame
    window.requestAnimationFrame(this.Tick.bind(this));
  }

  PostProcessing() {
    const renderTarget = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        stencilBuffer: false,
        type: THREE.FloatType,
      }
    );

    const renderScene = new RenderPass(scene, camera);
    // Final post processing
    this.finalPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uNoiseMultiplier: { value: 0.03 },
        uNoiseOffset: { value: -0.1 },
        uRGBShiftMultiplier: { value: 0.004 },
        uRGBShiftOffset: { value: 0.04 },
        uCurrent: { value: 0 },
      },
      vertexShader: document.getElementById("finalPassShaderVertex").innerHTML,
      fragmentShader: document.getElementById("finalPassShaderFragment").innerHTML,
    });
    // EffectComposer
    effectcomposer = new EffectComposer(renderer, renderTarget);
    effectcomposer.setSize(this.sizes.width, this.sizes.height);
    effectcomposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    effectcomposer.addPass(renderScene);
    effectcomposer.addPass(this.finalPass);
  }
}

new HeroThree();
