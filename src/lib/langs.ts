export type Lang = "python" | "vexpy" | "cpp" | "vexcpp" | "pros";

export const LANGS: Record<Lang, { label: string; short: string; ext: string; family: "py" | "cpp"; file: string; hint: string }> = {
  python: { label: "Python", short: "PY", ext: ".py", family: "py", file: "main.py", hint: "Standard Python 3 — runs for real in your browser." },
  vexpy: { label: "VEX V5 Python", short: "V5 PY", ext: ".py", family: "py", file: "main.py", hint: "VEXcode V5 Python (from vex import *). Runs in a robot simulator here; export to load on a brain." },
  cpp: { label: "C++", short: "C++", ext: ".cpp", family: "cpp", file: "main.cpp", hint: "Standard C++17 — compiled and run for real on an online compiler." },
  vexcpp: { label: "VEX V5 C++", short: "V5 C++", ext: ".cpp", family: "cpp", file: "main.cpp", hint: "VEXcode V5 C++ (#include \"vex.h\"). Compiled for real against a robot simulator." },
  pros: { label: "PROS + LemLib", short: "PROS", ext: ".cpp", family: "cpp", file: "src/main.cpp", hint: "PROS C++ with LemLib (#include \"main.h\", \"lemlib/api.hpp\"). Compiled for real against a robot simulator." },
};
export const LANG_IDS = Object.keys(LANGS) as Lang[];

const STARTERS: Record<Lang, string> = {
  python: `# Normal Python
def drive(speed, seconds):
    for t in range(seconds):
        print(f"t={t}s  left={speed}%  right={speed}%")

print("Robot ready!")
drive(75, 3)
`,
  vexpy: `# VEX V5 Python
from vex import *

brain = Brain()
left_motor = Motor(Ports.PORT1, GearSetting.RATIO_18_1, False)
right_motor = Motor(Ports.PORT10, GearSetting.RATIO_18_1, True)
drivetrain = DriveTrain(left_motor, right_motor, 319.19, 295, 40, MM, 1)
dist = Distance(Ports.PORT5)

brain.screen.print("Auton start")
drivetrain.drive_for(FORWARD, 500, MM)
drivetrain.turn_for(RIGHT, 90, DEGREES)
while dist.object_distance(MM) > 100:
    drivetrain.drive(FORWARD)
    wait(100, MSEC)
drivetrain.stop()
brain.screen.print("Done")
`,
  cpp: `// Normal C++
#include <iostream>
#include <vector>
using namespace std;

int main() {
  vector<int> speeds = {25, 50, 75, 100};
  for (int s : speeds) cout << "Motor speed: " << s << "%" << endl;
  cout << "Robot ready!" << endl;
  return 0;
}
`,
  vexcpp: `// VEX V5 C++ (VEXcode)
#include "vex.h"
using namespace vex;

brain Brain;
motor LeftDrive(PORT1, ratio18_1, false);
motor RightDrive(PORT10, ratio18_1, true);
drivetrain Drivetrain(LeftDrive, RightDrive, 319.19, 295, 40, mm, 1);
distance Dist(PORT5);

int main() {
  Brain.Screen.print("Auton start");
  Drivetrain.driveFor(forward, 500, mm);
  Drivetrain.turnFor(right, 90, degrees);
  while (Dist.objectDistance(mm) > 100) {
    Drivetrain.drive(forward);
    wait(100, msec);
  }
  Drivetrain.stop();
  Brain.Screen.print("Done");
  return 0;
}
`,
  pros: `// PROS + LemLib
#include "main.h"
#include "lemlib/api.hpp"

pros::MotorGroup left_mg({-1, -2, -3}, pros::MotorGearset::blue);
pros::MotorGroup right_mg({4, 5, 6}, pros::MotorGearset::blue);
pros::Imu imu(10);

lemlib::Drivetrain drivetrain(&left_mg, &right_mg, 10, lemlib::Omniwheel::NEW_325, 450, 2);
lemlib::ControllerSettings lateral(10, 0, 3, 3, 1, 100, 3, 500, 20);
lemlib::ControllerSettings angular(2, 0, 10, 3, 1, 100, 3, 500, 0);
lemlib::OdomSensors sensors(nullptr, nullptr, nullptr, nullptr, &imu);
lemlib::Chassis chassis(drivetrain, lateral, angular, sensors);

void initialize() {
  pros::lcd::initialize();
  chassis.calibrate();
}

void autonomous() {
  chassis.setPose(0, 0, 0);
  chassis.moveToPoint(0, 24, 2000);
  chassis.turnToHeading(90, 1000);
  pros::lcd::print(0, "Auton done");
}

void opcontrol() {
  pros::Controller master(pros::E_CONTROLLER_MASTER);
  while (true) {
    int dir = master.get_analog(pros::E_CONTROLLER_ANALOG_LEFT_Y);
    int turn = master.get_analog(pros::E_CONTROLLER_ANALOG_RIGHT_X);
    chassis.arcade(dir, turn);
    pros::delay(20);
  }
}
`,
};
export const starter = (l: Lang) => STARTERS[l];

