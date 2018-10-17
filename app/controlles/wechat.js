const { reply } = require('../../wechat/reply')
const config = require('../../config/config')
const { getOAuth } = require('../../wechat/index')
const wechatMiddle = require('../../wechat-lib/middleware')

//接入微信消息中间件
exports.hear = async (ctx, next) => {
	const middle = wechatMiddle(config.wechat, reply)

	await middle(ctx, next)
}

exports.oauth = async (ctx, next) => {
	const oauth = getOAuth()
	const target = config.baseUrl + 'userinfo'
	const scope = 'snsapi_userinfo'
	const state = ctx.query.id
	const url = oauth.getAuthorizeURL(scope, target, state)

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

