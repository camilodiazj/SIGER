const express = require('express');
const pool = require('../database');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const path = require('path');

router.get('/add', isLoggedIn, async(req, res) => {
    program = await pool.query('select P.name, P.id from USERS U, PROGRAM P, USER_PROGRAM UP WHERE U.no_id = UP.id_user AND P.id = UP.id_program AND U.no_id = ?', req.user.no_id);
    console.log(program);
    res.render('links/add', { program });
});

router.post('/add', isLoggedIn, async (req, res) => {
    console.log(req.body);
    if (req.files) {
        const rows = await pool.query('SELECT U.no_id, IFNULL(P.max_id,0)+1 max_id FROM (select user_id,max(id) max_id from LINKS group by user_id) P RIGHT JOIN USERS U ON U.id = P.user_id where U.id = ?', req.user.id);
        const user = rows[0];
        const file = req.files.file;
        file.mv(`./src/upload/${user.no_id}${user.max_id}${file.name}`, err => {
            if (err) return res.status(500).send({ message: err });
        });
        const { title, description } = req.body;
        const newLink = {
            title: req.body.request,
            file_name: user.no_id + user.max_id + file.name,
            description,
            user_id: req.user.id,
            status: 'En proceso',
            id_subject: req.body.subject
        };
        await pool.query('INSERT INTO LINKS SET ?', [newLink]);
        req.flash('success', 'Solicitud guardada');
        res.redirect('/links');
    } else {
        req.flash('message', 'No se ha encontrado archivo adjunto');
        res.redirect('/links/add');
    }
});


router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query('SELECT * FROM LINKS WHERE user_id = ?', req.user.id);
    res.render('links/list', { links });
});
//camilo


router.get('/requests', isLoggedIn, async (req, res) => {
    const user_rows = await pool.query('SELECT user_mode FROM USERS where id = ?', req.user.id);
    const user_mode = user_rows[0].user_mode;

    if (user_mode == 'COMITE' || user_mode == 'ADMINISTRADOR') {
        const links = await pool.query('SELECT concat(u.last_name," ", u.name   ) fullname ,u.no_id cedula, u.email correo, l.title title, l.description description, l.created_at created_at, l.status status, l.id id, l.file_name file_name, p.name program FROM USERS u JOIN LINKS l on u.id = l.user_id JOIN USER_PROGRAM ps on u.no_id = ps.id_user JOIN PROGRAM p on ps.id_program = p.id;');
        res.render('links/list2', { links });
    } else {
        res.redirect('/profile');
    };

});


router.post('/status1/', isLoggedIn, async (req, res) => {
    const { id, file } = req.body;
    await pool.query('UPDATE LINKS set status = "APROBADA" where id = ?', [id]);
    req.flash('success', 'Solicitud aprobada exitosamente');
    res.redirect('/links/requests');
});

router.post('/status2/', isLoggedIn, async (req, res) => {
    const { id, file } = req.body;
    await pool.query('UPDATE LINKS set status = "RECHAZADA" where id = ?', [id]);
    req.flash('success', 'Solicitud rechazada exitosamente');
    res.redirect('/links/requests');
});




//camilo
router.post('/delete/', isLoggedIn, async (req, res) => {
    const { id, file } = req.body;
    const fs = require('fs');
    fs.unlink(path.join(__dirname, `../upload/${file}`), (err) => {
        if (err) throw err;
    });
    await pool.query('DELETE FROM LINKS WHERE ID = ?', [id]);
    req.flash('success', 'Solicitud borrada correctamente');
    res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const bolean = await pool.query('SELECT id FROM LINKS WHERE id = ? AND user_id = ?', [id, userId]);
    if (bolean[0]) {
        return next();
    }
    else {
        return res.redirect('/links')
    }
}, async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM LINKS WHERE ID = ?', [id]);
    res.render('links/edit', { links: links[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const newLink = {
        title,
        description
    };
    await pool.query('UPDATE LINKS SET ? WHERE ID = ?', [newLink, id]);
    res.redirect('/links');
});

router.post('/download/', isLoggedIn, async (req, res) => {
    const { id } = req.body;
    const file = await pool.query('SELECT file_name FROM LINKS WHERE ID = ?', id);
    res.download(path.join(__dirname, `../upload/${file[0].file_name}`));
});

module.exports = router;