import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import { createGrounds } from './grounds'
import { createHouse } from './house'
import { createMaterials } from './textures'

export interface World {
  scene: THREE.Scene
  sky: Sky
  fog: THREE.FogExp2
  ambient: THREE.AmbientLight
  moon: THREE.DirectionalLight
  porchLight: THREE.PointLight
  ghostLights: THREE.PointLight[]
  setGroundRepeat: (repeat: number) => void
  update: (elapsed: number, ghostSpeed: number, porchIntensity: number, motion: boolean) => void
}

export function createWorld(): World {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#06151d')
  const fog = new THREE.FogExp2('#112d36', 0.041)
  scene.fog = fog

  const sky = new Sky()
  sky.scale.setScalar(100)
  sky.material.uniforms.turbidity.value = 10
  sky.material.uniforms.rayleigh.value = 2
  sky.material.uniforms.mieCoefficient.value = 0.005
  sky.material.uniforms.mieDirectionalG.value = 0.9
  sky.material.uniforms.sunPosition.value.set(0.2, -0.04, -0.8)
  scene.add(sky)

  const materials = createMaterials()
  scene.add(createGrounds(materials))
  const house = createHouse(materials)
  scene.add(house.group)

  const ambient = new THREE.AmbientLight('#7a9cc6', 1.35)
  const moon = new THREE.DirectionalLight('#b9ccef', 3.3)
  moon.position.set(5, 9, -6)
  moon.castShadow = true
  moon.shadow.mapSize.set(1024, 1024)
  moon.shadow.camera.left = -15
  moon.shadow.camera.right = 15
  moon.shadow.camera.top = 15
  moon.shadow.camera.bottom = -15
  moon.shadow.camera.near = 1
  moon.shadow.camera.far = 30
  moon.shadow.normalBias = 0.04
  scene.add(ambient, moon)

  const ghostColors = ['#80e3d7', '#bba8ff', '#ff9cc2']
  const ghostLights = ghostColors.map((color) => {
    const ghost = new THREE.PointLight(color, 9, 5, 2)
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshBasicMaterial({ color }),
    )
    ghost.add(core)
    scene.add(ghost)
    return ghost
  })

  const update = (elapsed: number, ghostSpeed: number, porchIntensity: number, motion: boolean): void => {
    const time = motion ? elapsed : 0
    ghostLights.forEach((ghost, index) => {
      const direction = index === 1 ? -1 : 1
      const angle = time * ghostSpeed * (0.57 - index * 0.11) * direction + index * 2.1
      const radius = 5 + index * 1.4
      ghost.position.set(
        Math.cos(angle) * radius,
        0.8 + Math.sin(angle * 2.3) * 0.42 + Math.sin(angle * 3.7) * 0.2,
        Math.sin(angle) * radius,
      )
    })
    house.porchLight.intensity = Math.max(0, motion
      ? porchIntensity + Math.sin(time * 7) * 1.2 + Math.sin(time * 19) * 0.65
      : porchIntensity)
  }
  update(0, 1, 16, false)

  return {
    scene, sky, fog, ambient, moon,
    porchLight: house.porchLight,
    ghostLights, setGroundRepeat: materials.setGroundRepeat,
    update,
  }
}
