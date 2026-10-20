import * as THREE from 'three'

export interface SceneMaterials {
  ground: THREE.MeshStandardMaterial
  wall: THREE.MeshStandardMaterial
  roof: THREE.MeshStandardMaterial
  stone: THREE.MeshStandardMaterial
  bush: THREE.MeshStandardMaterial
  door: THREE.MeshStandardMaterial
  setGroundRepeat: (repeat: number) => void
}

export function createMaterials(): SceneMaterials {
  const loader = new THREE.TextureLoader()
  const load = (name: string, color = false): THREE.Texture => {
    const texture = loader.load(`/textures/${name}.webp`)
    if (color) texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  const groundColor = load('ground-color', true)
  const groundArm = load('ground-arm')
  const groundNormal = load('ground-normal')
  const groundTextures = [groundColor, groundArm, groundNormal]
  const setGroundRepeat = (repeat: number): void => {
    for (const texture of groundTextures) {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(repeat, repeat)
      if (texture.image) texture.needsUpdate = true
    }
  }
  setGroundRepeat(5)

  const ground = new THREE.MeshStandardMaterial({
    map: groundColor,
    aoMap: groundArm,
    roughnessMap: groundArm,
    normalMap: groundNormal,
    roughness: 1,
    alphaMap: load('ground-alpha'),
    transparent: true,
  })

  const wallArm = load('wall-arm')
  const roofArm = load('roof-arm')
  const stoneArm = load('stone-arm')
  const bushArm = load('bush-arm')

  return {
    ground,
    wall: new THREE.MeshStandardMaterial({
      map: load('wall-color', true),
      aoMap: wallArm,
      roughnessMap: wallArm,
      normalMap: load('wall-normal'),
      roughness: 1,
    }),
    roof: new THREE.MeshStandardMaterial({
      map: load('roof-color', true),
      aoMap: roofArm,
      roughnessMap: roofArm,
      normalMap: load('roof-normal'),
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    stone: new THREE.MeshStandardMaterial({
      map: load('stone-color', true),
      aoMap: stoneArm,
      roughnessMap: stoneArm,
      normalMap: load('stone-normal'),
      roughness: 1,
    }),
    bush: new THREE.MeshStandardMaterial({
      map: load('bush-color', true),
      aoMap: bushArm,
      roughnessMap: bushArm,
      normalMap: load('bush-normal'),
      roughness: 1,
    }),
    door: new THREE.MeshStandardMaterial({
      map: load('door-color', true),
      alphaMap: load('door-alpha'),
      normalMap: load('door-normal'),
      roughnessMap: load('door-roughness'),
      metalnessMap: load('door-metalness'),
      transparent: true,
      roughness: 1,
    }),
    setGroundRepeat,
  }
}
