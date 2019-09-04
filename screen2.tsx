import React, { RefObject } from 'react'
import { View, Animated, PanResponder, PanResponderInstance, Dimensions } from 'react-native'
import ExpoTHREE, { THREE } from 'expo-three'
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js'

const { width, height } = Dimensions.get('screen')

interface AnimatedValue {
  x: number
  y: number
}
interface State {
  pan: Animated.ValueXY
}

export default class App extends React.Component<{}, State> {
  panResponder: PanResponderInstance
  state = {
    pan: new Animated.ValueXY()
  }
  view: RefObject<View> = React.createRef()
  _val: AnimatedValue
  componentWillMount () {
    this._val = { x: 0, y: 0 }
    this.state.pan.addListener(value => (this._val = value))

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y
        })
        this.state.pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ])
    })
  }

  render () {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform()
    }
    return (
      <View style={{ width, height }} ref={this.view}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={this._onGLContextCreate}
        />
      </View>
    )
  }

  _onGLContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const scene = new THREE.Scene()
    let mesh

    const lightProbe = new THREE.LightProbe()
    scene.add(lightProbe)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)

    const genCubeUrls = function (prefix, postfix) {
      return [
        prefix + 'px' + postfix, prefix + 'nx' + postfix,
        prefix + 'py' + postfix, prefix + 'ny' + postfix,
        prefix + 'pz' + postfix, prefix + 'nz' + postfix
      ]
    }
    const urls = genCubeUrls('http://127.0.0.1:8080/', '.png')
    new THREE.CubeTextureLoader().load(urls, function (cubeTexture) {
      cubeTexture.encoding = THREE.sRGBEncoding
      scene.background = cubeTexture
      lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture))
      const geometry = new THREE.SphereBufferGeometry(5, 64, 32)
      // var geometry = new TorusKnotBufferGeometry( 4, 1.5, 256, 32, 2, 3 );
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        envMap: cubeTexture,
        envMapIntensity: 1
      })
      // mesh
      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      render()
    })
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 30)

    const renderer = new ExpoTHREE.Renderer({ gl, antialias: true })
    renderer.setPixelRatio(1)
    renderer.setSize(width, height)
    renderer.gammaOutput = true
    // renderer.gammaFactor = 2.2

    const render = () => {
      requestAnimationFrame(render)
      renderer.render(scene, camera)

      gl.endFrameEXP()
    }

    const controls = new OrbitControls(camera)
    controls.addEventListener('change', render)
    controls.minDistance = 10
    controls.maxDistance = 50
    controls.enablePan = false
    render()
  }
}
