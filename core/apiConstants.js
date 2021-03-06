module.exports = {
  // statusCode section is copied from server part
  // it needs to be the same to have the same status code
  statusCode: {
    success: 1,
    databaseRelatedError: 6000,
    requiredParamsMissingError: 6001,
    httpError: 6002,
    responseIsNull: 6003,
    jsonParsedError: 6004,
    httpResponseErrorEvent: 6005,
    httpRequestErrorEvent: 6006,
    internetConnectionError: 6006,
    invalidAccessToken: 6007,
    sessionKeyAndOpenIdRequestError: 6008,
    openIdNotMatch: 6009,
    unknownError: 9999
  },
  headerKey: {
    userToken: "<your token name here>"
  }
}