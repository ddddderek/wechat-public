const { reply } = require('../../wechat/reply')
const config = require('../../config/config')
const util = require('../../wechat-lib/util')
const wechatMiddle = require('../../wechat-lib/middleware')
const api = require('../api')


//sdk介入测试中间件
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

//网页授权-获取code
exports.oauth = async (ctx, next) => {
	const target = config.baseUrl + 'userinfo'
	const scope = 'snsapi_userinfo'
	const state = ctx.query.id
	const url = api.wechat.getAuthorizeUrl(scope, target, state)


	ctx.redirect(url)
}

//网页授权-通过code获取用户信息
exports.userinfo = async (ctx, next) => {
	const code = ctx.query.code
  const userData = await api.wechat.getUserinfoByCode(code)

	ctx.body = userData
}

//sdk接入-获取参数接口
exports.getSDKSignature = async (ctx, next) => {
  let url = ctx.query.url

  url = decodeURIComponent(url) 

  const params = await api.wechat.getSignature(url)
  console.log(params)
  ctx.body = {
    success: true,
    data: params
  }
}


//所有的网页请求都会流经这个中间件，包括微信的网页访问
//针对 POST 非 GET 请求，不走用户授权流程
exports.checkWechat = async (ctx, next) => {
  const ua = ctx.headers['user-agent']
  const code = ctx.query.code

  // 所有的网页请求都会流经这个中间件，包括微信的网页访问
  // 针对 POST 非 GET 请求，不走用户授权流程
  if (ctx.method === 'GET') {
    // 如果参数带 code，说明用户已经授权
    if (code) {
      await next()
      // 如果没有 code，且来自微信访问，就可以配置授权的跳转
    } else if (util.isWechat(ua)) {
      const target = ctx.href
      const scope = 'snsapi_userinfo'
      console.log(scope,target)
      const url = api.wechat.getAuthorizeUrl(scope, target, 'fromWechat')
      ctx.redirect(url)
    } else {
      await next()
    }
  } else {
    await next()
  }
}

exports.wechatRedirect = async (ctx, next) => {
  const { code, state } = ctx.query

  if (code && state === 'fromWechat') {

    const userData = await api.wechat.getUserinfoByCode(code)
    //hack 微信端刷新 重复用code导致获取用户信息失败的情况
    if (userData) {
      const user = await api.wechat.saveWechatUser(userData)
      ctx.session.user = {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
      }

      ctx.state = Object.assign(ctx.state, {
        user: {
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        }
      })
    }
  }

  await next()
}



