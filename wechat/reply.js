const { resolve } = require('path')
exports.reply = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()

	if(message.MsgType === "text") {
		let content = message.Content
		let reply = `Oh 你说的 ${content} 太复杂了 无法解析`
		if (content === '1') {
			reply = '天下第一吃大米'
		} else if (content === '2') {
			reply = '天下第二吃豆腐'
		} else if(content === '3') {
			reply  = '天下第三吃仙丹'
		} else if (content === '4') {
			let data = await client.handle('uploadMaterial', 'image', resolve(__dirname,'../2.jpg'))
			console.log(data)
			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		}else if (content === '5') {
			let data = await client.handle('uploadMaterial', 'video', resolve(__dirname,'../6.mp4'))
			console.log('测试视频上传接口')
			console.log(data)
			reply = {
				type: 'video',
				title: '回复的视频标题',
				description: '打个篮球玩玩',
				mediaId: data.media_id
			}
		}

		ctx.body = reply
	}

	await next()
} 