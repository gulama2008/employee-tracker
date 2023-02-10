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
    var employeeList = getEmployeeList();
    var roleList = getRoleList();
    inquirer
        .prompt(inquirerQuestions.mainMenuQuestions)
        .then()
}