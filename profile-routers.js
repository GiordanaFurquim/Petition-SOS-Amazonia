const express = require('express');
const router = exports.router = express.Router();
//Add app.get and change them to router.get and require this file on my index.js
// const profileRouter = require('./profile-routes');
// you still have to require db and other things too
//you would have ti require middleware functions(if your profile routes use them)
//it is also necessary to have a middleware function on my index.js and it doesn'// TEMP: matter where are
//write them, it is only important to e above the server request:
//app.use(profileRouter());

router.get('/profile'), (request, response) => {
    console.log(response);
};
