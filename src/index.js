import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols')

const planeSize = 500
const elevationScale = 1


var camera, controls, scene, renderer, plane

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


//generate terrain
generateTerrain()

function animate(){
  renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate()


//return array with height data from img
function getHeightData(img,scale) {

 if (scale == undefined) scale=1;

    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
    context.drawImage(img,0,0, img.width, img.height);

    var size = img.width * img.height;
    var data = new Float32Array( size );

    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }

    return data;
}

function generateTerrain(){
  // generate terrain
  var img = new Image()

  img.src = "src/height_map.png"
  img.onload = function () {
    //get height data from img
    var data = getHeightData(img)

    // plane
    var geometry = new THREE.PlaneGeometry(planeSize,planeSize,planeSize-1,planeSize-1);
    // var texture = THREE.ImageUtils.loadTexture( img.src );
    var material = new THREE.MeshNormalMaterial( {wireframe: true } );
    plane = new THREE.Mesh( geometry, material );

    //set height of vertices
    for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
      plane.geometry.vertices[i].z = data[i]*elevationScale;
    }

    plane.geometry.computeVertexNormals();

    plane.rotateX(THREE.Math.degToRad(-90))
    scene.add(plane);
    camera.position.z = planeSize * 1.5
  };
}
