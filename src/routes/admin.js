const express = require('express');
const pool = require('../database');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');

router.get('/users', isLoggedIn, async (req, res) => {
    if (req.user.user_mode == 'ADMINISTRADOR') {
        const users = await pool.query('SELECT * FROM USERS');
        return res.render('admin/users', { users });
    }
    res.redirect('/');
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    if (req.user.user_mode == 'ADMINISTRADOR') {
        await pool.query('DELETE FROM LINKS WHERE user_id = ?', req.params.id);
        await pool.query('DELETE FROM USERS WHERE no_id = ?', req.params.id);
        return res.redirect('/admin/users');
    }
    res.redirect('/');
});

router.get('/load', isLoggedIn, async (req, res) => {
    if (req.user.user_mode == 'ADMINISTRADOR') {
        return res.render('admin/load');
    }
    res.redirect('/');
});

router.post('/load', isLoggedIn, async (req, res) => {
    if (req.files) {
        const file = req.files.file;
        const table = req.body.tableName;
        file.mv(`./src/documents/${file.name}`, err => {
            if (err) return res.status(500).send({ message: err });
        });
        const filePath = path.join(__dirname, `../documents/${file.name}`);
        await pool.query(`LOAD DATA LOCAL INFILE ? INTO TABLE ${table} FIELDS TERMINATED BY "," LINES TERMINATED BY "\n"; commit;`, filePath);
        fs.unlink(filePath, (err) => {
            if (err) throw err;
        });
        req.flash('success', 'El cargue ha finalizado correctamente');
        res.redirect('/admin/load');
    } else {
        req.flash('message', 'No se ha encontrado archivo adjunto');
        res.redirect('/admin/load');
    }
});

router.post('/download', isLoggedIn, (req, res) => {
    file_name = req.body.fileName;
    res.download(path.join(__dirname, `../documents/guide/${file_name}`));
});

router.post('/subject',  async (req, res) => {
    console.log(req.body);
    subjects = await pool.query('select S.id subject_id, S.name subject_name from SUBJECT S, PROGRAM P, PROGRAM_SUBJECT PS WHERE S.id = PS.id_subject AND P.id = PS.id_program AND P.id = ?', req.body.program);
    res.send(subjects);
});

router.get('/report', isLoggedIn, async (req, res) => {
    const today = new Date();
    const date = today.getFullYear() + '' + (today.getMonth() + 1) + '' + today.getDate();
    const time = today.getHours() + '' + today.getMinutes();
    const dateTime = date + '' + time;
    const data = await pool.query('SELECT @a:=@a+1 No, p.name Programa, p.curriculum PlanEstudios, u.no_id DocIdentidad, u.name Nombres, u.last_name Apellidos, s.name Asignatura, s.id Codigo, l.description Justificacion FROM USERS u, PROGRAM p, USER_PROGRAM up, LINKS l,  SUBJECT s, (SELECT @a:= 0) AS a WHERE u.no_id = up.id_user AND p.id = up.id_program AND l.user_id = u.id AND l.id_subject = s.id');
    const filePath = path.join(__dirname, `../documents/temp/rep${dateTime}.csv`);
    const file = fs.createWriteStream(filePath);
    fastcsv.write(data, {
        headers: true
    }).pipe(file)
        .on('finish', () => {
            res.download(filePath, (err) => {
                if (err) throw err;
                else {
                    fs.unlink(filePath, (err) => {
                        if (err) throw err;
                    });
                }
            });
        });
});

router.get('/reboot', isLoggedIn, async (req, res) => {
    var query = 'SET FOREIGN_KEY_CHECKS=0;';
    query += 'TRUNCATE TABLE PROGRAM_SUBJECT;';
    query += 'TRUNCATE TABLE USER_PROGRAM;';
    query += 'TRUNCATE TABLE PROGRAM;';
    query += 'TRUNCATE TABLE SUBJECT;';
    query += 'TRUNCATE TABLE LINKS;';
    query += 'DELETE FROM USERS WHERE USER_MODE <> "ADMINISTRADOR";';
    query += 'ALTER TABLE USERS AUTO_INCREMENT = 0;';
    query += 'ALTER TABLE LINKS AUTO_INCREMENT = 0;';
    query += 'SET FOREIGN_KEY_CHECKS=1;';
    pool.query(query);
    req.flash('success', 'Base de datos reiniciada correctamente');
    res.redirect('/admin/load');
});

router.get('/test', (req, res) => {
    res.render('admin/test');
});

module.exports = router;


router.get('/newUser', isLoggedIn, async (req, res) => {
    if (req.user.user_mode == 'ADMINISTRADOR') {
        const users = await pool.query('SELECT * FROM USERS');
        return res.render('admin/newUser', { users });
    }
    res.redirect('/');
});

router.post('/addNewUser', isLoggedIn, async (req, res) => {
    console.log(req.body);
        const newLink = {
            no_id: req.body.idUser,
            email: req.body.email,
            name: req.body.name,
            last_name: req.body.last_name,
            user_mode: req.body.request,
        }; 
        await pool.query('INSERT INTO USERS SET ?', [newLink]);
        req.flash('success', 'Usuario creado');
        res.redirect('/admin/users');
    
});