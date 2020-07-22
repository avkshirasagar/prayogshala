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

  DrawSockets(isRheostat) {
    var radius = 5;
    c.lineWidth = 5;
    this.isRheostat = isRheostat;
    if (this.isRheostat) {
      console.log(`Inside DrawSockets:isRheostat: ${isRheostat}`);
      var b1_x_space = 15;
      var r_x_space = 110;
      var b2_x_space = 105;
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
      c.fillText("F", this.sock_b1_x - 5, this.sock_b1_y - 10);
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
      c.fillText("F", this.sock_b2_x - 5, this.sock_b2_y - 10);
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
      c.fillText("+", this.sock_r_x - 8, this.sock_r_y - 5);

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
      c.fillText("-", this.sock_b_x - 5, this.sock_b_y - 4);
    }
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

class ScoreBoard {
  constructor(cx, cy, color, score) {
    this.cx = cx;
    this.cy = cy;
    this.color = color;
    this.score = score;
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
      c.lineTo(rheostat.sock_b2_x, rheostat.sock_b2_y + 30);
      c.lineTo(rheostat.sock_b2_x, rheostat.sock_b2_y + 270);
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
        console.log(`i=${i} j=${j} x=${x} y=${y} fillstyle=${c.fillStyle}`);
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
      step1.DrawStep(step_text);
    }
    ScoreStep1.DrawScore();
    ScoreStep2.DrawScore();
  } else if (step_count == 2) {
    if (
      x > ScoreStep2.cx - 40 &&
      x < ScoreStep2.cx + 40 &&
      y > ScoreStep2.cy - 40 &&
      y < ScoreStep2.cy + 40
    ) {
      console.log("start step 2");
      procStep2();
    }
  }
});

const battery = new Apparatus(10, 10, 250, 150, 150, 85, 40, 5);
battery.DrawOuterRect();
battery.DrawDial(true, ["OV", "5V", "10V", "15V", "20V"]);
battery.DrawKnob(180);
battery.DrawSockets(false);
battery.DrawPowerOFF();
battery.RedSocket = false;
battery.BlackSocket = false;
battery.RedSocketVerification = false;
const rheostat = new Apparatus(300, 10, 250, 150, 450, 85, 40, 5);
rheostat.DrawOuterRect();
rheostat.DrawDial(true, ["10Ω", "50Ω", "500Ω", "100KΩ", "20KΩ"]);
rheostat.DrawKnob(0);
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
voltmeter.DrawPointers(8, "V");
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
ammeter.DrawPointers(0, "mA");
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
const step3 = new Step(10, 600, 900, 100);
const step4 = new Step(10, 600, 900, 100);
const step5 = new Step(10, 600, 900, 100);
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
step1.DrawStep(step_text);

function procStep2() {
  step2.DrawTable1();
}
