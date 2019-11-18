import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols')

var camera, controls, scene, renderer
var planeSize, plane
var heightLimit = 4800
var elevationScale = 0.15 * heightLimit
var contourStep = 500

// setup scene
scene = new THREE.Scene();
scene.background = new THREE.Color( 'skyblue' )

//setup renderer
renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);

//setup camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000)
controls = new OrbitControls(camera, renderer.domElement)
camera.lookAt( scene.position )
controls.enableDamping = true
controls.dampingFactor = 0.25

//add directional light
var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1.2 );
directionalLight.position.set( 100, 350, 250 );
directionalLight.castShadow = true;
scene.add( directionalLight );

//load image
var img = new Image()
img.src = "src/height_map2.png"

//generate terrain
generateTerrain()

//show image
function animate(){
  renderer.render(scene, camera);
	requestAnimationFrame(animate);
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
    data[j] = 42 + factor * 22
    data[j+1] = 22 + factor * 21
    data[j+2] = 128 - factor * 13
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
