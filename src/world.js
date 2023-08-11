import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class World{
    constructor(){

        this.floor = new THREE.Group()

        this.skybox = new THREE.CubeTextureLoader().load([
            '/textures/sh_lf.png',
            '/textures/sh_rt.png',
            '/textures/sh_up.png',
            '/textures/sh_dn.png',
            '/textures/sh_ft.png',
            '/textures/sh_bk.png',
        ]);

        const textureloader= new THREE.TextureLoader()
        const grassColorTexture = textureloader.load('/textures/land/color.png')
        const grassAmbientOcclusionTexture = textureloader.load('/textures/land/ambientOcclusion.png')
        const grassNormalTexture = textureloader.load('/textures/land/normal.png')
        const grassRoughnessTexture = textureloader.load('/textures/land/roughness.png')
        const grassHeightTexture = textureloader.load('/textures/land/height.png')
        const grassMetalnessTexture = textureloader.load('/textures/land/metalness.png')

        grassColorTexture.repeat.set(300, 300)
        grassAmbientOcclusionTexture.repeat.set(300, 300)
        grassNormalTexture.repeat.set(300, 300)
        grassRoughnessTexture.repeat.set(300, 300)
        grassHeightTexture.repeat.set(300, 300)
        grassMetalnessTexture.repeat.set(300, 300)

        grassColorTexture.wrapS = THREE.RepeatWrapping
        grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
        grassNormalTexture.wrapS = THREE.RepeatWrapping
        grassRoughnessTexture.wrapS = THREE.RepeatWrapping
        grassHeightTexture.wrapS = THREE.RepeatWrapping
        grassMetalnessTexture.wrapS = THREE.RepeatWrapping

        grassColorTexture.wrapT = THREE.RepeatWrapping
        grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
        grassNormalTexture.wrapT = THREE.RepeatWrapping
        grassRoughnessTexture.wrapT = THREE.RepeatWrapping
        grassHeightTexture.wrapT = THREE.RepeatWrapping
        grassMetalnessTexture.wrapT = THREE.RepeatWrapping

        const planeGeometry = new THREE.PlaneGeometry(68000, 100000)
        const material = new THREE.MeshStandardMaterial({ 
                map: grassColorTexture,
                aoMap: grassAmbientOcclusionTexture,
                normalMap: grassNormalTexture,
                roughnessMap: grassRoughnessTexture,
                metalnessMap: grassMetalnessTexture,
                displacementMap: grassHeightTexture,
                transparent: true
                })

        this.plane = new THREE.Mesh(planeGeometry, material)
        this.plane.geometry.setAttribute(
            'uv2',
            new THREE.Float32BufferAttribute(this.plane.geometry.attributes.uv.array, 2)
        )
        this.plane.receiveShadow = true
        this.plane.rotation.x = - Math.PI * 0.5
        this.plane.position.z = 30000
        this.floor.add(this.plane)
        
        const gltfloader = new GLTFLoader()

        let mountine = []
        gltfloader.load(
            'models/mountineone/scene.gltf',
            (gltf) =>
            {
                mountine[0] = gltf.scene.clone()
                mountine[1] = gltf.scene.clone()
                mountine[2] = gltf.scene.clone()
                mountine[3] = gltf.scene.clone()

                mountine[0].position.x = 50000
                mountine[0].position.y = - 6000
                mountine[0].scale.set(1, 3, 2)

                mountine[2].position.x = 50000
                mountine[2].position.y = - 6000
                mountine[2].position.z =  50000
                mountine[2].scale.set(1, 3, 2)
                
                
                mountine[1].position.x = - 50000
                mountine[1].position.y = - 6000
                mountine[1].rotation.y = Math.PI
                mountine[1].scale.set(1, 3, 2)

                mountine[3].position.x = - 50000
                mountine[3].position.y = - 6000
                mountine[3].position.z =  50000
                mountine[3].rotation.y = Math.PI
                mountine[3].scale.set(1, 3, 2)

                this.floor.add(mountine[0], mountine[1], mountine[2], mountine[3])
            }
        )

        let tree = []
        gltfloader.load(
            'models/tree/scene.gltf',
            (gltf) => 
            {   
                tree[0] = gltf.scene.clone()
                tree[1] = gltf.scene.clone()
                
                tree[0].position.set(300, 0, 30000)
                tree[0].scale.set(0.2, 0.2, 0.2)
                tree[0].traverse( (node) => {
                    if(node.isMesh)
                        node.castShadow = true
                })

                tree[1].position.set(-300, 0, 30000)
                tree[1].scale.set(0.1, 0.1, 0.1)
                tree[1].traverse( (node) => {
                    if(node.isMesh)
                        node.castShadow = true
                })
                
                this.floor.add(tree[0], tree[1])
            }
        )

        this.floor.position.set(0, 0, -30000)

        this.ambientLight = new THREE.AmbientLight(0xfdfbd4, 0.5)

        this.directionalLight = new THREE.DirectionalLight(0xfdfbd4, 0.7)
        this.directionalLight.position.set(2500, 1000, 1000)
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.width = 4096
        this.directionalLight.shadow.mapSize.hieght = 4096
        this.directionalLight.shadow.camera.near = 10
        this.directionalLight.shadow.camera.far = 10000
        this.directionalLight.shadow.camera.left = - 5000
        this.directionalLight.shadow.camera.right = 5000
        this.directionalLight.shadow.camera.top = 5000
        this.directionalLight.shadow.camera.bottom = - 1000
        this.directionalLight.shadow.radius = 10
    }
}
export default World