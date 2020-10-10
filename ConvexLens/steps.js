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
var readingCords;

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

          drawCanvasText(textAim, 15);

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

function apparatus(aparatus) {
  switch (clickCount) {
    case 0:
      console.log("inside apparatus:score: " + score + "step: " + step);
      textStep = [
        "Apparatus",
        "Identify the apparatus:",
        "(Click on the apparatus mentioned below)",
        "1. Candle",
        "2. Board",
        "3. Measuring scale",
        "4. Convex Lens",
        "5. Convex Lens stand",
      ];
      clickCount += 1;
      text = textStep.slice(0, 4);
      camera.position.set(0, 5, 8.5);
      break;
    case 1:
      if (aparatus == "candle") {
        text = textStep.slice(0, 5);
        score += 1;
        clickCount += 1;
      }
      break;
    case 2:
      if (aparatus == "board") {
        text = textStep.slice(0, 6);
        score += 1;
        clickCount += 1;
      }
      break;
    case 3:
      if (aparatus == "scale") {
        text = textStep.slice(0, 7);
        score += 1;
        clickCount += 1;
      }
      break;
    case 4:
      if (aparatus == "lens") {
        text = textStep.slice(0, 8);
        score += 1;
        clickCount += 1;
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
        score += 1;
        clickCount += 1;
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
  render();
}

function setup1() {
  controlsDM.activate();

  console.log("setup1:step: " + step);

  text = [
    "Setup",
    "1. Make sure the candle, lens stand",
    "and the center of board are in",
    "straight line",
    "Drag the candle backward and forward",
    "to keep in correct position.",
    "Your score will increment if you place the",
    "candle in correct position",
  ];
  centerLine.visible = true;
  //clickCount = 5;
  camera.position.set(-8, 1, 7);
  camera.rotation.y -= (30 * Math.PI) / 180;
  //canvasText(text);
  drawCanvasText(text, 15);
  texCanvas.needsUpdate = true;
  render();
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
  if (step == 1) {
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
  } else if (step == 4) {
    setup2(intersects[0].object.name);
  } else if (step == 5) {
    /*console.log("OnClick: Step5: calling proc1: clickCount: " + clickCount);*/
    proc1(pos.x, pos.y);
  }
}

function setup2(clickedObject) {
  switch (clickCount) {
    case 0:
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
        "of the lens stand",
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
      if (clickedObject == "lensStand") {
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

        score += 1;
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
  console.log("Inside Proc1:ClickCount: " + clickCount);
  switch (clickCount) {
    case 0:
      initializeReadingArray();
      topLine.visible = false;
      Candleline.visible = true;
      Lensline.visible = true;
      controlsDM.deactivate();
      console.log("Proc1:case 0: step: " + step + " clickCount: " + clickCount);
      step += 1;
      clickCount += 1;
      console.log("Proc1:case 0: step: " + step + " clickCount: " + clickCount);
      text = [
        "Finding Focal Length",
        "1. Move candle at a position where image is seen",
        "2. Move the board till a sharp image is seen.",
        "3. Input object distance and image distance",
        "by clicking on the cell in the table",
        "5. Calculate the focal length using formula",
        "6. Input focal length in the table",
        "Click on arrow button to take readings",
      ];
      camera.near = 1;
      camera.position.set(-4, 3, 7);

      camera.rotation.y -= 6 * (Math.PI / 180);
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
        (function () {
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
              console.log(
                "x_min: " +
                  x_min +
                  "x_max: " +
                  x_max +
                  "y_min: " +
                  y_min +
                  "y_max: " +
                  y_max
              );
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
      break;
    case 3:
      console.log(
        "Proc1: case 3: x_min: " +
          x_min +
          "x_max: " +
          x_max +
          "y_min: " +
          y_min +
          "y_max: " +
          y_max
      );

      if (x > x_min && x < x_max && y > y_min && y < y_max) {
        var answer = getAnswer();
        if (answer != null) {
          readings[highlightRow - 1][highlightColumn] = answer;
          drawCanvasTable(5, 2, "Readings");
          clickCount -= 1;
        }
      }
  }
}
function proc2(x, y) {
  var isAnswer;
  switch (clickCount) {
    case 0:
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
        "Proc1:switch0:step: " +
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
      isAnswer = true;
      controlsDM.deactivate();
      if (x > -5.73 && x < 1.8 && y > -0.19 && y < 1.7) {
        if (y > 1.2 && y < 1.5) {
          console.log(
            "proc1:switch1:inside nemo: step: " +
              step +
              " clickCount: " +
              clickCount
          );
          score += 1;
        }
        var text = [
          "Object less than f(10cms)",
          "When the candle is placed at a distance less than f,",
          "a virtual image is formed on the same side of the object",
          "Hence, here it is NOT seen on the screen",
          "Image is NOT seen on the screen",
          "Image is diminished",
          "Image is of same height as that of object",
          "Image is enlarged",
        ];
        clickCount += 1;
        drawCanvasQuiz(text, isAnswer, 4);
        texCanvas.needsUpdate = true;
        render();
      }
      break;
    case 2:
      isAnswer = false;
      controlsDM.activate();
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
            "Proc1:switch0:step: " +
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
      controlsDM.deactivate();
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
      controlsDM.activate();
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
            "Proc1:switch0:step: " +
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
      controlsDM.deactivate();
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
          "Proc1:switch3:step: " +
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
      controlsDM.activate();
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
            "Proc1:switch0:step: " +
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
      controlsDM.deactivate();
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
          "Proc1:switch7:step: " +
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
  }
}

function InitializeReadingCords(x, y) {
  var x_orig = x;
  var y_orig = y;
  var i, j;
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

  readings[0][0] = "Object position";
  readings[0][1] = "Image distance";
  readings[0][2] = "focal length";

  for (i = 1; i <= 5; i++) {
    for (j = 0; j <= 2; j++) {
      readings[i][j] = "0";
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
        score += 1;
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
      console.log("CanvasTable:readings: " + readings[i][j]);
      ctx.strokeRect(x, y, rowWidth, rowHeight);
      ctx.fillText(readings[i][j], x + rowWidth / 2, y + rowHeight / 2);

      if (i == highlightRow && j == highlightColumn) {
        console.log("CanvasTable:highlight cell: readings: " + readings[i][j]);
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
    var text2 = "Click on the box and enter the length";
  }
  if (clickCount == 1) {
    if (answer == fl) {
      if (answer >= 9 && answer <= 11) {
        score += 1;
        doneFlag = true;
        text1 = "The focal length of the lens is correct";
        text2 = "Click on the arrow button for the summary";
      } else {
        text1 = "The focal length is not correct";
        text2 = "Refresh the page and redo the experiment";
      }
    } else {
      text1 = "The calculation is not correct check again";
      text2 = "Recalculate and enter value again";
      clickCount = 1;
      proc3();
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
      return answer;
    }
  }
  if (step == 7) {
    answer = prompt("Enter the calculated focal length");
    if (isNaN(answer)) {
      alert("Only numbers allowed");
      return null;
    } else if (answer.length > 4) {
      alert("Only 4 characters allowed");
      return null;
    } else {
      return answer;
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
