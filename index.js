import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const sunLight = new THREE.DirectionalLight(0xffffff, 4);
sunLight.position.set(5, 5, 5);
sunLight.castShadow = true;
scene.add(sunLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
scene.background = new THREE.Color(0x87CEEB)
document.body.appendChild(renderer.domElement);
const buttonPlay = document.querySelector('.hand-element');
const textPlay = document.querySelector('.text-element');
buttonPlay.addEventListener('click', onBtnClick)
const controlCamera = new OrbitControls(camera, renderer.domElement);
controlCamera.update();
controlCamera.enableDamping = true;
controlCamera.minDistance = 10;
camera.position.z = 10;
camera.position.x = 0;
camera.position.y = 5;
let man;
let mixer;
let way;
let brain;
let wayTextureOffsetX = 0;
let manSpeed = 1;
const loader = new GLTFLoader()
const brainPositions = [
    new THREE.Vector3(-4, 0, -15),
    new THREE.Vector3(-4, 0, -3),
    new THREE.Vector3(4, 0, -30),
    new THREE.Vector3(-4, 0, -20),
    new THREE.Vector3(4, 0, -25),
    new THREE.Vector3(0, 0, -50),
    new THREE.Vector3(-4, 0, -42),
    new THREE.Vector3(4, 0, -65)
];
const brains = [];

for (let i = 0; i < brainPositions.length + 1; i++) {
    loadBrainModel(brainPositions[i], i);
}
const clock = new THREE.Clock();
loader.load('/threejs_tz/Stickman.glb', (gltf) => {
    man = gltf.scene;
    man.position.z = -2;
    man.rotation.y = Math.PI;
    man.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const meshMaterial = child.material;
            meshMaterial.color.set(0xFFA500);
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    mixer = new THREE.AnimationMixer(man);

    mixer.clipAction(gltf.animations[4]).play();
    window.addEventListener('keypress', (e) => {
        switch (e.code) {
            case 'KeyA':
                man.position.x = -4;
                break;
            case 'KeyS':
                man.position.x = 0;
                break;
            case 'KeyD':
                man.position.x = 4;
                break;
            default:
                break;
        }
    })
    scene.add(man);

})
loader.load('/threejs_tz/TrackFloor.glb', (gltf) => {
    way = gltf.scene;
    way.position.z = 0;
    way.scale.set(2, 2, 10)
    scene.add(way)
})
function loadBrainModel(position, index) {
    loader.load('/threejs_tz/Brain.glb', (gltf) => {
        brain = gltf.scene;
        brain.position.copy(position);
        brain.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const meshMaterial = child.material;
                meshMaterial.color.set(0xEE82EE);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(brain);
        brains[index] = brain;
    });
}

function animate() {
    requestAnimationFrame(animate);
    mixer.update(clock.getDelta());
    wayTextureOffsetX += manSpeed * clock.getDelta();
    way.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.map.offset.x = wayTextureOffsetX;
            child.receiveShadow = true;
        }
    })

    for (let i = 0; i < brains.length; i++) {
        const brainEl = brains[i];
        const position = brainPositions[i];
        position.z += (manSpeed * 500) * clock.getDelta();
        brainEl.position.copy(position);
        mixer.update(clock.getDelta());
        if (man.position.distanceTo(brainEl.position) < 1) {
            scene.remove(brainEl);
        }
    }
    mixer.update(clock.getDelta());
    controlCamera.update();
    renderer.render(scene, camera);
}
function onBtnClick() {
    animate();
    buttonPlay.classList.add('is-hidden');
    textPlay.classList.add('is-hidden')
}



