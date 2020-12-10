import * as THREE from "./three/build/three.module.js";

import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "./three/examples/jsm/controls/DragControls.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./three/examples/jsm/loaders/RGBELoader.js";
import { RoughnessMipmapper } from "./three/examples/jsm/utils/RoughnessMipmapper.js";
import { TextureLoader } from "./three/src/loaders/TextureLoader.js";

var container, controls, controlsDM;
var camera, scene, renderer, gltf, camera1;
var objects = [];
var mouse = new THREE.Vector2();
var objectBoard;
var objectSheet;
var objectCandle;
var objectFlame;
var objectTv;
var objectScreen;
var objectlensStand;
var objectLensHolder;
var objectScale;
var objectLens;
var objectButton1;
var objectButton2;
var hintSprite;
var centerLine;
var topLine;
var arrow;
var score;
var step = 0;
var clickCount;
var intersects = [];
var lmousex;
var oldPositionCandle = new THREE.Vector3();
var newPositionCandle = new THREE.Vector3();
var oldPositionBoard = new THREE.Vector3();
var newPositionBoard = new THREE.Vector3();
var oldPositionLens = new THREE.Vector3();
var oldPositionSheet = new THREE.Vector3();
var lObjectPositionx;
var lObjectPositiony;
var lObjectPositionz;
var tex,
  texArray = [],
  LenstexArray = [],
  CandlelineVertices = [],
  ToplineVertices = [];
var positionAttribute;
var TopLinepositionAttribute;
var CandlelineGeometry;
var Candleline;
var Lensline;
var ToplineGeometry;
var centerLine;
var textStep = [];
var text = [];
var texCanvas;
var readings = [];
var highlightRow = 1;
var highlightColumn = 0;
var hintTaken = false;
var getReading = false;
var doneFlag = false;
var redoFlag = false;
var reCalcFlag = false;
var readingCords;
var answered = [false,false,false,false,false,false,false]

var canvasScreen = document.createElement("canvas");
var ctx = canvasScreen.getContext("2d");
var canvasSprite = document.createElement("canvas");
var ctxSprite = canvasSprite.getContext("2d");
var SpriteCanvasTexture;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

init();
//animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    5,
    1000
  );
  camera1 = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    5,
    1000
  );
  camera.position.set(0, 0, 1);
  //camera.rotation.z = (90 * Math.PI) / 180; */
  //camera.position.set(0, 0, 90);
  //camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera1.copy(camera,true);
  scene = new THREE.Scene();

  const loadingManager = new THREE.LoadingManager( () => {
	
		const loadingScreen = document.getElementById( 'loading-screen' );
		loadingScreen.classList.add( 'fade-out' );
		
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
		
	} );

  new RGBELoader(loadingManager)
    .setDataType(THREE.UnsignedByteType)
    .setPath("images/")
    .load("equirectangular_room.hdr", function (texture) {
      var envMap = pmremGenerator.fromEquirectangular(texture).texture;

      scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      render();

      // model

      // use of RoughnessMipmapper is optional
      var roughnessMipmapper = new RoughnessMipmapper(renderer);

      var loader = new GLTFLoader().setPath("");
      loader.load(
        "convex_simple_table.gltf",
        function (gltf) {
          gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              //RoughnessMipmapper seems to be broken with WebGL 2.0
              roughnessMipmapper.generateMipmaps(child.material);
            }
          });
          console.log(gltf.scene);
          //Moving single object (candle)
          objectCandle = gltf.scene.getObjectByName("candle");
          objectBoard = gltf.scene.getObjectByName("board");
          objectSheet = gltf.scene.getObjectByName("sheet");
          objectScreen = gltf.scene.getObjectByName("tvscreen");
          objectlensStand = gltf.scene.getObjectByName("lensStand");
          objectLens = gltf.scene.getObjectByName("lens");
          objectButton1 = gltf.scene.getObjectByName("button1");
          objectButton2 = gltf.scene.getObjectByName("button2");
          objectScale = gltf.scene.getObjectByName("scale");
          objectLensHolder = gltf.scene.getObjectByName("lensHolder");
          objectFlame = gltf.scene.getObjectByName("flame");
          objectTv = gltf.scene.getObjectByName("tv");
          //lens material


          //console.log("x Position of flame: " + objectFlame.position.x);
          //textAim = ["Aim:", " To", " find", " the", " focal", " length", " of", " convex", " lens" ];
          var textAim = [
            "Instructions",
            "\u261E At every step, read the instructions carefully.",
            "\u261E For every correct answer, you will be given a score.",
            "\u261E For hint, click on the \u2753 symbol",
            "If you use a hint, you will not be awarded with a",
            "score for that question.",
            "",
            "To start the experiment, click on the arrow button"
          ];

          drawCanvasText(textAim, 12);

          // canvas contents will be used for a texture
          texCanvas = new THREE.CanvasTexture(ctx.canvas);
          texCanvas.encoding = THREE.sRGBEncoding;
          texCanvas.flipY = false;
          texCanvas.needsUpdate = true;
          var materialCanvas = new THREE.MeshBasicMaterial({
            map: texCanvas,
            color: 0xffffff,
            side: THREE.FrontSide,
          });
          //material1.transparent = true;

          objectScreen.material = materialCanvas;

          //Create canvas for camera button icon
          var canvasCam = document.createElement("canvas");
          var ctxCamera = canvasCam.getContext("2d");
          //Draw camera on canvas
          /*drawCanvasCamera(canvasCam, ctxCamera);*/
          drawCanvasRedo(canvasCam, ctxCamera);
          var texCamera = new THREE.CanvasTexture(ctxCamera.canvas);
          texCamera.encoding = THREE.sRGBEncoding;
          texCamera.flipY = false;
          texCamera.needsUpdate = false;
          var materialCamera = new THREE.MeshBasicMaterial({
            map: texCamera,
            color: 0xffffff,
            side: THREE.FrontSide,
          });
          objectButton1.material = materialCamera;

          //Create canvas for proceed button icon
          var canvasProceed = document.createElement("canvas");
          var ctxProceed = canvasProceed.getContext("2d");
          //Draw Proceed icon on canvas
          drawCanvasProceed(canvasProceed, ctxProceed);
          var texProceed = new THREE.CanvasTexture(ctxProceed.canvas);
          texProceed.encoding = THREE.sRGBEncoding;
          texProceed.flipY = false;
          texProceed.needsUpdate = false;
          var materialProceed = new THREE.MeshBasicMaterial({
            map: texProceed,
            color: 0xffffff,
            side: THREE.FrontSide,
          });
          objectButton2.material = materialProceed;

          //create image texture for flame on the sheet

          var flameImages = [
            "flame0.png",
            "flame1.png",
            "flame2.png",
            "flame3.png",
            "flame4.png",
            "flame5.png",
            "flame6.png",
            "flame7.png",
            "flame8.png",
            "flame9.png",
            "flame10.png",
            "flame11.png",
          ];
          for (var i = 0; i <= 11; i++) {
            var image = "./images/flame/" + flameImages[i];
            tex = new TextureLoader().load(image);
            tex.encoding = THREE.sRGBEncoding;
            tex.flipY = false;
            tex.needsUpdate = true;
            texArray[i] = tex;
            //console.log("image: " + image);
          }

          //console.log("applying texture to sheet: " + image);

          //tex.wrapS = tex.wrapT = THREE.repeatWrapping;
          objectSheet.material = new THREE.MeshBasicMaterial({
            map: texArray[11],
            color: 0xffffff,
            side: THREE.FrontSide,
          });
          console.log(gltf.scene);
          //console.log("scene after applying material" + gltf.scene);

          var lens = ["lens1.png","lens_virtual.png"]
          //lens material
          for(var i=0; i<=1; i++){
          var image = "./images/lens/" + lens[i];
            tex = new TextureLoader().load(image);
            tex.encoding = THREE.sRGBEncoding;
            tex.flipY = false;
            tex.needsUpdate = true;
            LenstexArray[0] = tex;
            //console.log("image: " + image);
          }

          //console.log("applying texture to sheet: " + image);

          //tex.wrapS = tex.wrapT = THREE.repeatWrapping;
          objectLens.material = new THREE.MeshBasicMaterial({
            map: LenstexArray[0],
            color: 0xffffff,
            side: THREE.DoubleSide
          });
          objectLens.material.transparent = "true"
          objectLens.material.opacity = 0.5;

          CandlelineVertices = new Float32Array([
            objectCandle.position.x,
            objectCandle.position.y - 0.4,
            objectCandle.position.z,
            objectCandle.position.x,
            objectCandle.position.y - 0.4,
            objectCandle.position.z + 1.6,
          ]);
          console.log("CandlelineVertices: " + CandlelineVertices);
          CandlelineGeometry = new THREE.BufferGeometry();
          positionAttribute = new THREE.Float32BufferAttribute(
            CandlelineVertices,
            3
          );
          positionAttribute.setUsage(THREE.DynamicDrawUsage);
          positionAttribute.needsUpdate = true;
          CandlelineGeometry.setAttribute("position", positionAttribute);

          var LenslineVertices = [];
          console.log("Candle_x: " + objectCandle.position.x);
          console.log("lens_x: " + objectlensStand.position.x);
          console.log("Candle_y: " + objectCandle.position.y);
          console.log("lens_y: " + objectlensStand.position.y);
          console.log("Candle_z: " + objectCandle.position.z);
          console.log("lens_z: " + objectlensStand.position.z);
          LenslineVertices.push(
            new THREE.Vector3(
              objectlensStand.position.x,
              objectlensStand.position.y - 0.5,
              objectlensStand.position.z
            )
          );
          LenslineVertices.push(
            new THREE.Vector3(
              objectlensStand.position.x,
              objectlensStand.position.y - 0.5,
              objectlensStand.position.z + 1.2
            )
          );

          var CenterlineVertices = [];
          CenterlineVertices.push(
            new THREE.Vector3(
              objectlensStand.position.x - 6,
              objectlensStand.position.y - 0.5,
              objectlensStand.position.z
            )
          );
          CenterlineVertices.push(
            new THREE.Vector3(
              objectlensStand.position.x + 6,
              objectlensStand.position.y - 0.5,
              objectlensStand.position.z
            )
          );
          ToplineVertices = new Float32Array([
            objectLens.position.x - 5,
            objectLens.position.y,
            objectLens.position.z,
            objectLens.position.x + 5,
            objectLens.position.y,
            objectLens.position.z,
          ]);
          ToplineGeometry = new THREE.BufferGeometry();
          TopLinepositionAttribute = new THREE.Float32BufferAttribute(
            ToplineVertices,
            3
          );
          TopLinepositionAttribute.setUsage(THREE.DynamicDrawUsage);
          TopLinepositionAttribute.needsUpdate = true;
          ToplineGeometry.setAttribute("position", TopLinepositionAttribute);

          var CenterlineGeometry = new THREE.BufferGeometry().setFromPoints(
            CenterlineVertices
          );

          var LenslineGeometry = new THREE.BufferGeometry().setFromPoints(
            LenslineVertices
          );

          var lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
          });

          Candleline = new THREE.Line(CandlelineGeometry, lineMaterial);
          //Candleline = new THREE.Line(ToplineGeometry, lineMaterial);
          Lensline = new THREE.Line(LenslineGeometry, lineMaterial);
          centerLine = new THREE.Line(CenterlineGeometry, lineMaterial);
          topLine = new THREE.Line(ToplineGeometry, lineMaterial);

          //HintSprite
          drawHintText("Hello");
          SpriteCanvasTexture = new THREE.Texture(canvasSprite);
          //SpriteCanvasTexture.encoding = THREE.sRGBEncoding;
          //SpriteCanvasTexture.flipY = false;
          SpriteCanvasTexture.needsUpdate = true;
          var spriteMaterial = new THREE.SpriteMaterial({
            map: SpriteCanvasTexture,
            color: 0xffffff,
          })
          hintSprite = new THREE.Sprite(spriteMaterial);
          hintSprite.scale.set(2, 1, 1);
          hintSprite.position.set(-5,0,-5);
          hintSprite.visible = false;
          //Add Arrow helper
          var sourcePos = new THREE.Vector3(objectCandle.position.x - 5, objectCandle.position.y, objectCandle.position.z);
          var targetPos = new THREE.Vector3(objectCandle.position.x, objectCandle.position.y, objectCandle.position.z);
          var direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
          arrow = new THREE.ArrowHelper(direction.clone().normalize(), sourcePos, direction.length(), 0x00ff00);
          arrow.visible = false;
          centerLine.visible = false;
          topLine.visible = false;
          Candleline.visible = true;
          Lensline.visible = false;
          objectButton1.visible = false;
          gltf.scene.add(Candleline);
          gltf.scene.add(Lensline);
          gltf.scene.add(centerLine);
          gltf.scene.add(topLine);
          gltf.scene.add(arrow)
          gltf.scene.add(hintSprite);
          //scene.add(spr);
          //gltf.scene.position.set(0, -1, -17);
          gltf.scene.position.set(0, -5, 0);
          scene.add(gltf.scene);



          objects.push(objectCandle);
          objects.push(objectBoard);
          objects.push(objectSheet);

          roughnessMipmapper.dispose();

          render();
        },
        function () {}, // onProgress function
        function (error) {
          console.log(error);
        } // no error gets logged
      );
    });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  window.addEventListener("resize", onWindowResize, false);
  //Add event listener to highlight dragged objects
  score = 0;
  console.log("init: score: " + score + "step= " + step);
  renderer.domElement.addEventListener("mousedown", onClick);
  //renderer.domElement.addEventListener("touchstart", onTouch);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  //controls.target.set(0, 0, -1);
  controls.target.set(0, 0, 0);
  controls.update();
  controls.enabled = false;

  console.log("declaring drag control");
  console.log("objects passed to drag control: " + objects);
  controlsDM = new DragControls(objects, camera, renderer.domElement);
  controlsDM.addEventListener("hoveron", function () {
    console.log("hoveron");
    //controls.enabled = false;
  });
  controlsDM.addEventListener("hoveroff", function () {
    console.log("hoveroff");
    //controls.enabled = true;
  });
  controlsDM.addEventListener("dragstart", function (event) {
    console.log("drag start event");
    lObjectPositionx = event.object.position.x;
    lObjectPositiony = event.object.position.y;
    lObjectPositionz = event.object.position.z;
  });
  controlsDM.addEventListener("drag", onDragEvent);
  controlsDM.addEventListener("dragend", function () {
    console.log("on drag end");
  });

  controlsDM.deactivate();
  InitializeReadingCords(-4.51, 2.26);
}
function onTransitionEnd( event ) {

	event.target.remove();
	
}

