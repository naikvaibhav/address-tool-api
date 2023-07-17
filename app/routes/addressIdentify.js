const addressIdentifyController = require("./../controllers/addressIdentifyController");
const appConfig = require("../../config/appConfig");


const setRouter = (app) => {
    // let baseUrl = `${appConfig.apiVersion}`;
    // defining routes
    // params: address
    app.post(`/validate`, addressIdentifyController.validateFunction);
}

module.exports = {
   setRouter: setRouter
};