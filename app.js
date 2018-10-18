const Koa = require('koa')
const { resolve } = require('path')
const moment = require('moment')
const Router = require('koa-router')
const wechat = require('./wechat-lib/middleware')
const config = require('./config/config')
const { reply } = require('./wechat/reply')
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

	require('./config/routes')(router)
	app.use(router.routes()).use(router.allowedMethods())

	app.listen(3000)

	console.log('listen: ' + 3000)
})()

