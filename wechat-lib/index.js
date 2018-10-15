const request = require('request-promise')
const fs = require('fs')
const base = 'https://api.weixin.qq.com/cgi-bin'
const api = {
	accessToken: '/token?grant_type=client_credential',
	temporary: {
		upload: base + '/media/upload?'
	},
	permannent: {
		uploadNews: base + '/material/add_news?',
		upload: base + '/material/add_material?',
		uploadNewsPic: base + '/media/uploadimg?'
		
	}
}

module.exports = class Wechat {
	constructor (opts) {
		this.opts = Object.assign({}, opts)
		this.appID = opts.appID
		this.appSecret = opts.appSecret
		this.getAccessToken = opts.getAccessToken
		this.saveAccessToken = opts.saveAccessToken

		this.fetchAccessToken()
	} 

	async request(options) {
		options = Object.assign({}, options, {json:true})

		try {
			const res = await request(options)

			return res
		} catch (err) {
			console.log(err)
		}
	}

	//首先检查数据库里面的token是否过期
	//过期刷新
	//token入库
	async fetchAccessToken () {
		let data = await this.getAccessToken()


		if(!this._isValidToken(data)) {
			data = await this.updateAccessToken()
		}
		
		await this.saveAccessToken(data)

		return data
	}

	//获取 token
	async updateAccessToken () {
		const url = `${base}${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

		const data = await this.request({ url })
		const now = new Date().getTime()
		const expiresIn = now + (data.expires_in - 20) * 1000

		data.expires_in = expiresIn
		return data
	}

	_isValidToken (data) {
		if (!data || !data.expires_in) {
			return false
		}

		const expiresIn = data.expires_in
		const now = new Date().getTime()

		if(now < expiresIn) {
			return true
		} else {
			return false
		}
	}

	uploadMaterial(token, type, material, permannent = false) {
		let form = {}
		let url = api.temporary.upload

		// 永久素材 form是个obj 继承外面传入的新对象
		if (permannent) {
			url = api.permannent.upload
			form = Object.assign(form, permannent)
		}

		//上传图文消息的图片素材
		if (type === 'pic') {
			url = api.permannent.uploadNewsPic
		}

		//图文非图文素材提交表单切换
		if (type === 'news') {
			url = api.permannent.uploadNews
			form = material
		} else {
			form.media = fs.createReadStream(material)
		}
		

		let uploadUrl = `${url}access_token=${token}`

		//根据素材永久性填充token
		if (!permannent) {
			uploadUrl += `&type=${type}`
		} else {
			if (type != 'news') {
				form.access_token = token
			}
		}

		const options = {
			method: 'POST',
			url: uploadUrl,
			json: true,
			formData: form
		}

		//图文和非图文在 request 提交主体判断
		if (type === 'news') {
			options.body = form
		} else {
			options.formData = form
		}

		return options
	}

	async handle (operation, ...args) {
		const tokenData = await this.fetchAccessToken()
		const options = this[operation](tokenData.access_token, ...args)
		const data = await this.request(options)

		return data
	}
}