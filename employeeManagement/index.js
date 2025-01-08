const fs = require("fs");
const readline = require("readline");

// File lưu trữ danh sách nhân viên
const dataFile = "employees.json";

// Kiểm tra và tạo file nếu chưa tồn tại
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

// Đọc danh sách nhân viên từ file
const getEmployees = () => {
  const data = fs.readFileSync(dataFile);
  return JSON.parse(data);
};

// Ghi danh sách nhân viên vào file
const saveEmployees = (employees) => {
  fs.writeFileSync(dataFile, JSON.stringify(employees, null, 2));
};

// Hiển thị danh sách nhân viên
const listEmployees = () => {
  const employees = getEmployees();
  console.log("\n--- Danh sách nhân viên ---");
  employees.forEach((emp, index) => {
    console.log(`${index + 1}. ID: ${emp.id}, Tên: ${emp.name}, Vị trí: ${emp.position}, Phòng ban: ${emp.department}`);
  });
};

// Thêm nhân viên mới
const addEmployee = (name, position, department) => {
  const employees = getEmployees();
  const newEmployee = {
    id: employees.length + 1,
    name,
    position,
    department,
  };
  employees.push(newEmployee);
  saveEmployees(employees);
  console.log("\nNhân viên mới đã được thêm!");
};

// Sửa thông tin nhân viên
const editEmployee = (id, name, position, department) => {
  const employees = getEmployees();
  const index = employees.findIndex((emp) => emp.id === id);

  if (index === -1) {
    console.log("\nNhân viên không tồn tại!");
    return;
  }

  employees[index] = { id, name, position, department };
  saveEmployees(employees);
  console.log("\nThông tin nhân viên đã được cập nhật!");
};

// Xóa nhân viên
const deleteEmployee = (id) => {
  let employees = getEmployees();
  const initialLength = employees.length;
  employees = employees.filter((emp) => emp.id !== id);

  if (employees.length === initialLength) {
    console.log("\nNhân viên không tồn tại!");
    return;
  }

  saveEmployees(employees);
  console.log("\nNhân viên đã được xóa!");
};

// Giao diện dòng lệnh
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Hiển thị menu
const showMenu = () => {
  console.log("\n--- Quản lý nhân viên ---");
  console.log("1. Hiển thị danh sách nhân viên");
  console.log("2. Thêm nhân viên mới");
  console.log("3. Sửa thông tin nhân viên");
  console.log("4. Xóa nhân viên");
  console.log("5. Thoát");
  rl.question("\nChọn một tùy chọn: ", (option) => {
    handleMenuOption(option);
  });
};

// Xử lý lựa chọn từ menu
const handleMenuOption = (option) => {
  switch (option) {
    case "1":
      listEmployees();
      showMenu();
      break;
    case "2":
      rl.question("Nhập tên: ", (name) => {
        rl.question("Nhập vị trí: ", (position) => {
          rl.question("Nhập phòng ban: ", (department) => {
            addEmployee(name, position, department);
            showMenu();
          });
        });
      });
      break;
    case "3":
      rl.question("Nhập ID nhân viên cần sửa: ", (id) => {
        rl.question("Nhập tên mới: ", (name) => {
          rl.question("Nhập vị trí mới: ", (position) => {
            rl.question("Nhập phòng ban mới: ", (department) => {
              editEmployee(parseInt(id), name, position, department);
              showMenu();
            });
          });
        });
      });
      break;
    case "4":
      rl.question("Nhập ID nhân viên cần xóa: ", (id) => {
        deleteEmployee(parseInt(id));
        showMenu();
      });
      break;
    case "5":
      console.log("Thoát chương trình. Tạm biệt!");
      rl.close();
      break;
    default:
      console.log("Lựa chọn không hợp lệ!");
      showMenu();
      break;
  }
};

// Bắt đầu chương trình
showMenu();