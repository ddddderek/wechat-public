const request = require('request-promise')
const base = 'https://api.weixin.qq.com/sns'
const api = {
	authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
	access_token: base + '/oauth2/access_token?',
	userInfo: base + '/userinfo?'
}
module.exports = class WechatOAth {
	constructor (opts) {
		this.appID = opts.appID
		this.appSecret = opts.appSecret
	} 

	async request(options) {
		options = Object.assign({}, options, {json:true})
		console.log('检查请求参数')
		console.log(options)

		try {
			const res = await request(options)

			return res
		} catch (err) {
			console.log(err)
		}
	}

	//详细信息/主动授权 snsapi_userinfo
	//基本信息/静默授权 snsapi_base
	getAuthorizeURL (scope = 'snsapi_base', target, state) {
		const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURI(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
		
		return url
	}

	//通过授权code获取用户网页中的token和openid
	async fetchAccessToken (code) {
		const url = `${api.access_token}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`

		const res = await this.request({url})

		console.log(res)

		return res
	}
	
	//根据token和openid获取用户详细信息
	async getUserInfo (token, openID, lang="zh_CN") {
		const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`

		const res =  await this.request({url})

		return res
	}
		
}