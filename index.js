const winston = require('winston');
const express = require('express');
const app = express();


require('./startup/logging')(); // Load logging first
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();


const port = process.env.port || 3000;
app.listen(port, () => winston.info(`Server is listening on port: ${port}`));
