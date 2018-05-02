require('express-async-errors');
const winston = require('winston');


module.exports = function() {

  // It handles all of the unhandled exceptions, but not the promise rejections
  // So to make it work for both, on every 'unhandledRejection' event throw an unhandled exception that it can catch
  // Winston logs the error then terminate the process
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'logfile.log' }
  ));

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

};
