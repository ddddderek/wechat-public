const mongoose = require('mongoose')
const User = mongoose.model('User')
const { getOAuth, getWechat } = require('../../wechat/index')
const util = require('../../wechat-lib/util')

//微信sdk签名授权
exports.getSignature = async (url) => {
	const client = getWechat()
	const data = await client.fetchAccessToken()
	const token = data.access_token
	const ticketData = await client.fetchTicket(token)
	const ticket = ticketData.ticket

	let params = util.sign(ticket, url)
	params.appID = client.appID

	return params
}

//微信网页授权
exports.getAuthorizeUrl = (scope, target, state) => {
	const oauth = getOAuth()
	const url = oauth.getAuthorizeURL(scope, target, state)

	return url
}
exports.getUserinfoByCode = async (code) => {
	const oauth = getOAuth()
	const data = await oauth.fetchAccessToken(code)
	if (data.access_token && data.openid) {
		const userData = await oauth.getUserInfo(data.access_token,data.openid)
		return userData
	}
	return false
	
}

exports.saveWechatUser = async (userData) => {
	let query = {
		openid: userData.openid
	}

	if (userData.unionid) {
		query = {
			unionid: userData.unionid
		}
	}

	let user = await User.findOne(query)

	if (!user) {
		user = new User({
			openid: [userData.openid],
			unionid: userData.unionid,
			nickname: userData.nickname,
			email: ( userData.unionid|| userData.openid) + '@wx.com' ,
			province: userData.province,
			city: userData.city,
			country: userData.country,
			gender: userData.gender || userData.sex,
		})

		user = await user.save()
	}

	return user
}