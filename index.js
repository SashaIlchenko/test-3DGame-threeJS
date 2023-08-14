import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

const scene = new THREE.Scene();
const sunLight = new THREE.DirectionalLight(0xffffff, 4);
sunLight.position.set(5, 5, 5);
sunLight.castShadow = true;
scene.add(sunLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const sceneContainer = document.querySelector('.scene-container');
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
scene.background = new THREE.Color(0x87CEEB)
renderer.setSize(sceneContainer.offsetWidth, sceneContainer.offsetHeight);
sceneContainer.appendChild(renderer.domElement);

const buttonPlay = document.querySelector('.hand-element');
const textPlay = document.querySelector('.text-element');
const imgWrapper = document.querySelector('.img-wrapper');
const resultText = document.querySelector('.results-label')
imgWrapper.addEventListener('click', onBtnClick)
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
let manSpeed = 10;
let run;
let won;
let died;
const loader = new GLTFLoader()
const brainPositions = [
    new THREE.Vector3(-4, 0, -10),
    new THREE.Vector3(-4, 0, -40),
    new THREE.Vector3(4, 0, -20),
    new THREE.Vector3(-4, 0, -30),
    new THREE.Vector3(4, 0, -50),
    new THREE.Vector3(0, 0, -65),
    new THREE.Vector3(-4, 0, -80),
    new THREE.Vector3(4, 0, -60),
    new THREE.Vector3(4, 0, -70),
    new THREE.Vector3(0, 0, -85),
    new THREE.Vector3(0, 0, -90),
    new THREE.Vector3(4, 0, -100)
];
const brains = [];

for (let i = 0; i < brainPositions.length; i++) {
    loadBrainModel(brainPositions[i], i);
}
const clock = new THREE.Clock();
loader.load('/threejs_tz/Stickman.glb', (gltf) => {
    man = gltf.scene;
    man.position.z = -2;
    man.rotation.y = Math.PI;
    man.children[0].children[0].visible = false;
    man.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const meshMaterial = child.material;
            meshMaterial.color.set(0xFFA500);
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    mixer = new THREE.AnimationMixer(man);
    run = mixer.clipAction(gltf.animations[4]);
    won = mixer.clipAction(gltf.animations[0]);
    died = mixer.clipAction(gltf.animations[2]);

    run.play();
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
function loadBrainModel(pos, index) {
    loader.load('/threejs_tz/Brain.glb', (gltf) => {
        brain = gltf.scene;
        brain.scale.set(2, 2, 2)
        brain.position.copy(pos);
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
    wayTextureOffsetX += (manSpeed * clock.getDelta()) / 10;
    way.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.map.offset.x = wayTextureOffsetX;
            child.receiveShadow = true;
        }
    })
    for (let i = 0; i < brains.length; i++) {
        let brainEl = brains[i];
        const position = brainPositions[i];
        position.z += (manSpeed * 500) * clock.getDelta();
        brainEl.position.copy(position);
        mixer.update(clock.getDelta());
        if (man.position.distanceTo(brainEl.position) < 1) {
            scene.remove(brainEl);
            let currentSum = parseInt(resultText.textContent);
            currentSum += 1;
            resultText.textContent = currentSum;
        }
    }

    if (parseInt(resultText.textContent) > 200) {
        run.stop();
        won.play();
    }
    else if (parseInt(resultText.textContent) > 120 && parseInt(resultText.textContent) < 200) {
        setTimeout(() => {
            run.stop();
            died.play();
        }, 20000);

    }
    renderer.render(scene, camera);
}

function onBtnClick() {
    animate();
    imgWrapper.classList.add('.is-hidden');
    textPlay.classList.add('is-hidden');
    buttonPlay.classList.add('is-hidden')
}



