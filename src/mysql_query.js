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
