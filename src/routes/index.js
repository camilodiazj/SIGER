const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    const noReg = {
        noReg: 'default'
    };
    res.render('index', { noReg });
});


module.exports = router;