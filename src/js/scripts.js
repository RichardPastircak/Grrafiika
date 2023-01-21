import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import { ConvexPolyhedron, Plane, Vec3 } from 'cannon-es';
//import { GLTFLoader } from '../js/examples/jsm/loaders/GLTFLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import image4 from '../img/planet.jpg';
const monkeyUrl = new URL('../img/classroom.glb', import.meta.url);

//import { generateUUID } from 'three/src/math/MathUtils';
//import { Quaternion } from 'three';

//GLOBAL VARIABLES------------------------------
let objektMesh, objektBody;
let groundMesh, coneMesh, boxMesh, sphereMesh, ground2Mesh, ground3Mesh;
let groundBody, coneBody, boxBody, sphereBody, ground2Body, ground3Body;
let obj, toRemove = [];

const renderer =new THREE.WebGLRenderer();


const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
);
const orbit = new OrbitControls(camera, renderer.domElement);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81,0)
});

const timeStep = 1/60;

const gui = new dat.GUI({width: 360});
const options = {
    color: '#ff0000',
    mass: 10,
    gravity: 9.81,
    air_resistance: 0.31,
    jump_speed: 15,
    starting_position: 20,
    push_power: 5
};


//START 
init();
init_gravity_world();

//INICILIZE OBJEKT AND SCENE
function init(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;

    camera.position.set(30,20, 70);
    orbit.update();

    //Precreate objects
    const coneGeo = new THREE.ConeGeometry(6, 8, 16);
    const coneMat = new THREE.MeshPhongMaterial({
        color: 0xff0000,
    });
    coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.castShadow = true;

    const boxGeo = new THREE.BoxGeometry(8, 8, 8);
    const boxMat = new THREE.MeshPhongMaterial({
 	    color: 0xff0000,
    });
    boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.castShadow = true;

    const sphereGeo = new THREE.SphereGeometry(4);
    const sphereMat = new THREE.MeshPhongMaterial({ 
	    color: 0xff0000, 
    });
    sphereMesh = new THREE.Mesh( sphereGeo, sphereMat);
    sphereMesh.castShadow = true;
    objektMesh = sphereMesh;
    scene.add(objektMesh);

    //Create 1 plane
    const groundGeo = new THREE.PlaneGeometry(40.5,20);
    const groundMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color("#02718f"),
        side: THREE.DoubleSide,
        
    });
    groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.visible = false;
    scene.add(groundMesh);
    groundMesh.receiveShadow = true;

    //Create 2 plane
    const ground2Geo = new THREE.PlaneGeometry(30,30);
    const ground2Mat = new THREE.MeshPhongMaterial({
        color: 0x03728fb0,
        side: THREE.DoubleSide,
        
    });
    ground2Mesh = new THREE.Mesh(ground2Geo, ground2Mat);
    ground2Mesh.position.set(0, 40, 0);
    scene.add(ground2Mesh);
    ground2Mesh.receiveShadow = true;

    //Create 3 plane
    const ground3Geo = new THREE.PlaneGeometry(100,100);
    const ground3Mat = new THREE.MeshPhongMaterial({
        color: 0x03728fb0,
        side: THREE.DoubleSide,
        
    });
    ground3Mesh = new THREE.Mesh(ground3Geo, ground3Mat);
    ground3Mesh.position.set(0, 50, 0);
    scene.add(ground3Mesh);
    ground3Mesh.receiveShadow = true;
    ground3Mesh.visible = false;

    //Light
    const ambientLight = new THREE.AmbientLight(0x333333);
    ambientLight.intensity = 4;
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    scene.add(directionalLight);
    directionalLight.position.set(150, 60, 1);
    directionalLight.intensity = 0.4;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;

    const helpLight = new THREE.SpotLight(0xFFFFFF, 0.1);
    scene.add(helpLight);
    helpLight.position.set(0, 120, 0);
    //const helper = new THREE.SpotLightHelper(helpLight);
    //scene.add(helper);
    helpLight.angle = Math.PI / 2;

  

    // const helper = new THREE.DirectionalLightHelper(directionalLight);
    // scene.add(helper);
    // const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(dLightShadowHelper);


    //3D background
    const assetLoader = new GLTFLoader();

    assetLoader.load(monkeyUrl.href, function(gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(-52, 40, -10);
        model.scale.set(50, 50, 50);
        model.receiveShadow = true;
        model.castShadow = true;

        model.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        })

    }, undefined, function(error){
        console.error(error);
    });

    
    //Background
    const textureLoader = new THREE.TextureLoader();
    
    // var loader = new THREE.GLTFLoader();
    // loader.load( '../img/classroom.glb', function ( gltf )
    // {
    //     sword = gltf.scene;  // sword 3D object is loaded
    //     sword.scale.set(2, 2, 2);
    //     sword.position.y = 4;
    //     scene.add(sword);
    // } );  

    scene.background = textureLoader.load(image4);

    //3D image:
    //const cubeTextureLoader = new THREE.CubeTextureLoader();
    //scene.background = cubeTextureLoader.load([
    //  snimka2,
        //snimka2,
    // snimka,
    // snimka,
    // snimka,
    // snimka
    //]);
}

