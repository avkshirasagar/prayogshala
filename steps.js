var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");

c.canvas.width = window.innerWidth;
c.canvas.height = window.innerHeight;

var step_count = 1;
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
    this.isRheostat = false;
    this.RheostatAngles = [0, 45, 90, 135, 180];
    this.voltmeter_init_angle = 7;
    this.ammter_init_angle = 0;
    this.VoltmeterAngles = { 0: 145, 45: 124, 90: 48, 135: 33, 180: 25 };
    this.AmmterAngles = { 0: 170, 45: 145, 90: 56, 135: 30, 180: 22 };
    this.battery_switch_x_min = 20;
    this.battery_switch_x_max = 35;
    this.battery_switch_y_min = 35;
    this.battery_switch_y_max = 60;
    this.rheostat_angle = 0;
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

  DrawResistor() {
    c.beginPath();
    c.strokeStyle = "#565051";
    c.lineWidth = this.height;
    c.moveTo(this.x, this.y);
    c.lineTo(this.x + this.width, this.y);
    c.stroke();
    c.beginPath();
    c.arc(this.x, this.y, 5, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
    c.beginPath();
    c.arc(this.x + this.width, this.y, 5, 0 * Math.PI, 2 * Math.PI, true);
    c.stroke();
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
        x_text = x_text;
        y_text = y_text + 5;
      } else if (angle > 90) {
        x_text = x_text;
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
  DrawKnob(apparatus) {
    var k_angle = 0;
    if (apparatus == "battery") {
      k_angle = 180;
    } else if (apparatus == "rheostat") {
      k_angle = this.rheostat_angle;
    }
    var knob_cords = Apparatus.getRotateCordinates(
      this.c_x,
      this.c_y,
      k_angle,
      this.radius3
    );
    //dimensions of outer rect for the knob. Will be used for clearing
    var rect_x = this.c_x - this.radius3;
    var rect_y = this.c_y - this.radius3;
    var rect_h = 2 * this.radius3;
    var rect_w = 2 * this.radius3;

    this.rh_knob_x_min = rect_x;
    this.rh_knob_x_max = rect_x + rect_w;
    this.rh_knob_y_min = rect_y;
    this.rh_knob_y_max = rect_y + rect_h;
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 10;
    c.fillRect(rect_x, rect_y, rect_w, rect_h);

    c.moveTo(this.c_x, this.c_y);
    c.lineTo(knob_cords[0], knob_cords[1]);
    c.stroke();
    c.beginPath();
    c.arc(knob_cords[0], knob_cords[1], 3, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
  }

  DrawSockets(isRheostat) {
    c.textAlign = "center";
    c.textBaseline = "middle";
    var radius = 5;
    c.lineWidth = 5;
    this.isRheostat = isRheostat;
    if (this.isRheostat) {
      console.log(`Inside DrawSockets:isRheostat: ${isRheostat}`);
      var b1_x_space = 15;
      var r_x_space = 85;
      var b2_x_space = 85;
      var r_y_space = 15;
      this.sock_b1_x = this.x + b1_x_space;
      this.sock_r_x = this.sock_b1_x + r_x_space;
      this.sock_b2_x = this.sock_r_x + b2_x_space;
      this.sock_r_y = this.y + this.height - r_y_space;
      this.sock_b1_y = this.sock_r_y;
      this.sock_b2_y = this.sock_r_y;

      c.strokeStyle = "black";
      c.beginPath();
      c.arc(
        this.sock_b1_x,
        this.sock_b1_y,
        radius,
        0 * Math.PI,
        2 * Math.PI,
        true
      );
      c.stroke();
      c.beginPath();
      c.font = "15px Arial";
      c.fillStyle = "black";
      c.fillText("F", this.sock_b1_x, this.sock_b1_y - 13);
      //c.stroke();

      c.strokeStyle = "red";
      c.beginPath();
      c.arc(
        this.sock_r_x,
        this.sock_r_y,
        radius,
        0 * Math.PI,
        2 * Math.PI,
        true
      );
      c.stroke();

      c.strokeStyle = "black";
      c.beginPath();
      c.arc(
        this.sock_b2_x,
        this.sock_b2_y,
        radius,
        0 * Math.PI,
        2 * Math.PI,
        true
      );
      c.stroke();
      c.beginPath();
      c.font = "15px Arial";
      c.fillStyle = "black";
      c.fillText("F", this.sock_b2_x, this.sock_b2_y - 13);
    } else {
      console.log(`Inside DrawSockets:isRheostat else: ${isRheostat}`);
      var r_x_space = 15;
      var r_y_space = 15;
      var b_x_space = 100;
      this.sock_r_x = this.x + r_x_space;
      this.sock_r_y = this.y + this.height - r_y_space;
      this.sock_b_x = this.sock_r_x + b_x_space;
      this.sock_b_y = this.sock_r_y;

      c.strokeStyle = "red";
      c.beginPath();
      c.arc(
        this.sock_r_x,
        this.sock_r_y,
        radius,
        0 * Math.PI,
        2 * Math.PI,
        true
      );
      c.stroke();
      c.beginPath();
      c.font = "30px Arial";
      c.fillStyle = "black";
      c.fillText("+", this.sock_r_x, this.sock_r_y - 13);

      c.beginPath();
      c.strokeStyle = "black";
      c.arc(
        this.sock_b_x,
        this.sock_b_y,
        radius,
        0 * Math.PI,
        2 * Math.PI,
        true
      );
      c.stroke();
      c.beginPath();
      c.font = "30px Arial";
      c.fillStyle = "black";
      c.fillText("-", this.sock_b_x, this.sock_b_y - 12);
    }
  }

  DrawPowerOFF() {
    console.log("Inside drawPowerOFF");
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.fillRect(13, 13, 35, 80);
    //c.fillRect(21, 29, 15, 18);
    c.strokeRect(13, 13, 35, 80);
    c.lineWidth = 8;
    c.strokeRect(20, 40, 15, 15);
    c.fillStyle = "silver";
    c.lineWidth = 0.5;
    c.fillRect(25, 47, 5, 18);
    c.strokeRect(25, 47, 5, 18);
    c.fillStyle = "black";
    c.font = "16px Arial";
    c.textAlign = "left";
    c.textBaseline = "middle";
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
    console.log("Inside drawPowerOn");
    c.beginPath();
    c.fillStyle = "white";
    c.fillRect(13, 13, 35, 80);
    //c.fillRect(20, 40, 15, 26);
    c.strokeStyle = "black";
    c.lineWidth = 8;
    c.strokeRect(20, 40, 15, 15);
    c.fillStyle = "silver";
    c.lineWidth = 0.5;
    c.fillRect(25, 33, 5, 18);
    c.strokeRect(25, 33, 5, 18);
    c.fillStyle = "black";
    c.font = "16px Arial";
    c.textAlign = "left";
    c.textBaseline = "middle";
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
  //DrawDialText(dial_text) {
  //  c.beginPath();
  //  var x_text = this.c_x - 10;
  //  var y_text = this.c_y + 20;
  //console.log(
  //  `x_text is ${x_text}, y_text is ${y_text}, r_text is ${dial_text}`
  //);
  //  c.fillStyle = "black";
  //  c.font = "18px Arial bold";
  //  c.fillText(dial_text, x_text, y_text);
  //}
  DrawPointers(apparatus) {
    //Clean previous pointer

    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.arc(this.c_x, this.c_y, this.radius_p, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    var p_angle = 0;
    var dial_text = "";
    if (apparatus == "voltmeter") {
      dial_text = "V";
      if (battery.power) {
        p_angle = this.VoltmeterAngles[rheostat.rheostat_angle];
      } else {
        p_angle = 7;
      }
    } else if (apparatus == "ammter") {
      dial_text = "mA";
      if (battery.power) {
        p_angle = this.AmmterAngles[rheostat.rheostat_angle];
      } else {
        p_angle = 0;
      }
    }
    console.log(`pointers:p_angle=${p_angle}, battery=${battery.power}`);
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
    var x_text = this.c_x;
    var y_text = this.c_y + 15;
    //console.log(
    //  `x_text is ${x_text}, y_text is ${y_text}, r_text is ${dial_text}`
    //);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "black";
    c.font = "18px Arial bold";
    c.fillText(dial_text, x_text, y_text);
  }
}

class ScoreBoard {
  constructor(cx, cy, color, score) {
    this.cx = cx;
    this.cy = cy;
    this.color = color;
    this.score = score;
    this.ClickedScoreBoard = false;
  }
  static DrawBoard() {
    c.beginPath();
    c.fillStyle = "#03dffc";
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.fillRect(600, 10, 300, 50);
    c.strokeRect(600, 10, 300, 50);
    c.fillRect(550, 60, 400, 100);
    c.strokeRect(550, 60, 400, 100);
    c.font = "25px Verdana";
    c.fillStyle = "#000000";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Steps", 750, 35);
    c.fillText("1", 590, 75);
    c.fillText("2", 670, 75);
    c.fillText("3", 750, 75);
    c.fillText("4", 830, 75);
    c.fillText("5", 910, 75);
  }
  DrawScore() {
    //Circle for step1
    c.fillStyle = this.color;
    c.strokeStyle = "black";
    c.beginPath();
    c.arc(this.cx, this.cy, 30, 0 * Math.PI, 2 * Math.PI, true);
    c.fill();
    c.fillStyle = "#48AAAD";
    c.strokeStyle = "black";
    c.beginPath();
    c.font = "30px Robinson Typeface";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(this.score, this.cx, this.cy);
  }
}

class Step {
  constructor(x, y, width, height, t1x, t1y, t1w, t1h) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.l_step_event = "";
    this.c_step_event = "";
    this.t1x = t1x;
    this.t1y = t1y;
    this.t1w = t1w;
    this.t1h = t1h;
    this.AmmterRangeVerificationDone = false;
    this.VoltmeterRangeVerification = false;
    this.AmmterLCVerification = false;
    this.VoltmeterLCVerification = false;
    this.AmmterZEVerification = false;
    this.VoltmeterZEVerification = false;
    this.Step3R1VoltVerificationDone = false;
    this.Step3R1ammVerificationDone = false;
    this.Step3R1resistorVerificationDone = false;
    this.Step3R2VoltVerificationDone = false;
    this.Step3R2ammVerificationDone = false;
    this.Step3R2resistorVerificationDone = false;
    this.Step3R3VoltVerificationDone = false;
    this.Step3R3ammVerificationDone = false;
    this.Step3R3resistorVerificationDone = false;
    this.Step3R4VoltVerificationDone = false;
    this.Step3R4ammVerificationDone = false;
    this.Step3R4resistorVerificationDone = false;
    this.Step3R5VoltVerificationDone = false;
    this.Step3R5ammVerificationDone = false;
    this.Step3R5resistorVerificationDone = false;
    this.Step3ReadingCount = 0;
    this.Step3rOptions = [
      [18, 19, 20, 95.2, 100, 0.09, 199.5, 19, 5],
      [15, 16, 17, 0.8, 8, 80, 500, 400, 200],
      [5.5, 6.5, 7.5, 28, 280, 0.28, 0.196, 1.96, 196],
      [4.5, 45, 3.5, 0.16, 16, 160, 4500, 218, 450],
      [200, 20, 2.5, 120, 0.12, 12, 208, 10, 0.2],
    ];
    this.meanResistor_opt1_x_min = 0;
    this.meanResistor_opt1_x_max = 0;
    this.meanResistor_opt1_y_min = 0;
    this.meanResistor_opt1_y_max = 0;
    this.meanResistor_opt2_x_min = 0;
    this.meanResistor_opt2_x_max = 0;
    this.meanResistor_opt2_y_min = 0;
    this.meanResistor_opt2_y_max = 0;
    this.step4VerificationDone = false;
    this.slopeVerificationDone = false;
    this.conductanceVerificationDone = false;
    this.resistenaceVerificationDone = false;
    this.step5VerificationDone = false;
  }
  DrawStep(text) {
    //console.log(this.text);
    //console.log(text);
    c.beginPath();
    c.fillStyle = "#03dffc";
    c.strokeStyle = "black";
    c.fillRect(this.x, this.y, this.width, this.height);
    c.strokeRect(this.x, this.y, this.width, this.height);
    c.beginPath();
    c.font = "20px Verdana";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.textBaseline = "middle";
    var space = 25;
    for (var i = 0; i < text.length; i++) {
      c.fillText(text[i], this.x + this.width / 2, this.y + space);
      space = space + 20;
    }
  }
  DrawCircuit() {
    const image = new Image();
    image.onload = function () {
      c.drawImage(image, 550, 200);
    };
    image.src = "images/circuit-diagram.png";
  }
  DrawGreatJob() {
    const image = new Image();
    image.onload = function () {
      c.drawImage(image, 600, 55);
    };
    image.src = "images/james_bond.gif";
  }
  DrawConnection(connection) {
    c.strokeStyle = "green";
    if (connection == "batteryRed") {
      c.beginPath();
      c.strokeStyle = "green";
      c.moveTo(battery.sock_r_x, battery.sock_r_y);
      c.lineTo(battery.sock_r_x, ammeter.sock_r_y);
      c.lineTo(ammeter.sock_r_x, ammeter.sock_r_y);
      c.stroke();
    }
    if (connection == "batteryBlack") {
      console.log("drawConnection for battery black");
      console.log(`${battery.sock_b_x} ${battery.sock_b_y}`);
      c.beginPath();
      c.moveTo(battery.sock_b_x, battery.sock_b_y);
      c.lineTo(battery.sock_b_x, battery.sock_b_y + 30);
      c.lineTo(rheostat.sock_b1_x, rheostat.sock_b1_y + 30);
      c.lineTo(rheostat.sock_b1_x, rheostat.sock_b1_y);
      c.stroke();
    }
    if (connection == "rheostatRed") {
      console.log("drawConnection for rheostat red");
      c.beginPath();
      c.moveTo(rheostat.sock_r_x, rheostat.sock_r_y);
      c.lineTo(rheostat.sock_r_x, battery.sock_b_y + 30);
      c.lineTo(rheostat.sock_b2_x + 45, rheostat.sock_b2_y + 30);
      c.lineTo(rheostat.sock_b2_x + 45, rheostat.sock_b2_y + 270);
      c.lineTo(voltmeter.sock_b_x, rheostat.sock_b2_y + 270);
      c.lineTo(voltmeter.sock_b_x, voltmeter.sock_b_y);
      c.stroke();
    }
    if (connection == "voltmeterRed") {
      console.log("drawConnection for voltmeter red");
      c.beginPath();
      c.moveTo(voltmeter.sock_r_x, voltmeter.sock_r_y);
      c.lineTo(voltmeter.sock_r_x, voltmeter.sock_r_y + 30);
      c.lineTo(ammeter.sock_b_x, ammeter.sock_b_y + 30);
      c.lineTo(ammeter.sock_b_x, ammeter.sock_b_y);
      c.stroke();
    }
    if (connection == "resistorT1") {
      console.log("drawConnection for resistor t1");
      c.beginPath();
      c.moveTo(voltmeter.sock_r_x, voltmeter.sock_r_y);
      c.lineTo(resistor.x, resistor.y);
      c.stroke();
    }
    if (connection == "resistorT2") {
      console.log("drawConnection for resistor t2");
      c.beginPath();
      c.moveTo(voltmeter.sock_b_x, voltmeter.sock_b_y);
      c.lineTo(resistor.x + resistor.width, resistor.y);
      c.stroke();
    }
  }

  DrawTable1() {
    //c.fillStyle = "#fc03ad";
    c.beginPath();
    c.strokeStyle = "black";
    c.lineWidth = "2px";
    c.textAlign = "center";
    c.textBaseline = "medium";
    var x = this.t1x;
    var y = this.t1y;
    c.font = "20px Verdana";

    //c.fillRect(550, 200, 100, 50);
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 3; j++) {
        if (i == 0) {
          c.fillStyle = "#fc03ad";
        } else {
          c.fillStyle = "white";
        }
        //console.log(`i=${i} j=${j} x=${x} y=${y} fillstyle=${c.fillStyle}`);
        c.fillRect(x, y, this.t1w, this.t1h);
        c.strokeRect(x, y, this.t1w, this.t1h);
        if (i == 0 && j == 1) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Ammeter", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 0 && j == 2) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Voltmeter", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 1 && j == 0) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Range", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 2 && j == 0) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Least Count", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 3 && j == 0) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Zero Error", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 4 && j == 0) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("Zero Correc", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 1 && j == 1) {
          c.fillStyle = "#030bfc";
          //Calculate the x_min and x_max of small rectangles which will be later used for verification
          this.AmmRangeOption1_x_min = x;
          this.AmmRangeOption1_x_max = x + this.t1w / 3;
          this.AmmRangeOption1_y_min = y;
          this.AmmRangeOption1_y_max = y + this.t1h;

          this.AmmRangeOption2_x_min = x + this.t1w / 3;
          this.AmmRangeOption2_x_max = x + (2 * this.t1w) / 3;
          this.AmmRangeOption2_y_min = y;
          this.AmmRangeOption2_y_max = y + this.t1h;
          this.AmmRangeOption3_x_min = x + (2 * this.t1w) / 3;
          this.AmmRangeOption3_x_max = x + this.t1w;
          this.AmmRangeOption3_y_min = y;
          this.AmmRangeOption3_y_max = y + this.t1h;

          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("100A", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("100mA", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("20mA", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 1 && j == 2) {
          c.fillStyle = "#030bfc";
          this.VoltRangeOption1_x_min = x;
          this.VoltRangeOption1_x_max = x + this.t1w / 3;
          this.VoltRangeOption1_y_min = y;
          this.VoltRangeOption1_y_max = y + this.t1h;

          this.VoltRangeOption2_x_min = x + this.t1w / 3;
          this.VoltRangeOption2_x_max = x + (2 * this.t1w) / 3;
          this.VoltRangeOption2_y_min = y;
          this.VoltRangeOption2_y_max = y + this.t1h;

          this.VoltRangeOption3_x_min = x + (2 * this.t1w) / 3;
          this.VoltRangeOption3_x_max = x + this.t1w;
          this.VoltRangeOption3_y_min = y;
          this.VoltRangeOption3_y_max = y + this.t1h;

          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("5V", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("25V", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("20V", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 2 && j == 1) {
          c.fillStyle = "#030bfc";
          this.AmmLCOption1_x_min = x;
          this.AmmLCOption1_x_max = x + this.t1w / 3;
          this.AmmLCOption1_y_min = y;
          this.AmmLCOption1_y_max = y + this.t1h;

          this.AmmLCOption2_x_min = x + this.t1w / 3;
          this.AmmLCOption2_x_max = x + (2 * this.t1w) / 3;
          this.AmmLCOption2_y_min = y;
          this.AmmLCOption2_y_max = y + this.t1h;

          this.AmmLCOption3_x_min = x + (2 * this.t1w) / 3;
          this.AmmLCOption3_x_max = x + this.t1w;
          this.AmmLCOption3_y_min = y;
          this.AmmLCOption3_y_max = y + this.t1h;

          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("2mA", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("4mA", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("20mA", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 2 && j == 2) {
          c.fillStyle = "#030bfc";
          this.VoltLCOption1_x_min = x;
          this.VoltLCOption1_x_max = x + this.t1w / 3;
          this.VoltLCOption1_y_min = y;
          this.VoltLCOption1_y_max = y + this.t1h;

          this.VoltLCOption2_x_min = x + this.t1w / 3;
          this.VoltLCOption2_x_max = x + (2 * this.t1w) / 3;
          this.VoltLCOption2_y_min = y;
          this.VoltLCOption2_y_max = y + this.t1h;

          this.VoltLCOption3_x_min = x + (2 * this.t1w) / 3;
          this.VoltLCOption3_x_max = x + this.t1w;
          this.VoltLCOption3_y_min = y;
          this.VoltLCOption3_y_max = y + this.t1h;
          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("0.5V", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("5V", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("1V", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 3 && j == 1) {
          c.fillStyle = "#030bfc";
          this.AmmZEOption1_x_min = x;
          this.AmmZEOption1_x_max = x + this.t1w / 3;
          this.AmmZEOption1_y_min = y;
          this.AmmZEOption1_y_max = y + this.t1h;

          this.AmmZEOption2_x_min = x + this.t1w / 3;
          this.AmmZEOption2_x_max = x + (2 * this.t1w) / 3;
          this.AmmZEOption2_y_min = y;
          this.AmmZEOption2_y_max = y + this.t1h;

          this.AmmZEOption3_x_min = x + (2 * this.t1w) / 3;
          this.AmmZEOption3_x_max = x + this.t1w;
          this.AmmZEOption3_y_min = y;
          this.AmmZEOption3_y_max = y + this.t1h;
          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("0mA", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("1mA", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("10mA", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 3 && j == 2) {
          c.fillStyle = "#030bfc";
          this.VoltZEOption1_x_min = x;
          this.VoltZEOption1_x_max = x + this.t1w / 3;
          this.VoltZEOption1_y_min = y;
          this.VoltZEOption1_y_max = y + this.t1h;

          this.VoltZEOption2_x_min = x + this.t1w / 3;
          this.VoltZEOption2_x_max = x + (2 * this.t1w) / 3;
          this.VoltZEOption2_y_min = y;
          this.VoltZEOption2_y_max = y + this.t1h;

          this.VoltZEOption3_x_min = x + (2 * this.t1w) / 3;
          this.VoltZEOption3_x_max = x + this.t1w;
          this.VoltZEOption3_y_min = y;
          this.VoltZEOption3_y_max = y + this.t1h;
          c.fillRect(x, y, this.t1w / 3, this.t1h);
          c.strokeRect(x, y, this.t1w / 3, this.t1h);
          c.fillRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + this.t1w / 3, y, this.t1w / 3, this.t1h);
          c.fillRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.strokeRect(x + (2 * this.t1w) / 3, y, this.t1w / 3, this.t1h);
          c.fillStyle = "white";
          c.font = "12px Arial";
          c.fillText("0.5V", x + this.t1w / 6, y + this.t1h / 2);
          c.fillText("1V", x + this.t1w / 2, y + this.t1h / 2);
          c.fillText("10V", x + (this.t1w * 5) / 6, y + this.t1h / 2);
          c.font = "20px Verdana";
        }
        if (i == 4 && j == 1) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("I - e", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 4 && j == 2) {
          c.fillStyle = "black";
          console.log("filling text");
          c.fillText("V - e", x + this.t1w / 2, y + this.t1h / 2);
        }
        x = x + this.t1w;
      }
      x = this.t1x;
      y = y + this.t1h;
    }
  }
  DrawTableStep3Head() {
    c.beginPath();
    c.strokeStyle = "black";
    c.lineWidth = "2px";
    c.textAlign = "center";
    c.textBaseline = "medium";
    var x = step3.t1x;
    var y = step3.t1y;
    var w = step3.t1w;
    var h = step3.t1h;
    c.font = "15px Verdana";
    c.fillStyle = "chocolate";
    c.strokeStyle = "black";
    c.fillRect(540, 200, 500, 400);
    for (var i = 0; i < 3; i++) {
      c.fillStyle = "#fc03ad";
      c.beginPath();
      c.fillRect(x, y, w, h);
      c.strokeRect(x, y, w, h);
      c.fillStyle = "black";
      if (i == 0) {
        c.fillText("Voltmeter(V)", x + w / 2, y + h / 2);
      }
      if (i == 1) {
        c.fillText("Ammeter(mA)", x + w / 2, y + h / 2);
      }
      if (i == 2) {
        c.fillText("R=V/I(Ω)", x + w / 2, y + h / 2);
      }
      x = x + w;
    }
  }
  DrawTableStep3() {
    for (var i = 0; i < 1; i++) {
      for (var j = 0; j < 3; j++) {
        //console.log(`i=${i} j=${j} x=${x} y=${y} fillstyle=${c.fillStyle}`);
        c.fillStyle = "#fc03ad";
        c.fillRect(x, y, this.t1w, this.t1h);
        c.strokeRect(x, y, this.t1w, this.t1h);
        if (i == 0 && j == 0) {
          //console.log("filling text");
          c.fillStyle = "black";
          c.fillText("Voltmeter(V)", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 0 && j == 1) {
          //console.log("filling text");
          c.fillStyle = "black";
          c.fillText("Ammeter(mA)", x + this.t1w / 2, y + this.t1h / 2);
        }
        if (i == 0 && j == 2) {
          //console.log("filling text");
          c.fillStyle = "black";
          c.fillText("R=V/I(Ω)", x + this.t1w / 2, y + this.t1h / 2);
        }
        x = x + this.t1w;
      }
      x = this.t1x;
      y = y + this.t1h;
    }
  }
  UpdateTable1(option) {
    c.fillStyle = "green";
    c.strokeStyle = "black";
    var w = step2.t1w / 3;
    var h = step2.t1h;
    if (option == "AmmterRange") {
      var x = step2.AmmRangeOption2_x_min;
      var y = step2.AmmRangeOption2_y_min;
      var w = step2.t1w / 3;
      var h = step2.t1h;
      var text = "100mA";
    } else if (option == "VoltRange") {
      var x = step2.VoltRangeOption2_x_min;
      var y = step2.VoltRangeOption2_y_min;
      var text = "25V";
    } else if (option == "ammLC") {
      var x = step2.AmmLCOption2_x_min;
      var y = step2.AmmLCOption2_y_min;
      var text = "4mA";
    } else if (option == "VoltLC") {
      var x = step2.VoltLCOption3_x_min;
      var y = step2.VoltLCOption3_y_min;
      var text = "1V";
    } else if (option == "AmmZE") {
      var x = step2.AmmZEOption1_x_min;
      var y = step2.AmmZEOption1_y_min;
      var text = "0mA";
    } else if (option == "VoltZE") {
      var x = step2.VoltZEOption2_x_min;
      var y = step2.VoltZEOption2_y_min;
      var text = "1V";
    }

    c.fillRect(x, y, w, h);
    c.strokeRect(x, y, w, h);
    c.fillStyle = "white";
    c.font = "12px Arial";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, x + w / 2, y + h / 2);
  }
  DrawTableStep3Options() {
    c.beginPath();
    c.strokeStyle = "black";
    c.lineWidth = "2px";
    c.textAlign = "center";
    c.textBaseline = "medium";
    c.fillStyle = "#030bfc";
    var readArrayrow = this.Step3ReadingCount;
    console.log(`array: first value:${this.Step3rOptions[readArrayrow][0]}`);
    var x = this.t1x;
    var y = this.t1y + this.t1h;
    var w = this.t1w;
    var h = this.t1h;

    for (var i = 0; i < 9; i++) {
      //created array for keeping options x and y min max values
      if (this.Step3ReadingCount == 0) {
        if (i == 1) {
          this.volt_opt_x_min = x;
          this.volt_opt_x_max = x + w / 3;
          this.volt_opt_y_min = y;
          this.volt_opt_y_max = y + h;
        } else if (i == 3) {
          this.amm_opt_x_min = x;
          this.amm_opt_x_max = x + w / 3;
          this.amm_opt_y_min = y;
          this.amm_opt_y_max = y + h;
        } else if (i == 6) {
          this.resistor_opt_x_min = x;
          this.resistor_opt_x_max = x + w / 3;
          this.resistor_opt_y_min = y;
          this.resistor_opt_y_max = y + h;
        }
      }
      if (this.Step3ReadingCount == 1) {
        if (i == 1) {
          this.volt_opt_x_min = x;
          this.volt_opt_x_max = x + w / 3;
          this.volt_opt_y_min = y;
          this.volt_opt_y_max = y + h;
        } else if (i == 5) {
          this.amm_opt_x_min = x;
          this.amm_opt_x_max = x + w / 3;
          this.amm_opt_y_min = y;
          this.amm_opt_y_max = y + h;
        } else if (i == 8) {
          this.resistor_opt_x_min = x;
          this.resistor_opt_x_max = x + w / 3;
          this.resistor_opt_y_min = y;
          this.resistor_opt_y_max = y + h;
        }
      }
      if (this.Step3ReadingCount == 2) {
        if (i == 0) {
          this.volt_opt_x_min = x;
          this.volt_opt_x_max = x + w / 3;
          this.volt_opt_y_min = y;
          this.volt_opt_y_max = y + h;
        } else if (i == 3) {
          this.amm_opt_x_min = x;
          this.amm_opt_x_max = x + w / 3;
          this.amm_opt_y_min = y;
          this.amm_opt_y_max = y + h;
        } else if (i == 8) {
          this.resistor_opt_x_min = x;
          this.resistor_opt_x_max = x + w / 3;
          this.resistor_opt_y_min = y;
          this.resistor_opt_y_max = y + h;
        }
      }
      if (this.Step3ReadingCount == 3) {
        if (i == 2) {
          this.volt_opt_x_min = x;
          this.volt_opt_x_max = x + w / 3;
          this.volt_opt_y_min = y;
          this.volt_opt_y_max = y + h;
        } else if (i == 4) {
          this.amm_opt_x_min = x;
          this.amm_opt_x_max = x + w / 3;
          this.amm_opt_y_min = y;
          this.amm_opt_y_max = y + h;
        } else if (i == 7) {
          this.resistor_opt_x_min = x;
          this.resistor_opt_x_max = x + w / 3;
          this.resistor_opt_y_min = y;
          this.resistor_opt_y_max = y + h;
        }
      }
      if (this.Step3ReadingCount == 4) {
        if (i == 2) {
          this.volt_opt_x_min = x;
          this.volt_opt_x_max = x + w / 3;
          this.volt_opt_y_min = y;
          this.volt_opt_y_max = y + h;
        } else if (i == 5) {
          this.amm_opt_x_min = x;
          this.amm_opt_x_max = x + w / 3;
          this.amm_opt_y_min = y;
          this.amm_opt_y_max = y + h;
        } else if (i == 6) {
          this.resistor_opt_x_min = x;
          this.resistor_opt_x_max = x + w / 3;
          this.resistor_opt_y_min = y;
          this.resistor_opt_y_max = y + h;
        }
      }

      //console.log(`x=${x}, y=${y}, w=${w}, h=${h}`);
      c.fillStyle = "#030bfc";
      c.fillRect(x, y, w / 3, h);
      c.strokeRect(x, y, w / 3, h);
      c.fillStyle = "white";
      c.font = "12px Arial";
      console.log(`step 3 option is: ${this.Step3rOptions[readArrayrow][i]}`);
      c.fillText(this.Step3rOptions[readArrayrow][i], x + w / 6, y + h / 2);
      x = x + w / 3;
    }
    this.t1y = this.t1y + this.t1h;
  }
  UpdateTable2(option) {
    c.fillStyle = "green";
    c.strokeStyle = "black";
    var w = step3.t1w / 3;
    var h = step3.t1h;
    console.log(`inside updatetable2: option=${option}`);
    if (option == "voltage" && this.Step3ReadingCount == 0) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "19";
    } else if (option == "ammter" && this.Step3ReadingCount == 0) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "95.2";
    } else if (option == "resistor" && this.Step3ReadingCount == 0) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "199.5";
    } else if (option == "voltage" && this.Step3ReadingCount == 1) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "16";
    } else if (option == "ammter" && this.Step3ReadingCount == 1) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "80";
    } else if (option == "resistor" && this.Step3ReadingCount == 1) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "200";
    } else if (option == "voltage" && this.Step3ReadingCount == 2) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "5.5";
    } else if (option == "ammter" && this.Step3ReadingCount == 2) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "28";
    } else if (option == "resistor" && this.Step3ReadingCount == 2) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "196";
    } else if (option == "voltage" && this.Step3ReadingCount == 3) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "3.5";
    } else if (option == "ammter" && this.Step3ReadingCount == 3) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "16";
    } else if (option == "resistor" && this.Step3ReadingCount == 3) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "218";
    } else if (option == "voltage" && this.Step3ReadingCount == 4) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "2.5";
    } else if (option == "ammter" && this.Step3ReadingCount == 4) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "12";
    } else if (option == "resistor" && this.Step3ReadingCount == 4) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "208";
    } else if (option == "voltage" && this.Step3ReadingCount == 5) {
      var x = this.volt_opt_x_min;
      var y = this.volt_opt_y_min;
      var text = "19";
    } else if (option == "ammter" && this.Step3ReadingCount == 5) {
      var x = this.amm_opt_x_min;
      var y = this.amm_opt_y_min;
      var text = "95.2";
    } else if (option == "resistor" && this.Step3ReadingCount == 5) {
      var x = this.resistor_opt_x_min;
      var y = this.resistor_opt_y_min;
      var text = "199.5";
    }

    c.fillRect(x, y, w, h);
    c.strokeStyle = "black";
    c.strokeRect(x, y, w, h);
    c.fillStyle = "white";
    c.font = "12px Arial";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, x + w / 2, y + h / 2);
  }
  updatetable3() {
    c.fillStyle = "green";
    c.strokeStyle = "black";
    c.fillRect(
      step4.meanResistor_opt2_x_min,
      step4.meanResistor_opt2_y_min,
      step4.t1w,
      step4.t1h
    );
    c.strokeRect(
      step4.meanResistor_opt2_x_min,
      step4.meanResistor_opt2_y_min,
      step4.t1w,
      step4.t1h
    );
    c.fillStyle = "white";
    c.fillText(
      "204.3",
      step4.meanResistor_opt2_x_min + step4.t1w / 2,
      step4.meanResistor_opt2_y_min + step4.t1h / 2
    );
  }

  UpdateTable4(option) {
    c.strokeStyle = "black";
    c.font = "15px Arial";
    if (option == "slope") {
      c.fillStyle = "green";
      c.fillRect(step5.slope_x_min, step5.slope_y_min, step5.t1w, step5.t1h);
      c.strokeRect(step5.slope_x_min, step5.slope_y_min, step5.t1w, step5.t1h);
      c.fillStyle = "white";
      c.fillText(
        "0.005",
        step5.slope_x_min + 5,
        step5.slope_y_min + step5.t1h / 2
      );
    } else if (option == "conductance") {
      console.log(
        `detected conductance: x_min=${step5.conductance_x_min}, y_min=${step5.conductance_y_min}, width=${step5.t1w}, height=${step5.t1h}`
      );
      c.fillStyle = "green";
      c.fillRect(
        step5.conductance_x_min,
        step5.conductance_y_min,
        step5.t1w,
        step5.t1h
      );
      c.strokeRect(
        step5.conductance_x_min,
        step5.conductance_y_min,
        step5.t1w,
        step5.t1h
      );
      c.fillStyle = "white";
      c.fillText(
        "0.005",
        step5.conductance_x_min + 5,
        step5.conductance_y_min + step5.t1h / 2
      );
    } else if (option == "resistance") {
      c.fillStyle = "green";
      c.fillRect(
        step5.resistance_x_min,
        step5.resistance_y_min,
        step5.t1w,
        step5.t1h
      );
      c.strokeRect(
        step5.resistance_x_min,
        step5.resistance_y_min,
        step5.t1w,
        step5.t1h
      );
      c.fillStyle = "white";
      c.fillText(
        "200",
        step5.resistance_x_min + 10,
        step5.resistance_y_min + step5.t1h / 2
      );
    }
  }

  DrawCalcs() {
    console.log("inside draw cals");
    var tx = this.x;
    var ty = this.y;
    var tw = this.t1w;
    var th = this.t1h;
    c.font = "15px Arial";
    c.textAlign = "center";
    c.textBaseline = "middle";
    console.log(`x=${x},y=${y},w=${tw},h=${th}`);
    c.strokeStyle = "black";
    c.fillStyle = "green";
    c.fillRect(tx, ty, tw + 10, th);
    c.strokeRect(tx, ty, tw + 10, th);
    c.fillStyle = "white";
    c.fillText("Mean R = ", tx + (tw + 10) / 2, ty + th / 2);
    var tyr = ty - th / 2;
    var txr = tx + 100;
    c.strokeStyle = "black";
    c.fillStyle = "green";
    c.fillRect(txr, tyr, tw + 140, th);
    c.strokeRect(txr, tyr, tw + 140, th);
    c.fillStyle = "white";
    c.fillText(
      "199.5 + 200 + 196 + 218 + 208",
      txr + (tw + 140) / 2,
      tyr + th / 2
    );
    c.font = "30px Arial";
    c.beginPath();
    c.moveTo(txr, tyr + th + 5);
    c.lineTo(txr + 230, tyr + th + 5);
    c.stroke();
    c.beginPath();
    c.fillText("=", txr + 235, tyr + th + 5);
    c.font = "15px Arial";
    var txd = txr + 70;
    var tyd = tyr + th + 8;
    c.fillStyle = "green";
    c.fillRect(txd, tyd, tw, th);
    c.strokeRect(txd, tyd, tw, th);
    c.fillStyle = "white";
    c.fillText("5", txd + tw / 2, tyd + th / 2);
    var tx_ans = txr + 250;
    var ty_ans = tyr + th / 2;
    var tw_ans = tw - 20;
    this.meanResistor_opt1_x_min = tx_ans;
    this.meanResistor_opt1_x_max = tx_ans + tw_ans;
    this.meanResistor_opt1_y_min = ty_ans;
    this.meanResistor_opt1_y_max = this.th;
    c.strokeStyle = "black";
    c.fillStyle = "#030bfc";
    c.fillRect(tx_ans, ty_ans, tw_ans, th);
    c.strokeRect(tx_ans, ty_ans, tw_ans, th);
    c.fillStyle = "white";
    c.fillText("200.4", tx_ans + tw_ans / 2, ty_ans + th / 2);
    tx_ans = txr + 320;
    ty_ans = tyr + th / 2;
    c.strokeStyle = "black";
    c.fillStyle = "#030bfc";
    c.fillRect(tx_ans, ty_ans, tw_ans, th);
    c.strokeRect(tx_ans, ty_ans, tw_ans, th);
    c.fillStyle = "white";
    c.fillText("204.3", tx_ans + tw_ans / 2, ty_ans + th / 2);
    this.meanResistor_opt2_x_min = tx_ans;
    this.meanResistor_opt2_x_max = tx_ans + tw_ans;
    this.meanResistor_opt2_y_min = ty_ans;
    this.meanResistor_opt2_y_max = ty_ans + this.t1h;
  }
  DrawGraph() {
    console.log(
      `Draw graph: x=${this.x}, y=${this.y}, w=${this.t1w}, h=${this.t1h}`
    );
    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;
    var tbw = this.t1w;
    var tbh = this.t1h;
    c.fillStyle = "black";
    c.fillstroke = "black";
    c.font = "12px Arial";

    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + w, y);
    c.stroke();
    c.moveTo(x, y);
    c.lineTo(x, y - h);
    c.stroke();

    for (var i = 0; i < 25; i++) {
      x = x + 10;
      c.beginPath();
      c.arc(x, y, 1, 0 * Math.PI, 2 * Math.PI, true);
      c.stroke();
      if (i == 4) {
        c.fillText("5V", x, y + 10);
      }
      if (i == 9) {
        c.fillText("10V", x, y + 10);
      }
      if (i == 14) {
        c.fillText("15V", x, y + 10);
      }
      if (i == 19) {
        c.fillText("20V", x, y + 10);
      }
      if (i == 24) {
        c.fillText("25V", x, y + 10);
      }
    }
    x = this.x;
    y = this.y;
    for (var i = 0; i < 25; i++) {
      y = y - 10;
      c.beginPath();
      c.arc(x, y, 1, 0 * Math.PI, 2 * Math.PI, true);
      c.stroke();
      if (i == 4) {
        c.fillText("20", x - 10, y);
      }
      if (i == 9) {
        c.fillText("40", x - 10, y);
      }
      if (i == 14) {
        c.fillText("60", x - 10, y);
      }
      if (i == 19) {
        c.fillText("80", x - 10, y);
      }
      if (i == 24) {
        c.fillText("100", x - 10, y);
      }
    }
    x = this.x;
    y = this.y;
    c.moveTo(x, y);
    c.lineTo(x + 160, y - 200);
    c.stroke();
    c.setLineDash([5, 5]);
    c.moveTo(x + 60, y);
    c.fillText("V1", x + 60, y + 25);
    c.lineTo(x + 60, y - 75);
    c.stroke();
    c.lineTo(x + 120, y - 75);
    c.stroke();
    c.lineTo(x + 120, y - 150);
    c.stroke();
    c.lineTo(x, y - 150);
    c.stroke();
    c.fillText("I2", x - 25, y - 150);
    c.moveTo(x + 60, y - 75);
    c.lineTo(x, y - 75);
    c.stroke();
    c.moveTo(x + 120, y - 75);
    c.lineTo(x + 120, y);
    c.stroke();
    c.fillText("I1", x - 25, y - 75);
    c.fillText("V2", x + 120, y + 25);
    c.fillStyle = "green";
    c.setLineDash([0, 0]);
    c.fillRect(x + 130, y - 175, tbw + 130, tbh);
    c.strokeRect(x + 130, y - 175, tbw + 130, tbh);
    c.fillRect(x + 130, y - 125, tbw + 130, tbh);
    c.strokeRect(x + 130, y - 125, tbw + 130, tbh);
    c.fillRect(x + 130, y - 75, tbw + 130, tbh);
    c.strokeRect(x + 130, y - 75, tbw + 130, tbh);

    c.fillStyle = "#030bfc";
    //Slope
    c.fillRect(x + 320, y - 175, tbw, tbh);
    c.strokeRect(x + 320, y - 175, tbw, tbh);
    c.fillRect(x + 380, y - 175, tbw, tbh);
    c.strokeRect(x + 380, y - 175, tbw, tbh);
    this.slope_x_min = x + 380;
    this.slope_x_max = x + 380 + tbw;
    this.slope_y_min = y - 175;
    this.slope_y_max = y - 175 + tbh;

    //Conductance
    c.fillRect(x + 320, y - 125, tbw, tbh);
    c.strokeRect(x + 320, y - 125, tbw, tbh);
    c.fillRect(x + 380, y - 125, tbw, tbh);
    c.strokeRect(x + 380, y - 125, tbw, tbh);
    this.conductance_x_min = x + 380;
    this.conductance_x_max = x + 380 + tbw;
    this.conductance_y_min = y - 125;
    this.conductance_y_max = y - 125 + tbh;

    //Resistance
    c.fillRect(x + 320, y - 75, tbw, tbh);
    c.strokeRect(x + 320, y - 75, tbw, tbh);
    c.fillRect(x + 380, y - 75, tbw, tbh);
    c.strokeRect(x + 380, y - 75, tbw, tbh);
    this.resistance_x_min = x + 320;
    this.resistance_x_max = x + 320 + tbw;
    this.resistance_y_min = y - 75;
    this.resistance_y_max = y - 75 + tbh;

    c.fillStyle = "white";
    c.fillstroke = "black";
    c.font = "15px Arial";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText("SLOPE = (I2-I1)/(V2-V1) = ", x + 130, y - 150);
    c.fillText("CONDUCTANCE(ρ) = ", x + 130, y - 100);
    c.fillText("RESISTANCE = ", x + 130, y - 50);
    c.fillText("200", x + 330, y - 150);
    c.fillText("0.005", x + 385, y - 150);
    c.fillText("200", x + 330, y - 100);
    c.fillText("0.005", x + 385, y - 100);
    c.fillText("200", x + 330, y - 50);
    c.fillText("0.005", x + 385, y - 50);
  }
}

