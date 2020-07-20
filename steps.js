var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");

c.canvas.width = window.innerWidth;
c.canvas.height = window.innerHeight;

//Methods and properties common to all apparatus
class Apparatus {
  constructor(
    x,
    y,
    width,
    height,
    c_x,
    c_y,
    radius,
    dialLines,
    LargedialLines
  ) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.c_x = c_x;
    this.c_y = c_y;
    this.radius = radius;
    this.radius1 = radius;
    this.radius2 = radius + 10;
    this.radius3 = radius - 13;
    this.radius4 = radius + 20;
    this.radius_p = radius - 2;
    this.dialLines = dialLines;
    this.LargedialLines = LargedialLines;
    this.power = false;
    this.sock_r_x = 0;
    this.sock_r_y = 0;
    this.sock_b_x = 0;
    this.sock_b_y = 0;
  }

  static getRotateCordinates(x, y, rot_angle, rot_radius) {
    //console.log(`radius is ${rot_radius}`);
    var x_start = x - Math.cos((rot_angle * Math.PI) / 180) * rot_radius;

    var y_start = y - Math.sin((rot_angle * Math.PI) / 180) * rot_radius;
    //console.log(`The x_start is ${x_start} and y_start is ${y_start}`);
    return [x_start, y_start];
  }

  DrawOuterRect() {
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.fillRect(this.x, this.y, this.width, this.height);
    c.strokeRect(this.x, this.y, this.width, this.height);
  }

  DrawDial(IsDrawText, r_text) {
    //Circle for dial
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.arc(this.c_x, this.c_y, this.radius1, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
    c.beginPath();
    c.arc(this.c_x, this.c_y, this.radius2, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
    var DialLineAngleDiff = 180 / (this.dialLines - 1);
    //console.log("dial angle diff: " + DialLineAngleDiff);
    var angle = 0;
    for (var i = 0; i < this.dialLines; i++) {
      //console.log("angle: " + angle);
      var x_start = this.c_x - Math.cos((angle * Math.PI) / 180) * this.radius1;
      var y_start = this.c_y - Math.sin((angle * Math.PI) / 180) * this.radius1;
      var x_end = this.c_x - Math.cos((angle * Math.PI) / 180) * this.radius2;
      var y_end = this.c_y - Math.sin((angle * Math.PI) / 180) * this.radius2;
      if (IsDrawText) {
        var x_text =
          this.c_x - Math.cos((angle * Math.PI) / 180) * this.radius4;
        var y_text =
          this.c_y - Math.sin((angle * Math.PI) / 180) * this.radius4;
        if (angle <= 90) {
          x_text = x_text - 18;
          y_text = y_text + 5;
        } else if (angle > 90) {
          x_text = x_text - 8;
          y_text = y_text + 5;
        }
      }

      //console.log("x_start: " + x_start);
      //console.log("y_start: " + y_start);
      c.beginPath();
      c.moveTo(x_start, y_start);
      c.lineTo(x_end, y_end);
      c.stroke();
      if (IsDrawText) {
        c.beginPath();
        c.fillStyle = "black";
        c.font = "16px Arial";
        c.fillText(r_text[i], x_text, y_text);
      }

      angle = angle + DialLineAngleDiff;
    }
  }

  DrawDialLarge(r_text) {
    //Circle for dial
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.arc(this.c_x, this.c_y, this.radius2, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
    c.beginPath();
    c.arc(this.c_x, this.c_y, this.radius4, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
    var DialLineAngleDiff = 180 / (this.LargedialLines - 1);
    //console.log("dial angle diff: " + DialLineAngleDiff);
    var angle = 0;
    var radius_text = this.radius4 + 20;
    for (var i = 0; i < this.LargedialLines; i++) {
      //console.log("angle: " + angle);
      var x_start = this.c_x - Math.cos((angle * Math.PI) / 180) * this.radius2;
      var y_start = this.c_y - Math.sin((angle * Math.PI) / 180) * this.radius2;
      var x_end = this.c_x - Math.cos((angle * Math.PI) / 180) * this.radius4;
      var y_end = this.c_y - Math.sin((angle * Math.PI) / 180) * this.radius4;
      var x_text = this.c_x - Math.cos((angle * Math.PI) / 180) * radius_text;
      var y_text = this.c_y - Math.sin((angle * Math.PI) / 180) * radius_text;
      if (angle <= 90) {
        x_text = x_text - 18;
        y_text = y_text + 5;
      } else if (angle > 90) {
        x_text = x_text - 8;
        y_text = y_text + 5;
      }
      //console.log("x_start: " + x_start);
      //console.log("y_start: " + y_start);
      c.beginPath();
      c.moveTo(x_start, y_start);
      c.lineTo(x_end, y_end);
      c.stroke();
      c.beginPath();
      c.fillStyle = "black";
      c.font = "16px Arial";
      c.fillText(r_text[i], x_text, y_text);
      angle = angle + DialLineAngleDiff;
    }
  }
  DrawKnob(angle) {
    var knob_cords = Apparatus.getRotateCordinates(
      this.c_x,
      this.c_y,
      angle,
      this.radius3
    );
    //dimensions of outer rect for the knob. Will be used for clearing
    var rect_x = this.c_x - this.radius3;
    var rect_y = this.c_y - this.radius3;
    var rect_h = 2 * this.radius3;
    var rect_w = 2 * this.radius3;
    //console.log(`knob: ${knob_cords[0]} , ${knob_cords[1]}`);
    c.beginPath();
    c.fillStyle = "white";
    c.fillRect(rect_x, rect_y, rect_w, rect_h);
    c.strokeStyle = "black";
    c.lineWidth = 10;
    c.moveTo(this.c_x, this.c_y);
    c.lineTo(knob_cords[0], knob_cords[1]);
    c.stroke();
    c.beginPath();
    c.arc(knob_cords[0], knob_cords[1], 3, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
  }

  DrawSockets() {
    var r_x_space = 15;
    var r_y_space = 15;
    var b_x_space = 100;
    this.sock_r_x = this.x + r_x_space;
    this.sock_r_y = this.y + this.height - r_y_space;
    this.sock_b_x = this.sock_r_x + b_x_space;
    this.sock_b_y = this.sock_r_y;

    var radius = 5;
    c.strokeStyle = "red";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(this.sock_r_x, this.sock_r_y, radius, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();

    c.beginPath();
    c.strokeStyle = "black";
    c.arc(this.sock_b_x, this.sock_b_y, radius, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
  }

  DrawExtraBlackSocket() {
    var x = this.x + 220;
    var y = this.y + this.height - 15;
    var radius = 5;
    c.strokeStyle = "black";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(x, y, radius, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
  }

  DrawPowerOFF() {
    //console.log("Inside drawPowerOFF");
    c.beginPath();
    c.fillStyle = "white";
    c.fillRect(20, 29, 15, 18);
    c.strokeStyle = "black";
    c.lineWidth = 8;
    c.strokeRect(20, 40, 15, 15);
    c.fillStyle = "silver";
    c.lineWidth = 0.5;
    c.fillRect(25, 47, 5, 18);
    c.strokeRect(25, 47, 5, 18);
    c.fillStyle = "black";
    c.font = "16px Arial";
    c.fillText("ON", 15, 28);
    c.fillText("OFF", 15, 80);
    //power LED
    c.beginPath();
    c.fillStyle = "silver";
    c.arc(65, 47, 10, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.stroke();
    this.power = false;
  }
  DrawPowerON() {
    //console.log("Inside drawPowerOn");
    c.beginPath();
    c.fillStyle = "white";
    c.fillRect(20, 40, 15, 26);
    c.strokeStyle = "black";
    c.lineWidth = 8;
    c.strokeRect(20, 40, 15, 15);
    c.fillStyle = "silver";
    c.lineWidth = 0.5;
    c.fillRect(25, 33, 5, 18);
    c.strokeRect(25, 33, 5, 18);
    c.fillStyle = "black";
    c.font = "16px Arial";
    c.fillText("ON", 15, 28);
    c.fillText("OFF", 15, 80);
    //power LED
    c.beginPath();
    c.fillStyle = "red";
    c.arc(65, 47, 10, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.stroke();
    this.power = true;
  }
  DrawPointers(p_angle, dial_text) {
    //Clean previous pointer
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.arc(this.c_x, this.c_y, this.radius_p, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    var pointer_cords = Apparatus.getRotateCordinates(
      this.c_x,
      this.c_y,
      p_angle,
      this.radius_p
    );

    //console.log(`pointer: ${pointer_cords[0]} , ${pointer_cords[1]}`);
    c.strokeStyle = "red";
    c.fillStyle = "red";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(this.c_x, this.c_y);
    c.lineTo(pointer_cords[0], pointer_cords[1]);
    c.stroke();
    c.beginPath();
    c.arc(this.c_x, this.c_y, 5, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    c.beginPath();
    var x_text = this.c_x - 10;
    var y_text = this.c_y + 20;
    //console.log(
    //  `x_text is ${x_text}, y_text is ${y_text}, r_text is ${dial_text}`
    //);
    c.fillStyle = "black";
    c.font = "18px Arial bold";
    c.fillText(dial_text, x_text, y_text);
  }
}

class Step {
  constructor(x, y, width, height, score) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = 0;
    this.l_step_event = "";
  }
  DrawStep(score, text) {
    //console.log(this.text);
    c.beginPath();
    c.fillStyle = "#48AAAD";
    c.strokeStyle = "black";
    c.fillRect(this.x, this.y, this.width, this.height);
    c.beginPath();
    c.font = "30px Comic Sans MS";
    c.fillStyle = "red";
    //c.textAlign = "center";
    c.fillText(text, this.x + 10, this.y + 50);
  }
  DrawCircuit() {
    const image = new Image();
    image.onload = function () {
      c.drawImage(image, 600, 100);
    };
    image.src = "images/circuit-diagram.png";
  }
}
function logEvent(e) {
  event = e || window.event;
  var x = event.clientX;
  var y = event.clientY;
  //console.log("mouse clicked: x is: " + x + "y is: " + y);
  //console.log(
  //  "windows width: " +
  //    window.innerWidth +
  //    "windows height: " +
  //    window.innerWidth
  //);
  //console.log(`battery x co-ordinate: ${battery.x}`);
  if (x > 20 && x < 35 && y > 35 && y < 60) {
    if (battery.power) {
      battery.DrawPowerOFF();
    } else {
      battery.DrawPowerON();
    }
  }
}

canvas.addEventListener("mousedown", (md_e) => {
  x = md_e.offsetX;
  y = md_e.offsetY;
  var space = 10;
  console.log(`mouse down event: x=${x} and y=${y}`);
  batt_r_x_min = battery.sock_r_x - space;
  batt_r_x_max = battery.sock_r_x + space;
  batt_r_y_min = battery.sock_r_y - space;
  batt_r_y_max = battery.sock_r_y + space;

  batt_b_x_min = battery.sock_b_x - space;
  batt_b_x_max = battery.sock_b_x + space;
  batt_b_y_min = battery.sock_b_y - space;
  batt_b_y_max = battery.sock_b_y + space;

  amm_r_x_min = ammeter.sock_r_x - space;
  amm_r_x_max = ammeter.sock_r_x + space;
  amm_r_y_min = ammeter.sock_r_y - space;
  amm_r_y_max = ammeter.sock_r_y + space;

  amm_b_x_min = ammeter.sock_b_x - space;
  amm_b_x_max = ammeter.sock_b_x + space;
  amm_b_y_min = ammeter.sock_b_y - space;
  amm_b_y_max = ammeter.sock_b_y + space;

  console.log(
    `b_x_min=${batt_r_x_min}, b_x_max=${batt_r_x_max}, b_y_min=${batt_r_y_min}, b_y_max=${batt_r_y_max}`
  );
  console.log(
    `amm_x_min=${amm_r_x_min}, amm_x_max=${amm_r_x_max}, amm_y_min=${amm_r_y_min}, _ammy_max=${amm_r_y_max}`
  );
  switch (true) {
    case x > batt_r_x_min &&
      x < batt_r_x_max &&
      y > batt_r_y_min &&
      y < batt_r_y_max:
      console.log("clicked on battery positive");
      if (!battery.RedSocket) {
        battery.RedSocket = true;
      } else if (
        battery.RedSocket &&
        ammeter.RedSocket &&
        !battery.RedSocketVerification
      ) {
        battery.RedSocketVerification = true;
        step1.score = step1.score + 1;
      }
      step1.l_step_event = "battery_r";
      break;
    case x > amm_r_x_min &&
      x < amm_r_x_max &&
      y > amm_r_y_min &&
      y < amm_r_y_max:
      console.log("clicked on ammeter positive");
      console.log(
        `${ammeter.RedSocket} ${battery.RedSocket} ${battery.RedSocketVerification}`
      );
      if (!ammeter.RedSocket) {
        ammeter.RedSocket = true;
      }
      if (
        ammeter.RedSocket &&
        battery.RedSocket &&
        !battery.RedSocketVerification &&
        step1.l_step_event == "battery_r"
      ) {
        battery.RedSocketVerification = true;
        step1.score = step1.score + 1;
      }
  }
  console.log(`score: ${step1.score}`);
});

const battery = new Apparatus(10, 10, 250, 150, 150, 85, 40, 5);
battery.DrawOuterRect();
battery.DrawDial(true, ["OV", "5V", "10V", "15V", "20V"]);
battery.DrawKnob(45);
battery.DrawSockets();
battery.DrawPowerOFF();
battery.RedSocket = false;
battery.BlackSocket = false;
battery.RedSocketVerification = false;
const rheostat = new Apparatus(300, 10, 250, 150, 450, 85, 40, 5);
rheostat.DrawOuterRect();
rheostat.DrawDial(true, ["10Ω", "50Ω", "500Ω", "100KΩ", "20KΩ"]);
rheostat.DrawKnob(0);
rheostat.DrawSockets();
rheostat.DrawExtraBlackSocket();
rheostat.RedSocket = false;
rheostat.BlackSocket = false;
rheostat.RedSocketVerification = false;

const voltmeter = new Apparatus(300, 200, 220, 200, 410, 300, 50, 26, 6);
voltmeter.DrawOuterRect();
voltmeter.DrawDial(false);
voltmeter.DrawDialLarge(["0V", "5V", "10V", "15V", "20V", "25V", "V"]);
//voltmeter.DrawKnob(0);
voltmeter.DrawSockets();
voltmeter.DrawPointers(45, "V");
voltmeter.RedSocket = false;
voltmeter.BlackSocket = false;
voltmeter.RedSocketVerification = false;

const ammeter = new Apparatus(40, 200, 220, 200, 150, 300, 40, 26, 6);
ammeter.DrawOuterRect();
ammeter.DrawDial(false);
ammeter.DrawDialLarge(["0", "20", "40", "60", "80", "100", "mA"]);
ammeter.DrawSockets();
ammeter.DrawPointers(120, "mA");
ammeter.RedSocket = false;
ammeter.BlackSocket = false;
ammeter.RedSocketVerification = false;

const step1 = new Step(10, 500, 900, 100);
var step_text =
  "Step 1: Connect the apparatus as shown in the circuit diagram.";
//console.log(step_text);
step1.DrawStep(0, step_text);
step1.DrawCircuit();