function apparatus(aparatus) {
  switch (clickCount) {
    case 0:
      console.log("inside apparatus:score: " + score + "step: " + step);
      textStep = [
        "Apparatus",
        "Identify the apparatus:",
        "(Click on the apparatus mentioned below)",
        "1. Candle  \u2753",
        "2. Board with white sheet paper  \u2753",
        "3. Measuring scale  \u2753",
        "4. Convex Lens  \u2753",
        "5. Convex Lens stand  \u2753",
      ];
      clickCount += 1;
      text = textStep.slice(0, 4);
      //camera.position.set(0, 5, 8.5);
      camera.position.set(0, 5, 10);
      break;
    case 1:
      if (aparatus == "candle") {
        text = textStep.slice(0, 5);
        clickCount += 1;
        if(!hintTaken){
        score += 1;
        }else{
        hintTaken = false;
        arrow.visible = false;
        hintSprite.visible = false;
        }
      }
      else if(aparatus == "tvscreen"){
        console.log("Inside apparatus, tvscreen")
        showHint();
        hintTaken=true;
      }
      break;
    case 2:
      if (aparatus == "board") {
        text = textStep.slice(0, 6);
        clickCount += 1;
        if(!hintTaken){
          score += 1;
        }else{
          hintTaken = false;
          arrow.visible = false;
          hintSprite.visible = false;
      }
    }
      else if(aparatus == "tvscreen"){
        console.log("Inside apparatus, tvscreen")
        showHint();
        hintTaken=true;
      }
      break;
    case 3:
      if (aparatus == "scale") {
        text = textStep.slice(0, 7);
        clickCount += 1;
        if(!hintTaken){
          score += 1;
        }else {
          hintTaken = false;
          arrow.visible = false;
          hintSprite.visible = false;
      }
    }
      else if(aparatus == "tvscreen"){
        console.log("Inside apparatus, tvscreen")
        showHint();
        hintTaken=true;
      }
      break;
    case 4:
      if (aparatus == "lens") {
        text = textStep.slice(0, 8);
        clickCount += 1;
        if(!hintTaken){
          score += 1;
        }else{
          hintTaken = false;
          arrow.visible = false;
          hintSprite.visible = false;
      }
    }
      else if(aparatus == "tvscreen"){
        console.log("Inside apparatus, tvscreen")
        showHint();
        hintTaken=true;
      }
      break;
    case 5:
      if (aparatus == "lensStand") {
        text = [
          "Apparatus",
          "",
          "Apparatus identification is completed.",
          "",
          "",
          "Please click on the arrow button to",
          "proceed to setup",
        ];
        clickCount += 1;
        if(!hintTaken){
          score += 1;
        }else{
          hintTaken = false;
          arrow.visible = false;
          hintSprite.visible = false;
      }
    }
      else if(aparatus == "tvscreen"){
        console.log("Inside apparatus, tvscreen")
        showHint();
        hintTaken=true;
      }
      break;
    case 6:
      if (aparatus == "button2") {
        step += 1;
        clickCount = 0;
        setup1();
      }
  }
  drawCanvasText(text, 15);
  texCanvas.needsUpdate = true;
  SpriteCanvasTexture.needsUpdate = true;
  render();
}

function setup1(aparatus) {
  controlsDM.activate();

  console.log("setup1:step: " + step);
if(clickCount == 0){
  text = [
    "Setup",
    "1. Make sure the candle, lens stand",
    "and the center of board are in",
    "straight line",
    "Drag the candle backward and forward",
    "to keep in correct position.",
    "Your score will increment if you place the",
    "candle in correct position  \u2753",
  ];
  centerLine.visible = true;
  //clickCount = 5;
  camera.position.set(-8, 1, 7);
  camera.rotation.y -= (30 * Math.PI) / 180;
  //canvasText(text);
  drawCanvasText(text, 15);
  texCanvas.needsUpdate = true;
  clickCount += 1;
  render();
}
else if (clickCount > 0){ 
  if(aparatus == "tvscreen"){
    arrow.visible = true;
    hintSprite.visible = true;
    console.log("Inside apparatus, tvscreen")
    showHint();
    hintTaken=true;
    render();
  }
}
}