canvas.addEventListener("mousedown", (md_e) => {
  x = md_e.offsetX;
  y = md_e.offsetY;
  if (step_count == 1) {
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

    rh_r_x_min = rheostat.sock_r_x - space;
    rh_r_x_max = rheostat.sock_r_x + space;
    rh_r_y_min = rheostat.sock_r_y - space;
    rh_r_y_max = rheostat.sock_r_y + space;

    rh_b1_x_min = rheostat.sock_b1_x - space;
    rh_b1_x_max = rheostat.sock_b1_x + space;
    rh_b1_y_min = rheostat.sock_b1_y - space;
    rh_b1_y_max = rheostat.sock_b1_y + space;

    rh_b2_x_min = rheostat.sock_b2_x - space;
    rh_b2_x_max = rheostat.sock_b2_x + space;
    rh_b2_y_min = rheostat.sock_b2_y - space;
    rh_b2_y_max = rheostat.sock_b2_y + space;

    v_r_x_min = voltmeter.sock_r_x - space;
    v_r_x_max = voltmeter.sock_r_x + space;
    v_r_y_min = voltmeter.sock_r_y - space;
    v_r_y_max = voltmeter.sock_r_y + space;

    v_b_x_min = voltmeter.sock_b_x - space;
    v_b_x_max = voltmeter.sock_b_x + space;
    v_b_y_min = voltmeter.sock_b_y - space;
    v_b_y_max = voltmeter.sock_b_y + space;

    resistor_t1_x_min = resistor.x - space;
    resistor_t1_x_max = resistor.x + space;
    resistor_t1_y_min = resistor.y - space;
    resistor_t1_y_max = resistor.y + space;
    resistor_t2_x_min = resistor.x + resistor.width - space;
    resistor_t2_x_max = resistor.x + resistor.width + space;
    resistor_t2_y_min = resistor.y - space;
    resistor_t2_y_max = resistor.y + space;

    step1.l_step_event = step1.c_step_event;
    switch (true) {
      case x > batt_r_x_min &&
        x < batt_r_x_max &&
        y > batt_r_y_min &&
        y < batt_r_y_max:
        console.log("clicked on battery positive");
        step1.c_step_event = "battery_r";
        break;
      case x > batt_b_x_min &&
        x < batt_b_x_max &&
        y > batt_b_y_min &&
        y < batt_b_y_max:
        console.log("clicked on battery negative");
        step1.c_step_event = "battery_b";
        break;
      case x > amm_r_x_min &&
        x < amm_r_x_max &&
        y > amm_r_y_min &&
        y < amm_r_y_max:
        console.log("clicked on ammeter positive");
        step1.c_step_event = "ammter_r";
        break;
      case x > amm_b_x_min &&
        x < amm_b_x_max &&
        y > amm_b_y_min &&
        y < amm_b_y_max:
        console.log("clicked on ammeter negative");
        step1.c_step_event = "ammter_b";
        break;
      case x > rh_r_x_min && x < rh_r_x_max && y > rh_r_y_min && y < rh_r_y_max:
        step1.c_step_event = "rheostat_r";
        console.log("clicked fixed of rheostat");
        break;
      case x > rh_b1_x_min &&
        x < rh_b1_x_max &&
        y > rh_b1_y_min &&
        y < rh_b1_y_max:
        step1.c_step_event = "rheostat_b1";
        console.log("clicked b1 fixed of rheostat");
        break;
      case x > rh_b2_x_min &&
        x < rh_b2_x_max &&
        y > rh_b2_y_min &&
        y < rh_b2_y_max:
        step1.c_step_event = "rheostat_b2";
        console.log("clicked b2 fixed of rheostat");
        break;
      case x > v_r_x_min && x < v_r_x_max && y > v_r_y_min && y < v_r_y_max:
        step1.c_step_event = "voltmeter_r";
        console.log("clicked r of voltmeter");
        break;
      case x > v_b_x_min && x < v_b_x_max && y > v_b_y_min && y < v_b_y_max:
        step1.c_step_event = "voltmeter_b";
        console.log("clicked b of voltmeter");
        break;
      case x > resistor_t1_x_min &&
        x < resistor_t1_x_max &&
        y > resistor_t1_y_min &&
        y < resistor_t1_y_max:
        step1.c_step_event = "resistor_t1";
        console.log("clicked resistor t1");
        break;
      case x > resistor_t2_x_min &&
        x < resistor_t2_x_max &&
        y > resistor_t2_y_min &&
        y < resistor_t2_y_max:
        step1.c_step_event = "resistor_t2";
        console.log("clicked resistor t2");
        break;
    }
    console.log(
      `l_step_event=${step1.l_step_event} \n c_step_event=${step1.c_step_event}`
    );
    console.log(`redsocketverfication=${battery.RedSocketVerification}`);

    if (
      !battery.RedSocketVerification &&
      ((step1.l_step_event == "battery_r" &&
        step1.c_step_event == "ammter_r") ||
        (step1.l_step_event == "ammter_r" && step1.c_step_event == "battery_r"))
    ) {
      ScoreStep1.score = ScoreStep1.score + 1;
      battery.RedSocketVerification = true;
      step1.DrawConnection("batteryRed");
    } else if (
      !rheostat.bSocketVerification &&
      ((step1.l_step_event == "battery_b" &&
        step1.c_step_event == "rheostat_b1") ||
        (step1.l_step_event == "rheostat_b1" &&
          step12.c_step_event == "battery_b"))
    ) {
      ScoreStep1.score = ScoreStep1.score + 1;
      rheostat.bSocketVerification = true;
      step1.DrawConnection("batteryBlack");
    } else if (
      !rheostat.rSocketVerification &&
      ((step1.l_step_event == "voltmeter_b" &&
        step1.c_step_event == "rheostat_r") ||
        (step1.l_step_event == "rheostat_r" &&
          step1.c_step_event == "voltmeter_b"))
    ) {
      ScoreStep1.score = ScoreStep1.score + 1;
      rheostat.rSocketVerification = true;
      step1.DrawConnection("rheostatRed");
    } else if (
      !voltmeter.rSocketVerification &&
      ((step1.l_step_event == "voltmeter_r" &&
        step1.c_step_event == "ammter_b") ||
        (step1.l_step_event == "ammter_b" &&
          step1.c_step_event == "voltmeter_r"))
    ) {
      ScoreStep1.score = ScoreStep1.score + 1;
      voltmeter.rSocketVerification = true;
      step1.DrawConnection("voltmeterRed");
    } else if (
      !resistor.rSocketVerification &&
      ((step1.l_step_event == "voltmeter_r" &&
        step1.c_step_event == "resistor_t1") ||
        (step1.l_step_event == "resistor_t1" &&
          step1.c_step_event == "voltmeter_r"))
    ) {
      console.log("resistor t1 connection detected");
      ScoreStep1.score = ScoreStep1.score + 1;
      resistor.rSocketVerification = true;
      step1.DrawConnection("resistorT1");
    } else if (
      !resistor.bSocketVerification &&
      ((step1.l_step_event == "voltmeter_b" &&
        step1.c_step_event == "resistor_t2") ||
        (step1.l_step_event == "resistor_t2" &&
          step1.c_step_event == "voltmeter_b"))
    ) {
      ScoreStep1.score = ScoreStep1.score + 1;
      resistor.bSocketVerification = true;
      step1.DrawConnection("resistorT2");
    }
    console.log(`score: ${step1.score}`);
    if (ScoreStep1.score == 6) {
      ScoreStep1.color = "green";
      ScoreStep2.color = "yellow";
      step_count = step_count + 1;
      var step_text = [];
      step_text[0] =
        "Completed 1st step: click on the round button no. 2 to proceed to next step";
      //step1.DrawStep(step_text);
    }
    ScoreStep1.DrawScore();
    ScoreStep2.DrawScore();
  } else if (step_count == 2) {
    console.log(`step2: x=${x}, y=${y}`);
    console.log(`step2: ammlc option2_x_min = ${step2.AmmLCOption2_x_min}`);
    console.log(`step2: ammlc option2_x_max = ${step2.AmmLCOption2_x_max}`);
    console.log(`step2: ammlc option2_y_min = ${step2.AmmLCOption2_y_min}`);
    console.log(`step2: ammlc option2_y_max = ${step2.AmmLCOption2_y_max}`);
    if (
      x > ScoreStep2.cx - 40 &&
      x < ScoreStep2.cx + 40 &&
      y > ScoreStep2.cy - 40 &&
      y < ScoreStep2.cy + 40 &&
      !ScoreStep2.ClickedScoreBoard
    ) {
      ScoreStep2.ClickedScoreBoard = true;
      console.log("start step 2");
      procStep2();
    } else if (
      !step2.AmmterRangeVerificationDone &&
      x > step2.AmmRangeOption2_x_min &&
      x < step2.AmmRangeOption2_x_max &&
      y > step2.AmmRangeOption2_y_min &&
      y < step2.AmmRangeOption2_y_max
    ) {
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.AmmterRangeVerificationDone = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("AmmterRange");
    } else if (
      !step2.VoltmeterRangeVerification &&
      x > step2.VoltRangeOption2_x_min &&
      x < step2.VoltRangeOption2_x_max &&
      y > step2.VoltRangeOption2_y_min &&
      y < step2.VoltRangeOption2_y_max
    ) {
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.VoltmeterRangeVerification = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("VoltRange");
    } else if (
      !step2.AmmterLCVerification &&
      x > step2.AmmLCOption2_x_min &&
      x < step2.AmmLCOption2_x_max &&
      y > step2.AmmLCOption2_y_min &&
      y < step2.AmmLCOption2_y_max
    ) {
      console.log("ammter LC option selected is correct");
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.AmmterLCVerification = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("ammLC");
    } else if (
      !step2.VoltmeterLCVerification &&
      x > step2.VoltLCOption3_x_min &&
      x < step2.VoltLCOption3_x_max &&
      y > step2.VoltLCOption3_y_min &&
      y < step2.VoltLCOption3_y_max
    ) {
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.VoltmeterLCVerification = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("VoltLC");
    } else if (
      !step2.AmmterZEVerification &&
      x > step2.AmmZEOption1_x_min &&
      x < step2.AmmZEOption1_x_max &&
      y > step2.AmmZEOption1_y_min &&
      y < step2.AmmZEOption1_y_max
    ) {
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.AmmterZEVerification = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("AmmZE");
    } else if (
      !step2.VoltmeterZEVerification &&
      x > step2.VoltZEOption2_x_min &&
      x < step2.VoltZEOption2_x_max &&
      y > step2.VoltZEOption2_y_min &&
      y < step2.VoltZEOption2_y_max
    ) {
      ScoreStep2.score = ScoreStep2.score + 1;
      step2.VoltmeterZEVerification = true;
      ScoreStep2.DrawScore();
      step2.UpdateTable1("VoltZE");
    }
    if (ScoreStep2.score == 6) {
      ScoreStep2.color = "green";
      ScoreStep3.color = "yellow";
      step_count = step_count + 1;
      var step_text = [];
      step_text[0] =
        "Completed 2nd step: click on the round button no. 3 to proceed to next step";
      //step2.DrawStep(step_text);
    }
    ScoreStep2.DrawScore();
    ScoreStep3.DrawScore();
  } else if (step_count == 3) {
    if (
      x > ScoreStep3.cx - 40 &&
      x < ScoreStep3.cx + 40 &&
      y > ScoreStep3.cy - 40 &&
      y < ScoreStep3.cy + 40 &&
      !ScoreStep3.ClickedScoreBoard
    ) {
      ScoreStep3.ClickedScoreBoard = true;
      console.log("start step 3");
      procStep3();
    }
    if (
      x > battery.battery_switch_x_min &&
      x < battery.battery_switch_x_max &&
      y > battery.battery_switch_y_min &&
      y < battery.battery_switch_y_max
    ) {
      if (battery.power == false) {
        console.log("inside battery power off detected");
        battery.DrawPowerON();
        voltmeter.DrawPointers("voltmeter");
        ammeter.DrawPointers("ammter");
      } else if (battery.power == true) {
        console.log("inside battery power on detected");
        battery.DrawPowerOFF();
        voltmeter.DrawPointers("voltmeter");
        ammeter.DrawPointers("ammter");
      }
    }
    if (
      x > rheostat.rh_knob_x_min &&
      x < rheostat.rh_knob_x_max &&
      y > rheostat.rh_knob_y_min &&
      y < rheostat.rh_knob_y_max &&
      rheostat.rheostat_angle < 180
    ) {
      console.log(
        `Step3: knob rect dimensions=${rheostat.rh_knob_x_min},${rheostat.rh_knob_x_max},${rheostat.rh_knob_y_min},${rheostat.rh_knob_y_max}`
      );
      if (
        (step3.Step3ReadingCount == 0 && ScoreStep3.score == 3) ||
        (step3.Step3ReadingCount == 1 && ScoreStep3.score == 6) ||
        (step3.Step3ReadingCount == 2 && ScoreStep3.score == 9) ||
        (step3.Step3ReadingCount == 3 && ScoreStep3.score == 12)
      ) {
        console.log(`mouse pointer location: ${x}, ${y}`);
        rheostat.rheostat_angle = rheostat.rheostat_angle + 45;
        rheostat.DrawKnob("rheostat");
        if (battery.power) {
          voltmeter.DrawPointers("voltmeter");
          ammeter.DrawPointers("ammter");
          if (step3.Step3ReadingCount < 5) {
            step3.Step3ReadingCount = step3.Step3ReadingCount + 1;
            step3.DrawTableStep3Options();
          }
        }
      }
    }
    if (
      x > step3.volt_opt_x_min &&
      x < step3.volt_opt_x_max &&
      y > step3.volt_opt_y_min &&
      y < step3.volt_opt_y_max
    ) {
      if (step3.Step3ReadingCount == 0 && !step3.Step3R1VoltVerificationDone) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R1VoltVerificationDone = true;
        step3.UpdateTable2("voltage");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 1 &&
        !step3.Step3R2VoltVerificationDone
      ) {
        console.log(
          `inside step 3 voltage verification r2: x and y click cords: ${x},${y}`
        );
        console.log(
          `inside step 3 voltage verification r2: ${step3.volt_opt_x_min},${step3.volt_opt_x_max},${step3.volt_opt_y_min},${step3.volt_opt_y_max}`
        );
        step3.Step3R2VoltVerificationDone = true;
        step3.UpdateTable2("voltage");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 2 &&
        !step3.Step3R3VoltVerificationDone
      ) {
        step3.Step3R3VoltVerificationDone = true;
        step3.UpdateTable2("voltage");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 3 &&
        !step3.Step3R4VoltVerificationDone
      ) {
        step3.Step3R4VoltVerificationDone = true;
        step3.UpdateTable2("voltage");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 4 &&
        !step3.Step3R5VoltVerificationDone
      ) {
        step3.Step3R5VoltVerificationDone = true;
        step3.UpdateTable2("voltage");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      }
    }
    if (
      x > step3.amm_opt_x_min &&
      x < step3.amm_opt_x_max &&
      y > step3.amm_opt_y_min &&
      y < step3.amm_opt_y_max
    ) {
      if (step3.Step3ReadingCount == 0 && !step3.Step3R1ammVerificationDone) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R1ammVerificationDone = true;
        step3.UpdateTable2("ammter");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 1 &&
        !step3.Step3R2ammVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R2ammVerificationDone = true;
        step3.UpdateTable2("ammter");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 2 &&
        !step3.Step3R3ammVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R3ammVerificationDone = true;
        step3.UpdateTable2("ammter");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 3 &&
        !step3.Step3R4ammVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R4ammVerificationDone = true;
        step3.UpdateTable2("ammter");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 4 &&
        !step3.Step3R5ammVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R5ammVerificationDone = true;
        step3.UpdateTable2("ammter");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      }
    }
    if (
      x > step3.resistor_opt_x_min &&
      x < step3.resistor_opt_x_max &&
      y > step3.resistor_opt_y_min &&
      y < step3.resistor_opt_y_max
    ) {
      if (
        step3.Step3ReadingCount == 0 &&
        !step3.Step3R1resistorVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R1resistorVerificationDone = true;
        step3.UpdateTable2("resistor");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 1 &&
        !step3.Step3R2resistorVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R2resistorVerificationDone = true;
        step3.UpdateTable2("resistor");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 2 &&
        !step3.Step3R3resistorVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R3resistorVerificationDone = true;
        step3.UpdateTable2("resistor");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 3 &&
        !step3.Step3R4resistorVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R4resistorVerificationDone = true;
        step3.UpdateTable2("resistor");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      } else if (
        step3.Step3ReadingCount == 4 &&
        !step3.Step3R5resistorVerificationDone
      ) {
        //console.log(`step 3 volt verification = ${step3.Step3R1VoltVerificationDone}`);
        step3.Step3R5resistorVerificationDone = true;
        step3.UpdateTable2("resistor");
        ScoreStep3.score = ScoreStep3.score + 1;
        ScoreStep3.DrawScore();
      }
    }
    if (ScoreStep3.score == 15) {
      ScoreStep3.color = "green";
      ScoreStep4.color = "yellow";
      step_count = step_count + 1;
      var step_text = [];
      step_text[0] =
        "Completed 2nd step: click on the round button no. 3 to proceed to next step";
      //step2.DrawStep(step_text);
    }
    ScoreStep3.DrawScore();
    ScoreStep4.DrawScore();
  } else if (step_count == 4) {
    console.log(`inside step4 x=${x},y=${y}`);
    console.log(
      `inside step4 x_min=${step4.meanResistor_opt2_x_min},x_max=${step4.meanResistor_opt2_x_max},y_min=${step4.meanResistor_opt2_y_min}, y_max=${step4.meanResistor_opt2_y_max}`
    );
    if (
      x > ScoreStep4.cx - 40 &&
      x < ScoreStep4.cx + 40 &&
      y > ScoreStep4.cy - 40 &&
      y < ScoreStep4.cy + 40 &&
      !ScoreStep4.ClickedScoreBoard
    ) {
      ScoreStep4.ClickedScoreBoard = true;
      console.log("start step 3");
      procStep4();
    } else if (
      x > step4.meanResistor_opt2_x_min &&
      x < step4.meanResistor_opt2_x_max &&
      y > step4.meanResistor_opt2_y_min &&
      y < step4.meanResistor_opt2_y_max &&
      !step4.step4VerificationDone
    ) {
      step4.step4VerificationDone = true;
      step4.updatetable3();
      ScoreStep4.color = "green";
      ScoreStep5.color = "yellow";
      step_count = step_count + 1;
      ScoreStep4.score = ScoreStep4.score + 1;
      ScoreStep4.DrawScore();
      ScoreStep5.DrawScore();
    }
  } else if (step_count == 5) {
    if (
      x > ScoreStep5.cx - 40 &&
      x < ScoreStep5.cx + 40 &&
      y > ScoreStep5.cy - 40 &&
      y < ScoreStep5.cy + 40 &&
      !ScoreStep5.ClickedScoreBoard
    ) {
      ScoreStep5.ClickedScoreBoard = true;
      console.log("start step 5");
      procStep5();
    }
    if (
      x > step5.slope_x_min &&
      x < step5.slope_x_max &&
      y > step5.slope_y_min &&
      y < step5.slope_y_max &&
      !step5.slopeVerificationDone
    ) {
      console.log(
        `slope: x_min=${step5.slope_x_min}, x_max=${step5.slope_x_max}, y_min=${step5.slope_y_min},y_max=${step5.slope_y_max}`
      );
      step5.slopeVerificationDone = true;
      step3.UpdateTable4("slope");
      ScoreStep5.score = ScoreStep5.score + 1;
      ScoreStep5.DrawScore();
    }
    if (
      x > step5.conductance_x_min &&
      x < step5.conductance_x_max &&
      y > step5.conductance_y_min &&
      y < step5.conductance_y_max &&
      !step5.conductanceVerificationDone
    ) {
      step5.conductanceVerificationDone = true;
      step3.UpdateTable4("conductance");
      ScoreStep5.score = ScoreStep5.score + 1;
      ScoreStep5.DrawScore();
    }
    if (
      x > step5.resistance_x_min &&
      x < step5.resistance_x_max &&
      y > step5.resistance_y_min &&
      y < step5.resistance_y_max &&
      !step5.resistenaceVerificationDone
    ) {
      step5.resistenaceVerificationDone = true;
      step3.UpdateTable4("resistance");
      ScoreStep5.score = ScoreStep5.score + 1;
    }
    if (ScoreStep5.score == 3 && !step5.step5VerificationDone) {
      step5.step5VerificationDone = true;
      ScoreStep5.color = "green";
      step_count = step_count + 1;
      ScoreStep5.DrawScore();
    }
  }
});

