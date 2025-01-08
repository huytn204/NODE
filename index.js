const mongoose = require("mongoose");
const readlineSync = require("readline-sync");

// Kết nối MongoDB
const mongoURI = "mongodb://127.0.0.1:27017/employeeDB";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch(err => console.error("Không thể kết nối MongoDB:", err));

// Định nghĩa schema cho Counter
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// Định nghĩa schema cho Employee
const employeeSchema = new mongoose.Schema({
  empId: { type: Number, unique: true },
  name: String,
  position: String,
  department: String,
});

// Middleware để tự động tăng empId
employeeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "employeeId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // Tạo mới nếu không tồn tại
    );
    this.empId = counter.seq;
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

// Hiển thị menu chính
const showMenu = () => {
  console.log("\n--- Quản lý nhân viên ---");
  console.log("1. Hiển thị danh sách nhân viên");
  console.log("2. Thêm nhân viên mới");
  console.log("3. Sửa thông tin nhân viên");
  console.log("4. Xóa nhân viên");
  console.log("5. Thoát");
};

// Hiển thị danh sách nhân viên
const listEmployees = async () => {
  const employees = await Employee.find().sort({ empId: 1 });
  console.log("\n--- Danh sách nhân viên ---");
  if (employees.length === 0) {
    console.log("Không có nhân viên nào.");
  } else {
    employees.forEach((emp) => {
      console.log(`ID: ${emp.empId}, Tên: ${emp.name}, Vị trí: ${emp.position}, Phòng ban: ${emp.department}`);
    });
  }
};

// Thêm nhân viên mới
const addEmployee = async () => {
  const name = readlineSync.question("Nhập tên: ");
  const position = readlineSync.question("Nhập vị trí: ");
  const department = readlineSync.question("Nhập phòng ban: ");

  const employee = new Employee({ name, position, department });
  await employee.save();
  console.log("\nNhân viên mới đã được thêm!");
};

// Sửa thông tin nhân viên
const editEmployee = async () => {
  const id = parseInt(readlineSync.question("Nhập ID nhân viên cần sửa: "));
  const employee = await Employee.findOne({ empId: id });

  if (!employee) {
    console.log("\nKhông tìm thấy nhân viên.");
    return;
  }

  const name = readlineSync.question(`Nhập tên mới (${employee.name}): `, { defaultInput: employee.name });
  const position = readlineSync.question(`Nhập vị trí mới (${employee.position}): `, { defaultInput: employee.position });
  const department = readlineSync.question(`Nhập phòng ban mới (${employee.department}): `, { defaultInput: employee.department });

  employee.name = name;
  employee.position = position;
  employee.department = department;
  await employee.save();

  console.log("\nThông tin nhân viên đã được cập nhật!");
};

// Xóa nhân viên
const deleteEmployee = async () => {
  const id = parseInt(readlineSync.question("Nhập ID nhân viên cần xóa: "));
  const result = await Employee.findOneAndDelete({ empId: id });

  if (!result) {
    console.log("\nKhông tìm thấy nhân viên.");
  } else {
    console.log("\nNhân viên đã được xóa!");
  }
};

// Chương trình chính
const main = async () => {
  let exit = false;

  while (!exit) {
    showMenu();
    const option = readlineSync.question("Chọn một tùy chọn: ");

    switch (option) {
      case "1":
        await listEmployees();
        break;
      case "2":
        await addEmployee();
        break;
      case "3":
        await editEmployee();
        break;
      case "4":
        await deleteEmployee();
        break;
      case "5":
        exit = true;
        console.log("Thoát chương trình. Tạm biệt!");
        break;
      default:
        console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
    }
  }

  mongoose.disconnect(); // Đóng kết nối MongoDB khi thoát
};

main();