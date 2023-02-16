const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const inquirerQuestions = require("./inquirer_questions");
const { up } = require("inquirer/lib/utils/readline");
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "aaaaaaaa",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

const init = function () {  
    inquirer
        .prompt(inquirerQuestions.mainMenuQuestions)
        .then(result => { 
          if (result.choice === "Quit employee-tracker") {
              process.exit();
            } else { 
                handleChoice(result.choice);
            }        
        })
}

//function of getting the most updated role title list
async function getUpdatedRoleList() {
  const roleListQuery = `SELECT title FROM role`;
  const result = await db.promise().query(roleListQuery);
  return result[0].map((e) => e.title);
}

//function of getting the most updated department name list
async function getUpdatedDepartmentList() {
  const departmentListQuery = `SELECT name FROM department`;
  const result = await db.promise().query(departmentListQuery);
  return result[0].map((e) => e.name);
}

async function getUpdatedEmployeeList() {
  const employeeListQuery = `SELECT CONCAT(first_name," ",last_name) AS name FROM employee`;
  const result = await db.promise().query(employeeListQuery);
  return result[0].map((e) => e.name);
}

function viewAllDepartments() { 
    const query = "SELECT * FROM department";
    db.promise()
      .query(query)
      .then(([rows,fields])=> {
        console.table(rows);
        init();
      })
      .catch(console.log)
}

function viewAllRoles() { 
    const query =
      "SELECT role.id,role.title,department.name AS department,role.salary FROM role JOIN department ON role.department_id=department.id ORDER BY role.id";
    db.promise()
      .query(query)
      .then(([rows, fields]) => {
        console.table(rows);
        init();
      })
      .catch(console.log)
}

function viewAllEmployees() {
    const query =
      "SELECT e.id,e.first_name,e.last_name,title,department.name AS department,salary,CONCAT(m.first_name,' ',m.last_name) AS manager FROM ((employee e LEFT JOIN role ON e.role_id=role.id) LEFT JOIN department ON role.department_id=department.id) LEFT JOIN employee m ON e.manager_id=m.id ORDER BY e.id"; 
    db
      .promise()
      .query(query)
      .then(([rows, fields]) => {
          console.table(rows);
          init();
      })
      .catch(console.log)
}

function addNewDepartment() { 
    inquirer
        .prompt(inquirerQuestions.addDepartmentQuestions)
        .then(result => { 
            const query = `INSERT INTO department (name) VALUES (?)`;
            const name = result.departmentName;
            db.promise()
              .query(query,name)
              .then(() => {
                console.log(`Added ${name} to the database`);
                init();
              })
              .catch(console.log);
        })  
}

//function of adding new role to a selected department
async function addNewRole() {
  const updatedDepartmentList = await getUpdatedDepartmentList();
  inquirer
    .prompt(inquirerQuestions.addNewRoleQuestions(updatedDepartmentList))
    .then((result) => {
      const params = [];
      params.push(result.roleName);
      params.push(result.roleSalary);
      const getDepartmentIdByName = `SELECT id FROM department WHERE name=?`;
      db.promise()
        .query(getDepartmentIdByName, result.roleDepartment)
        .then(([rows, fields]) => {
          params.push(rows[0].id);
          return params;
        })
        .then((params) => {
          const query = `INSERT INTO role (title,salary,department_id) VALUES (?,?,?)`;
          db.promise()
            .query(query, params)
            .then(() => {
              console.log(`Added ${params[0]} to the database`);
              init();
            })
            .catch(console.log);
        });
    });
}

