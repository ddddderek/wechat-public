const Koa = require('koa')
const { resolve } = require('path')
const session = require('koa-session')
const server = require('koa-static')
const BodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const moment = require('moment')
const Router = require('koa-router')
const config = require('./config/config')
const { initSchemas, connect } = require('./app/datebase/init')


;(async () => {
	await connect(config.db)

	initSchemas()

	//生成服务器实例
	const app = new Koa()
	const router = new Router
	const views = require('koa-views')

	app.use(views(resolve(__dirname, 'app/views'), {
	    extension: 'pug',
	    options: {
	      moment: moment
	    }
	}))

	app.keys = ['imooc']
	app.use(session(app))
	app.use(BodyParser())
	app.use(server(resolve(__dirname, './public')))

	//植入两个中间件，做前置的微信环境检查、跳转、回调的用户数据储存和状态同步
	const wechatController = require('./app/controlles/wechat')

	app.use(wechatController.checkWechat)
  	app.use(wechatController.wechatRedirect)

	app.use(async (ctx, next) => {
		const User = mongoose.model('User')
		let user = ctx.session.user

		if(user && user._id) {
			user = await User.findOne({ _id: user._id })
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
		} else {
			ctx.session.user = null
		}

		await next()
		
	})

	require('./config/routes')(router)
	app.use(router.routes()).use(router.allowedMethods())

	app.listen(3000)

	console.log('listen: ' + 3000)
})()

