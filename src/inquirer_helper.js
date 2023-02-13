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


function getUpdatedEmployeeList() { 
    const employeeListQuery = `SELECT CONCAT(first_name," ",last_name) AS name FROM employee`;
    db.query(employeeListQuery, function (err, results) {
      const employeeList = results.map((e) => e.name);
      return employeeList;
    });
}



const init = function () {  
    inquirer
        .prompt(inquirerQuestions.mainMenuQuestions)
        .then(result => { 
            // console.log(result);
            if (result.choice === "Quit employee-tracker") {
                return;
            } else { 
                handleChoice(result.choice);
            }        
        })
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
      "SELECT e.id,e.first_name,e.last_name,title,department.name AS department,salary,CONCAT(m.first_name,' ',m.last_name) AS manager FROM ((employee e JOIN role ON e.role_id=role.id) JOIN department ON role.department_id=department.id) LEFT JOIN employee m ON e.manager_id=m.id ORDER BY e.id"; 
    db
      .promise()
      .query(query)
      .then(([rows, fields]) => {
          console.table(rows);
          init();
      })
      .catch(console.log)
}

function addDepartment() { 
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

function addNewRole() {
  const departmentListQuery = `SELECT name FROM department`;
  db.promise()
    .query(departmentListQuery)
    .then(([rows, fields]) => {
      const updatedDepartmentList = rows.map((e) => e.name);
      console.log(updatedDepartmentList, 111);
      addRole(updatedDepartmentList);
    })
    .catch(console.log);
}

function addRole(updatedDepartmentList) {
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
          console.log(params, 1);
          return params;
        })
        .then((params) => {
          console.log(params, 2);
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

function addNewEmployee() {
    const roleListQuery = `SELECT title FROM role`;
    db.promise()
      .query(roleListQuery)
      .then(([rows, fields]) => {
        const updatedRoleList = rows.map((e) => e.title);
        console.log(updatedRoleList, 111);
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
            console.log(params, 1);
            const getManagerIdByName = `SELECT id FROM employee WHERE CONCAT(first_name," ",last_name)=?`;
            db.promise()
              .query(getManagerIdByName, result.employeeManager)
              .then(([rows, fields]) => {
                params.push(rows[0].id);
                console.log(params, 1);
                return params;
              })
              .then((params) => {
                console.log(params, 2);
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
            addDepartment();
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
    }
}

init();