const { resolve } = require('path')
exports.reply = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()
	if(message.MsgType === 'event') {
		let reply = ''
		if (message.Event === 'LOCATION') {
			reply = `您上报的位置是${message.Latitude}-${message.Longitude}-${message.Precision}`
		}

		ctx.body = reply

	} else if(message.MsgType === "text") {
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
		} else if (content === '5') {
			let data = await client.handle('uploadMaterial', 'video', resolve(__dirname,'../6.mp4'))
			console.log('测试视频上传接口')
			console.log(data)
			reply = {
				type: 'video',
				title: '回复的视频标题',
				description: '打个篮球玩玩',
				mediaId: data.media_id
			}
		} else if (content === '6') {
			let data = await client.handle('uploadMaterial', 'video', resolve(__dirname,'../6.mp4'), {
				type:'video',
				description:'{"title":"这个地方很棒","introduction":"好吃不如饺子"}'
			})	
			console.log(data)
			reply = {
				type: 'video',
				title: '回复的视频标题 2',
				description: '打个篮球玩玩',
				mediaId: data.media_id
			}
		} else if (content === '7') {
			let data = await client.handle('uploadMaterial', 'image', resolve(__dirname,'../2.jpg'), {
				type:'image'
			})
			console.log(data)
			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		} else if (content === '8') {
			let data = await client.handle('uploadMaterial', 'image', resolve(__dirname,'../2.jpg'), {
				type:'image'
			})

			let data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname,'../2.jpg'), {
				type:'image'
			})
			
			let media = {
				articles: [
					{
						title: '这是服务端上传的图文1',
						thumb_media_id: data.media_id,
						author: 'derek',
						digest: '没有摘要',
						show_cover_pic: 1,
						content: '点击去往慕课网',
						content_source_url: 'https://coding.imooc.com/'
					},
					{
						title: '这是服务端上传的图文2',
						thumb_media_id: data.media_id,
						author: 'derek',
						digest: '没有摘要',
						show_cover_pic: 1,
						content: '点击去往慕课网',
						content_source_url: 'https://github.com/'
					}
				]
			}

			let uploadData = await client.handle('uploadMaterial', 'news', media, {})

			let newMedia = {
				media_id: uploadData.media_id,
				index: 0,
				title: '这是服务端上传的图文0001',
				thumb_media_id: data.media_id,
				author: 'derek',
				digest: '没有摘要',
				show_cover_pic: 1,
				content: '点击去往慕课网',
				content_source_url: 'https://coding.imooc.com/'
			}

			let mediaData = await client.handle('updateMaterial', uploadData.media_id, newMedia)

			console.log(mediaData)

			let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true)

			let items = newsData.news_item
			let news = []

			if(items){
				items.forEach(item => {
					news.push({
						title: item.title,
						description: item.content,
						picUrl: data2.url,
						url: item.url
					})
				})

				reply = news
			} else {
				reply = uploadData.errmsg
			}	
			
		} else if (content === '9') {
			let counts = await client.handle('countMaterial')
			console.log(JSON.stringify(counts))

			let res = await Promise.all([
				client.handle('batchMaterial', {
					type:'image',
				    offset:0,
				    count:10
				}),
				client.handle('batchMaterial', {
					type:'video',
				    offset:0,
				    count:10
				}),
				client.handle('batchMaterial', {
					type:'voice',
				    offset:0,
				    count:10
				}),
				client.handle('batchMaterial', {
					type:'news',
				    offset:0,
				    count:10
				}),
			])

			console.log(res)

			reply = `
				images: ${res[0].total_count},
				video: ${res[1].total_count},
				voice: ${res[2].total_count},
				news: ${res[3].total_count},
			`
		} else if (content === '10') {
			//创建标签
			// let newTag = await client.handle('createTag', 'vue')
			// console.log(newTag)
			//删除标签
			// await client.handle('delTag', 100)
			//标记标签
			// await client.handle('updateTag', 101, '测试修改')

			//批量打标签/取消标签
			await client.handle('batchTag',[message.FromUserName], 101, true)

			//获取某个标签的用户列表
			let userList = await client.handle('fetchTagUsers', 2)

			//获取公众号的标签列表
			let tagsData = await client.handle('fetchTags')

			//获取某个用户的标签列表
			let userTags = await client.handle('getUserTags', message.FromUserName)
			console.log(userTags)

			reply = tagsData.tags.length
		} else if (content === '11') {

			let userList = await client.handle('fetchUserList')
			console.log(userList)

			reply = userList.total + '关注者'
		} else if (content === '12') {

			await client.handle('remarkUser', message.FromUserName, 'derekderek')

			reply = '改名成功'
		} else if (content === '13') {

			const userInfoData = await client.handle('getUserInfo', message.FromUserName)

			console.log(userInfoData)

			reply = JSON.stringify(userInfoData)
		} else if (content === '14') {

			const batchUsersInfo = await client.handle('remarkUser', [{
				openid: message.FromUserName,
				lang: "zh_CN"
			}])

			console.log(batchUsersInfo)

			reply = JSON.stringify(batchUsersInfo)
		} else if (content === '15') {
			//临时票据
			// let tempQr = {
			// 	expire_seconds: 400000,
			// 	action_name: 'QR_SCENE',
			// 	action_info: {
			// 		scene: {
			// 			scene_id: 101
			// 		}
			// 	}}
			// let tempTicketData = await client.handle('createQrcode', tempQr)

			// console.log(tempTicketData)

			// let temQr = client.showQrCode(tempTicketData.ticket)

			// console.log(temQr)

			//永久票据
			let qrData = {
				action_name: 'QR_LIMIT_SCENE',
				action_info: {
					scene: {
						scene_id: 99
					}
				}}
			let ticketData = await client.handle('createQrcode', qrData)

			console.log(ticketData)

			let qr = client.showQrCode(ticketData.ticket)

			console.log(qr)

			reply = qr.url
		} else if (content === '16') {
			//永久票据
			let qrData = {
				action_name: 'QR_LIMIT_SCENE',
				action_info: {
					scene: {
						scene_id: 102
					}
				}}
			let ticketData = await client.handle('createQrcode', qrData)
			let qr = client.showQrCode(ticketData.ticket)
			console.log(qr)

			let shorData = await client.handle('createShortUrl', qr)	

			console.log(shorData)

			reply = shorData.short_url
		} else if (content === '17') {
			let semanticData = {
				query:'查一下明天从北京到上海的南航机票',
				city:'北京',
				category: 'flight,hotel',
				uid:message.FromUserName
			}
			let searchData = await client.handle('semantic', semanticData)
			
			console.log(searchData)

			reply = JSON.stringify(searchData)
		} else if (content === '18') {
			let body = '编程语言难学么'
				
			let translateData = await client.handle('voiceTranslate', body, 'zh_CN', 'en_US')
			
			console.log(translateData)

			reply = translateData.to_content
		}

		ctx.body = reply
	}

	await next()
} 