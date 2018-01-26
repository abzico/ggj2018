const permTokenFlow = require('flow/perm-token.js');
const api = require('core/api.js')

//app.js
App({
  onLaunch: function () {
    // ask this here so user can go to the app from any possible way, it will ask for such permision and try to get access token
    // ask user for allowing permission, and try to get access token (thus login in the process)
    var that = this;
    permTokenFlow.askToAuthorizeNecessaryScopes()
      .then(() => {
        console.log('user allowed all permissions');

        // try to get access token
        api.syncTokenAndUserInfo()
          .then(function() {
            // update user info (if not yet)
            permTokenFlow.updateUserInfoToServerIfNeeded();
          })
          .catch(function(err) {
            console.log(err);
          });

      }, () => {
        console.log('error from asking permissions from user.');
      })

    // get system info and save it to global data
    var res = wx.getSystemInfoSync();
    this.globalData.systemInfo = res;
  },

  // global data maintained at app-level
  globalData: {
    systemInfo: null,
  }
})