//PHYSICS---------------------------------------------------------
function init_gravity_world(){
    //Create physical objects
    const groundPhysMat = new CANNON.Material();
    groundBody = new CANNON.Body({
        //shape: new CANNON.Plane(), //creates infinite ground
        shape: new CANNON.Box(new CANNON.Vec3(18.5,20,0.1)), //3rd is thickness
        type: CANNON.Body.STATIC, // the object will not move
        material: groundPhysMat
    });
    world.addBody(groundBody); 
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //the mesh will update itself from physics world
    
    //plane 2
    const ground2PhysMat = new CANNON.Material();
    ground2Body = new CANNON.Body({
        shape: new CANNON.Plane(), //creates infinite ground
        //shape: new CANNON.Box(new CANNON.Vec3(15,15,0.1)), //3rd is thickness
        type: CANNON.Body.STATIC, // the object will not move
        material: ground2PhysMat,
        position: new CANNON.Vec3(0, -43, 0) 
    });
    world.addBody(ground2Body); 
    ground2Body.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //the mesh will update itself from physics world

    //plane3
    const ground3PhysMat = new CANNON.Material();
    ground3Body = new CANNON.Body({
        shape: new CANNON.Plane(), //creates infinite ground
        //shape: new CANNON.Box(new CANNON.Vec3(15,15,0.1)), //3rd is thickness
        type: CANNON.Body.STATIC, // the object will not move
        material: ground3PhysMat,
        position: new CANNON.Vec3(190, -50, 0) 
    });
    world.addBody(ground3Body); 
    ground3Body.quaternion.setFromEuler(0, -Math.PI / 2, 0); //the mesh will update itself from physics world
 

    const conePhysMat = new CANNON.Material();
    coneBody = new CANNON.Body({
        mass: 10,
        shape: new CANNON.Cylinder(0.01, 6, 8, 16, 1), 
        position: new CANNON.Vec3(0, 20, 0), 
        material: conePhysMat
    });

    const boxPhysMat = new CANNON.Material();
    boxBody = new CANNON.Body({
        mass: 10,
        shape: new CANNON.Box(new CANNON.Vec3(4,4,4)), //sizes needs to be half of the original
        position: new CANNON.Vec3(0, 20, 0), 
        material: boxPhysMat
    });

    const spherePhysMat = new CANNON.Material();
    sphereBody = new CANNON.Body({
        mass: 10,
        shape: new CANNON.Sphere(4), //the radius needs to be same as original
        position: new CANNON.Vec3(0, 20, 0), 
        material: spherePhysMat
    });
    sphereBody.linearDamping = 0.31;
    objektBody = sphereBody;
    world.addBody(objektBody);
    

    //Materials
    const sphereContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        spherePhysMat,
        {restitution: 0.8}
    );
    world.addContactMaterial(sphereContactMat);

    const boxContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        boxPhysMat,
        {restitution: 0.8, friction: 0}
    );
    world.addContactMaterial(boxContactMat);

    const coneContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        conePhysMat,
        {restitution: 0.8, friction: 0}
    );
    world.addContactMaterial(coneContactMat);
}

//RENDER & LISTENERS---------------------------------------
function animate() {
    world.step(timeStep); // update the phyzics world

    groundMesh.position.copy(groundBody.position); 
    groundMesh.quaternion.copy(groundBody.quaternion); //orientation

    ground2Mesh.position.copy(ground2Body.position); 
    ground2Mesh.quaternion.copy(ground2Body.quaternion); //orientation

    ground3Mesh.position.copy(ground3Body.position); 
    ground3Mesh.quaternion.copy(ground3Body.quaternion);

    objektMesh.position.copy(objektBody.position);
    objektMesh.quaternion.copy(objektBody.quaternion);
    objektBody.mass = options.mass;
    objektBody.linearDamping = options.air_resistance;

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

//Resizer function
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//stop the movement and change obj position to starting
let restart = {restart_animation:function (){
    objektBody.position.set(0,options.starting_position,0);
    objektBody.velocity = new Vec3(0,0,0);
    objektBody.angularVelocity = new Vec3(0,0,0);
    objektBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,0), Math.PI / 2);
}};