/** Python mock of the VEX V5 `vex` module: logs every robot action. */
export const VEX_PY_MOCK = `
import time as _t
_sim = {"t": 0.0}
def _log(msg): print(f"[{_sim['t']:6.2f}s] {msg}")
def _adv(sec):
    _sim["t"] += sec
    if _sim["t"] > 15: raise SystemExit("[sim] 15s limit reached (match auton is 15s)")
class _Const(str): pass
FORWARD=_Const("FORWARD"); REVERSE=_Const("REVERSE"); LEFT=_Const("LEFT"); RIGHT=_Const("RIGHT")
PERCENT=_Const("%"); RPM=_Const("rpm"); VOLT=_Const("V"); SECONDS=_Const("s"); MSEC=_Const("ms")
DEGREES=_Const("deg"); TURNS=_Const("turns"); MM=_Const("mm"); INCHES=_Const("in"); BRAKE=_Const("BRAKE"); COAST=_Const("COAST"); HOLD=_Const("HOLD")
class Ports:
    pass
for _i in range(1,22): setattr(Ports, f"PORT{_i}", _i)
class GearSetting:
    RATIO_36_1="red 100rpm"; RATIO_18_1="green 200rpm"; RATIO_6_1="blue 600rpm"
def wait(n, unit=SECONDS):
    _adv(n/1000 if unit==MSEC else n)
class _Dev:
    _kind="Device"
    def __init__(self, *a, **k): self._name=f"{self._kind}({', '.join(str(x) for x in a[:1])})"
    def __getattr__(self, name):
        def f(*a, **k):
            _log(f"{self._name}.{name}({', '.join(str(x) for x in a)})"); return 0
        return f
class _Screen(_Dev):
    _kind="Screen"
    def print(self, *a, **k): _log("BRAIN SCREEN: " + " ".join(str(x) for x in a))
class Brain(_Dev):
    _kind="Brain"
    def __init__(self): self._name="Brain"; self.screen=_Screen(); self.screen._name="Brain.screen"
class Motor(_Dev):
    _kind="Motor"
    def spin_for(self, d, amt, unit=DEGREES, *a, **k): _log(f"{self._name} spin_for {d} {amt}{unit}"); _adv(0.5)
class MotorGroup(_Dev): _kind="MotorGroup"
class DriveTrain(_Dev):
    _kind="DriveTrain"
    def __init__(self,*a,**k): self._name="Drivetrain"
    def drive_for(self, d, amt, unit=MM, *a, **k): _log(f"Drivetrain drive_for {d} {amt}{unit}"); _adv(1.0)
    def turn_for(self, d, amt, unit=DEGREES, *a, **k): _log(f"Drivetrain turn_for {d} {amt}{unit}"); _adv(0.6)
    def drive(self, d, *a, **k):
        _sim["v"] = d
    def stop(self, *a): _log("Drivetrain stop")
SmartDrive = DriveTrain
class Distance(_Dev):
    _kind="Distance"
    def object_distance(self, unit=MM):
        d = max(0, 600 - int(_sim["t"]*200)); _log(f"{self._name} reads {d}mm"); return d
class Inertial(_Dev):
    _kind="Inertial"
    def heading(self, *a): return 0
    def rotation(self, *a): return 0
class _Axis:
    def position(self, *a): return 0
class Controller(_Dev):
    _kind="Controller"
    def __init__(self,*a):
        self._name="Controller"
        for n in ["axis1","axis2","axis3","axis4"]: setattr(self, n, _Axis())
class Competition:
    def __init__(self, driver, auton):
        _log("Competition: running autonomous"); auton(); _log("Competition: running driver control"); driver()
Optical=Rotation=Bumper=Limit=Pneumatics=DigitalOut=Gps=_Dev
`;

