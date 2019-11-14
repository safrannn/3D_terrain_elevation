import * as THREE from 'three';

// const max_elevation = 4148
// const zx_scale_factor = 0.005396608132664835
const planeSize = 1400

// setup scene
var scene = new THREE.Scene();
scene.background = new THREE.Color( 'skyblue' )
//setup camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = 5

//setup renderer
var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);


function getHeightData(img,scale) {

 if (scale == undefined) scale=1;

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
        data[j++] = all/(12*scale);
    }

    return data;
}

// terrain
var img = new Image();
img.onload = function () {

//get height data from img
var data = getHeightData(img);

// plane
var geometry = new THREE.PlaneGeometry(10,10,9,9);
var texture = THREE.ImageUtils.loadTexture( "img/height_map.png" );
var material = new THREE.MeshLambertMaterial( { map: texture } );
plane = new THREE.Mesh( geometry, material );

//set height of vertices
for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
  plane.geometry.vertices[i].z = data[i];
}

scene.add(plane);

};
// load img source
img.src = "img/height_map.png";


var animate = function() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
};

animate();
