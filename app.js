const Koa = require('koa')
const wechat = require('./wechat-lib/middleware')
const config = require('./config/config')
const { reply } = require('./wechat/reply')
const { initSchemas, connect } = require('./app/datebase/init')


;(async () => {
	await connect(config.db)

	initSchemas()

	//生成服务器实例
	const app =new Koa()

	app.use(wechat(config.wechat, reply))

	app.listen(3000)

	console.log('listen: ' + 3000)
})()

