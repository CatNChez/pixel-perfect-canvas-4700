export const ENVIRONMENTS = [
  { id: "blocks", name: "VEXcode V5 Blocks", level: "Beginner", official: true, url: "https://www.vexrobotics.com/vexcode/v5",
    summary: "Drag-and-drop blocks based on Scratch. Best first step — no typing errors.",
    setup: ["Install VEXcode V5 (Windows, macOS, Chromebook) or use codev5.vex.com in Chrome.", "Choose File → New Blocks Project.", "Configure devices and ports in the Devices panel.", "Plug in the brain by USB or controller and press Download."] },
  { id: "vexpy", name: "VEXcode V5 Python", level: "Beginner → Intermediate", official: true, url: "https://api.vex.com/v5/home/python/index.html",
    summary: "Official Python (MicroPython-based) using the vex module: from vex import *.",
    setup: ["In VEXcode V5 choose File → New Text Project → Python.", "Add devices in the Devices panel (generates the config code).", "Write code below the config, then Download to a program slot."] },
  { id: "vexcpp", name: "VEXcode V5 C++", level: "Intermediate", official: true, url: "https://api.vex.com/v5/home/cpp/index.html",
    summary: "Official C++ with #include \"vex.h\" and the vex:: namespace (motor, drivetrain, competition).",
    setup: ["In VEXcode V5 choose File → New Text Project → C++.", "Configure devices; VEXcode writes robot-config.cpp.", "Use a vex::competition object for autonomous and driver control."] },
  { id: "vscode", name: "Visual Studio Code", level: "Intermediate → Advanced", official: true, url: "https://marketplace.visualstudio.com/items?itemName=VEXRobotics.vexcode",
    summary: "The official VEX Robotics extension adds VEXcode V5 Python/C++ projects to VS Code. Install the PROS extension instead for PROS.",
    setup: ["Install VS Code.", "Install the \"VEX Robotics\" extension (VEXRobotics.vexcode) from the Marketplace.", "Use the VEX panel to create a V5 project, build and download.", "For PROS, install the \"PROS\" extension (sigbots.pros) — it installs its own toolchain."] },
  { id: "pros", name: "PROS + LemLib", level: "Advanced / Competition", official: false, url: "https://pros.cs.purdue.edu/",
    summary: "PROS is an open-source C++ kernel by Purdue SIGBots. LemLib is a community library for odometry, PID and motion (moveToPoint, turnToHeading).",
    setup: ["Install the PROS VS Code extension (sigbots.pros).", "Create a project: PROS → Create Project → V5.", "Add LemLib: pros c add-depot LemLib https://raw.githubusercontent.com/LemLib/LemLib/depot/stable.json then pros c apply LemLib.", "Build with pros make and upload with pros upload (or the extension buttons). Docs: lemlib.readthedocs.io"] },
] as const;

export type DocEnv = "VEXcode Python" | "VEXcode C++" | "PROS + LemLib";

