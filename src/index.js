import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols')
import * as dat from 'dat.gui'

var camera, controls, scene, renderer
var planeSize, plane
var heightLimit = 4800
var elevationScale = 0.15 * heightLimit
var contourStep = 500


var colorBase = [42,22,128]
var colorGradient = [22,21,-13]

// setup scene
scene = new THREE.Scene()
scene.background = new THREE.Color( 'black' )

//setup renderer
renderer = new THREE.WebGLRenderer({alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

//setup camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000)
controls = new OrbitControls(camera, renderer.domElement)
camera.lookAt( scene.position )
controls.enableDamping = true
controls.dampingFactor = 0.25

// loading screen
var progress = document.createElement('h1')
progress.innerHTML = 'Loading'
progress.id = 'progress'
document.body.appendChild(progress)

setTimeout(function(){progress.remove()}, 3000)


//add directional light
var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1.0)
directionalLight.position.set( 100, 350, 250 )
directionalLight.castShadow = true
scene.add(directionalLight)

//load image
var img = new Image()
img.src = "src/height_map2.png"

//generate terrain
generateTerrain()

// set up GUI
// data for gui
var gui = new dat.GUI()
var heightLabel = gui.addFolder('Elevation(meter)')

var params = new Object()
for (var k = 1; k < heightLimit / contourStep ; k ++){
  var r = colorBase[0] + colorGradient[0] * k
  var g = colorBase[1] + colorGradient[1] * k
  var b = colorBase[2] + colorGradient[2] * k
  var newLabel = parseInt(k * contourStep)
  params[newLabel] = [r,g,b]
  heightLabel.addColor(params, newLabel)
}


//show image
function animate(){
	requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()

//read image pixel information
function readImageData(){
  var canvas = document.createElement( 'canvas' )
  canvas.width = img.width
  canvas.height = img.height
  var context = canvas.getContext( '2d' )

  context.drawImage(img,0,0)

  var imgd = context.getImageData(0, 0, img.width, img.height)
  var pix = imgd.data

  return pix
}

//return array with height data from img
function getHeightData() {
  var pix  = readImageData()
  var data = new Float32Array(img.width * img.height)

  for (var i = 0; i < pix.length; i +=4) {
      data[i/4] = pix[i]
  }
  return data
}

function getTexture(){
  var pix  = readImageData()
  var size = img.width * img.height
  var data = new Uint8Array(img.width * img.height * 3)

  var j = 0
  for (var i = 0; i < pix.length; i+=4) {
    var currentHeight = Math.round(heightLimit * pix[i] / 256)
    var factor = Math.floor(currentHeight / contourStep)

    // assign contour color
    data[j] = colorBase[0] + factor * colorGradient[0]
    data[j+1] = colorBase[1] + factor * colorGradient[1]
    data[j+2] = colorBase[2] + factor * colorGradient[2]
    // assign contour line
    for (var k = 0; k < 20; k++){
      if (currentHeight % contourStep < k){
        data[j] = 255
        data[j+1] = 255
        data[j+2] = 255
        break
      }
    }
    j += 3
  }
  return data
}

function generateTerrain(){
  // generate terrain
  img.onload = function () {
    // plane
    planeSize = img.width
    var geometry = new THREE.PlaneGeometry(planeSize,planeSize,planeSize - 1 ,planeSize - 1)
    var diffuseMap = new THREE.DataTexture(getTexture(), img.width, img.height, THREE.RGBFormat)
    diffuseMap.flipY = true
    var material = new THREE.MeshStandardMaterial({map:diffuseMap,metalness:0.0})
    plane = new THREE.Mesh( geometry, material )

    //set height of vertices
    var heightData = getHeightData()
    for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
         plane.geometry.vertices[i].z = heightData[i] * elevationScale / img.width
    }

    plane.geometry.computeVertexNormals(true);

    plane.rotateX(THREE.Math.degToRad(-90))
    scene.add(plane);
    camera.position.z = planeSize * 1.5
  }
}
