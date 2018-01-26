/**
 * App-level
 *
 * Provide management of overall of user's preference through localstorage.
 */

var localstorage = require('../utils/localstorage.js');
var config = require('../core/config.js');

var obj = {

	/**
	 * Save specified language to disk.
	 * @param  {String} language Language string
	 */
	saveToDiskForLanguage: function(language) {
		localstorage.set(config.dataKey.language, language);
	},

	/**
	 * Get language.
	 */
	getLanguageSync: function() {
		return localstorage.getSync(config.dataKey.language);
	},

	/**
	 * Save to disk for userInfo to server.
	 * @param  {Number} timestamp Unix timestamp of updating time of userinfo to server.
	 */
	saveToDiskForUpdateUserInfoTimestampToServer: function(timestamp) {
		localstorage.set(config.dataKey.updateUserInfoTimestampToServer, timestamp);
	},

	/**
	 * Get whether userInfo has been updated to server.
	 * @return {Object} Promise object
	 */
	getUpdateUserInfoTimestampToServer: function() {
		return new Promise((resolve, reject) => {
			localstorage.get(config.dataKey.updateUserInfoTimestampToServer)
				.then((data) => {
					resolve(data);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
};

module.exports = obj;