
module.exports = {
  retryCooldown: 3000,   // retry cooldown in ms
  retryCount: 3, // number of retry for certain operation
  version: '0.0.1', // version number for heatap
  userInfoUpdateExpiredDuration: 7889238000,  // in millisecond (3 months = 7889238000 millsecond)

  endPoint: "<your end-point url here>",
  
  dataKey: {
    userToken: 'userToken',
    userInfo: 'userInfo',

    systemInfo: 'systemInfo',
    language: 'language',
    updateUserInfoTimestampToServer: 'updateUserInfoTimestampToServer'
  }
}