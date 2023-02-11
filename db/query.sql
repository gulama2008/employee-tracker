SELECT * FROM employee;
SELECT e.id,e.first_name,e.last_name,title,department.name AS department,salary,CONCAT(m.first_name,' ',m.last_name) AS manager 
FROM (
    (employee e 
    JOIN role 
    ON e.role_id=role.id) 
    JOIN department 
    ON role.department_id=department.id) 
    LEFT JOIN employee m 
    ON e.manager_id=m.id;

SELECT * FROM department;

-- DELETE FROM department WHERE id=5;