const CPP_COMMON = `
#include <cstdio>
#include <cstdlib>
#include <cstdarg>
#include <iostream>
#include <string>
#include <vector>
#include <initializer_list>
static double __simT = 0;
static void __log(const char* fmt, ...) { std::printf("[%6.2fs] ", __simT); va_list a; va_start(a, fmt); std::vprintf(fmt, a); va_end(a); std::printf("\\n"); std::fflush(stdout); }
static void __adv(double s) { __simT += s; if (__simT > 15) { std::printf("[sim] 15s limit reached\\n"); std::exit(0); } }
`;

export const VEX_CPP_MOCK = CPP_COMMON + `
namespace vex {
  enum directionType { forward, reverse, fwd = forward, rev = reverse };
  enum turnType { left, right };
  enum velocityUnits { pct, rpm, dps }; static const velocityUnits percent = pct;
  enum timeUnits { sec, msec }; static const timeUnits seconds = sec;
  enum rotationUnits { deg, rev_, raw }; static const rotationUnits degrees = deg; static const rotationUnits turns = rev_;
  enum distanceUnits { mm, inches, cm };
  enum gearSetting { ratio36_1, ratio18_1, ratio6_1 };
  enum brakeType { coast, brake, hold };
  enum { PORT1=1,PORT2,PORT3,PORT4,PORT5,PORT6,PORT7,PORT8,PORT9,PORT10,PORT11,PORT12,PORT13,PORT14,PORT15,PORT16,PORT17,PORT18,PORT19,PORT20,PORT21 };
  inline void wait(double t, timeUnits u = sec) { __adv(u == msec ? t / 1000 : t); }
  inline const char* dn(directionType d) { return d == forward ? "forward" : "reverse"; }
  struct screen_ {
    void print(const char* f, ...) { char b[256]; va_list a; va_start(a, f); std::vsnprintf(b, 256, f, a); va_end(a); __log("BRAIN SCREEN: %s", b); }
    void print(int v) { __log("BRAIN SCREEN: %d", v); } void print(double v) { __log("BRAIN SCREEN: %.2f", v); }
    void newLine() {} void clearScreen() {} void setCursor(int, int) {}
  };
  struct brain { screen_ Screen; };
  struct motor {
    int port; motor(int p, ...) : port(p) {}
    void spin(directionType d, double v = 50, velocityUnits = pct) { __log("Motor(PORT%d) spin %s %.0f", port, dn(d), v); }
    void spin(directionType d, double v, int) { spin(d, v); }
    void spinFor(directionType d, double a, rotationUnits = deg, ...) { __log("Motor(PORT%d) spinFor %s %.0f", port, dn(d), a); __adv(0.5); }
    void spinFor(double a, rotationUnits u = deg, ...) { spinFor(forward, a, u); }
    void stop(brakeType = coast) { __log("Motor(PORT%d) stop", port); }
    void setVelocity(double v, ...) { __log("Motor(PORT%d) velocity %.0f", port, v); }
    void setStopping(brakeType) {}
    double position(rotationUnits = deg) { return 0; }
  };
  struct motor_group { std::vector<motor*> m; template <class... M> motor_group(M&... ms) : m{&ms...} {}
    void spin(directionType d, double v = 50, ...) { __log("MotorGroup spin %s %.0f", dn(d), v); } void stop(...) { __log("MotorGroup stop"); } };
  struct drivetrain {
    template <class A, class B> drivetrain(A&, B&, ...) {}
    void driveFor(directionType d, double dist, distanceUnits = mm, ...) { __log("Drivetrain driveFor %s %.0f", dn(d), dist); __adv(1.0); }
    void driveFor(double dist, distanceUnits u = mm, ...) { driveFor(forward, dist, u); }
    void turnFor(turnType t, double a, rotationUnits = deg, ...) { __log("Drivetrain turnFor %s %.0f deg", t == right ? "right" : "left", a); __adv(0.6); }
    void turnFor(double a, rotationUnits u = deg, ...) { turnFor(right, a, u); }
    void drive(directionType, ...) {} void stop(...) { __log("Drivetrain stop"); }
    void setDriveVelocity(double v, ...) { __log("Drivetrain velocity %.0f", v); } void setTurnVelocity(double, ...) {}
  };
  typedef drivetrain smartdrive;
  struct distance { int port; distance(int p) : port(p) {} double objectDistance(distanceUnits = mm) { double d = 600 - __simT * 200; if (d < 0) d = 0; __log("Distance(PORT%d) reads %.0fmm", port, d); return d; } };
  struct inertial { inertial(int) {} void calibrate() { __log("Inertial calibrate"); } bool isCalibrating() { return false; } double heading(...) { return 0; } double rotation(...) { return 0; } };
  struct axis_ { int position(...) { return 0; } };
  struct button_ { bool pressing() { return false; } };
  struct controller { axis_ Axis1, Axis2, Axis3, Axis4; button_ ButtonA, ButtonB, ButtonX, ButtonY, ButtonL1, ButtonL2, ButtonR1, ButtonR2; controller(...) {} };
  struct competition { void autonomous(void (*f)()) { __log("Competition: autonomous"); f(); } void drivercontrol(void (*f)()) { __log("Competition: driver control"); f(); } };
  struct vexcodeInit_ {}; inline void vexcodeInit() {}
}
`;

