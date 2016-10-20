
const GLOBE_RADIUS = 1;

var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');

var Globe = require('./globe');
var GlobeData = require('./globe-data');
var GlobeUtils = require('./globe-utils');

// var THREE = require("three");

var scene, camera, renderer, controls;

init();

// initialises scene
function init() {

    window.addEventListener('resize', onWindowResize, false);

    var width = window.innerWidth;

    scene = new THREE.Scene();
    scene.origin = new THREE.Vector3(0,0,0);

    camera = new THREE.PerspectiveCamera( 45, width / window.innerHeight, 0.01, 1000 );
    camera.position.z = GLOBE_RADIUS * 3;

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2); // soft white light
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xbbbbbb, 0.8);
    scene.add( directionalLight );
    directionalLight.position.copy(camera.position);

    controls = new OrbitControls( camera );
    controls.enablePan = false;
    // controls.autoRotate = true;
    controls.minDistance = GLOBE_RADIUS * 2;
    controls.maxDistance = GLOBE_RADIUS * 3;
    controls.minPolarAngle = (Math.PI / 10) * 2.5; // radians
    controls.maxPolarAngle = (Math.PI / 10) * 6.5;
    
    controls.addEventListener('change', function(evt) {
        directionalLight.position.copy(camera.position);
    });

    var globe = new Globe(scene, 1);
    var data = new GlobeData.rawDataSphereMesh(scene, 1.02, hadcrut4);
    var annotations = new GlobeData.annotations(data);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( width, window.innerHeight );
    renderer.setClearColor( 0x000000 );

    document.getElementById('content').appendChild( renderer.domElement );

    // data = new GlobeData.indianMonsoonSeason(globeMesh);
    // data.play();
    
    // annotations = new GlobeAnnotations(globeMesh);
    // press 'h' to show/hide gui

    var gui = new dat.GUI();


    var obj = {
        inc : function() {
            console.log("clicked");
            data.increaseCDI();
            // annotations.add(50.3,-3.3,"hello world");
        },
        dec : function() {
            data.decreaseCDI();
        }

    };
    var guiDataFolder = gui.addFolder('data');
    guiDataFolder.add(obj,'inc');
    guiDataFolder.add(obj,'dec');

    var guiCamFolder = gui.addFolder('camera');
    guiCamFolder.add(camera.position, 'x', -5, 5).listen();
    guiCamFolder.add(camera.position, 'y', -5, 5).listen();
    guiCamFolder.add(camera.position, 'z', -5, 5).listen();

    animate();
}

// animates the scene
function animate(time) {

    scene.dispatchEvent({type:"animate", message: time});
    controls.update();
    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

    var spriteAlignment = THREE.SpriteAlignment.topLeft;


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}