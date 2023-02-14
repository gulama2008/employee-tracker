const mainMenuQuestions = [
    {
        type: "list",
        choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Update employee managers",
        "View employees by manager",
        "View employees by department",
        "Delete departments",
        "Delete roles",
        "Delete employee",
        "View the total utilized budget of a department",
        "Quit employee-tracker"
        ],
        message: "What would you like to do?",
        name: "choice",
    },
];

const addDepartmentQuestions = [
    {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName",
    }
];

function addNewRoleQuestions(choices) {
    return [
      {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role?",
        name: "roleSalary",
      },
      {
        type: "list",
        choices: choices,
        message: "Which department does the role belong to?",
        name: "roleDepartment",
      },
    ];

}

function addNewEmployeeQuestions(roleChoices,managerChoices) { 
    return [
      {
        type: "input",
        message: "What is the first name of the employee?",
        name: "employeeFirstName",
      },
      {
        type: "input",
        message: "What is the last name of the employee?",
        name: "employeeLastName",
      },
      {
        type: "list",
        choices:roleChoices,
        message: "What is the role of the employee?",
        name: "employeeRole",
      },
      {
        type: "list",
        choices:managerChoices,
        message: "Who is the manager of the employee?",
        name: "employeeManager",
      },
    ];
}

function updateEmployeeRoleQuestions(employeeChoices,roleChoices) { 
    return [
      {
        type: "list",
        choices: employeeChoices,
        message: "Which employee would you like to update?",
        name: "employeeToUpdate",
      },
      {
        type: "list",
        choices: roleChoices,
        message: "What is the new role of this employee?",
        name: "employeeNewRole",
      },
    ];
}

function updateEmployeeManagerQuestions(employeeChoices) {
  return [
    {
      type: "list",
      choices: employeeChoices,
      message: "Which employee would you like to update?",
      name: "employeeToUpdate",
    },
    {
      type: "list",
      choices: employeeChoices,
      message: "What is the new manager of this employee?",
      name: "employeeNewManager",
    },
  ];
}

function viewEmployeeByManagerQuestions(choices) {
  return [
    {
      type: "list",
      choices: choices,
      message: "Which manager's employees would you like to view?",
      name: "managerName",
    },
  ];
}

function viewEmployeeByDepartmentQuestions(choices) {
  return [
    {
      type: "list",
      choices: choices,
      message: "Which department's employees would you like to view?",
      name: "departmentName",
    },
  ];
}

function deleteDepartmentQuestions(choices) {
  return [
    {
      type: "list",
      choices: choices,
      message: "Which department would you like to delete?",
      name: "departmentName",
    },
  ];
}

function deleteRoleQuestions(choices) {
  return [
    {
      type: "list",
      choices: choices,
      message: "Which role would you like to delete?",
      name: "roleTitle",
    },
  ];
}

module.exports = {
  mainMenuQuestions,
  addDepartmentQuestions,
  addNewRoleQuestions,
  addNewEmployeeQuestions,
  updateEmployeeRoleQuestions,
  updateEmployeeManagerQuestions,
  viewEmployeeByManagerQuestions,
  viewEmployeeByDepartmentQuestions,
  deleteDepartmentQuestions,
  deleteRoleQuestions,
};