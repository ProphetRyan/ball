import './style.css'
import * as THREE from 'three'
// import { Clock, Material, PointLight } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as dat from 'dat.gui'

//Cursor
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.height - 0.5)
})

// Sizes
const sizes = {
    width: window.innerWidth,
    height: innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height)
camera.position.z = 40

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// //Textures
const textureLoader = new THREE.TextureLoader()

const BaseColor = textureLoader.load('/textures/Ball_BaseColor.png')
const Emission = textureLoader.load('/textures/Ball_Emission.png')
const Normal = textureLoader.load('/textures/Ball_Normal.png')

const Ballmaterial = new THREE.MeshStandardMaterial({
    // color : 0xffc674,
    map : BaseColor,
    normalMap : Normal,
    emissiveMap : Emission,
    emissiveIntensity : 1,
    emissive : 0xFF7C33,
    metalness : 0,
    roughness : 0.5
})

// Objects
//GLTF Loader
// let mixer = null
const gltfloader = new GLTFLoader() 

gltfloader.load(
    '/models/AR Ball.gltf',
     (gltf) => 
    {
        const Ball = gltf.scene.children[0]
        Ball.material = Ballmaterial
        
        console.log(gltf.scene)
        scene.add(gltf.scene)
    })



// //Lights
// const ambientlight = new THREE.AmbientLight(0xffffff, 1)
// // ambientlight.castShadow = true

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
    antialias : true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.outputColorSpace = THREE.SRGBColorSpace
// renderer.toneMapping = THREE.ACESFilmicToneMapping

// Animate
// const clock = new THREE.Clock()

// let previousTime = 0

// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//     // gltf.scene.children[0].rotation.x = cursor.x
    
     
//     const deltatime = elapsedTime - previousTime
//     previousTime = elapsedTime

//     if(mixer !== null)
//     {
//        mixer.update(deltatime)   
//     }
    
  

//     // sphere.position.y = 0.2*Math.sin(elapsedTime)
//     // sphere.rotation.y = 0.2*(elapsedTime)

//     // spherecage.position.y = 0.2*Math.sin(elapsedTime)
//     // spherecage.rotation.y = 0.2*(elapsedTime)

//     controls.update()

//     renderer.render(scene, camera)

//     window.requestAnimationFrame(tick)
    
// }

// tick()