//functions that help with changing objects from one to another
function changeObj(mesh,body){
    world.removeBody(objektBody);
    scene.remove(objektMesh);
    objektBody = body;
    objektMesh = mesh;
    world.addBody(objektBody);
    scene.add(objektMesh);
}

//removes part of gui that arent needed for new type of movement
function removeRedundantGUI(){
    length = toRemove.length;
    for (let i = 0; i < length; i++){
        gui.remove(toRemove.pop());
    }
}

//GUI-------------------------------------------------------------------------------------------------
gui.addColor(options, 'color').onChange(function(e){
    objektMesh.material.color.set(e);
    sphereMesh.material.color.set(e);
    coneMesh.material.color.set(e);
    boxMesh.material.color.set(e);
}).name("Color");

gui.add(options, 'mass', 0, 1000, 10).name("Mass");
gui.add(options, 'air_resistance', 0, 1).name("Air resistance");

gui.add(options, 'gravity').onChange(function(e){
    world.gravity.set(0, -(e), 0);
}).name("Gravity");

gui.add(options, "starting_position", 4, 30).name("Starting position Y");

gui.add(restart,'restart_animation').name("Restart");

obj = { change_object_to_sphere:function(){ 
    if (objektBody !== sphereBody){
        changeObj(sphereMesh, sphereBody);
    }
    restart.restart_animation();
 }};
gui.add(obj,'change_object_to_sphere').name("Change to Ball");


obj = { change_object_to_box:function(){ 
    if (objektBody !== boxBody){
        changeObj(boxMesh, boxBody);
    }
    restart.restart_animation();
 }};
gui.add(obj,'change_object_to_box').name("Change to Box");


obj = { change_object_to_cone:function(){ 
    if (objektBody !== coneBody){
        changeObj(coneMesh, coneBody);
    }
    restart.restart_animation();
 }};
gui.add(obj,'change_object_to_cone').name("Change to Cone");


//BUTTONS - CHANGE MOVEMENT TYPE FUNCTIONS--------------------------------------------------------------------------------
document.getElementById("btn1").addEventListener('click', event => {
    removeRedundantGUI();
    jump();
});

function jump (){
    obj = {move_object:function(){
        restart.restart_animation();
        setTimeout(uneven_movement_up, 250);       
    }
    };
    function uneven_movement_up(){
        objektBody.velocity = new Vec3(0,options.jump_speed,0);
    }
    
    options.starting_position = 4;
    options.air_resistance = 0.31;
    options.gravity = 9.81;
    world.gravity.set(0, -9.81, 0);
    gui.updateDisplay();  
    toRemove.push(gui.add(obj, 'move_object').name("Jump"));
    toRemove.push(gui.add(options, "jump_speed", 1, 65).name("Jump power"));
    obj.move_object();
}

document.getElementById("btn2").addEventListener('click', event => {
    removeRedundantGUI();
    free_fall();
});
function free_fall(){
    options.starting_position = 20;
    options.air_resistance = 0.31;
    options.gravity = 9.81;
    world.gravity.set(0, -9.81, 0);
    gui.updateDisplay();
    restart.restart_animation();  
}

document.getElementById("btn3").addEventListener('click', event => {
    removeRedundantGUI();
    even_movement();
})
function even_movement(){
    obj = {move_object:function(){
        restart.restart_animation();
        setTimeout(even_movement_side, 250);       
    }
    };
    function even_movement_side(){
        objektBody.velocity = new Vec3(options.push_power,0,0);
    }

    options.starting_position = 4;
    options.air_resistance = 0.0;
    gui.updateDisplay();
    toRemove.push(gui.add(obj, "move_object").name("Push"));
    toRemove.push(gui.add(options, "push_power",0,100).name("Power"));
    obj.move_object();
}


//COMMENTS------------------------------------------------------------------------
//creating metrial for box
 //const boxPhysMat = new CANNON.Material();

 //const boxBody = new CANNON.Body({
  //   mass: 1, //this is also work as weight the more mass the harder is to move object with other
  //   shape: new CANNON.Box(new CANNON.Vec3(1,1,1)), //the values has to be half the size of original box
 //    position: new CANNON.Vec3(1, 20, 0), //position the object to preveny starting jump
 //    material: boxPhysMat
 //});
 ///world.addBody(boxBody);

//rotation of object 
//boxBody.angularVelocity.set(0, 10, 0);
//boxBody.angularDamping = 0.5;

//configuration of reaction of materials
 //const groundBoxContactMat = new CANNON.ContactMaterial(
    // groundPhysMat, //metrial1
    // boxPhysMat, //metrial 2
    // {friction: 0} //how should the contact be
 //);
 //world.addContactMaterial(groundBoxContactMat);