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

    //initial variables
    const initMass = document.getElementById('mass')
    const initRadius = document.getElementById('radius')
    const initFuel = document.getElementById('initFuel')

    // Hide the canvas initially
    canvas.style.display = "none";
    
    startButton.addEventListener("click", () => {
        variables.radius = initRadius.value
        variables.mass = initMass.value
        variables.fuel = initFuel.value
        // Hide the start menu
        startMenu.style.display = "none";
        // Show the canvas
        canvas.style.display = "block";
    });
});

//  FULLSCREEN TOGGLE
window.addEventListener('keydown', (event) => {
    if(event.code==='KeyF'){
        if(! document.fullscreenElement)
            canvas.requestFullscreen()
        else
            document.exitFullscreen()
    }
})

// Scene
const scene = new THREE.Scene()

























/**
 * FUNCTION TO CREATE NEW VARIABLE TO SHOW ON THE SCREEN 
 */

function addElement(name, variable){
    const var1 = document.createElement('li');
    var1.id = name;
    var1.innerText = `${name}: ${variable}`;
    variablesList.appendChild(var1);
}

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
    controls.maxDistance = 5000
    controls.minDistance = 250
    controls.maxPolarAngle = Math.PI/2 - 0.05*Math.PI
    controls.enableDamping = true

// Add world to the scene
scene.background = world.skybox
scene.add(world.floor, world.ambientLight, world.directionalLight)

// Balloon Model
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
        addElement('altitude',balloon.model.position.y)
        animate()
    }
)

document.addEventListener("DOMContentLoaded", () => {

    addElement('balloon mass', variables.mass + (variables.fuel*0.583) )
    addElement('inner temp', variables.inner_temperature)
    addElement('outer temp', 25)
    addElement('velocity Y', 0)
    addElement('acceleration Y', 0)
    addElement('fuel', variables.fuel)
    
})

/**
 * burner turn on and off
 * GUI variables
 */
let variables = {
    burner: false,  
    radius: 5,              //m
    mass: 10,               //kg
    inner_temperature: 25,  //c
    fuel: 40                //Gallon
}

window.addEventListener('keydown', (event)=>{
    if(event.code === 'Space')
        variables.burner = !variables.burner
})

function updateVariables(){
    const mass = document.getElementById('balloon mass');
    mass.innerText = `balloon mass: ${( +variables.mass + variables.fuel * 0.583 ).toFixed(0)} (kg)`
    
    const altitude = document.getElementById('altitude');
    altitude.innerText = `altitude: ${Math.trunc(balloon.model.position.y)} (m)`

    const inner_temperature = document.getElementById('inner temp');
    inner_temperature.innerText = `inner temp: ${Math.trunc(variables.inner_temperature)} (C)`

    const fuel = document.getElementById('fuel');
    fuel.innerText = `fuel: ${Math.trunc(variables.fuel)} (L)`
    
    if(ph){
        const velocityY = document.getElementById('velocity Y');
        velocityY.innerText = `velocity Y: ${(ph.vel.y).toFixed(1)} (m/s)`

        const accY = document.getElementById('acceleration Y');
        accY.innerText = `acceleration Y: ${(ph.acc.y).toFixed(1)} (m/s)`
    }

    if(ph){
        const outer_temperature = document.getElementById('outer temp');
        const temp =  (ph.calc_tempereture(balloon.model.position.y)).toFixed(0)
        outer_temperature.innerText = `outer temp: ${temp} (C)`
    }
}
    

/* Renderer */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const clock = new THREE.Clock()
console.log(variables)
let ph

const animate = () => {
    
    const delta = clock.getDelta() 
    
    controls.update()
    
    updateVariables()
    
    if(balloon){
        if(!ph) ph = new Physics(balloon.model)

        ph.execute(delta*10, variables, balloon.model)
        
        camera.lookAt(balloon.model.position )

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

// gui.onChange(function() {
    
// });