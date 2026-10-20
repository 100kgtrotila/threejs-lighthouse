import * as THREE from 'three'
import type { SceneMaterials } from './textures'

export interface HouseResult {
  group: THREE.Group
  porchLight: THREE.PointLight
}

function shadow(mesh: THREE.Mesh, receive = true): THREE.Mesh {
  mesh.castShadow = true
  mesh.receiveShadow = receive
  return mesh
}

export function createHouse(materials: SceneMaterials): HouseResult {
  const group = new THREE.Group()
  const walls = shadow(new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 4.4), materials.wall))
  walls.position.y = 1.6
  group.add(walls)

  const roof = shadow(new THREE.Mesh(new THREE.ConeGeometry(3.75, 1.9, 4), materials.roof))
  roof.position.y = 4.08
  roof.rotation.y = Math.PI / 4
  group.add(roof)

  const chimney = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.8, 0.68), materials.wall))
  chimney.position.set(-1.3, 4.27, -0.65)
  group.add(chimney)
  const chimneyTop = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), materials.stone))
  chimneyTop.position.set(-1.3, 5.22, -0.65)
  group.add(chimneyTop)

  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.45), materials.door)
  door.position.set(0, 1.23, 2.211)
  group.add(door)

  const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: '#2a2425', roughness: 0.9 })
  for (const x of [-0.96, 0.96]) {
    const post = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.55, 0.16), doorFrameMaterial))
    post.position.set(x, 1.28, 2.28)
    group.add(post)
  }
  const lintel = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.16, 0.18), doorFrameMaterial))
  lintel.position.set(0, 2.56, 2.28)
  group.add(lintel)

  const glass = new THREE.MeshStandardMaterial({
    color: '#ffbd72',
    emissive: '#f98238',
    emissiveIntensity: 1.45,
    metalness: 0.1,
    roughness: 0.3,
  })
  for (const x of [-1.56, 1.56]) {
    const frame = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.99, 1.18, 0.11), doorFrameMaterial))
    frame.position.set(x, 1.89, 2.27)
    const window = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.94), glass)
    window.position.set(x, 1.89, 2.34)
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.98, 0.08), doorFrameMaterial)
    mullion.position.set(x, 1.89, 2.38)
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.08), doorFrameMaterial)
    crossbar.position.set(x, 1.89, 2.38)
    group.add(frame, window, mullion, crossbar)
  }

  const steps = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 1.05), materials.stone))
  steps.position.set(0, 0.15, 2.65)
  group.add(steps)

  const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
  for (const side of [-1, 1]) {
    for (const [distance, z, radius] of [[2.65, 2.4, 0.4], [1.85, 2.7, 0.22]]) {
      const bush = shadow(new THREE.Mesh(bushGeometry, materials.bush), false)
      bush.scale.setScalar(radius)
      bush.position.set(side * distance, radius, z)
      group.add(bush)
    }
  }

  // A small side workshop changes the silhouette without introducing a model loader.
  const annex = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.75, 2.2, 3.1), materials.wall))
  annex.position.set(3.44, 1.1, -0.55)
  const annexRoof = shadow(new THREE.Mesh(new THREE.ConeGeometry(2.42, 1.08, 4), materials.roof))
  annexRoof.position.set(3.44, 2.74, -0.55)
  annexRoof.rotation.y = Math.PI / 4
  group.add(annex, annexRoof)

  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.43, 0.3), new THREE.MeshStandardMaterial({
    color: '#ffd998', emissive: '#ff9a46', emissiveIntensity: 2,
  }))
  lantern.position.set(0, 2.88, 2.6)
  const porchLight = new THREE.PointLight('#ffae68', 16, 8, 1.7)
  porchLight.position.copy(lantern.position)
  group.add(lantern, porchLight)

  return { group, porchLight }
}