export const PROS_MOCK = CPP_COMMON + `
#include <cmath>
namespace pros {
  enum class MotorGearset { red, green, blue, invalid }; enum class v5 { };
  enum controller_id_e_t { E_CONTROLLER_MASTER, E_CONTROLLER_PARTNER };
  enum controller_analog_e_t { E_CONTROLLER_ANALOG_LEFT_X, E_CONTROLLER_ANALOG_LEFT_Y, E_CONTROLLER_ANALOG_RIGHT_X, E_CONTROLLER_ANALOG_RIGHT_Y };
  enum controller_digital_e_t { E_CONTROLLER_DIGITAL_L1, E_CONTROLLER_DIGITAL_L2, E_CONTROLLER_DIGITAL_R1, E_CONTROLLER_DIGITAL_R2, E_CONTROLLER_DIGITAL_A, E_CONTROLLER_DIGITAL_B, E_CONTROLLER_DIGITAL_X, E_CONTROLLER_DIGITAL_Y };
  inline void delay(unsigned ms) { __adv(ms / 1000.0); }
  inline unsigned millis() { return (unsigned)(__simT * 1000); }
  struct Motor { int port; Motor(int p, ...) : port(p) {} void move(int v) { __log("Motor(%d) move %d", port, v); } void move_velocity(int v) { __log("Motor(%d) move_velocity %d", port, v); }
    void move_relative(double p, int v) { __log("Motor(%d) move_relative %.0f @%d", port, p, v); __adv(0.5); } void brake() { __log("Motor(%d) brake", port); } double get_position() { return 0; } };
  struct MotorGroup { std::vector<int> ports; MotorGroup(std::initializer_list<int> p, ...) : ports(p) {} void move(int v) { __log("MotorGroup move %d", v); } void move_velocity(int v) { __log("MotorGroup move_velocity %d", v); } void brake() { __log("MotorGroup brake"); } };
  struct Imu { int port; Imu(int p) : port(p) {} void reset(bool = false) { __log("IMU(%d) reset", port); } double get_heading() { return 0; } double get_rotation() { return 0; } };
  struct Rotation { Rotation(int) {} double get_position() { return 0; } };
  struct Distance { int port; Distance(int p) : port(p) {} int get() { int d = (int)(600 - __simT * 200); if (d < 0) d = 0; __log("Distance(%d) reads %dmm", port, d); return d; } int get_distance() { return get(); } };
  namespace adi { struct DigitalOut { char p; DigitalOut(char c, bool = false) : p(c) {} void set_value(bool v) { __log("ADI %c -> %d", p, v); } }; }
  struct Controller { Controller(controller_id_e_t) {} int get_analog(controller_analog_e_t) { return 0; } bool get_digital(controller_digital_e_t) { return false; } bool get_digital_new_press(controller_digital_e_t) { return false; } void print(int, int, const char*, ...) {} };
  namespace lcd { inline bool initialize() { __log("LCD initialized"); return true; } inline void print(int line, const char* f, ...) { char b[256]; va_list a; va_start(a, f); std::vsnprintf(b, 256, f, a); va_end(a); __log("LCD line %d: %s", line, b); } inline void set_text(int l, std::string s) { __log("LCD line %d: %s", l, s.c_str()); } }
}
using pros::E_CONTROLLER_MASTER; using pros::E_CONTROLLER_ANALOG_LEFT_Y; using pros::E_CONTROLLER_ANALOG_RIGHT_X; using pros::E_CONTROLLER_ANALOG_LEFT_X; using pros::E_CONTROLLER_ANALOG_RIGHT_Y;
namespace lemlib {
  namespace Omniwheel { const double NEW_2 = 2.125, NEW_275 = 2.75, OLD_275 = 2.75, NEW_325 = 3.25, OLD_325 = 3.25, NEW_4 = 4, OLD_4 = 4.18; }
  struct Pose { float x, y, theta; };
  struct Drivetrain { template <class... A> Drivetrain(A...) {} };
  struct ControllerSettings { template <class... A> ControllerSettings(A...) {} };
  struct TrackingWheel { template <class... A> TrackingWheel(A...) {} };
  struct OdomSensors { template <class... A> OdomSensors(A...) {} };
  struct ExpoDriveCurve { template <class... A> ExpoDriveCurve(A...) {} };
  struct Chassis {
    Pose p{0, 0, 0};
    template <class... A> Chassis(A&&...) {}
    void calibrate(bool = true) { __log("LemLib chassis calibrate"); }
    void setPose(float x, float y, float t, bool = false) { p = {x, y, t}; __log("LemLib setPose (%.1f, %.1f, %.1f)", x, y, t); }
    Pose getPose(bool = false) { return p; }
    template <class... A> void moveToPoint(float x, float y, int timeout, A...) { __log("LemLib moveToPoint (%.1f, %.1f) timeout %d", x, y, timeout); __adv(std::hypot(x - p.x, y - p.y) / 40.0); p.x = x; p.y = y; }
    template <class... A> void moveToPose(float x, float y, float t, int timeout, A...) { __log("LemLib moveToPose (%.1f, %.1f, %.1f)", x, y, t); __adv(1); p = {x, y, t}; }
    template <class... A> void turnToHeading(float h, int timeout, A...) { __log("LemLib turnToHeading %.1f", h); __adv(0.5); p.theta = h; }
    template <class... A> void turnToPoint(float x, float y, int timeout, A...) { __log("LemLib turnToPoint (%.1f, %.1f)", x, y); __adv(0.5); }
    void waitUntilDone() {}
    void tank(int l, int r, bool = false) { (void)l; (void)r; }
    void arcade(int t, int a, bool = false, float = 0.5) { (void)t; (void)a; }
  };
}
void initialize() __attribute__((weak)); void competition_initialize() __attribute__((weak));
void autonomous() __attribute__((weak)); void opcontrol() __attribute__((weak));
`;

export const PROS_MAIN = `
int main() {
  if (initialize) { __log("== initialize() =="); initialize(); }
  if (autonomous) { __log("== autonomous() =="); autonomous(); }
  if (opcontrol) { __log("== opcontrol() =="); opcontrol(); }
  return 0;
}
`;