//function of adding a new employee to a selected role and allocate a manager
function addNewEmployee() {
    const roleListQuery = `SELECT title FROM role`;
    db.promise()
      .query(roleListQuery)
      .then(([rows, fields]) => {
        const updatedRoleList = rows.map((e) => e.title);
        const employeeList = `SELECT CONCAT(first_name," ",last_name) AS name FROM employee`;
        db.promise()
          .query(employeeList)
          .then(([rows, fields]) => {
            const updatedEmployeeList = rows.map((e) => e.name);
              addEmployee(updatedRoleList, updatedEmployeeList);
          })
          .catch(console.log);
      })
      .catch(console.log);
}
function addEmployee(updatedRoleList,updatedEmployeeList) {
    inquirer
      .prompt(inquirerQuestions.addNewEmployeeQuestions(updatedRoleList,updatedEmployeeList))
      .then((result) => {
        const params = [];
        params.push(result.employeeFirstName);
        params.push(result.employeeLastName);
        const getRoleIdByName = `SELECT id FROM role WHERE title=?`;
        db.promise()
          .query(getRoleIdByName, result.employeeRole)
          .then(([rows, fields]) => {
            params.push(rows[0].id);
            const getManagerIdByName = `SELECT id FROM employee WHERE CONCAT(first_name," ",last_name)=?`;
            db.promise()
              .query(getManagerIdByName, result.employeeManager)
              .then(([rows, fields]) => {
                params.push(rows[0].id);
                return params;
              })
              .then((params) => {
                const query = `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)`;
                db.promise()
                .query(query, params)
                .then(() => {
                    console.log(`Added ${params[0]} ${params[1]} to the database`);
                    init();
                })
                .catch(console.log);
            });
          })
      });
}

function updateEmployeeRole() { 
    const employeeList = `SELECT CONCAT(first_name," ",last_name) AS name FROM employee`;
    db.promise()
      .query(employeeList)
      .then(([rows, fields]) => {
        const updatedEmployeeList = rows.map((e) => e.name);
        const roleListQuery = `SELECT title FROM role`;
        db.promise()
          .query(roleListQuery)
          .then(([rows, fields]) => {
            const updatedRoleList = rows.map((e) => e.title);
            updateEmployee(updatedEmployeeList, updatedRoleList);
          })
          .catch(console.log);
      })
}
function updateEmployee(updatedEmployeeList, updatedRoleList) {
  inquirer
    .prompt(inquirerQuestions.updateEmployeeRoleQuestions(updatedEmployeeList,updatedRoleList))
    .then(result => { 
      const getRoleIdByName = `SELECT id FROM role WHERE title=?`;
      db.promise()
        .query(getRoleIdByName, result.employeeNewRole)
        .then(([rows, fields]) => {
          const newRoleId=rows[0].id;
          const updateEmployeeRole = `UPDATE employee SET role_id=? WHERE CONCAT(first_name," ",last_name)=?`;
          db.promise()
            .query(updateEmployeeRole, [newRoleId, result.employeeToUpdate])
            .then(() => {
              console.log(`Updated employee's role`);
              init();
            });
        });
    })
}

async function updateEmployeeManager() {
  const updatedEmployeeList = await getUpdatedEmployeeList();
  inquirer
    .prompt(
      inquirerQuestions.updateEmployeeManagerQuestions(updatedEmployeeList)
    )
    .then((result) => {
      const getEmployeeIdByName = `SELECT id FROM employee WHERE CONCAT(first_name," ",last_name)=?`;
      db.promise()
        .query(getEmployeeIdByName, result.employeeNewManager)
        .then(([rows, fields]) => {
          const newManagerId = rows[0].id;
          const updateEmployeeManager = `UPDATE employee SET manager_id=? WHERE CONCAT(first_name," ",last_name)=?`;
          db.promise()
            .query(updateEmployeeManager, [
              newManagerId,
              result.employeeToUpdate,
            ])
            .then(() => {
              console.log(`Updated employee's manager`);
              init();
            });
        });
    });
}

function viewEmployeeByManager() {
  const managerListQuery = `SELECT DISTINCT CONCAT(m.first_name," ",m.last_name) as name,m.id
                        FROM employee e 
                        JOIN employee m 
                        ON e.manager_id=m.id
                        WHERE e.manager_id IS NOT NULL`;
  db.promise()
    .query(managerListQuery)
    .then(([rows, fields]) => {
      const managerList = rows.map((e) => e.name);
      viewEmployeeByManagerQuery(managerList);
    });
}
function viewEmployeeByManagerQuery(managerList){
  inquirer
    .prompt(
      inquirerQuestions.viewEmployeeByManagerQuestions(managerList)
    )
    .then((result) => {
      const getEmployeeByManager = `SELECT CONCAT(e.first_name," ",e.last_name) as name FROM employee e JOIN employee m ON e.manager_id=m.id WHERE CONCAT(m.first_name," ",m.last_name)=?`;
      db.promise()
        .query(getEmployeeByManager, result.managerName)
        .then(([rows, fields]) => {
          console.table(rows);
              init();
          });
      });
}

