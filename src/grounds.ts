import * as THREE from 'three'
import type { SceneMaterials } from './textures'

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

export function createGrounds(materials: SceneMaterials): THREE.Group {
  const group = new THREE.Group()
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), materials.ground)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  const pathMaterial = new THREE.MeshStandardMaterial({ color: '#77716a', roughness: 1 })
  const pathGeometry = new THREE.BoxGeometry(0.95, 0.06, 0.62)
  const random = seededRandom(3829)
  for (let index = 0; index < 11; index++) {
    const slab = new THREE.Mesh(pathGeometry, pathMaterial)
    slab.position.set(Math.sin(index * 0.48) * 0.23, 0.045, 3.25 + index * 0.72)
    slab.rotation.y = (random() - 0.5) * 0.2
    slab.castShadow = true
    slab.receiveShadow = true
    group.add(slab)
  }

  const graveGeometry = new THREE.BoxGeometry(0.57, 0.95, 0.2)
  const gravePositions: THREE.Vector2[] = []
  const graveCount = 30
  let attempts = 0
  while (gravePositions.length < graveCount && attempts < 1000) {
    attempts++
    const angle = random() * Math.PI * 2
    const radius = 5.4 + random() * 4.2
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    if (x > -3.3 && x < 5.3 && z > -2.7 && z < 3.15) continue
    if (Math.abs(x) < 1.8 && z >= 2.7) continue
    if (Math.abs(Math.abs(x) - 3.1) < 0.55 && z >= 2.9) continue
    const position = new THREE.Vector2(x, z)
    if (gravePositions.some((gravePosition) => gravePosition.distanceTo(position) < 0.9)) continue

    const grave = new THREE.Mesh(graveGeometry, materials.stone)
    grave.position.set(x, 0.35 + random() * 0.08, z)
    grave.rotation.set((random() - 0.5) * 0.2, (random() - 0.5) * 0.5, (random() - 0.5) * 0.22)
    grave.castShadow = true
    grave.receiveShadow = true
    group.add(grave)
    gravePositions.push(position)
  }
  if (gravePositions.length !== graveCount) throw new Error('Unable to place all graves')

  const wood = new THREE.MeshStandardMaterial({ color: '#3d302b', roughness: 1 })
  const postGeometry = new THREE.BoxGeometry(0.13, 0.92, 0.13)
  const railGeometry = new THREE.BoxGeometry(0.09, 0.1, 1.78)
  for (const side of [-1, 1]) {
    for (let index = 0; index < 5; index++) {
      const post = new THREE.Mesh(postGeometry, wood)
      post.position.set(side * 3.1, 0.46, 3.4 + index * 1.65)
      post.castShadow = true
      group.add(post)
    }
    for (const height of [0.37, 0.72]) {
      for (let index = 0; index < 4; index++) {
        const rail = new THREE.Mesh(railGeometry, wood)
        rail.position.set(side * 3.1, height, 4.225 + index * 1.65)
        group.add(rail)
      }
    }
  }

  const signPost = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.65, 0.13), wood)
  signPost.position.set(-2.45, 0.83, 4.1)
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.48, 0.1), wood)
  signBoard.position.set(-2.45, 1.43, 4.18)
  group.add(signPost, signBoard)

  return group
}
