import {
  AmbientLight,
  AnimationMixer,
  Box3,
  Cache,
  Color,
  DirectionalLight,
  HemisphereLight,
  LoadingManager,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  LinearToneMapping
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { KTX2Loader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { EXRLoader } from 'three/examples/jsm/Addons.js'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js'
import { useRef, useEffect, useState } from 'react'
import styles from './Board.module.scss'

const traverseMaterials = (object, callback) => {
  object.traverse(node => {
    if (!node.geometry) return
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material]
    materials.forEach(callback)
  })
}

class Viewer {
  constructor(el, options) {
    this.environments = [
      {
        id: '',
        name: 'None',
        path: null
      },
      {
        id: 'neutral', // THREE.RoomEnvironment
        name: 'Neutral',
        path: null
      }
    ]

    this.DEFAULT_CAMERA = '[default]'

    this.MANAGER = new LoadingManager()
    this.DRACO_LOADER = new DRACOLoader(this.MANAGER).setDecoderPath(
      'three/examples/jsm/libs/draco/gltf'
    )
    this.KTX2_LOADER = new KTX2Loader(this.MANAGER).setTranscoderPath(
      'three/examples/jsm/libs/basis'
    )

    this.Preset = { ASSET_GENERATOR: 'assetgenerator' }

    Cache.enabled = true

    this.el = el
    this.options = options

    this.lights = []
    this.content = null
    this.mixer = null
    this.clips = []
    this.gui = null

    this.state = {
      environment:
        options.preset === this.Preset.ASSET_GENERATOR
          ? this.environments.find(e => e.id === 'footprint-court').name
          : this.environments[1].name,
      background: false,
      playbackSpeed: 1.0,
      actionStates: {},
      camera: this.DEFAULT_CAMERA,
      wireframe: false,
      skeleton: false,
      autoRotate: false,
      punctualLights: true,
      exposure: 0.0,
      toneMapping: LinearToneMapping,
      ambientIntensity: 0.3,
      ambientColor: '#ffffff',
      directIntensity: 0.8 * Math.PI,
      directColor: '#ffffff',
      bgColor: '#191919',
      pointSize: 1.0
    }

    this.prevTime = 0

    this.backgroundColor = new Color(this.state.bgColor)

    this.scene = new Scene()
    this.scene.background = null

    const fov =
      options.preset === this.Preset.ASSET_GENERATOR
        ? (0.8 * 180) / Math.PI
        : 60
    const aspect = el.clientWidth / el.clientHeight
    this.defaultCamera = new PerspectiveCamera(fov, aspect, 0.01, 1000)
    this.activeCamera = this.defaultCamera
    this.scene.add(this.defaultCamera)

    this.renderer = window.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(el.clientWidth, el.clientHeight)

    this.pmremGenerator = new PMREMGenerator(this.renderer)
    this.pmremGenerator.compileEquirectangularShader()

    this.neutralEnvironment = this.pmremGenerator.fromScene(
      new RoomEnvironment()
    ).texture

    this.controls = new OrbitControls(
      this.defaultCamera,
      this.renderer.domElement
    )
    this.controls.screenSpacePanning = true

    this.el.appendChild(this.renderer.domElement)

    this.cameraCtrl = null
    this.cameraFolder = null
    this.animFolder = null
    this.animCtrls = []
    this.morphFolder = null
    this.morphCtrls = []
    this.skeletonHelpers = []

    this.controls.addEventListener('change', event => {
      console.log(this.activeCamera)
    })

    this.animate = this.animate.bind(this)
    requestAnimationFrame(this.animate)
    // window.addEventListener('resize', this.resize.bind(this), false)
  }

  animate(time) {
    this.animateId = requestAnimationFrame(this.animate)

    const dt = (time - this.prevTime) / 1000

    this.controls.update()
    this.mixer && this.mixer.update(dt)
    this.render()

    this.prevTime = time
  }

  render() {
    this.renderer.render(this.scene, this.activeCamera)
  }

  resize() {
    const { clientHeight, clientWidth } = this.el.parentElement

    this.defaultCamera.aspect = clientWidth / clientHeight
    this.defaultCamera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)
  }

  load(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader(this.MANAGER)
        .setCrossOrigin('anonymous')
        .setDRACOLoader(this.DRACO_LOADER)
        .setKTX2Loader(this.KTX2_LOADER.detectSupport(this.renderer))
        .setMeshoptDecoder(MeshoptDecoder)

      loader.load(
        url,
        gltf => {
          const scene = gltf.scene || gltf.scenes[0]
          const clips = gltf.animations || []

          this.setContent(scene, clips)

          resolve(this)
        },
        undefined,
        reject
      )
    })
  }

  setContent(object, clips) {
    this.clear()

    object.updateMatrixWorld()

    const box = new Box3().setFromObject(object)
    const size = box.getSize(new Vector3()).length()
    const center = box.getCenter(new Vector3())

    this.controls.reset()

    object.position.x -= center.x
    object.position.y -= center.y
    object.position.z -= center.z

    this.controls.maxDistance = size * 10

    this.defaultCamera.near = size / 100
    this.defaultCamera.far = size * 100
    this.defaultCamera.updateProjectionMatrix()

    if (this.options.cameraPosition) {
      this.defaultCamera.position.fromArray(this.options.cameraPosition)
      this.defaultCamera.lookAt(new Vector3())
    } else {
      this.defaultCamera.position.copy(center)
      this.defaultCamera.position.x = -object.position.x / 2.0
      this.defaultCamera.position.y = -object.position.y * 3
      this.defaultCamera.position.z = -object.position.z / 2.0
      this.defaultCamera.zoom = 3
      this.defaultCamera.lookAt(center)
    }

    this.defaultCamera.rotation.x = this.setCamera(this.DEFAULT_CAMERA)

    this.controls.saveState()

    this.scene.add(object)
    this.content = object

    this.state.punctualLights = true

    this.content.traverse(node => {
      if (node.isLight) this.state.punctualLights = false
    })

    this.setClips(clips)

    this.updateLights()
    this.updateEnvironment()
  }

  setClips(clips) {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.uncacheRoot(this.mixer.getRoot())
      this.mixer = null
    }

    this.clips = clips
    if (!clips.length) return

    this.mixer = new AnimationMixer(this.content)
  }

  playAllClips() {
    this.clips.forEach(clip => {
      this.mixer.clipAction(clip).reset().play()
      this.state.actionStates[clip.name] = true
    })
  }

  setCamera(name) {
    if (name === this.DEFAULT_CAMERA) {
      // this.controls.enabled = false
      this.controls.enabled = true
      this.controls.zoom = false
      this.activeCamera = this.defaultCamera
    } else {
      this.controls.enabled = false
      this.content.traverse(node => {
        if (node.isCamera && node.name === name) {
          this.activeCamera = node
        }
      })
    }
  }

  updateLights() {
    const state = this.state
    const lights = this.lights

    if (state.punctualLights && !lights.length) this.addLights()
    else if (!state.punctualLights && lights.length) this.removeLights()

    this.renderer.toneMapping = Number(state.toneMapping)
    this.renderer.toneMappingExposure = Math.pow(2, state.exposure)

    if (lights.length === 2) {
      lights[0].intensity = state.ambientIntensity
      lights[0].color.set(state.ambientColor)
      lights[1].intensity = state.directIntensity
      lights[1].color.set(state.directColor)
    }
  }

  addLights() {
    const state = this.state

    if (this.options.preset === this.Preset.ASSET_GENERATOR) {
      const hemiLight = new HemisphereLight()
      hemiLight.name = 'hemi_light'
      this.scene.add(hemiLight)
      this.lights.push(hemiLight)
      return
    }

    const light1 = new AmbientLight(state.ambientColor, state.ambientIntensity)
    light1.name = 'ambient_light'
    this.defaultCamera.add(light1)

    const light2 = new DirectionalLight(
      state.directColor,
      state.directIntensity
    )
    light2.position.set(0.5, 0, 0.866)
    light2.name = 'main_light'
    this.defaultCamera.add(light2)

    this.lights.push(light1, light2)
  }

  removeLights() {
    this.lights.forEach(light => light.parent.remove(light))
    this.lights.length = 0
  }

  updateEnvironment() {
    const environment = this.environments.filter(
      entry => entry.name === this.state.environment
    )[0]

    this.getCubeMapTexture(environment).then(({ envMap }) => {
      this.scene.environment = envMap
    })
  }

  getCubeMapTexture(environment) {
    const { id, path } = environment

    if (id === 'neutral')
      return Promise.resolve({ envMap: this.neutralEnvironment })
    if (id === '') return Promise.resolve({ envMap: null })

    return new Promise((resolve, reject) => {
      new EXRLoader().load(
        path,
        texture => {
          const envMap =
            this.pmremGenerator.fromEquirectangular(texture).texture
          this.pmremGenerator.dispose()

          resolve({ envMap })
        },
        undefined,
        reject
      )
    })
  }

  clear() {
    if (!this.content) return

    this.scene.remove(this.content)

    this.content.traverse(node => {
      if (!node.geometry) return
      node.geometry.dispose()
    })

    traverseMaterials(this.content, material => {
      for (const key in material) {
        if (key !== 'envMap' && material[key] && material[key].isTexture)
          material[key].dispose()
      }
    })
  }
}

export default function Board() {
  const container = useRef(null)

  useEffect(() => {
    const el = container.current
    el.parentNode.style.height = `${(el.offsetWidth / 16) * 9}px`
    el.style.height = `${(el.offsetWidth / 16) * 9}px`

    const viewer = new Viewer(el, {})

    viewer
      .load('/landing/board.glb')
      .catch(e => console.log(e))
      .then(viewer => {})

    return () => {
      const el = container.current
      while (el.hasChildNodes()) el.removeChild(el.lastChild)
    }
  }, [])

  return (
    <div className={styles.board}>
      <div className={styles.container} ref={container}></div>
    </div>
  )
}