const battery = new Apparatus(10, 10, 250, 150, 150, 85, 40, 5);
battery.DrawOuterRect();
battery.DrawDial(true, ["OV", "5V", "10V", "15V", "20V"]);
battery.DrawKnob("battery");
battery.DrawSockets(false);
battery.DrawPowerOFF();
battery.RedSocket = false;
battery.BlackSocket = false;
battery.RedSocketVerification = false;
const rheostat = new Apparatus(300, 10, 225, 150, 425, 85, 40, 5);
rheostat.DrawOuterRect();
rheostat.DrawDial(true, ["10Ω", "50Ω", "500Ω", "100KΩ", "20KΩ"]);
rheostat.DrawKnob("rheostat");
rheostat.DrawSockets(true);
rheostat.RedSocket = false;
rheostat.BlackSocket = false;
rheostat.RedSocketVerification = false;

const voltmeter = new Apparatus(300, 200, 220, 200, 410, 300, 50, 26, 6);
voltmeter.DrawOuterRect();
voltmeter.DrawDial(false);
voltmeter.DrawDialLarge(["0V", "5V", "10V", "15V", "20V", "25V", "V"]);
//voltmeter.DrawKnob(0);
voltmeter.DrawSockets(false);
voltmeter.DrawPointers("voltmeter");
//voltmeter.DrawDialText("V");
voltmeter.RedSocket = false;
voltmeter.BlackSocket = false;
voltmeter.RedSocketVerification = false;

