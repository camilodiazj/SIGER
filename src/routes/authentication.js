const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const crypto = require('crypto');
const pool = require('../database');
const helpers = require('../lib/helpers');
const sgMail = require('@sendgrid/mail');

router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('auth/signup');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, async (req, res, next) => {
    const user_rows = await pool.query('SELECT user_mode FROM USERS WHERE username = ?', req.body.username);
    if (user_rows.length > 0) {
        const userm = user_rows[0].user_mode;
        if (userm == 'COMITE' || userm == 'ADMINISTRADOR') {
            passport.authenticate('local.signin', {
                successRedirect: '/links/requests',
                failureRedirect: '/signin',
                failureFlash: true
            })(req, res, next);
        } else if (userm == 'ESTUDIANTE') {
            passport.authenticate('local.signin', {
                successRedirect: '/profile',        
                failureRedirect: '/signin',
                failureFlash: true
            })(req, res, next);
        }
    } else {
        passport.authenticate('local.signin', {
            successRedirect: '/links/requests',
            failureRedirect: '/signin',
            failureFlash: true
        })(req, res, next);
    }
});

router.get('/forgot', isNotLoggedIn, (req, res) => {
    res.render('auth/forgot');
});

router.post('/forgot', isNotLoggedIn, async (req, res) => {
    const token = await crypto.randomBytes(20).toString('hex');
    const bolean = await pool.query('SELECT email FROM USERS WHERE email = ?', req.body.email);

    if (!bolean[0]) {
        req.flash('message', 'No hay cuentas registradas con ese email');
        return res.redirect('/forgot');
    }

    await pool.query('UPDATE USERS SET token = ?, token_life = ? WHERE email = ?', [token, Date.now() + 3600000, req.body.email]);

    try {
        sgMail.setApiKey('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');
        const msg = {
            to: req.body.email,
            from: 'resetPassword@gaemcdj.com',
            subject: 'Restablecer contraseña',
            text: 'Estas recibiendo este correo porque tú (o alguien más) solicitó restablecer la contraseña para tu cuenta.\n\n' +
                'Por favor da click en el siguiente link, o pegalo en tu navegador para completar el proceso:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'Recuerda que el link es valido por una hora.\n\n' +
                'Si no lo solicitaste, por favor haz caso omiso a este email y tu contraseña permanecerá intacta :D.',
        };
        await sgMail.send(msg);
        req.flash('success', 'Te hemos enviado un correo a tu correo institucional, revisa spam si no lo encuentras en tu bandeja de entrada');
        res.redirect('/signin');
    } catch (err) {
        console.log(err);
    }

});

router.get('/reset/:token', async (req, res) => {
    const bolean = await pool.query('SELECT token FROM USERS WHERE token = ? AND token_life > ?', [req.params.token, Date.now()]);
    if (!bolean[0]) {
        req.flash('message', 'El link es invalido o ha expirado');
        return res.redirect('/signin');
    }
    console.log(bolean);
    res.render('auth/reset', bolean[0]);
});

router.post('/reset/:token', async (req, res) => {
    password = await helpers.encryptPassword(req.body.password);
    await pool.query('UPDATE USERS SET password = ?, token = "", token_life = 0 WHERE token = ?', [password, req.params.token]);
    req.flash('success', 'Tu contraseña ha sido cambiada');
    res.redirect('/signin');
});

router.get('/profile', isLoggedIn, async(req, res) => {
    const user = req.user.id;
    var query = 'SELECT P.P, A.A, R.R FROM ';
    query += '(SELECT 1, COUNT(1) P FROM LINKS WHERE user_id = ? AND STATUS = "EN PROCESO") P, ';
    query += '(SELECT 1, COUNT(1) A FROM LINKS WHERE user_id = ? AND STATUS = "APROBADA") A, ';
    query += '(SELECT 1, COUNT(1) R FROM LINKS WHERE user_id = ? AND STATUS = "RECHAZADA") R ';
    query += 'WHERE P.1 = A.1 AND P.1 = R.1';
    const links_count = await pool.query(query, [ user, user, user ]);
    const udata = await pool.query('select CONCAT(UPPER(LEFT(u.name, 1)), LOWER(SUBSTRING(u.name, 2))," ",UPPER(LEFT(u.last_name, 1)), LOWER(SUBSTRING(u.last_name, 2))) name, p.name program from PROGRAM p join USER_PROGRAM up on p.id = up.id_program join USERS u on up.id_user = u.no_id where u.id = ?', user);
    const process_data = await pool.query('SELECT * FROM LINKS WHERE STATUS = "EN PROCESO" and user_id = ?', user);
    const approved_data = await pool.query('SELECT * FROM LINKS WHERE STATUS = "APROBADA" and user_id = ?', user);
    const denied_data = await pool.query('SELECT * FROM LINKS WHERE STATUS = "RECHAZADA" and user_id = ?', user);
    const program = await pool.query('select p.name name from PROGRAM p join USER_PROGRAM up on p.id = up.id_program join USERS u on up.id_user = u.no_id where u.id = ?', user);
    console.log(udata);
    const approve = links_count[0].A;
    const process = links_count[0].P;
    const denied = links_count[0].R;
    res.render('profile',{ approve, process, denied, udata, process_data, approved_data, denied_data, program });
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/signin');
});

module.exports = router;