async function viewEmployeeByDepartment() {
  const updatedDepartmentList = await getUpdatedDepartmentList();
  inquirer
    .prompt(
      inquirerQuestions.viewEmployeeByDepartmentQuestions(updatedDepartmentList)
    )
    .then((result) => {
      const getEmployeeByDepartment = `select CONCAT(first_name," ",last_name) as name FROM (employee e join role r on e.role_id=r.id) join department d on r.department_id=d.id where d.name=?`;
      db.promise()
        .query(getEmployeeByDepartment, result.departmentName)
        .then(([rows, fields]) => {
          console.table(rows);
          init();
        });
    });
}

async function deleteDepartment() {
  const updatedDepartmentList = await getUpdatedDepartmentList();
  inquirer
    .prompt(inquirerQuestions.deleteDepartmentQuestions(updatedDepartmentList))
    .then((result) => {
      const deleteDepartmentQuery = `DELETE FROM department WHERE name=?`;
      db.promise()
        .query(deleteDepartmentQuery, result.departmentName)
        .then(() => {
          console.log(`Deleted ${result.departmentName} from department table`);
          init();
        });
    });
}

async function deleteRole() {
  const updatedRoleList = await getUpdatedRoleList();
  inquirer
    .prompt(inquirerQuestions.deleteRoleQuestions(updatedRoleList))
    .then((result) => {
      const deleteRoleQuery = `DELETE FROM role WHERE title=?`;
      db.promise()
        .query(deleteRoleQuery, result.roleTitle)
        .then(([rows, fields]) => {
          console.log(`Deleted ${result.roleTitle} from role table`);
          init();
        });
    });
}

async function deleteEmployee() {
  const updatedEmployeeList = await getUpdatedEmployeeList();
  inquirer
    .prompt(inquirerQuestions.deleteEmployeeQuestions(updatedEmployeeList))
    .then((result) => {
      const deleteEmployeeQuery = `DELETE FROM employee WHERE CONCAT(first_name," ",last_name)=?`;
      db.promise()
        .query(deleteEmployeeQuery, result.employeeName)
        .then(() => {
          console.log(`Deleted ${result.employeeName} from employee table`);
          init();
        });
    });
}

async function viewBudget() {
  const updatedDepartmentList = await getUpdatedDepartmentList();
  inquirer
    .prompt(inquirerQuestions.viewBudgetQuestions(updatedDepartmentList))
    .then((result) => {
      const viewBudgetQuery = `SELECT department.name AS department,SUM(salary) AS budget FROM role JOIN department ON role.department_id=department.id GROUP BY department.name HAVING department.name=?`;
      db.promise()
        .query(viewBudgetQuery, result.departmentName)
        .then(([rows, fields]) => {
          console.table(rows);
          init();
        });
    });
}

function handleChoice(choice) { 
    switch (choice) {
      case "View all departments":
        viewAllDepartments();
        break;
      case "View all roles":
        viewAllRoles();
        break;
      case "View all employees":
        viewAllEmployees();
        break;
      case "Add a department":
        addNewDepartment();
        break;
      case "Add a role":
        addNewRole();
        break;
      case "Add an employee":
        addNewEmployee();
        break;
      case "Update an employee role":
        updateEmployeeRole();
        break;
      case "Update employee managers":
        updateEmployeeManager();
        break;
      case "View employees by manager":
        viewEmployeeByManager();
        break;
      case "View employees by department":
        viewEmployeeByDepartment();
        break;
      case "Delete departments":
        deleteDepartment();
        break;
      case "Delete roles":
        deleteRole();
        break;
      case "Delete employees":
        deleteEmployee();
        break;
      case "View the total utilized budget of a department":
        viewBudget();
        break;
    }
}

module.exports = {
  init,
}