function onTouch(event) {
  console.log("On TOUCH detected");
  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
    (event.targetTouches[0].clientX / window.innerWidth) * 2 - 1,
    -(event.targetTouches[0].clientY / window.innerHeight) * 2 + 1,
    0.5
  );
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  var distance = -camera.position.z / vec.z;

  pos.copy(camera.position).add(vec.multiplyScalar(distance));
  console.log("Finding Lepord: pos.x: " + pos.x + "pos.y: " + pos.y);
}
function onClick(event) {
  console.log("inside click event");
  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  var distance = -camera.position.z / vec.z;

  pos.copy(camera.position).add(vec.multiplyScalar(distance));
  console.log("Nemo: pos.x: " + pos.x + "pos.y: " + pos.y);
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //console.log("x-cordinate: " + mouse.x);
  //console.log("y cordinate: " + mouse.y);

  raycaster.setFromCamera(mouse, camera);
  var intersectionObjects = [];
  intersects.length = 0;
  intersectionObjects = [
    objectButton1,
    objectButton2,
    objectScreen,
    objectCandle,
    objectBoard,
    objectScale,
    objectLens,
    objectlensStand,
  ];
  intersects = raycaster.intersectObjects(intersectionObjects, true);
  console.log("OnClick: Checking step: " + step);
  if (step == 0) {
    if (intersects.length > 0) {
      /*console.log(
        "step1: intersect[0] object name: " + intersects[0].object.name
      );
      console.log("object clicked: " + intersects[0].object.name);*/
      if (intersects[0].object.name == "button2") {
        clickCount = 0;
        step += 1;
        aim();
      }
    }
   } else if (step == 1) {
    if (intersects.length > 0) {
      /*console.log(
        "step1: intersect[0] object name: " + intersects[0].object.name
      );
      console.log("object clicked: " + intersects[0].object.name);*/
      if (intersects[0].object.name == "button2") {
        clickCount = 0;
        step += 1;
        apparatus();
      }
    }
  } else if (step == 2) {
    /*console.log(
      "Onclick: step 2:clickCount: " +
        clickCount +
        " object: " +
        intersects[0].object.name
    );*/
    apparatus(intersects[0].object.name);
  } else if (step == 3) {
    setup1(intersects[0].object.name);
  } else if (step == 4) {
    setup2(intersects[0].object.name);
  } else if (step == 5) {
    /*console.log("OnClick: Step5: calling proc1: clickCount: " + clickCount);*/
    proc1(pos.x, pos.y);
  } else if (step == 6) {
    proc2(pos.x, pos.y);
  } else if (step == 7) {
    console.log("calling proc3 from click event: clickCount: "+clickCount)
    proc3(pos.x, pos.y);
  }
  else if(step == 8){
    console.log("Inside step 8: calling result: clickCount: "+clickCount)
    result(pos.x,pos.y)
  }
}

function aim(){
  var textAim = [
    "Aim",
    "1) To study nature and size of image",
    "of an object formed by convex lens.",
    "",
    "2) To find image distance for varying",
    "object distances from the convex lens.",
    "",
    "3) To find focal length of convex lens",
    "     Click on the -> button to proceed.",
  ];
  drawCanvasText(textAim, 15);
  texCanvas.needsUpdate = true;
  render();
}

function setup2(clickedObject) {
  switch (clickCount) {
    case 0:
      hintSprite.visible = false;
      arrow.visible = false;
      step += 1;
      clickCount += 1;
      /*console.log(
        "inside setup2: switch 0: step: " +
          step +
          " clickedCount after increment: " +
          clickCount
      );*/
      text = [
        "Setup",
        "2. The center of the lens, the tip of",
        "candle flame and the center of screen",
        "should lie in straight line and parallel",
        "to the measuring scale",
        "Click on lens stand to adjust the height",
        "of the lens stand \u2753",
      ];
      centerLine.visible = false;
      topLine.visible = true;
      camera.position.set(0, 5, 8);
      camera.rotation.y += (30 * Math.PI) / 180;
      drawCanvasText(text, 15);
      texCanvas.needsUpdate = true;
      render();
      break;
    case 1:
      if(clickedObject == "tvscreen"){
        hintSprite.visible = true;
        arrow.visible = true;
        showHint();
        hintTaken = true;
        SpriteCanvasTexture.needsUpdate = true;
        render();
      }else if (clickedObject == "lensStand") {
        console.log("Step4 inside lens stand: " + clickedObject);
        objectlensStand.scale.y = 0.349;
        objectlensStand.position.set(-0.0377, 2.3972, 0);
        objectLensHolder.position.set(0, 3, 0);
        objectLens.position.set(0, 3.4, 0);
        ToplineVertices = new Float32Array([
          objectLens.position.x - 5,
          objectLens.position.y,
          objectLens.position.z,
          objectLens.position.x + 5,
          objectLens.position.y,
          objectLens.position.z,
        ]);
        TopLinepositionAttribute = new THREE.Float32BufferAttribute(
          ToplineVertices,
          3
        );
        TopLinepositionAttribute.setUsage(THREE.DynamicDrawUsage);
        ToplineGeometry.setAttribute("position", TopLinepositionAttribute);
        ToplineGeometry.computeBoundingSphere();
        TopLinepositionAttribute.needsUpdate = true;
        if (hintTaken){
          hintTaken = false;
          hintSprite.visible = false;
        }  
        else{
        score += 1;
        }
        clickCount += 1;
        text = [
          "Setup",
          "Set up is successfully completed",
          "",
          "In the next step, we will find the focal",
          "length of the lens.",
          "",
          "Now, click on arrow button to proceed",
        ];
        hintSprite.visible = false;
        arrow.visible = false;
      }
      drawCanvasText(text, 15);
      texCanvas.needsUpdate = true;
      render();
      break;
    case 2:
      if (clickedObject == "button2") {
        clickCount = 0;
        proc1();
      }
  }
}
function proc1(x, y) {
  console.log("Inside Proc1:ClickCount: " + clickCount+" step: "+step);
  switch (clickCount) {
    case 0:
      initializeReadingArray();
      topLine.visible = false;
      Candleline.visible = true;
      Lensline.visible = true;
      controlsDM.activate();
      console.log("Proc1:case 0: step: " + step + " clickCount: " + clickCount);
      step += 1;
      clickCount += 1;
      console.log("Proc1:case 0: step: " + step + " clickCount: " + clickCount);
      text = [
        "Finding Focal Length",
        "In the next step:",
        "1. Move candle at a position where image is seen",
        "2. Move the board till a sharp image is seen.",
        "3. Input object distance and image distance",
        "by clicking on the cell in the table",
        "5. Calculate the focal length using formula",
        "6. Input focal length in the table",
        "         Click on arrow button to take readings",
      ];
      camera.near = 1;
      camera.position.set(-4, 3, 7);
      console.log("Inside Proc1: Before rotation: camera positions: "+camera.rotation.y)
      camera.rotation.y =0;
      camera.rotation.y -= 6 * (Math.PI / 180);
      console.log("Inside Proc1: after rotation: camera positions: "+camera.rotation.y)
      console.log("inside proc 1");
      drawCanvasText(text, 12);
      texCanvas.needsUpdate = true;
      render();
      break;
    case 1:
      if (intersects[0].object.name == "button2") {
        controlsDM.activate();
        //camera.near = 1;
        //camera.position.set(0, 3, 7);
        //camera.rotation.y += 9 * (Math.PI / 180);
        //camera.rotation.y -= 2 * (Math.PI / 180);
        drawCanvasTable(5, 2, "Readings");
        texCanvas.needsUpdate = true;
        render();
        console.log(
          "Proc2:step: " +
            step +
            " :clickcount: " +
            clickCount +
            " :score: " +
            score
        );
        clickCount += 1;
      }
      break;
    case 2:
      if (intersects[0].object.name == "tvscreen") {
        console.log("Proc1: step: " + step + " clickcount" + clickCount);
        var x_min;
        var x_max;
        var y_min;
        var y_max;
        var i, j;
        console.log("Received Co-ords: x=" + x + ", y=" + y);
        if (x>-5.7 && x<1.7 && y > 2.5 && y < 2.9){
          showHint(x,y)
        }
        else {
        (function () {
          arrow.visible = false;
          for (i = 0; i <= 4; i++) {
            for (j = 0; j <= 2; j++) {
              if (readingCords[i][j][0] < 0) {
                x_min = readingCords[i][j][0] - 0.9;
                x_max = readingCords[i][j][0] + 0.9;
              } else if (readingCords[i][j][0] > 0) {
                x_min = readingCords[i][j][0] - 0.9;
                x_max = readingCords[i][j][0] + 0.9;
              }
              if (readingCords[i][j][1] < 0) {
                y_min = readingCords[i][j][1] + 0.16;
                y_max = readingCords[i][j][1] - 0.16;
              } else if (readingCords[i][j][1] > 0) {
                y_min = readingCords[i][j][1] - 0.16;
                y_max = readingCords[i][j][1] + 0.16;
              }
              /*console.log(
                "x_min: " +
                  x_min +
                  "x_max: " +
                  x_max +
                  "y_min: " +
                  y_min +
                  "y_max: " +
                  y_max
              );*/
              if (x > x_min && x < x_max && y > y_min && y < y_max) {
                highlightRow = i + 1;
                highlightColumn = j;
                drawCanvasTable(5, 2, "Readings");
                var answer = getAnswer();
                if (answer != null) {
                  readings[highlightRow][highlightColumn] = answer;
                  drawCanvasTable(5, 2, "Readings");
                  //clickCount -= 1;
                }
                //clickCount += 1;
                return;
              }
            }
          }
        })();
      }
    } else if (intersects[0].object.name == "button2") {
        console.log("Proc1: button2: step: "+ step+" clockcount= "+clickCount)
        clickCount = 0;
        step += 1;
        arrow.visible = false;
        proc2();
      }  
}
}

