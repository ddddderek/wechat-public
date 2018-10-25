module.exports = {
	port: 3000,
	db: 'mongodb://localhost/public',
	baseUrl: 'http://derek.vipgz1.idcfengye.com/',
	wechat:{
		appID: 'wx880680f7ad1e2b15',
		appSecret: 'c57e417cea0100256cf6da6f29a72860',
		token: 'wechatisreallynice123'
	},
	isWechat: function (ua) {
	  if (ua.indexOf('MicroMessenger') >= 0) {
	    return true
	  } else {
	    return false
	  }
	}
}