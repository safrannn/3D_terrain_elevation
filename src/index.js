import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols')



var camera, controls, scene, renderer
var planeSize, plane
var heightLimit = 4272
var elevationScale = 0.0316 * heightLimit
var contourScale = 10
var contourHeight = 500

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
var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
directionalLight.position.set( 100, 350, 250 );
directionalLight.castShadow = true;
scene.add( directionalLight );

//load image
var img = new Image()
img.src = "src/height_map.png"

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
  var size = img.width * img.height
  var data = new Float32Array(size)

  for (var i = 0; i < pix.length; i +=4) {
      data[i/4] = pix[i]
  }
  return data
}

function getTexture(){
  var pix  = readImageData()
  var size = img.width * img.height
  var data = new Uint8Array(img.width * img.height*4)

  for (var i = 0; i < pix.length; i+=4) {
    // var currentHeight = heightLimit * pix[i] / 256
    // // console.log(currentHeight)
    // if (currentHeight % contourHeight < 10){
    //   data[i] = 0
    //   data[i+1] = 0
    //   data[i+2] = 0
    //   data[i+3] = 255
    // }else{
    //   data[i] = 255
    //   data[i+1] = 255
    //   data[i+2] = 255
    //   data[i+3] = 255
    // }
    if (pix[i] % 50 == 0){
      data[i] = 0
        data[i+1] = 0
        data[i+2] = 0
        data[i+3] = 255
      }else{
        data[i] = 255
        data[i+1] = 255
        data[i+2] = 255
        data[i+3] = 255
      }
  }
  return data
}

function generateTerrain(){
  // generate terrain
  img.onload = function () {
    //get height data from img
    var heightData = getHeightData()

    planeSize = img.width
    elevationScale /= (img.width * 0.25)

    // plane
    var geometry = new THREE.PlaneGeometry(planeSize,planeSize,planeSize - 1 ,planeSize - 1)
    var diffuseMap = new THREE.DataTexture(getTexture(), img.width, img.height, THREE.RGBAFormat )
    diffuseMap.flipY = true
    // var normalMap = new THREE.TextureLoader().load("src/normal_map.png")
    var specularMap = new THREE.TextureLoader().load("src/specular_map.png")
    var ambientMap = new THREE.TextureLoader().load("src/ambient_map.png")
    // var material = new THREE.MeshStandardMaterial( {map:diffuseMap, normalMap:normalMap, specularMap:specularMap,aoMap: ambientMap, wireframe: false } )
    var material = new THREE.MeshStandardMaterial({map:diffuseMap,specularMap:specularMap,aoMap: ambientMap})
    plane = new THREE.Mesh( geometry, material )

    //set height of vertices
    for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
         plane.geometry.vertices[i].z = heightData[i] * elevationScale
    }

    plane.geometry.computeVertexNormals();

    plane.rotateX(THREE.Math.degToRad(-90))
    scene.add(plane);
    camera.position.z = planeSize * 1.5
  }
}
