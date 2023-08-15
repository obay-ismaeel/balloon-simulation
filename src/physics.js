import * as THREE from 'three'

// Define constants
const G0 =  9.80665,            // Gravitational constant
      RE =  6_371_000  ,        // Radius of the Earth m
      T0 = 25,                  // Standard temperature
      P0 = 1.01325,             // Standard pressure
      R = 287.058,              // Gas constant
      L = -6.5/1000 ,       // change by 6.5 every 1000 m
      MATRIX = generateWindCurrents();

function generateWindCurrents() {
    let N = 10, height = 100, Matrix = [];

    for(let i = 0 ; i < N ; i++){    
        let windCurrent = {
            minHeight : height,
            maxHeight : height + Math.ceil( 500 + Math.random() * 500 ), 
            windSpeed : Math.ceil( Math.random() * 50 ), //m/s
            Xangle :  Math.random() * 2 * Math.PI,
            Yangle :  Math.random() * 2 * Math.PI,
            Zangle :  Math.random() * 2 * Math.PI,
        }
        height = windCurrent.maxHeight;
        Matrix.push(windCurrent);
    }
    return Matrix;
}

class Physics{

    constructor(model) {
        this.mass = 1000
        this.radius = 5
        this.cd = 0.47
        this.model = model
        
        this.vel = new THREE.Vector3(0,0,0);
        this.acc = new THREE.Vector3(0,0,0);
        this.netForce = new THREE.Vector3(0,0,0);
    }

    weight(){   
        //gravity
        let g = new THREE.Vector3(0, -this.calc_gravity(this.model.position.y) ,0 )
        
        //w=m*g
        let w = g.clone().multiplyScalar(this.mass)

        return w;
    }

    wind(){
        let windCurrent

        for(let i =0; i<MATRIX.length; i++){
            if( this.model.position.y >= MATRIX[i].minHeight && this.model.position.y < MATRIX[i].maxHeight ){
                    windCurrent=MATRIX[i]
                    break
            }
        }
        if(!windCurrent) return new THREE.Vector3(0,0,0)
        
        let b1 = Math.cos(windCurrent.Xangle)
        let b2 = Math.cos(windCurrent.Yangle)
        let b3 = Math.cos(windCurrent.Zangle)

        let wind = 
            0.5 * this.cd * this.calc_air_rho(this.model.position.y) * Math.PI * Math.pow(this.radius, 2) * (windCurrent.windSpeed,2)
            
        // let windForce = new THREE.Vector3(wind*b1, wind*b2, wind*b3)
        let windForce = new THREE.Vector3(wind*b1, wind*b2, wind*b3)
        
        return windForce
    }
        
    drag(variables){
        let drag = 
        0.5 * this.cd * this.calc_air_rho(this.model.position.y) * Math.PI * Math.pow(variables.radius, 2)
        
        let xdrag = drag * Math.pow(this.vel.x, 2) * - Math.sign(this.vel.x)
        let ydrag = drag * Math.pow(this.vel.y, 2) * - Math.sign(this.vel.y)
        let zdrag = drag * Math.pow(this.vel.z, 2) * - Math.sign(this.vel.z)
        
        let dragForce = new THREE.Vector3(xdrag, ydrag, zdrag)
        return dragForce
        
    }
    
    collision(){
        if(this.model.position.y <= 2 ){
            this.model.position.setY(2)
            if(this.vel.y<0) this.vel.setY(0)
            if(this.acc.y<0) this.acc.setY(0)
        }
    }
    
    buoyancy(variables){
        
        var rho_air = this.calc_air_rho(this.model.position.y)
        
        // var rho_balloon = this.calc_balloon_rho() 
        
        var v = this.calc_balloon_volume(variables.radius)

        let g = this.calc_gravity(this.model.position.y)
        
        console.log(g)
        //var air_temp = this.calc_tempereture(this.model.position.y)
        
        let B = 
        rho_air * T0 * v * g 
        * ( ( 1 / this.calc_tempereture(this.model.position.y) ) - ( 1 / variables.inner_temperature ) );
        
        let buoyancyForce = new THREE.Vector3(0,B,0)

        return buoyancyForce
    }
    
    update(dt){
        // acceleration = force / mass
        this.acc.add(this.netForce.clone().divideScalar(this.mass))
        
        //update the velocity based on the acceleration [v = v + (a*dt)]
        this.vel.add(this.acc.clone().multiplyScalar(dt))
        
        //update the position based on the velocity [v = v + (a*dt)]
        this.model.position.add(this.vel.clone().multiplyScalar(dt))
        
        this.collision()
    }

    execute(dt, variables, model){
        this.model = model
        this.mass = +variables.mass + variables.fuel*0.583
        this.radius = variables.radius
        this.netForce.multiplyScalar(0)
        this.acc.multiplyScalar(0)
        
        this.change_balloon_temp(variables, dt)
        
        this.netForce.add(this.wind())
        this.netForce.add(this.weight()) 
        this.netForce.add(this.drag(variables))
        this.netForce.add(this.buoyancy(variables))
        this.update(dt)
    }
    


    
    
    calc_balloon_volume(radius){
        return (4/3) * Math.PI * Math.pow(radius,3)
    }
    
    calc_gravity(height){
        // g = g0 * [RE / (RE + h)] ** 2   
        return G0 * Math.pow((RE / (RE + height)), 2);
    }
    
    calc_pressure(height){
        let g = this.calc_gravity(height);
        // P = P0 * [1 + L * h / T0] ** -g/RL
        return P0 * Math.pow((1 + (L * height) / T0 ), (- g / (R * L)));
    }
    
    calc_tempereture(height){
        // T = T0 + L * h 
        return T0 + (L * height); // temperature at height  
    }

    change_balloon_temp(variables, dt){
        if( variables.inner_temperature > 140 ) window.alert('balloon exploded!')
        if( variables.burner && variables.fuel>0 ){
            variables.inner_temperature += dt
            variables.fuel -= 0.511
        }  
        if( variables.inner_temperature > 25 ) variables.inner_temperature -= 0.135*dt
    }
    
    calc_air_rho(height){
        let P = this.calc_pressure(height) * Math.pow(10, 5);
        let T = this.calc_tempereture(height);
        return P / (R * T); // k/m3
    }

}
export default Physics