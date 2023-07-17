let appConfig = {};

appConfig.port = 3001;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.apiVersion = "/api/v1";

module.exports = {
  port: appConfig.port,
  allowedCorsOrigin: appConfig.allowedCorsOrigin,
  environment: appConfig.env,
  apiVersion: appConfig.apiVersion,
};