function proc2(x, y) {
  console.log("Inside proc2: step: " + step);
  console.log("Proc2:x=" + x + " y=" + y);
  switch (clickCount) {
    case 0:
      console.log("Proc2: Switch case 0");
      drawCanvasCalcs();
      texCanvas.needsUpdate = true;
      render();
      console.log("Proc2: After drawCanvasCalcs()");
      clickCount += 1;
      break;
    case 1:
      reCalcFlag = false;
      redoFlag = false;
      doneFlag = false;
      if (x > -1.38 && x < -0.4 && y > 1.2 && y < 1.6) {
        console.log("step 7: detected rect");
        //clickCount += 1;
        console.log("inside proc2:case 1");
        var answer = getAnswer();
        if (answer != null) {
          drawCanvasCalcs(answer);
          texCanvas.needsUpdate = true;
          if (doneFlag) {
            console.log("inside proc2:case 1: inside done flag");
          }
          if (redoFlag)
          {
            console.log("inside proc2:case 1: making button1 visible");
            objectButton1.visible = true;
          }
          clickCount += 1;
        }
      }
      render();
      break;
    case 2:
      if (intersects[0].object.name == "button2" && doneFlag == true) {
        console.log("Go to next step");
        text = [
          "Focal Length",
          "The focal length of this lens is 10 cms.",
          "Next we study the nature of image",
          "at various positions of objects from",
          "the lens.",
          "Click on arrow button to proceed",
        ];
        drawCanvasText(text);
        texCanvas.needsUpdate = true;
        render();
        clickCount += 1;
      }
      else if(intersects[0].object.name == "button1" && redoFlag == true){
        step = 4;
        clickCount = 0;
        objectButton1.visible = false;
        proc1();
      }
      else if(reCalcFlag == true){ 
        clickCount = 1;
        proc2();
      }
      break;
    case 3:
      if (intersects[0].object.name == "button2" && doneFlag == true) {
        step += 1;
        clickCount = 0;
        proc3();
      }
  }
}
function proc3(x, y) {
  console.log("Inside proc3:step: "+step+" clickcount: "+clickCount)
  var isAnswer;
  switch (clickCount) {
    case 0:
      console.log("proc3: case 0 step: "+step)
      isAnswer = false;
      controlsDM.activate();
      var text = [
        "Object less than f(10cms)",
        "Place the candle at a distance less than 10cms from lens",
        "Move the board horizontally and observe the image",
        "How is the image? Click on the correct option:",
        "Image is NOT seen on the screen",
        "Image is diminished",
        "Image is of same height as that of object",
        "Image is enlarged",
      ];
      camera.near = 1;
      camera.position.set(-4, 3, 7);
      camera.rotation.y -= 9 * (Math.PI / 180);
      clickCount += 1;
      console.log(
        "Proc3:switch0:step: " +
          step +
          " :clickcount: " +
          clickCount +
          " :score: " +
          score
      );
      drawCanvasQuiz(text, isAnswer);
      texCanvas.needsUpdate = true;
      render();
      break;
      case 1:
        //controls.enabled = true;
        if (intersects[0].object.name == "tvscreen"){
        if (x > -5.73 && x < 1.8 && y > -0.19 && y < 1.7) {
        if (y > 1.2 && y < 1.5) {
          score += 1;
        }
        camera.position.set(3,-1,0);
        objectTv.position.x -= 5;
        objectTv.position.z -= 2;
        objectTv.rotation.y += 90 * (Math.PI / 180);
        //to add refraction
        camera.rotation.y += 99 * (Math.PI / 180);
        objectLens.material.map = LenstexArray[1];       
        objectLens.material.opacity = 1;
        objectBoard.visible = false;
          isAnswer = true;
            var text = [
              "Object less than f(10cms)",
              "When the candle is placed at a distance less than f,",
              "a virual image image is formed on the same side",
              "of the object as seen now.",
              "Image NOT seen on the screen as it is NOT real",
              "The image is virtual, erect and enlarged.",
              "Hence a convex lens can be used as magnifying lens.",
              "Click on arrow button to proceed further",
            ];
          clickCount += 1;
          drawCanvasQuiz(text, isAnswer, 4);
          texCanvas.needsUpdate = true;
          render();
          console.log(
            "proc3:switch1:inside nemo: step: " +
              step +
              " clickCount: " +
              clickCount
          );
        }
    }
    break;
    case 2:
      isAnswer = false;
      objectTv.position.x += 5;
      objectTv.position.z += 2;
      objectTv.rotation.y -= 90 * (Math.PI / 180);
      //to add refraction
      camera.rotation.y -= 99 * (Math.PI / 180);
      camera.near = 1;
      camera.position.set(-4, 3, 7);
      //camera.rotation.y -= 9 * (Math.PI / 180);
      objectLens.material.map = LenstexArray[0];
      objectlensStand.material.opacity = 0.5;
      objectBoard.visible = true;
      if (intersects.length > 0) {
        if (intersects[0].object.name == "button2") {
          var text = [
            "Object between f and 2f",
            "Place the candle between 10cms and 20cms from lens",
            "Move the board horizontally and observe the image",
            "How is the image? Click on the correct option:",
            "Image is enlarged and formed at less than 2f",
            "Image is diminished and formed at 2f",
            "Image is of same height as that of object",
            "Image is enlarged and formed beyond 2f",
          ];
          clickCount += 1;
          console.log(
            "Proc3:switch0:step: " +
              step +
              " :clickcount: " +
              clickCount +
              " :score: " +
              score
          );
          drawCanvasQuiz(text, isAnswer);
          texCanvas.needsUpdate = true;
          render();
        }
      }
      break;
    case 3:
      isAnswer = true;
      if (x > -5.73 && x < 1.8 && y > -0.19 && y < 1.7) {
        if (y > 0.06 && y < 0.34) { 
          score += 1;
        }         
        text = [
          "Object between f and 2f",
          "When the candle is between 10cms and 20cms from lens",
          "then an enlarged image is formed on the screen.",
          "A sharp image is seen at a distance greater than 2f",
          "Image is enlarged and formed at less than 2f",
          "Image is diminished and formed at 2f",
          "Image is of same height as that of object",
          "Image is enlarged and formed beyond 2f",
        ];
        clickCount += 1;
        drawCanvasQuiz(text, isAnswer, 7);
        texCanvas.needsUpdate = true;
        render();
    }
      break;
    case 4:
      isAnswer = false;
      if (intersects.length > 0) {
        if (intersects[0].object.name == "button2") {
          var text = [
            "Object on 2f",
            "Place the candle at 20cms from lens",
            "Move the board horizontally and observe the image",
            "How is the image? Click on the correct option:",
            "Image is diminished and at distance less than 2f",
            "Image is of same size as that of object and at f",
            "Image is of same size as that of object and at 2f",
            "Image is diminished and formed at 2f",
          ];
          clickCount += 1;
          console.log(
            "Proc3:switch0:step: " +
              step +
              " :clickcount: " +
              clickCount +
              " :score: " +
              score
          );
          drawCanvasQuiz(text, isAnswer);
          texCanvas.needsUpdate = true;
          render();
        }
      }
      break;
    case 5:
      isAnswer = true;
      if (x > -5.73 && x < 1.8 && y > -0.19 && y < 1.7) {
        if (y > 0.46 && y < 0.72) {  
          score += 1;
        }  
        text = [
          "Object on 2f",
          "When the candle is placed at 20cms from lens then",
          "an image of same size as that of object is formed ",
          "at a distance of 2f from the lens",
          "Image is diminished and at distance less than 2f",
          "Image is of same size as that of object and at f",
          "Image is of same size as that of object and at 2f",
          "Image is diminished and formed at 2f",
        ];
        clickCount += 1;
        console.log(
          "Proc3:switch3:step: " +
            step +
            " :clickcount: " +
            clickCount +
            " :score: " +
            score
        );
        drawCanvasQuiz(text, isAnswer, 6);
        texCanvas.needsUpdate = true;
        render();
    }
      break;
    case 6:
      isAnswer = false;
      if (intersects.length > 0) {
        if (intersects[0].object.name == "button2") {
          var text = [
            "Object is beyond 2f",
            "Place the candle beyond 20cms from lens",
            "Move the board horizontally and observe the image",
            "How is the image? Click on the correct option:",
            "Image is diminished and formed at less than 2f",
            "Image is of same size as that of object and at f",
            "Image is of same size as that of object and at 2f",
            "Image is diminished and formed at 2f",
          ];
          clickCount += 1;
          console.log(
            "Proc3:switch0:step: " +
              step +
              " :clickcount: " +
              clickCount +
              " :score: " +
              score
          );
          drawCanvasQuiz(text, isAnswer);
          texCanvas.needsUpdate = true;
          render();
        }
      }
      break;
    case 7:
      isAnswer = true;
      if (x > -5.73 && x < 1.8 && y > -0.19 && y < 1.7) {
        if (y > 1.18 && y < 1.47) {    
          score += 1;
        }
        text = [
          "Object is beyond 2f",
          "When the candle is placed beyond 20cms from lens, the image is",
          "is diminished and formed at less than 2f.",
          "The further that object, the more the image is diminished.",
          "Image is diminished and formed at less than 2f",
          "Image is of same size as that of object and at f",
          "Image is of same size as that of object and at 2f",
          "Image is diminished and formed at 2f",
        ];
        clickCount += 1;
        console.log(
          "Proc3:switch7:step: " +
            step +
            " :clickcount: " +
            clickCount +
            " :score: " +
            score
        );
        drawCanvasQuiz(text, isAnswer, 4);
        texCanvas.needsUpdate = true;
        render();
    }
      break;
    case 8:
      clickCount = 0;
      step += 1;
      if (intersects.length > 0) {
        if (intersects[0].object.name == "button2") {
          result();
        }
      }
  }
}