const resistor = new Apparatus(315, 430, 100, 5);
resistor.DrawResistor();

const ammeter = new Apparatus(40, 200, 220, 200, 150, 300, 40, 26, 6);
ammeter.DrawOuterRect();
ammeter.DrawDial(false);
ammeter.DrawDialLarge(["0", "20", "40", "60", "80", "100", "mA"]);
ammeter.DrawSockets(false);
ammeter.DrawPointers("ammter");
//ammeter.DrawDialText("mA");
ammeter.RedSocket = false;
ammeter.BlackSocket = false;
ammeter.RedSocketVerification = false;

ScoreBoard.DrawBoard();
const ScoreStep1 = new ScoreBoard(590, 120, "yellow", 0);
ScoreStep1.DrawScore();
const ScoreStep2 = new ScoreBoard(670, 120, "red", 0);
ScoreStep2.DrawScore();
const ScoreStep3 = new ScoreBoard(750, 120, "red", 0);
ScoreStep3.DrawScore();
const ScoreStep4 = new ScoreBoard(830, 120, "red", 0);
ScoreStep4.DrawScore();
const ScoreStep5 = new ScoreBoard(910, 120, "red", 0);
ScoreStep5.DrawScore();

const step1 = new Step(10, 450, 900, 150);
const step2 = new Step(10, 600, 900, 100, 550, 200, 133, 50);
const step3 = new Step(10, 600, 900, 100, 550, 200, 133, 50);
const step4 = new Step(550, 550, 100, 100, 550, 200, 80, 50);
const step5 = new Step(50, 650, 250, 250, 550, 200, 50, 50);
var step_text = [];
step_text[0] =
  "Step 1: Connect the electronics devices as shown in the circuit diagram.";
step_text[1] =
  "e.g. The +ve terminal of battery should be connected to the +ve terminal of ammeter";
step_text[2] =
  "In order to connect the terminals click on the first terminal and then the second.";
step_text[3] =
  "e.g. First click on +ve terminal of battery and then on +ve terminal of ammeter";
//console.log(step_text);
step1.DrawCircuit();
//step1.DrawScore();
//step1.DrawStep(step_text);

function procStep2() {
  step2.DrawTable1();
}

function procStep3() {
  console.log("inside proc3");
  step3.DrawTableStep3Head();
  step3.DrawTableStep3Options();
}
function procStep4() {
  console.log("inside proc4");
  step4.DrawCalcs();
  //step3.DrawTableStep3Options();
}

function procStep5() {
  step5.DrawGraph();
}
