const request = require('request-promise')
const base = 'https://api.weixin.qq.com/cgi-bin'
const api = {
	accessToken: '/token?grant_type=client_credential'
}

module.exports = class Wechat {
	constructor (opts) {
		this.opts = Object.assign({}, opts)
		this.appID = opts.appID
		this.appSecret = opts.appSecret

		this.fetchAccessToken()
	} 

	async request(options) {
		options = Object.assign({}, options, {json:true})

		try {
			console.log(options)
			const res = await request(options)

			return res
		} catch (err) {
			console.log(err)
		}
	}

	async fetchAccessToken () {
		let data

		if(this.getAccessToken) {
			let data = await this.getAccessToken()
		}

		if(!this._isValidToken(data)) {
			data = await this.updateAccessToken()
		}

		return data
	}

	async updateAccessToken () {
		const url = `${base}${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

		const data = await this.request({ url })
		const now = new Date().getTime()
		console.log(data)
		const expiresIn = now + (data.expires_in - 20) * 1000

		data.expiresIn = expiresIn
		console.log(data)
		return data
	}

	_isValidToken () {

	}
}