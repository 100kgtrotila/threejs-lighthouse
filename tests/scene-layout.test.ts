import assert from 'node:assert/strict'
import test from 'node:test'
import * as THREE from 'three'
import { createGrounds } from '../src/grounds.ts'
import { createHouse } from '../src/house.ts'
import type { SceneMaterials } from '../src/textures.ts'

const material = () => new THREE.MeshStandardMaterial()
const materials: SceneMaterials = {
  ground: material(),
  wall: material(),
  roof: material(),
  stone: material(),
  bush: material(),
  door: material(),
  setGroundRepeat: () => {},
}

test('the house has two grounded bushes on each side of the door', () => {
  const { group } = createHouse(materials)
  const bushes = group.children.filter(
    (child): child is THREE.Mesh => child instanceof THREE.Mesh && child.material === materials.bush,
  )

  assert.equal(bushes.length, 4)
  assert.equal(bushes.filter((bush) => bush.position.x < 0).length, 2)
  assert.equal(bushes.filter((bush) => bush.position.x > 0).length, 2)
  for (const bush of bushes) {
    assert.ok(bush.position.z > 2.2)
    assert.equal(bush.position.y, bush.scale.x)
    assert.ok(Math.abs(bush.position.x) - bush.scale.x > 1.35)
  }
})

test('all 30 graves are on the visible ground clear of the house, path and fence', () => {
  const group = createGrounds(materials)
  const graves = group.children.filter(
    (child): child is THREE.Mesh => child instanceof THREE.Mesh
      && child.material === materials.stone,
  )

  assert.equal(graves.length, 30)
  for (const [index, grave] of graves.entries()) {
    const { x, z } = grave.position
    assert.ok(Math.hypot(x, z) < 10, `grave ${index} is outside the visible ground`)
    assert.ok(x < -2.9 || x > 5.3 || z < -2.7 || z > 2.7,
      `grave ${index} intersects the house`)
    assert.ok(z < 2.7 || Math.abs(x) > 1.8,
      `grave ${index} intersects the path`)
    assert.ok(z < 2.9 || z > 12 || Math.abs(Math.abs(x) - 3.1) > 0.55,
      `grave ${index} intersects the fence`)
    for (const other of graves.slice(0, index)) {
      assert.ok(Math.hypot(x - other.position.x, z - other.position.z) > 0.85,
        `grave ${index} intersects another grave`)
    }
  }
})

test('fence posts remain inside the ground plane', () => {
  const group = createGrounds(materials)
  const posts = group.children.filter(
    (child): child is THREE.Mesh => child instanceof THREE.Mesh
      && child.geometry instanceof THREE.BoxGeometry
      && child.geometry.parameters.width === 0.13
      && child.geometry.parameters.height === 0.92,
  )

  assert.ok(posts.length > 0)
  assert.ok(posts.every((post) => post.position.z < 12))
})
