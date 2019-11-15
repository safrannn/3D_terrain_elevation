import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols')

const elevationScale = 0.000434 * (4372 - 176)
const scale = 5


var camera, controls, scene, renderer
var planeSize, plane

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

//generate terrain
generateTerrain()

function animate(){
  renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate()


//return array with height data from img
function getHeightData(img) {
  var canvas = document.createElement( 'canvas' );
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext( '2d' );

  var size = img.width * img.height;
  var data = new Float32Array( size );

  context.drawImage(img,0,0);

  for ( var i = 0; i < size; i ++ ) {
      data[i] = 0
  }

  var imgd = context.getImageData(0, 0, img.width, img.height);
  var pix = imgd.data;

  var j=0;
  for (var i = 0; i<pix.length; i +=4) {
      var all = pix[i]+pix[i+1]+pix[i+2];
      data[j++] = all/12;
  }

  return data
}

function getTexture(img){

}
function generateTerrain(){
  // generate terrain
  var img = new Image()

  img.src = "src/height_map.png"

  img.onload = function () {
    //get height data from img
    var data = getHeightData(img)

    planeSize = img.width

    // plane
    var geometry = new THREE.PlaneGeometry(planeSize,planeSize,planeSize- 1 ,planeSize - 1);
    var diffuseMap = new THREE.TextureLoader().load( img.src );
    var normalMap = new THREE.TextureLoader().load("src/normal_map.png");
    var material = new THREE.MeshLambertMaterial( {color:diffuseMap, normalMap: normalMap, wireframe: true } );
    plane = new THREE.Mesh( geometry, material );

    //set height of vertices
    for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
         plane.geometry.vertices[i].z = data[i] * elevationScale
    }

    plane.geometry.computeVertexNormals();

    plane.rotateX(THREE.Math.degToRad(-90))
    scene.add(plane);
    camera.position.z = planeSize * 1.5
  };
}
