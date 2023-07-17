const express = require('express');

const appConfig = require("./config/appConfig");
const app = express();
const fs = require('fs')
const http = require("http");
// const prompt = require('prompt-sync')();
const bodyParser = require("body-parser");
const logger = require("./app/libs/loggerLib");
const routeLoggerMiddleware = require("./app/middlewares/routeLogger.js");
const globalErrorMiddleware = require("./app/middlewares/appErrorHandler");
// const addressIdentifyController = require("./app/controllers/addressIdentifyController");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);


const controllersPath = "./app/controllers";
const libsPath = "./app/libs";
const middlewaresPath = "./app/middlewares";
const routesPath = "./app/routes";


app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

  // Bootstrap route
  fs.readdirSync(routesPath).forEach(function (file) {
    if (file.includes(".js")) {
      let route = require(`${routesPath}/${file}`);
      route.setRouter(app);
    }
  });
  // end bootstrap route


// calling global 404 handler after route
app.use(globalErrorMiddleware.globalNotFoundHandler);
// end global 404 handler


/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
    if (error.syscall !== "listen") {
        logger.error(`${error.code} not equal listen`, `serverOnErrorHandler`, 10);
        // logger.error(error.code + " not equal listen", "serverOnErrorHandler", 10);
        throw error;
      }
    
      // handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          logger.error(
            `${error.code} :elavated privileges required`,
            `serverOnErrorHandler`,
            10
          );
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(
            `${error.code} :port is already in use.`,
            `serverOnErrorHandler`,
            10
          );
          process.exit(1);
          break;
        default:
          logger.error(
            `${error.code} :some unknown error occured`,
            `serverOnErrorHandler`,
            10
          );
          throw error;
      }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    logger.info(
      `server listening on port: ${addr.port}`,
      `serverOnListeningHandler`,
      10
    );
}


/**
 * Create HTTP server.
 */
const server = http.createServer(app);
server.listen(appConfig.port);
server.on("error", onError);
server.on("listening", onListening);


process.on('unhandledRejection',(reason,p)=>{
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
// application specific logging, throwing an error, or other logic here
});





// app.post("/validate", addressIdentifyController.validateFunction);
// app.listen(3000, () => {
//     console.log('server started on port 3000');
// });