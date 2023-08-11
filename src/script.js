import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { BalloonControls } from './balloon.js'
import  World  from './world.js'
import Physics from './physics.js'

// World
const world = new World()

// Resize 
window.addEventListener('resize', () => {
    //Update Sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Update Camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    //Update Renderer
    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    const startMenu = document.querySelector(".start-menu");
    const canvas = document.querySelector(".webgl");
    
    // Hide the canvas initially
    canvas.style.display = "none";
    
    startButton.addEventListener("click", () => {
        // Hide the start menu
        startMenu.style.display = "none";
        // Show the canvas
        canvas.style.display = "block";
    });
});

// Fullscreen
window.addEventListener('dblclick', () => {

    if(! document.fullscreenElement)
    canvas.requestFullscreen()
    else
    document.exitFullscreen()
    
})

// Scene
const scene = new THREE.Scene()

/**
 * burner turn on and off
 * GUI variables
 */
let variables = {
    burner: false,  
    radius: 5,          //m
    payload: 10         //kg
}

window.addEventListener('keydown', (event)=>{
    if(event.code === 'Space')
        variables.burner = !variables.burner
})


// Sizes
const sizes = {
    width: innerWidth,
    height: innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000000 )
camera.position.set(0, 100, 300)
scene.add(camera)

const canvas = document.querySelector('.webgl')

// Camera Controls
const controls = new OrbitControls(camera, canvas)
    controls.maxDistance = 450
    controls.minDistance = 250
    controls.maxPolarAngle = Math.PI/2 - 0.05*Math.PI
    controls.enableDamping = true
    
    // Add world to the scene
    scene.background = world.skybox
scene.add(world.floor, world.ambientLight, world.directionalLight)

// Balloon
const gltfloader = new GLTFLoader()
let balloon
gltfloader.load(
    'models/balloon/scene.gltf',
    (gltf) =>
    {      
        gltf.scene.scale.set(variables.radius, variables.radius, variables.radius)
        gltf.scene.position.set(0, 1, 0)
        controls.target = gltf.scene.position
        
        gltf.scene.traverse( (node) => {
            if(node.isMesh)
                node.castShadow = true
        })
        
        balloon = new BalloonControls(gltf.scene, controls, camera)
        scene.add(gltf.scene)
        animate()
    }
    )
    
/* Renderer */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const clock = new THREE.Clock()

let ph

const animate = () => {
    
    const delta = clock.getDelta() 
    
    controls.update()
    
    //console.log(elapsedTime)
    if(balloon){
        if(!ph) ph = new Physics(balloon.model, 1000, 10)

        ph.execute(delta*10, variables, balloon.model)
        
        camera.lookAt(balloon.model.position )

        console.log(balloon.model.position)
    }
    
    renderer.render(scene, camera)
    
    window.requestAnimationFrame(animate)
    
}
// animate();


const gui = new dat.GUI({closed: false, width: 400})
gui.hide()
const ball = gui.addFolder('balloon')
ball.add(variables, 'radius').min(4).max(10).step(0.5).name('radius')
ball.add(variables, 'payload').min(1).max(1000).step(10).name('mass')
// ball.add(ph, 'balloon_temp').min(0).max(140).step(5).name('temperature')
ball.open()