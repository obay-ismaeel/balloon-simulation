import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

export class BalloonControls {

    constructor(model, orbitControl, camera){
        this.model = model
        this.orbitControl = orbitControl
        this.camera = camera
    }
    
    update(){
        this.model.position.y += 10     
        this.model.position.z -= 10
        this.model.position.x += 10   
    }
}
