const winston = require('winston');
const express = require('express');
const app = express();


require('./startup/logging')(); // Load logging first
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const port = process.env.port || 3000;
const server = app.listen(port, () => winston.info(`Server is listening on port: ${port}`));


module.exports = server;
