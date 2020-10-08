import * as THREE from "https://unpkg.com/three@0.120.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.120.1/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://unpkg.com/three@0.120.1/examples/jsm/controls/DragControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.120.1/examples/jsm/loaders/RGBELoader.js";
import { RoughnessMipmapper } from "https://unpkg.com/three@0.120.1/examples/jsm/utils/RoughnessMipmapper.js";
import { TextureLoader } from "https://unpkg.com/three@0.120.1/src/loaders/TextureLoader.js";
import { Line } from "https://unpkg.com/three@0.120.1/src/objects/Line.js";

var container, controls, controlsDM;
var camera, scene, renderer, gltf;
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
var centerLine;
var topLine;
var score;
var step = 1;
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
var getReading = false;
var doneFlag = false;

var canvasScreen = document.createElement("canvas");
var ctx = canvasScreen.getContext("2d");

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
  camera.position.set(0, 0, 1);
  //camera.rotation.z = (90 * Math.PI) / 180; */
  //camera.position.set(0, 0, 90);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();

  new RGBELoader()
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
        "convex_lens_flame.gltf",
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
          //console.log("x Position of flame: " + objectFlame.position.x);
          //textAim = ["Aim:", " To", " find", " the", " focal", " length", " of", " convex", " lens" ];
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

          drawCanvasText(textAim);

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
          drawCanvasCamera(canvasCam, ctxCamera);
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
          centerLine.visible = false;
          topLine.visible = false;
          Candleline.visible = true;
          Lensline.visible = false;
          gltf.scene.add(Candleline);
          gltf.scene.add(Lensline);
          gltf.scene.add(centerLine);
          gltf.scene.add(topLine);
          //scene.add(spr);
          //gltf.scene.position.set(0, -1, -17);
          gltf.scene.position.set(0, -5, 0);
          scene.add(gltf.scene);

          //Add Axis helper
          //var axesHelper = new THREE.AxesHelper(5);
          //scene.add(axesHelper);

          //Add image object
          var Cgeometry = new THREE.CircleGeometry(1, 32);
          var Cmaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
          });
          Cmaterial.opacity = 1;
          var sImage = new THREE.Mesh(Cgeometry, Cmaterial);
          //objects.push(objectFlame);
          objects.push(objectCandle);
          objects.push(objectBoard);
          objects.push(objectSheet);
          //objects.push(group);
          //console.log("object to be dragged" + sImage);

          //scene.add(sImage);

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
  mouse.x = pos.x;
  mouse.y = pos.y;
  console.log("Finding Nemo: pos.x: " + pos.x + "pos.y: " + pos.y);
  console.log("Finding Nemo: mouse.x: " + mouse.x + "mouse.y: " + mouse.y);
}

function drawCanvasText(text) {
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
  //ctx.font = " Bolder 14px Comic Sans MS";
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
        score += 1;
        objectSheet.material.map = texArray[0];
        objectCandle.position.z = 0;
        objectFlame.position.z = 0;
        controlsDM.deactivate();
        controls.enabled = false;
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
    e.object.position.y = lObjectPositiony;
    e.object.position.z = lObjectPositionz;
    console.log("object that is being dragged: " + e.object.name);
    console.log("object2 is: " + objects[2]);
    //console.log(
    //  "object that is being dragged is board?? " + objects[2].getObjectByName()
    //);

    //Moving sheet with board
    if (e.object == objectBoard) {
      //console.log("board is being dragged");
      objectSheet.position.x = objectBoard.position.x - 0.25;
      objectSheet.position.y = objectBoard.position.y;
      objectSheet.position.z = objectBoard.position.z;
      //console.log("board position: " + objectBoard.position.x);
      //console.log("sheet position: " + objectSheet.position.x);
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
