import './style.css'
import * as THREE from 'three'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let model_3d;
let rotaion_speed = 0.1;
let characteristic;



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//adding light 
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 5, 5, 5 );
scene.add( directionalLight );
const spotLight = new THREE.SpotLight( 0xff0000 );
spotLight.position.set( 1000, 1000, 1000 );
// spotLight.map = new THREE.TextureLoader().load( url );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );
//add model 
const loader = new GLTFLoader();

 loader.load( 'assest/dakon_board.gltf', function ( gltf ) {
  model_3d = gltf.scene
  // model_3d.rotation.z = 120;
  model_3d.rotation.y=135;
	scene.add( model_3d);

}, undefined, function ( error ) {

	console.error( error );

} );
// adding to the scene 
// scene.add( cube );
const controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
// camera.position.set( 0, 20, 100 );
controls.update();
camera.position.z = 5;

  





// Connect to the ESP32 via Web Bluetooth
async function connect() {
try {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['00001111-0000-1000-8000-00805f9b34fb'] }],
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('00001111-0000-1000-8000-00805f9b34fb');
  characteristic = await service.getCharacteristic('00002222-0000-1000-8000-00805f9b34fb');

  characteristic.addEventListener('characteristicvaluechanged', handleData);
  await characteristic.startNotifications();
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.log('User cancelled the device selection.');
  } else {
    console.error('Error:', error);
  }
}
}

// Handle incoming data and update the 3D object's rotation
function handleData(event) {
const data = event.target.value;
const decoder = new TextDecoder('utf-8');
const dataString = decoder.decode(data);

const [x, y, z] = dataString.split(',');

// Update the rotation of the 3D object (assuming 'cube' represents the object)
model_3d.rotation.z = parseFloat(x) * rotaion_speed;
model_3d.rotation.x = parseFloat(y) * rotaion_speed;
model_3d.rotation.y = parseFloat(z) * rotaion_speed;

console.log('X:', x, 'Y:', y, 'Z:', z);
return 
}

// Disconnect from the ESP32
async function disconnect() {
try {
  if (characteristic) {
    await characteristic.stopNotifications();
    characteristic.removeEventListener('characteristicvaluechanged', handleData);
    characteristic = null;
  }
} catch (error) {
  console.error('Error:', error);
}
}

const connectButton = document.getElementById('connect');

// Set up the click event listener
connectButton.addEventListener('click', connect);

function animate() {
	requestAnimationFrame( animate );
  model_3d.rotation.y+=0.01;
  directionalLight.animations;




	renderer.render( scene, camera );
}

animate(); 
