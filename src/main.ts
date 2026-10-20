import * as THREE from 'three'
import { Timer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { createWorld } from './world'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Application container is missing')

app.innerHTML = `
  <canvas class="scene-canvas" aria-label="Інтерактивна сцена покинутого будинку"></canvas>
  <main class="overlay">
    <div class="eyebrow"><span class="eyebrow-dot"></span> ІНТЕРАКТИВНА 3D СЦЕНА <span class="eyebrow-number">01 / THREE.JS</span></div>
    <div class="hero-copy">
      <p class="kicker">Після заходу сонця</p>
      <h1>Там, де<br><em>живе світло</em></h1>
      <p class="intro">Покинутий дім ще пам’ятає своїх мешканців. Дослідіть нічний сад і світло, яке ніколи не згасає.</p>
      <button class="explore-button" type="button">Дослідити сцену <span aria-hidden="true">↗</span></button>
    </div>
    <div class="bottom-bar">
      <span>ПЕРЕТЯГНІТЬ, ЩОБ ПОВЕРНУТИ · ПРОКРУТІТЬ, ЩОБ НАБЛИЗИТИ</span>
      <button class="settings-button" type="button" aria-label="Відкрити налаштування сцени" aria-expanded="false">⚙ ПАРАМЕТРИ</button>
    </div>
  </main>
`

const canvas = app.querySelector<HTMLCanvasElement>('canvas')
const settingsButton = app.querySelector<HTMLButtonElement>('.settings-button')
const exploreButton = app.querySelector<HTMLButtonElement>('.explore-button')
if (!canvas || !settingsButton || !exploreButton) throw new Error('Scene controls are missing')

const world = createWorld()
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 140)
camera.position.set(10.5, 7.1, 12.6)
const controls = new OrbitControls(camera, canvas)
controls.target.set(0.1, 1.3, 0)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.minDistance = 6
controls.maxDistance = 30
controls.maxPolarAngle = Math.PI * 0.49
controls.update()

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.55

const settings = {
  ghostSpeed: 1,
  ambient: world.ambient.intensity,
  moon: world.moon.intensity,
  porch: world.porchLight.intensity,
  fogDensity: world.fog.density,
  fogColor: '#112d36',
  moonColor: '#b9ccef',
  repeat: 5,
  turbidity: 10,
  rayleigh: 2,
}

const gui = new GUI({ title: 'Налаштування сцени', width: 280 })
gui.domElement.classList.add('scene-gui')
gui.close()
gui.hide()

const lightFolder = gui.addFolder('Освітлення')
lightFolder.add(settings, 'ambient', 0, 3, 0.05).name('Навколишнє світло').onChange((value: number) => { world.ambient.intensity = value })
lightFolder.add(settings, 'moon', 0, 7, 0.1).name('Місячне світло').onChange((value: number) => { world.moon.intensity = value })
lightFolder.addColor(settings, 'moonColor').name('Колір місяця').onChange((value: string) => { world.moon.color.set(value) })
lightFolder.add(settings, 'porch', 0, 30, 0.5).name('Ліхтар біля дверей')

const atmosphereFolder = gui.addFolder('Атмосфера')
atmosphereFolder.add(settings, 'fogDensity', 0, 0.12, 0.002).name('Щільність туману').onChange((value: number) => { world.fog.density = value })
atmosphereFolder.addColor(settings, 'fogColor').name('Колір туману').onChange((value: string) => { world.fog.color.set(value) })
atmosphereFolder.add(settings, 'turbidity', 0, 20, 0.1).name('Мутність неба').onChange((value: number) => { world.sky.material.uniforms.turbidity.value = value })
atmosphereFolder.add(settings, 'rayleigh', 0, 5, 0.1).name('Розсіювання').onChange((value: number) => { world.sky.material.uniforms.rayleigh.value = value })

const sceneFolder = gui.addFolder('Сцена')
sceneFolder.add(settings, 'ghostSpeed', 0, 3, 0.05).name('Швидкість привидів')
sceneFolder.add(settings, 'repeat', 1, 12, 1).name('Повторення землі').onChange((value: number) => { world.setGroundRepeat(value) })

settingsButton.addEventListener('click', () => {
  const open = settingsButton.getAttribute('aria-expanded') !== 'true'
  settingsButton.setAttribute('aria-expanded', String(open))
  if (open) gui.show()
  else gui.hide()
})

exploreButton.addEventListener('click', () => {
  app.classList.toggle('is-exploring')
  exploreButton.textContent = app.classList.contains('is-exploring') ? 'Повернути опис ↙' : 'Дослідити сцену ↗'
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const timer = new Timer()
function animate(): void {
  timer.update()
  world.update(timer.getElapsed(), settings.ghostSpeed, settings.porch, !reducedMotion.matches)
  controls.update()
  renderer.render(world.scene, camera)
  window.requestAnimationFrame(animate)
}
animate()
