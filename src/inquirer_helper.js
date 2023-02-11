const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const inquirerQuestions = require("./inquirer_questions");
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

function getEmployeeList() { 
    const employeeListQuery = `SELECT CONCAT(first_name," ",last_name) AS name FROM employee`;
    db.query(employeeListQuery, function (err, results) {
      const employeeList = results.map((e) => e.name);
      return employeeList;
    });
}

function getRoleList() { 
    const roleListQuery = 'SELECT title FROM role';
    db.query(roleListQuery, function (err, results) {
      const roleList = results.map((e) => e.title);
      return roleList;
    });
}

const init = function () { 
    // const db = mysql.createConnection(
    //   {
    //     host: "localhost",
    //     // MySQL username,
    //     user: "root",
    //     // MySQL password
    //     password: "aaaaaaaa",
    //     database: "company_db",
    //   },
    //   console.log(`Connected to the company_db database.`)
    // );

    // var employeeList = getEmployeeList();
    // var roleList = getRoleList();
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
      "SELECT role.id,role.title,department.name AS department,role.salary FROM role JOIN department ON role.department_id=department.id";
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
    }
}

init();