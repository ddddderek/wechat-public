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
		}

		ctx.body = reply
	}

	await next()
} 