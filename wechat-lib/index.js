const request = require('request-promise')
const fs = require('fs')
const base = 'https://api.weixin.qq.com/cgi-bin'
const api = {
	accessToken: '/token?grant_type=client_credential',
	temporary: {
		upload: base + '/media/upload?',
		fetch: base + '/media/get?'
	},
	permannent: {
		uploadNews: base + '/material/add_news?',
		upload: base + '/material/add_material?',
		uploadNewsPic: base + '/media/uploadimg?',
		fetch: base + '/material/get_material?',
		del: base + '/material/del_material?',
		update: base + '/material/update_news?',
		batch: base + '/material/batchget_material?',
		count: base + '/material/get_materialcount?'
	},
	tag: {
		create: base + '/tags/create?',
		fetch: base + '/tags/get?',
		update: base + '/tags/update?',
		del: base + '/tags/delete?',
		fetchUsers: base + '/user/tag/get?',
		batchTag: base + '/tags/members/batchtagging?',
		batchUnTag: base + '/tags/members/batchuntagging?',
		getUserTags: base + '/tags/getidlist?',
		
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
		console.log('检查请求参数')
		console.log(options)

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
			if (type !== 'news') {
				form.access_token = token
			}
		}

		const options = {
			method: 'POST',
			url: uploadUrl,
			json: true,
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

	//获取素材本身
	fetchMaterial (token, mediaId, type, permannent) {
		let form = {}
		let fetchUrl = api.temporary.fetch
		
		if (permannent) {
			fetchUrl = api.permannent.fetch
		}

		let url = fetchUrl + 'access_token=' + token
		let options = {method: 'POST', url: url}

		if (permannent) {
			form.media_id = mediaId
			form.access_token = token
			options.body = form
		} else {
			if( type === 'video') {
				url = url.replace('https:', 'http:')
			}

			options.method = 'GET'
			url += '&media_id=' + mediaId
		}

		return options
	}

	//删除素材
	deleteMaterial (token, mediaId) {
		let form = {
			media_id: mediaId
		}

		const url = `${api.permannent.del}access_token=${token}&media_id=${mediaId}`

		return { method: 'POST', url: url, body: form}
	}

	//更新素材
	updateMaterial (token, mediaId, news) {
		let form = {
			media_id: mediaId
		}

		form = Object.assign(form, news)

		const url = `${api.permannent.update}access_token=${token}&media_id=${mediaId}`

		return { method: 'POST', url: url, body: form}
	}

	//获取素材总数
	countMaterial (token) {
		const url = `${api.permannent.count}access_token=${token}`

		return { method: 'GET', url: url}
	}

	//获取素材列表
	batchMaterial (token, options) {
		options.type = options.type || 'image'
		options.offset = options.offset || 0
		options.count = options.count || 10

		const url = `${api.permannent.batch}access_token=${token}`

		return { method: 'POST', url: url, body: options}
	}

	//创建标签
	createTag (token, name) {
		const body = {
			tag: {
				name
			}
		}

		const url = api.tag.create + 'access_token=' + token

		return {method: 'POST', url, body}
	}

	//获取全部标签
	fetchTags (token) {
		const url = api.tag.fetch + 'access_token=' + token

		return {url}
	}

	//编辑标签
	updateTag (token, id, name) {
		const body = {
			tag: {
				id,
				name
			}
		}

		const url = api.tag.update + 'access_token=' + token

		return {method: 'POST', url, body}
	}

	//删除标签
	delTag (token, id,) {
		const body = {
			tag: {
				id
			}
		}

		const url = api.tag.del + 'access_token=' + token

		return {method: 'POST', url, body}
	}

	//获取标签下的的粉丝列表
	fetchTagUsers (token, id, openID) {
		const body = {
			tagid: id,
			next_openid: openID || ''
		}

		const url = api.tag.fetchUsers + 'access_token=' + token

		return {method: 'POST', url, body}
	}

	//批量加标签/取消标签
	batchTag (token, openidList, id, unTag) {
		const body = {
			openid_list: openidList,
			tagid: id
		}

		let url = !unTag ? api.tag.batchTag : api.tag.batchUnTag
		url += 'access_token=' + token 

		return {method: 'POST', url, body}
	}

	getUserTags (token, openID) {
		const body = {
			openid: openID
		}

		const url = api.tag.getUserTags + 'access_token=' + token 

		return {method: 'POST', url, body}
	}
}