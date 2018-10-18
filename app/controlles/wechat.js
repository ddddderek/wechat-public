const { reply } = require('../../wechat/reply')
const config = require('../../config/config')
const wechatMiddle = require('../../wechat-lib/middleware')
const api = require('../api')

//接入微信消息中间件
exports.sdk = async (ctx, next) => {
	const url = ctx.href
	const params = await api.wechat.getSignature(url)
	await ctx.render('wechat/sdk.pug', params)
}

//接入微信消息中间件
exports.hear = async (ctx, next) => {
	const middle = wechatMiddle(config.wechat, reply)

	await middle(ctx, next)
}

exports.oauth = async (ctx, next) => {
	const target = config.baseUrl + 'userinfo'
	const scope = 'snsapi_userinfo'
	const state = ctx.query.id
	const url = api.wechat.getAuthorizeUrl(scope, target, state)

	ctx.redirect(url)
}

exports.userinfo = async (ctx, next) => {
	const oauth = getOAuth()
	const code = ctx.query.code
	const data = await oauth.fetchAccessToken(code)
	console.log(data)
	const userData = await oauth.getUserInfo(data.access_token,data.openid)

	ctx.body = userData
}

