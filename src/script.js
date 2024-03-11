import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "lil-gui";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";

const debugObject = {
    bgColor: "#1a1919",
    color: "#d74e14",
    scale: 1.05,
};

const gui = new GUI();

//Cursor
const cursor = {
    x: 0,
    y: 0,
};
window.addEventListener("mousemove", event => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = -(event.clientY / sizes.height - 0.5);
});

// Sizes
const sizes = {
    width: window.innerWidth,
    height: innerHeight,
};

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height);
camera.position.z = 40;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// //Textures
const textureLoader = new THREE.TextureLoader();

const baseColorTexture = textureLoader.load("/textures/Ball_BaseColor.png");
baseColorTexture.flipY = false;
baseColorTexture.colorSpace = THREE.SRGBColorSpace;
baseColorTexture.needsUpdate = true;
const emissionTexture = textureLoader.load("/textures/Ball_Emission.png");
emissionTexture.flipY = false;
emissionTexture.colorSpace = THREE.SRGBColorSpace;
emissionTexture.needsUpdate = true;
const normalTexture = textureLoader.load("/textures/Ball_Normal.png");
normalTexture.colorSpace = THREE.SRGBColorSpace;
normalTexture.flipY = false;
normalTexture.needsUpdate = true;

let ballMaterial = null;

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    uniforms: {
        uMouse: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width, sizes.height)),
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(debugObject.color)),
        uFolloff: new THREE.Uniform(0.5),
        uFresnelPower: new THREE.Uniform(5),
    },
});

// Objects
//GLTF Loader
let mixer = null;
const gltfloader = new GLTFLoader();

gltfloader.load("/models/AR Ball.gltf", gltf => {
    const ball = gltf.scene.children[0];
    ballMaterial = ball.material;

    // Fresnel sphere
    const sphereGeometry = ball.geometry.clone();
    sphereGeometry.scale(1.05, 1.05, 1.05);
    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);

    mixer = new THREE.AnimationMixer(gltf.scene);
    console.log(gltf.scene);
    scene.add(gltf.scene);

    // Debug
    if (gui) {
        const folder = gui.addFolder("Ball");
        folder.add(ballMaterial, "visible").name("Visible");
        folder.add(ballMaterial, "wireframe").name("Wireframe");
        folder.add(ballMaterial, "metalness").min(0).max(1).step(0.001).name("Metalness");
        folder.add(ballMaterial, "roughness").min(0).max(1).step(0.001).name("Roughness");

        const folder2 = gui.addFolder("Fresnel");
        folder2.add(material.uniforms.uFolloff, "value").min(0).max(5).step(0.001).name("Falloff");
        folder2
            .add(material.uniforms.uFresnelPower, "value")
            .min(0)
            .max(10)
            .step(0.001)
            .name("Fresnel Power");
        folder2.addColor(debugObject, "color").onChange(() => {
            material.uniforms.uColor.value = new THREE.Color(debugObject.color);
        });
        folder2
            .add(debugObject, "scale")
            .min(0)
            .max(2)
            .step(0.001)
            .name("Scale")
            .onChange(() => {
                sphere.scale.set(debugObject.scale, debugObject.scale, debugObject.scale);
            });
    }

    // Animation
    const action = mixer.clipAction(gltf.animations[0]);
    action.stop();
});

// //Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(new THREE.Color("white"), 1);
directionalLight.position.set(12, 4, 6);
scene.add(directionalLight);

// const light1 = new THREE.DirectionalLight(0xff932E, 10)
// const helper1 = new THREE.DirectionalLightHelper(light1)
// light1.position.set(12,4,6)

// const light2 = new THREE.DirectionalLight(0x397BFE, 10)
// const helper2 = new THREE.DirectionalLightHelper(light2)
// light2.position.set(-12,4,6)

// // directionallight.castShadow = true
// // directionallight.shadow.mapSize.width = 2048
// // directionallight.shadow.mapSize.height = 2048

// scene.add(ambientlight, light1, light2, helper1, helper2)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new THREE.Color(debugObject.bgColor), 1);

// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Debug
gui.addColor(debugObject, "bgColor").onChange(() => {
    renderer.setClearColor(new THREE.Color(debugObject.bgColor), 1);
});
gui.add(ambientLight, "intensity").min(0).max(5).step(0.001).name("Ambient Light");
gui.add(directionalLight, "intensity").min(0).max(5).step(0.001).name("Directional Light");

// Animate
const clock = new THREE.Clock();

let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // gltf.scene.children[0].rotation.x = cursor.x

    const deltatime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (mixer !== null) {
        mixer.update(deltatime);
    }

    if (material) {
        material.uniforms.uMouse.value.x = cursor.x;
        material.uniforms.uMouse.value.y = cursor.y;
        material.uniforms.uTime.value = elapsedTime;
    }

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
