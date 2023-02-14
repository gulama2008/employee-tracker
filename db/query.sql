-- SELECT DISTINCT CONCAT(m.first_name," ",m.last_name) as name 
-- FROM employee e 
-- JOIN employee m 
-- ON e.manager_id=m.id
-- WHERE e.manager_id IS NOT NULL;

-- SELECT CONCAT(e.first_name," ",e.last_name) as name FROM employee e JOIN employee m ON e.manager_id=m.id WHERE CONCAT(m.first_name," ",m.last_name)="John Doe";

-- select CONCAT(first_name," ",last_name) as name FROM (employee e join role r on e.role_id=r.id) join department d on r.department_id=d.id where d.name="Sales";

select department.name as department,SUM(salary) as budget from role join department on role.department_id=department.id group by department.name having department.name="Sales";