export const EXAMPLES: { id: string; topic: string; title: string; env: DocEnv; code: string }[] = [
  { id: "dt-py", topic: "Drivetrain", title: "Drive forward and turn", env: "VEXcode Python", code: `from vex import *
brain = Brain()
left = Motor(Ports.PORT1, GearSetting.RATIO_18_1, False)
right = Motor(Ports.PORT10, GearSetting.RATIO_18_1, True)
drivetrain = DriveTrain(left, right, 319.19, 295, 40, MM, 1)

drivetrain.drive_for(FORWARD, 600, MM)
drivetrain.turn_for(RIGHT, 90, DEGREES)` },
  { id: "dt-cpp", topic: "Drivetrain", title: "Drive forward and turn", env: "VEXcode C++", code: `#include "vex.h"
using namespace vex;
brain Brain;
motor LeftMotor(PORT1, ratio18_1, false);
motor RightMotor(PORT10, ratio18_1, true);
drivetrain Drivetrain(LeftMotor, RightMotor, 319.19, 295, 40, mm, 1);

int main() {
  Drivetrain.driveFor(forward, 600, mm);
  Drivetrain.turnFor(right, 90, degrees);
}` },
  { id: "dt-pros", topic: "Drivetrain", title: "Drive to a point with LemLib", env: "PROS + LemLib", code: `#include "main.h"
#include "lemlib/api.hpp"
// chassis is a lemlib::Chassis built from your drivetrain, PID settings and sensors
void autonomous() {
  chassis.setPose(0, 0, 0);
  chassis.moveToPoint(0, 24, 2000);   // inches, timeout ms
  chassis.turnToHeading(90, 1000);
}` },
  { id: "arm-py", topic: "Motors & arms", title: "Spin an arm to a position", env: "VEXcode Python", code: `arm = Motor(Ports.PORT8, GearSetting.RATIO_36_1, False)
arm.set_velocity(50, PERCENT)
arm.spin_to_position(180, DEGREES)
arm.set_stopping(HOLD)` },
  { id: "arm-cpp", topic: "Motors & arms", title: "Spin an arm to a position", env: "VEXcode C++", code: `motor Arm(PORT8, ratio36_1, false);
Arm.setVelocity(50, percent);
Arm.spinToPosition(180, degrees);
Arm.setStopping(hold);` },
  { id: "arm-pros", topic: "Motors & arms", title: "Move an arm (PROS)", env: "PROS + LemLib", code: `pros::Motor arm(8, pros::MotorGearset::red);
arm.set_brake_mode(pros::E_MOTOR_BRAKE_HOLD);
arm.move_absolute(180, 100); // degrees, rpm` },
  { id: "drv-py", topic: "Driver control", title: "Tank drive with the controller", env: "VEXcode Python", code: `controller = Controller()
while True:
    left.spin(FORWARD, controller.axis3.position(), PERCENT)
    right.spin(FORWARD, controller.axis2.position(), PERCENT)
    wait(20, MSEC)` },
  { id: "drv-cpp", topic: "Driver control", title: "Tank drive with the controller", env: "VEXcode C++", code: `controller Controller1;
while (true) {
  LeftMotor.spin(forward, Controller1.Axis3.position(), percent);
  RightMotor.spin(forward, Controller1.Axis2.position(), percent);
  wait(20, msec);
}` },
  { id: "drv-pros", topic: "Driver control", title: "Arcade drive with LemLib", env: "PROS + LemLib", code: `pros::Controller master(pros::E_CONTROLLER_MASTER);
void opcontrol() {
  while (true) {
    int fwd = master.get_analog(ANALOG_LEFT_Y);
    int turn = master.get_analog(ANALOG_RIGHT_X);
    chassis.arcade(fwd, turn);
    pros::delay(20);
  }
}` },
  { id: "sen-py", topic: "Sensors", title: "Stop near a wall (Distance)", env: "VEXcode Python", code: `dist = Distance(Ports.PORT5)
while dist.object_distance(MM) > 100:
    drivetrain.drive(FORWARD)
    wait(20, MSEC)
drivetrain.stop()` },
  { id: "sen-cpp", topic: "Sensors", title: "Turn with the Inertial sensor", env: "VEXcode C++", code: `inertial Inertial(PORT6);
Inertial.calibrate();
while (Inertial.isCalibrating()) wait(50, msec);
Drivetrain.turnFor(right, 90, degrees); // use a smartdrive for gyro-based turns` },
  { id: "comp-cpp", topic: "Competition", title: "Competition template", env: "VEXcode C++", code: `competition Competition;
void autonomous() { /* 15s auton */ }
void usercontrol() { while (true) { wait(20, msec); } }
int main() {
  Competition.autonomous(autonomous);
  Competition.drivercontrol(usercontrol);
  while (true) wait(100, msec);
}` },
];

export const ERRORS = [
  { err: "Motor doesn't move", fix: "Check the port number matches the cable, and the motor isn't reversed against its partner." },
  { err: "Robot spins instead of driving straight", fix: "One side needs reversed = true (Python) or true as the 3rd argument (C++)." },
  { err: "'vex.h' file not found in PROS", fix: "PROS doesn't use vex.h. Use #include \"main.h\" and pros:: classes." },
  { err: "NameError: name 'Motor' is not defined", fix: "Add from vex import * at the top of VEXcode Python." },
  { err: "Code ends instantly in driver control", fix: "Driver code must sit inside a while loop with a short wait." },
  { err: "Turns are inaccurate", fix: "Calibrate the Inertial sensor before auton, or use LemLib/PID for precise turns." },
];

export const PORTS = [
  ["Smart ports", "21 (PORT1–PORT21) — motors, sensors, radio"],
  ["3-wire ports", "8 (A–H) — legacy sensors, pneumatics solenoids"],
  ["Green cartridge", "18:1 · 200 RPM — drivetrains (standard)"],
  ["Red cartridge", "36:1 · 100 RPM — arms and lifts (torque)"],
  ["Blue cartridge", "6:1 · 600 RPM — flywheels, fast drives"],
  ["Match timing (V5RC)", "15 s autonomous · 1:45 driver control"],
];
