CREATE DATABASE SIGER_DB;

USE SIGER_DB;

-- USERS TABLE
CREATE TABLE USERS(
    id INT(11) PRIMARY KEY,
    username VARCHAR(16) NOT NULL DEFAULT "",
    password VARCHAR(60)
);

ALTER TABLE USERS
    MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

ALTER TABLE USERS 
    ADD COLUMN no_id VARCHAR(15); 

ALTER TABLE USERS 
    ADD COLUMN token VARCHAR(50);

ALTER TABLE USERS
    ADD COLUMN email VARCHAR(40) NOT NULL;

ALTER TABLE USERS 
    ADD COLUMN token_life NUMERIC(15);

ALTER TABLE USERS
    ADD COLUMN name VARCHAR(60);

ALTER TABLE USERS
    ADD COLUMN last_name VARCHAR(60);

ALTER TABLE USERS
    ADD COLUMN user_mode VARCHAR(20) not null DEFAULT 'ESTUDIANTE';

ALTER TABLE USERS
    ADD CONSTRAINT PRIMARY KEY(no_id)

-- LINKS TABLE
CREATE TABLE LINKS(
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES USERS(id)
);

ALTER TABLE LINKS ADD COLUMN status VARCHAR(10);

ALTER TABLE LINKS 
    CHANGE COLUMN url file_name VARCHAR(70);

ALTER TABLE LINKS 
    ADD PRIMARY KEY(id);

ALTER TABLE LINKS
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

ALTER TABLE LINKS 
    ADD id_subject VARCHAR(10),
    ADD CONSTRAINT fk_subject_links FOREIGN KEY (id_subject) REFERENCES SUBJECT(id);

--SUBJECT TABLE

CREATE TABLE SUBJECT (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(40) NOT NULL
);

--PROGRAM TABLE 

CREATE TABLE PROGRAM (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(40) NOT NULL
);

ALTER TABLE PROGRAM
    ADD curriculum int(10) NOT NULL

--PROGRAM-SUBJECT 
CREATE TABLE PROGRAM_SUBJECT (
    id_program VARCHAR(10),
    id_subject VARCHAR(10),
    CONSTRAINT fk_program FOREIGN KEY (id_program) REFERENCES PROGRAM(id),
    CONSTRAINT fk_subject FOREIGN KEY (id_subject) REFERENCES SUBJECT(id)
);

ALTER TABLE PROGRAM_SUBJECT
    ADD PRIMARY KEY(id_program, id_subject);

--USER_PROGRAM
CREATE TABLE USER_PROGRAM (
    id_program VARCHAR(10),
    id_user INT(11),
    CONSTRAINT fk_program_up FOREIGN KEY (id_program) REFERENCES PROGRAM(id)
);

ALTER TABLE USER_PROGRAM  
    ADD PRIMARY KEY(id_program, id_user);
    
--REBOOT BD

TRUNCATE TABLE PROGRAM_SUBJECT;
TRUNCATE TABLE USER_PROGRAM; 
TRUNCATE TABLE SUBJECT;
TRUNCATE TABLE PROGRAM;
TRUNCATE TABLE LINKS;
DELETE FROM USERS WHERE USER_MODE <> 'ADMINISTRADOR';
--DELETE FROM sessions;
ALTER TABLE USERS AUTO_INCREMENT = 0;
ALTER TABLE LINKS AUTO_INCREMENT = 0;



-- FROM CSV

LOAD DATA LOCAL INFILE ? INTO TABLE USERS FIELDS TERMINATED BY "," LINES TERMINATED BY "\n";


-- QUERY REPORTE

SELECT @a:=@a+1 No, p.name Programa, p.curriculum PlanEstudios, u.no_id DocIdentidad, u.name Nombres, u.last_name Apellidos, s.name Asignatura, s.id Codigo, l.description Justificacion FROM USERS u, PROGRAM p, USER_PROGRAM up, LINKS l,  SUBJECT s, (SELECT @a:= 0) AS a WHERE u.no_id = up.id_user AND p.id = up.id_program AND l.user_id = u.id AND l.id_subject = s.id;


/home/alex/Documents/SIGER/src/documents/guide/PlantillaCargueMaterias_Programa.csv

SELECT U.no_id, IFNULL(P.max_id,0)+1 FROM (select user_id,max(id) max_id from LINKS group by user_id) P RIGHT JOIN USERS U ON U.id = P.user_id where U.id = 3


insert into USERS(username, email, user_mode) values ('camilo.diazj','camilo.diazj@utadeo.edu.co','COMITE');
insert into USERS(username, email) values ('camilodzjm','camilodiazjaimes@gmail.com');
INSERT INTO LINKS(id, title, file_name, description, user_id) values (1, 'hola', 'asdfadsf.txt', 'holaahola',2);




SELECT concat(u.name ," ", u.last_name, " ", u.no_id) fullname , u.email correo, l.title title, l.description description, l.created_at created_at, l.status status, l.id id, l.file_name file_name FROM USERS u JOIN LINKS l on u.id = l.user_id;

UPDATE USERS
set no_id = 1073176147
where id = 2;

UPDATE USERS
set name = 'Camilo', last_name = 'Diaz'
where id = 2;

SELECT P.P, A.A, R.R FROM (SELECT 1, COUNT(1) P FROM LINKS WHERE user_id = 41 AND STATUS = "EN PROCESO") P,(SELECT 1, COUNT(1) A FROM LINKS WHERE user_id = 41 AND STATUS = "APROBADA") A,(SELECT 1, COUNT(1) R FROM LINKS WHERE user_id = 41 AND STATUS = "RECHAZADA") R WHERE P.1 = A.1 AND P.1 = R.1



select p.name from PROGRAM p join USER_PROGRAM up on p.id = up.id_program join USERS u on up.id_user = u.no_id where u.id = 1;


select CONCAT(UPPER(LEFT(u.name, 1)), LOWER(SUBSTRING(u.name, 2))," ",UPPER(LEFT(u.last_name, 1)), LOWER(SUBSTRING(u.last_name, 2))) last_name, p.name from PROGRAM p join USER_PROGRAM up on p.id = up.id_program join USERS u on up.id_user = u.no_id where u.id = 1;


1023974030

UPDATE USER_PROGRAM set id_program = '2' where id_user = 1023974030;
SELECT concat(u.last_name," ", u.name   ) fullname ,u.no_id cedula, u.email correo, l.title title, l.description description, l.created_at created_at, l.status status, l.id id, l.file_name file_name, p.name program FROM USERS u JOIN LINKS l on u.id = l.user_id JOIN USER_PROGRAM ps on u.no_id = ps.id_user JOIN PROGRAM p on ps.id_program = p.id;