function InitializeReadingCords(x, y) {
  var x_orig = x;
  var y_orig = y;
  var    i, j;
  readingCords = new Array(5);
  for (i = 0; i < readingCords.length; i++) {
    readingCords[i] = new Array(3);
  }
  for (i = 0; i <= 4; i++) {
    for (j = 0; j <= 2; j++) {
      readingCords[i][j] = new Array(2);
      readingCords[i][j][0] = x;
      readingCords[i][j][1] = y;
      x = x + 2.54;
    }
    x = x_orig;
    y = y - 0.5;
  }

  for (i = 0; i <= 4; i++) {
    for (j = 0; j <= 2; j++) {
      console.log(
        "x=" + readingCords[i][j][0] + "   y=" + readingCords[i][j][1]
      );
    }
  }
}
function initializeReadingArray() {
  var i, j;
  readings = new Array(6);
  for (i = 0; i < readings.length; i++) {
    readings[i] = new Array(3);
  }

  readings[0][0] = "Object position \u2753";
  readings[0][1] = "Image distance \u2753";
  readings[0][2] = "focal length \u2753";
  readings[0][3] = "scoreUpdated"

  for (i = 1; i <= 5; i++) {
    for (j = 0; j <= 2; j++) {
      readings[i][j] = "0";
      readings[i][j+1] = false;
    }
  }
  for (i = 0; i <= 4; i++) {
    for (j = 0; j <= 2; j++) {
      console.log(readings[i][j]);
    }
  }
}
function drawCanvasText(text, fontSize) {
  var i, j;
  var x = 5;
  var y = 5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.lineWidth = 1;
  var font = "Bold " + fontSize + "px segoe UI";
  ctx.font = "Bold 15px segoe UI";
  ctx.strokeRect(x, y, 290, 20);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text[0], canvasScreen.width / 2, y + 10);

  ctx.textAlign = "end";
  ctx.fillStyle = "red";
  ctx.fillText("Score:" + score, canvasScreen.width - 8, y + 10);
  ctx.stroke();
  ctx.fillStyle = "black";
  var leftSpace = 5;
  x = leftSpace;
  y = 40;
  var rowWidth = 96.6;
  var rowHeight = 20;
  ctx.textAlign = "left";
  ctx.font = font;
  for (i = 1; i <= text.length - 1; i++) {
    ctx.fillText(text[i], x, y);
    ctx.stroke();
    y += 15;
  }
}

function onDragEvent(e) {
  console.log("dragging: step: " + step);
  if (step == 3) {
    e.object.position.x = lObjectPositionx;
    e.object.position.y = lObjectPositiony;
    if (e.object == objectBoard || e.object == objectSheet) {
      e.object.position.z = lObjectPositionz;
    }
    if (e.object == objectCandle || e.object == objectFlame) {
      //e.object.position.z = -1 * e.object.position.z;
      if (e.object.position.z < -1.2) {
        objectCandle.position.z = -1.2;
        objectFlame.position.z = -1.2;
      } else if (e.object.position.z > 0.6) {
        objectCandle.position.z = 0.6;
        objectFlame.position.z = 0.6;
      } else if ((e.object.position.z > -0.03) & (e.object.position.z < 0.02)) {
        if(hintTaken){
          hintTaken = false;
        } else{
        score += 1;
        }
        objectSheet.material.map = texArray[0];
        objectCandle.position.z = 0;
        objectFlame.position.z = 0;
        controlsDM.deactivate();
        controls.enabled = false;
        clickCount = 0;
        setup2();
      } else {
        objectCandle.position.z = e.object.position.z;
        objectFlame.position.z = e.object.position.z;
      }
      console.log("candle z co-ordinates: " + e.object.position.z);
      console.log("flame z-co-ordinates: " + objectFlame.position.z);
      render();
    }
  }
  if (step >= 5) {
    console.log("Drag event: step: "+step)
    e.object.position.y = lObjectPositiony;
    e.object.position.z = lObjectPositionz;
    console.log("object that is being dragged: " + e.object.name);
    console.log("object2 is: " + objects[2]);
    console.log(
      "object that is being dragged is board?? " + objects[2].getObjectByName()
    );

    //Moving sheet with board
    if (e.object == objectBoard) {
      //console.log("board is being dragged");
      objectSheet.position.x = objectBoard.position.x - 0.25;
      objectSheet.position.y = objectBoard.position.y;
      objectSheet.position.z = objectBoard.position.z;
      console.log("board position: " + objectBoard.position.x);
      console.log("sheet position: " + objectSheet.position.x);
    } else if(e.object == objectSheet){
      objectBoard.position.x = objectSheet.position.x +0.25;
      objectBoard.position.y = objectSheet.position.y;
      objectBoard.position.z = objectSheet.position.z;
    }
    if (e.object == objectCandle) {
      objectFlame.position.x = objectCandle.position.x;
      objectFlame.position.y = objectCandle.position.y + 0.7;
      objectFlame.position.z = objectCandle.position.z;
      updateLineVertices();
    }

    //Not allowing candle to move beyong lens
    if (objectCandle.position.x > -0.7) {
      objectCandle.position.x = -0.7;
      objectFlame.position.x = -0.7;
      updateLineVertices("right_extreme");
    }

    //Not allowing candle to fall off the table
    if (objectCandle.position.x < -5.8) {
      objectCandle.position.x = -5.8;
      objectFlame.position.x = -5.8;
      updateLineVertices("left_extreme");
    }
    //Not allowing board to fall off the table
    if (objectBoard.position.x > 6.4) {
      objectBoard.position.x = 6.4;
      objectSheet.position.x = objectBoard.position.x - 0.25;
      objectSheet.position.y = objectBoard.position.y;
      objectSheet.position.z = objectBoard.position.z;
    }

    //Not allowing board to go beyond candle
    if (objectBoard.position.x < 0.8) {
      objectBoard.position.x = 0.8;
      objectSheet.position.x = objectBoard.position.x - 0.25;
      objectSheet.position.y = objectBoard.position.y;
      objectSheet.position.z = objectBoard.position.z;
    }

    console.log("Candle position: " + objectCandle.position.x);
    console.log("Board position: " + objectBoard.position.x);

    //Logic for image display
    if (objectCandle.position.x > -1.6) {
      objectSheet.material.map = texArray[11];
    } else if (
      objectCandle.position.x < -1.6 &&
      objectCandle.position.x >= -1.8
    ) {
      if (objectBoard.position.x >= 6.1 && objectBoard.position.x <= 6.3) {
        objectSheet.material.map = texArray[2];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -1.8 &&
      objectCandle.position.x >= -2.0
    ) {
      if (objectBoard.position.x >= 4.8 && objectBoard.position.x <= 5.0) {
        objectSheet.material.map = texArray[2];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.0 &&
      objectCandle.position.x >= -2.15
    ) {
      if (objectBoard.position.x >= 4.1 && objectBoard.position.x <= 4.3) {
        objectSheet.material.map = texArray[3];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.15 &&
      objectCandle.position.x >= -2.3
    ) {
      if (objectBoard.position.x >= 3.6 && objectBoard.position.x <= 3.8) {
        objectSheet.material.map = texArray[3];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.3 &&
      objectCandle.position.x >= -2.4
    ) {
      if (objectBoard.position.x >= 3.0 && objectBoard.position.x <= 3.2) {
        objectSheet.material.map = texArray[4];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.4 &&
      objectCandle.position.x >= -2.75
    ) {
      if (objectBoard.position.x >= 2.9 && objectBoard.position.x <= 3.1) {
        objectSheet.material.map = texArray[4];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.75 &&
      objectCandle.position.x >= -2.85
    ) {
      if (objectBoard.position.x >= 2.75 && objectBoard.position.x <= 2.85) {
        objectSheet.material.map = texArray[5];
      } else {
        objectSheet.material.map = texArray[0];
      }
    } else if (
      objectCandle.position.x < -2.85 &&
      objectCandle.position.x >= -2.9
    ) {
      if (objectBoard.position.x >= 2.6 && objectBoard.position.x <= 2.75) {
        objectSheet.material.map = texArray[7];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -2.9 &&
      objectCandle.position.x >= -3.2
    ) {
      if (objectBoard.position.x >= 2.6 && objectBoard.position.x <= 2.7) {
        objectSheet.material.map = texArray[7];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -3.2 &&
      objectCandle.position.x >= -3.4
    ) {
      if (objectBoard.position.x >= 2.4 && objectBoard.position.x <= 2.5) {
        objectSheet.material.map = texArray[8];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -3.4 &&
      objectCandle.position.x >= -3.8
    ) {
      if (objectBoard.position.x >= 2.2 && objectBoard.position.x <= 2.4) {
        objectSheet.material.map = texArray[8];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -3.8 &&
      objectCandle.position.x >= -4.2
    ) {
      if (objectBoard.position.x >= 2.0 && objectBoard.position.x <= 2.2) {
        objectSheet.material.map = texArray[8];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -4.2 &&
      objectCandle.position.x >= -4.8
    ) {
      if (objectBoard.position.x >= 1.9 && objectBoard.position.x <= 2.0) {
        objectSheet.material.map = texArray[9];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -4.8 &&
      objectCandle.position.x >= -5.3
    ) {
      if (objectBoard.position.x >= 1.8 && objectBoard.position.x <= 2) {
        objectSheet.material.map = texArray[9];
      } else {
        objectSheet.material.map = texArray[6];
      }
    } else if (
      objectCandle.position.x < -5.3 &&
      objectCandle.position.x >= -5.8
    ) {
      if (objectBoard.position.x >= 1.8 && objectBoard.position.x <= 1.9) {
        objectSheet.material.map = texArray[9];
      } else {
        objectSheet.material.map = texArray[6];
      }
    }
    render();
  }
}

function updateLineVertices(position) {
  var CandleLinex;
  if (position == "left_extreme") {
    CandleLinex = -5.8;
    //console.log("inside extreme left: candle x position: " + CandleLinex);
  } else if (position == "right_extreme") {
    CandleLinex = -0.7;
    //console.log("inside extreme right: candle x position: " + CandleLinex);
  } else {
    CandleLinex = objectCandle.position.x;
    //console.log("inside middle: candle x position: " + CandleLinex);
  }
  CandlelineVertices = [
    CandleLinex,
    objectCandle.position.y - 0.4,
    objectCandle.position.z,
    objectCandle.position.x,
    objectCandle.position.y - 0.4,
    objectCandle.position.z + 1.6,
  ];
  console.log("inside candle move: candle vertices: " + CandlelineVertices);

  positionAttribute = new THREE.Float32BufferAttribute(CandlelineVertices, 3);
  CandlelineGeometry.setAttribute("position", positionAttribute);
  CandlelineGeometry.computeBoundingSphere();
}

function drawHintText(message, fontSize){
  console.log("drawHintText: step: "+step+"message: "+message)
  var x = 5;
  var y = 5;
  ctxSprite.fillStyle = "white";
  ctxSprite.fillRect(0, 0, canvasSprite.width, canvasSprite.height);
  ctxSprite.strokeStyle = "black";
  ctxSprite.fillStyle = "black";
  ctxSprite.lineWidth = 10;
  ctxSprite.font = " Bold "+ fontSize +"px "+ "segoe UI";
  ctxSprite.strokeRect(0, 0, canvasSprite.width, canvasSprite.height);
  ctxSprite.textBaseline = "middle";
  ctxSprite.textAlign = "start";
  ctxSprite.fillText(message, 5, canvasSprite.height/2);
}
function showHint(x,y){
  //controls.enabled = true;
  console.log("clickCount: "+clickCount+ " step:"+step);
  var newSourcePos;
  var newTargetPos;
  if(step == 2){
    var message = "Click";
    if(clickCount==1){
    console.log("inside candle hint")
    hintSprite.position.set(objectCandle.position.x-3, objectCandle.position.y, objectCandle.position.z);
    newSourcePos = new THREE.Vector3(objectCandle.position.x - 2, objectCandle.position.y, objectCandle.position.z);
    newTargetPos = new THREE.Vector3(objectCandle.position.x, objectCandle.position.y, objectCandle.position.z);
    }
    else if(clickCount==2){
      console.log("inside board")
      hintSprite.position.set(objectBoard.position.x-2, objectBoard.position.y, objectBoard.position.z);
      newSourcePos = new THREE.Vector3(objectBoard.position.x - 2, objectBoard.position.y, objectBoard.position.z);
      newTargetPos = new THREE.Vector3(objectBoard.position.x, objectBoard.position.y, objectBoard.position.z);
    }
    else if(clickCount==3){
      console.log("inside measuring scale")
      hintSprite.position.set(objectScale.position.x-1, objectScale.position.y+2, objectScale.position.z);
      newSourcePos = new THREE.Vector3(objectScale.position.x-1, objectScale.position.y+2, objectScale.position.z);
      newTargetPos = new THREE.Vector3(objectScale.position.x-1, objectScale.position.y, objectScale.position.z);
    }
    else if(clickCount==4){
      console.log("inside lens")
      hintSprite.position.set(objectLens.position.x-4, objectLens.position.y, objectLens.position.z);
      newSourcePos = new THREE.Vector3(objectLens.position.x - 5, objectLens.position.y, objectLens.position.z);
      newTargetPos = new THREE.Vector3(objectLens.position.x, objectLens.position.y, objectLens.position.z);
    }
    else if(clickCount == 5){
      console.log("inside lens holder")
      hintSprite.position.set(objectlensStand.position.x-2, objectlensStand.position.y, objectlensStand.position.z);
      newSourcePos = new THREE.Vector3(objectlensStand.position.x - 2, objectlensStand.position.y, objectlensStand.position.z);
      newTargetPos = new THREE.Vector3(objectlensStand.position.x, objectlensStand.position.y, objectlensStand.position.z);
    }
    arrow.position.copy(newSourcePos);
    var direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
    arrow.setLength(direction.length());
    arrow.setDirection(direction.normalize());  
    console.log(arrow);
    arrow.visible = true;
    drawHintText(message, 90);
    hintSprite.visible = true;
  } else if (step==3){
    var message = "Drag";
    if(clickCount>0){
    console.log("inside candle hint")
    hintSprite.position.set(objectCandle.position.x-2, objectCandle.position.y, objectCandle.position.z);
    newSourcePos = new THREE.Vector3(CandlelineVertices[0]-0.5, CandlelineVertices[1], CandlelineVertices[2]);
    newTargetPos = new THREE.Vector3(CandlelineVertices[0]-0.5, CandlelineVertices[4], CandlelineVertices[5]);
    }
    arrow.position.copy(newSourcePos);
    var direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
    arrow.setLength(direction.length());
    arrow.setDirection(direction.normalize());  
    console.log(arrow);
    arrow.visible = true;
    drawHintText(message,90);
    hintSprite.visible = true;
  } else if (step==4){
    var message = "Click";
    if(clickCount==1){
      console.log("inside candle hint")
      hintSprite.position.set(objectlensStand.position.x-1, objectlensStand.position.y, objectlensStand.position.z+1);
      newSourcePos = new THREE.Vector3(objectlensStand.position.x - 2, objectlensStand.position.y, objectlensStand.position.z);
      newTargetPos = new THREE.Vector3(objectlensStand.position.x, objectlensStand.position.y, objectlensStand.position.z);
      }
      arrow.position.copy(newSourcePos);
      var direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
      arrow.setLength(direction.length());
      arrow.setDirection(direction.normalize());  
      console.log(arrow);
      arrow.visible = true;
      drawHintText(message,90);
      hintSprite.visible = true;
  } else if(step == 5){
    if (clickCount == 2){ 
      if(x>-5.7 && x <-3.2 && y > 2.5 && y < 2.9){
        newSourcePos = new THREE.Vector3(objectCandle.position.x, objectCandle.position.y-0.2, objectCandle.position.z+1);
        newTargetPos = new THREE.Vector3(objectlensStand.position.x, objectCandle.position.y-0.2, objectCandle.position.z+1);
        alert("Object distance = lens distance - candle distance")
      }
      else if (x >-3.1 && x < -0.7 && y > 2.5 && y < 2.9){
        var msg = "Image distance = board distance - lens distance"
        msg = msg.concat("\nImage distance = board distance - 50")
        alert(msg)
        newSourcePos = new THREE.Vector3(objectlensStand.position.x, objectlensStand.position.y-0.2, objectlensStand.position.z+1);
        newTargetPos = new THREE.Vector3(objectBoard.position.x-0.4, objectlensStand.position.y-0.2, objectlensStand.position.z+1);
      }
      else if (x > -0.6 && x < 1.7 && y > 2.5 && y < 2.9){
        alert("1/f=1/v-1/u  (object distance is taken as -ve as object is on the left side of the lens)")
      }   
      arrow.position.copy(newSourcePos);
      var direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
      arrow.setLength(direction.length());
      arrow.setDirection(direction.normalize());  
      console.log(arrow);
      arrow.visible = true;
      render();  
    } 
  }
}

function drawCanvasQuiz(text, isAnswer, AnswerRow) {
  var i, j;
  var x = 5;
  var y = 5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.lineWidth = 1;
  ctx.font = " Bold 15px segoe UI";
  //ctx.font = " Bold 15px Microsoft Sans Serif";
  ctx.strokeRect(x, y, 290, 20);

  ctx.textBaseline = "middle";
  ctx.textAlign = "start";
  ctx.fillText(text[0], x, y + 10);

  ctx.textAlign = "end";
  ctx.fillStyle = "red";
  ctx.fillText("Score:" + score, canvasScreen.width - 8, y + 10);
  ctx.stroke();
  ctx.font = "Bold 10px segoe UI";
  ctx.fillStyle = "black";
  var leftSpace = 5;
  x = leftSpace;
  y = 40;
  var rowWidth = 96.6;
  var rowHeight = 15;
  ctx.textAlign = "left";
  //ctx.font = " Bolder 14px Comic Sans MS";
  for (i = 1; i <= 3; i++) {
    ctx.fillText(text[i], x, y);
    ctx.stroke();
    y += 15;
  }

  ctx.textAlign = "center";
  for (i = 4; i <= 7; i++) {
    if (isAnswer && i == AnswerRow) {
      ctx.fillStyle = "green";
      ctx.font = "Bold 12px segoe UI";
    } else {
      ctx.fillStyle = "black";
      ctx.font = "Bold 10px segoe UI";
    }
    ctx.strokeRect(x, y, 290, rowHeight);
    ctx.fillText(text[i], canvasScreen.width / 2, y + rowHeight / 2);
    y += rowHeight;
  }
}

function drawCanvasTable(max_row, max_col, title) {
  var i, j;
  var x = 5;
  var y = 5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
  //ctx.fillStyle = "blue";
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.lineWidth = 1;
  ctx.font = " Bold 15px segoe UI";
  ctx.strokeRect(x, y, 290, 20);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title + "       Score:" + score, canvasScreen.width / 2, y + 10);
  //ctx.textAlign = "end";
  //ctx.fillText("Score:" + score, canvasScreen.width / 2, y + 10);
  ctx.stroke();
  var leftSpace = 5;
  x = leftSpace;
  y = 25;
  var rowWidth = 290 / (max_col + 1);
  var rowHeight = 20;
  ctx.font = " Bolder 10px segoe UI";

  for (i = 0; i <= max_row; i++) {
    for (j = 0; j <= max_col; j++) {
      //console.log("CanvasTable:readings: " + readings[i][j]);
      ctx.strokeRect(x, y, rowWidth, rowHeight);
      ctx.fillText(readings[i][j], x + rowWidth / 2, y + rowHeight / 2);

      if (i == highlightRow && j == highlightColumn) {
        //console.log("CanvasTable:highlight cell: readings: " + readings[i][j]);
        //ctx.fillStyle = "grey";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, rowWidth, rowHeight);
        //ctx.fillStyle = "black";
        ctx.lineWidth = 1;
      }
      ctx.stroke();
      x = x + rowWidth;
      //console.log("drawtable:x: " + x + " y: " + y);
    }
    x = leftSpace;
    y = y + rowHeight;
  }
  texCanvas.needsUpdate = true;
  render();
}

function drawCanvasCalcs(answer) {
  var i, j;
  var calcStr = "Mean F.L. = (";
  var x = 5;
  var y = 5;
  var rowWidth = 290;
  var rowHeight = 20;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
  //ctx.fillStyle = "blue";
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.lineWidth = 1;
  ctx.font = " Bold 15px segoe UI";
  ctx.strokeRect(x, y, rowWidth, rowHeight);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Calculations     Score:" + score,
    canvasScreen.width / 2,
    y + rowHeight / 2
  );
  ctx.stroke();
  y = y + rowHeight + 5;
  var fl = 0;
  for (i = 1; i <= 5; i++) {
    calcStr = calcStr + readings[i][2] + "+";
    fl = fl + Number(readings[i][2]);
  }
  fl = fl / 5;
  console.log("Calculated focal length: " + fl);
  calcStr = calcStr.slice(0, -1);
  calcStr = calcStr + ")/5";
  console.log("calcStr: " + calcStr);

  ctx.strokeRect(x, y, rowWidth, 2 * rowHeight);
  ctx.fillText(calcStr, x + rowWidth / 2, y + rowHeight);
  ctx.stroke();
  y += 40;
  ctx.textAlign = "left";
  ctx.strokeRect(x, y, rowWidth, 2 * rowHeight);
  ctx.strokeRect(x + 160, y + 8, 50, rowHeight);
  ctx.fillText("Mean Focal Length = ", x + 5, y + rowHeight);
  if (clickCount == 1) {
    console.log("drawCanvasCals: inside clickcount 1");
    ctx.fillText(answer, x + 175, y + rowHeight);
  }
  ctx.stroke();
  if (clickCount == 0) {
    var text1 = "Calculate the mean focal length";
    var text2 = "Click on the box and enter the f.l.";
  }
  else if (clickCount == 1) {
      if (answer >= 9.1 && answer <= 10.9) {
        if(answer > fl - 0.1 || answer < fl+0.1){
        score += 1;
        doneFlag = true;
        ctx.fillStyle = "green";
        text1 = "The calculated Focal length is " + answer;
        text2 = "Click the arrow button to proceed further"; 
      } else{
        ctx.fillStyle = "red";
        text1 = "The calculation is not correct check again";
        text2 = "Recalculate and enter value again";
        reCalcFlag = true;
      }
    }else if (answer < 9 || answer > 11){
        ctx.fillStyle = "red";
        text1 = "The focal length is not correct";
        text2 = "Click on redo button to repeat the readings";
        redoFlag = true;
      }
    } 
  y += 50;
  ctx.textAlign = "center";
  ctx.fillText(text1, canvasScreen.width / 2, y);
  y += 20;
  ctx.fillText(text2, canvasScreen.width / 2, y);
  ctx.stroke();

  texCanvas.needsUpdate = true;
  render();
}

function drawCanvasCamera(canvasCam, ctxCamera) {
  //Draw camera
  ctxCamera.fillStyle = "white";
  ctxCamera.fillRect(0, 0, canvasCam.width, canvasCam.height);
  ctxCamera.strokeStyle = "black";
  ctxCamera.fillStyle = "black";
  ctxCamera.lineWidth = 10;
  var x = 40;
  var y = 20;
  //ctxCamera.strokeRect(x, y, 100, 50);
  ctxCamera.fillRect(x, y, 130, 100);
  ctxCamera.beginPath();
  ctxCamera.moveTo(x + 130, y + 20);
  ctxCamera.lineTo(x + 200, y);
  ctxCamera.lineTo(x + 200, y + 100);
  ctxCamera.lineTo(x + 130, y + 80);

  ctxCamera.fill();
  ctxCamera.stroke();
  /*ctxCamera.lineTo(x + 20, y + 15);
  ctxCamera.lineTo(x + 15, y + 10);
  ctxCamera.stroke();
  ctxCamera.moveTo(x + 3, y + 3);
  ctxCamera.lineTo(x + 12, y + 7);
  ctxCamera.lineTo(x + 3, y + 12);
  ctxCamera.lineTo(x + 3, y + 3);
  ctxCamera.fill();*/
}
function drawCanvasProceed(canvasProceed, ctxProceed) {
  //Draw Proceed
  ctxProceed.fillStyle = "white";
  ctxProceed.fillRect(0, 0, canvasProceed.width, canvasProceed.height);
  ctxProceed.strokeStyle = "black";
  ctxProceed.fillStyle = "black";
  ctxProceed.lineWidth = 10;
  var x = 30;
  var y = 45;
  //ctxProceed.strokeRect(x, y, 100, 60);
  ctxProceed.fillRect(x, y, 120, 60);
  ctxProceed.beginPath();
  ctxProceed.moveTo(x + 120, y - 40);
  ctxProceed.lineTo(x + 250, y + 30);
  ctxProceed.lineTo(x + 120, y + 90);
  ctxProceed.lineTo(x + 120, y - 40);
  ctxProceed.fill();
  ctxProceed.stroke();
}
function drawCanvasRedo(canvasCam, ctxCamera) {
  //Draw Redo
  ctxCamera.fillStyle = "white";
  ctxCamera.fillRect(0, 0, canvasCam.width, canvasCam.height);
  ctxCamera.strokeStyle = "black";
  ctxCamera.fillStyle = "black";
  ctxCamera.lineWidth = 25;
  var x = 140;
  var y = 50;
  var center_x = 130;
  var center_y = 70;
  var radius = 60;
  ctxCamera.beginPath();
  ctxCamera.arc(center_x,center_y, radius, 0.1*Math.PI, 1.8*Math.PI);
  ctxCamera.stroke();
  //ctxCamera.strokeRect(x, y, 100, 60);
  /*ctxCamera.fillRect(x, y, 120, 60);*/
  //ctxCamera.beginPath();
  ctxCamera.lineTo(x, y-10);
  ctxCamera.lineTo(x + 50, y + 10);
  ctxCamera.lineTo(x + 60, y -15);
  ctxCamera.lineTo(x, y - 10);
  //ctxCamera.fill();*/
  ctxCamera.stroke();
}

function getAnswer() {
  var answer;
  if (step == 5) {
    console.log("getanswer:highlightcolumn: " + highlightColumn);
    if (highlightColumn == 0) {
      answer = prompt("Object distance");
    } else if (highlightColumn == 1) {
      answer = prompt("Image distance");
    } else if (highlightColumn == 2) {
      answer = prompt("focal length");
    }
    if (isNaN(answer)) {
      alert("Only numbers allowed");
      return null;
    } else if (answer.length > 4) {
      alert("Only 4 characters allowed");
      return null;
    } else if (!Boolean(answer)) {
      return null;
    } else if (highlightColumn == 0 && (answer < 11 || answer > 42)) {
      alert("Invalid object distance");
      return null;
    } else if (highlightColumn == 1 && (answer < 5 || answer > 45)) {
      console.log("Inside image answer: answer: " + answer);
      alert("Invalid image distance");
      return null;
    } else if (highlightColumn == 2 && (answer < 9 || answer > 11)) {
      alert("focal length calculation may be wrong. Please recheck");
      return null;
    } else {
      if(highlightColumn == 2){
        if(readings[highlightRow][highlightColumn+1] == false){
          score += 1;
          readings[highlightRow][highlightColumn+1] = true;
        }
      }
      return answer;
    }
  }
  if (step == 6) {
    answer = prompt("Enter the calculated focal length");
    if (isNaN(answer)) {
      alert("Only numbers allowed");
      return null;
    } else if (answer.length > 4) {
      alert("Only 4 characters allowed.");
      return null;
    } else {
      return answer;
    }
  }
  if(step == 8){
    if(highlightRow == 1 && highlightColumn == 2){
      answer = prompt("options: enlarged/diminished/same size");
      if (answer.toLowerCase() == "enlarged" || answer.toLowerCase() == "diminished" || answer.toLowerCase() == "same size"){
        return answer.toLowerCase();
      }else{
        alert("Answer is invalid. Select among the given options");
        return null;
      }
  } else if(highlightRow == 1 && highlightColumn == 3){
    answer = prompt("options: real/virtual/unpredictable");
      if (answer.toLowerCase() == "real" || answer.toLowerCase() == "virtual" || answer.toLowerCase() == "unpredictable"){
        return answer.toLowerCase();
      }else{
        alert("Answer is invalid. Select among the given options");
        return null;
      }
    } else if(highlightRow == 2 && highlightColumn == 1){
      answer = prompt("options: at 2f/ at infinity/object side");
        if (answer.toLowerCase() == "at 2f" || answer.toLowerCase() == "at infinity" || answer.toLowerCase() == "object side"){
          return answer.toLowerCase();
        }else{
          alert("Answer is invalid. Select among the given options");
          return null;
        }
      }else if(highlightRow == 3 && highlightColumn == 1){
        answer = prompt("options: at 2f/beyond f/at infinity");
          if (answer.toLowerCase() == "at 2f" || answer.toLowerCase() == "beyond f" || answer.toLowerCase() == "at infinity"){
            return answer.toLowerCase();
          }else{
            alert("Answer is invalid. Select among the given options");
            return null;
          }
        }else if(highlightRow == 3 && highlightColumn == 3){
          answer = prompt("options: real/virtual/cannot say");
            if (answer.toLowerCase() == "real" || answer.toLowerCase() == "virtual" || answer.toLowerCase() == "cannot say"){
              return answer.toLowerCase();
            }else{
              alert("Answer is invalid. Select among the given options");
              return null;
            }
          } else if(highlightRow == 4 && highlightColumn == 1){
            answer = prompt("options: at 2f/beyond f/at infinity");
              if (answer.toLowerCase() == "at 2f" || answer.toLowerCase() == "beyond f" || answer.toLowerCase() == "at infinity"){
                return answer.toLowerCase();
              }else{
                alert("Answer is invalid. Select among the given options");
                return null;
              }
            } else if(highlightRow == 5 && highlightColumn == 1){
              answer = prompt("options: at 2f/beyond f/>f<2f");
                if (answer.toLowerCase == "at 2f" || answer.toLowerCase() == "beyond f" || answer.toLowerCase() == ">f<2f"){
                  return answer.toLowerCase();
                }else{
                  alert("Answer is invalid. Select among the given options");
                  return null;
                }
              } else if(highlightRow == 5 && highlightColumn == 2){
                answer = prompt("enlarged/diminished/same size");
                  if (answer.toLowerCase() == "enlarged" || answer.toLowerCase() == "diminished" || answer.toLowerCase() == "same size"){
                    return answer;
                  }else{
                    alert("Answer is invalid. Select among the given options");
                    return null;
                  }
                } 
  } 
}

function result(x,y) {
  console.log("Summary");
  switch (clickCount) {
    case 0:
      controlsDM.deactivate();
      console.log("Inside result: step:"+step+" clickcount: "+clickCount)
      camera.copy(camera1, true);
      text = ["Results",
      "Now it is time to note the observations",
      "", 
      "In the next step fill the empty cells", 
      "of the table with correct answers.",
      "",
      "Now, Click on arrow key to proceed"
    ];
      drawCanvasText(text);
      texCanvas.needsUpdate = true;
      render();    
      if (intersects[0].object.name == "button2"){
        clickCount +=1;
        console.log("result: inside intersect: clickCount: "+clickCount)
      }
    break;
    case 1:
      text = [
        "Obj. position",
        "Img. position",
        "Img. size",
        "Nature of image",
        "< f",
        "object side",
        "",
        "",
        "at f",
        "",
        "highly enlargd",
        "Real",
        ">f<2f",
        "",
        "Enlarged",
        "",
        "at 2f",
        "",
        "object size",
        "Real",
        ">2f",
        "",
        "",
        "Real",
      ];
      var i, j;
      var count = 0;
      for (i = 0; i <= 5; i++) {
        for (j = 0; j <= 3; j++) {
          readings[i][j] = text[count];
          count++;
        }
      }
      highlightRow = 1;
      highlightColumn = 2;
      clickCount +=1;
      console.log("summary: Switch case 0");
      drawCanvasTable(5, 3, "Observations");
      texCanvas.needsUpdate = true;
      render();
      break;
      case 2:
        var answer;
      console.log("result: case3");
      if(intersects[0].object.name == "tvscreen"){
        if (x>-0.01 && x<0.46 && y>0.18 && y<0.28 && !answered[0]){
          highlightRow = 1;
          highlightColumn = 2;
          answer = getAnswer();
          if(answer != null){
            if (answer == "enlarged"){
              score += 1;
              answered[0] = true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "Enlarged";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>0.5 && x<0.96 && y>0.18 && y<0.28 && !answered[1]){
          highlightRow = 1;
          highlightColumn = 3;
          answer = getAnswer();
          console.log("Virtal answer: "+answer)
          if(answer != null){
            if (answer == "virtual"){
              score += 1;
              answered[1]=true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "Virtual";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>-0.51 && x<-0.07 && y>0.06 && y<0.16 && !answered[2]){
          highlightRow = 2;
          highlightColumn = 1;
          answer = getAnswer();
          if(answer != null){
            if (answer == "at infinity"){
              score += 1;
              answered[2] = true
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "at infinity";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>-0.53 && x<-0.045 && y>-0.081 && y<0.024 && !answered[3]){
          highlightRow = 3;
          highlightColumn = 1;
          answer = getAnswer();
          if(answer != null){
            if (answer == "beyond f"){
              score += 1;
              answered[3]=true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "beyond f";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>0.48 && x<0.95 && y>-0.08 && y<0.028 && !answered[4]){
          console.log("detected at 2f cell")
          highlightRow = 3;
          highlightColumn = 3;
          answer = getAnswer();
          if(answer != null){
            if (answer == "real"){
              score += 1;
              answered[4]=true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "real";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }else if (x > -0.54 && x < -0.03 && y > -0.215 && y < -0.08 && !answered[5]){
          highlightRow = 4;
          highlightColumn = 1;
          answer = getAnswer();
          if(answer != null){
            if (answer == "at 2f"){
              score += 1;
              answered[5]=true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "at 2f";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>-0.54 && x<-0.04 && y>-0.34 && y<-0.23 && !answered[6]){
          highlightRow = 5;
          highlightColumn = 1;
          answer = getAnswer();
          if(answer != null){
            if (answer == ">f<2f"){
              score += 1;
              answered[6] = true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = ">f<2f";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
        else if (x>-0.021 && x<0.46 && y>-0.34 && y<-0.23 && !answered[7]){
          highlightRow = 5;
          highlightColumn = 2;
          answer = getAnswer();
          if(answer != null){
            if (answer == "diminished"){
              score += 1;
              answered[7]=true;
              alert("Answer is correct");
              readings[highlightRow][highlightColumn] = "diminished";
              drawCanvasTable(5, 3, "Observations");
              texCanvas.needsUpdate = true;
              render();
            }else{
              alert("Answer is wrong. Try again")
            }
          }
        }
      }else if (intersects[0].object.name == "button2"){
        clickCount += 1;
          text = ["Done!!!",
          "You have successfully completed",
          "the experiment",
          "",
          "Your score is: "+score+" out of 25",
      ];
          console.log("result: inside intersect: clickCount: "+clickCount)
        drawCanvasText(text);
      texCanvas.needsUpdate = true;
      render(); 
      }   
}
}
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //console.log("inside animate");
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

function render() {
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
