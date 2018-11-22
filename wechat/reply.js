const { resolve } = require('path')
const commonMenu = require('./menu')
const config = require('../config/config')

const help = '亲爱的，欢迎关注时光的余热\n' +
  '回复 1-3，测试文字回复\n' +
  '回复 4，测试图片回复\n' +
  '回复 首页，进入网站首页\n' +
  '回复 电影名字，查询电影信息\n' +
  '点击帮助，获取帮助信息\n' +
  '某些功能呢订阅号无权限，比如网页授权\n' +
  '回复语音，查询电影信息\n' +
  '也可以点击 <a href="' + config.baseUrl + 'sdk">语音查电影</a>，查询电影信息\n'

exports.reply = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()
	if (message.MsgType === 'image') {
		reply = message.PicUrl
		console.log(message.PicUrl)
	} else if(message.MsgType === 'event') {
		let reply = ''
		if (message.Event === 'subscribe') {
			reply = `欢迎订阅` + '! 扫码参数' + message.EventKey + '-' + message.Ticket
			console.log(reply = `欢迎订阅` + '! 扫码参数' + message.EventKey + '-' + message.Ticket)
		} else if (message.Event === 'unsubscribe') {
			reply = '无情取消订阅'
		} else if (message.Event === 'SCAN') {
			reply = `关注后扫二维码` + '! 扫码参数' + message.EventKey + '-' + message.Ticket
			console.log(`关注后扫二维码` + '! 扫码参数' + message.EventKey + '-' + message.Ticket)
		}else if (message.Event === 'LOCATION') {
			reply = `您上报的位置是${message.Latitude}-${message.Longitude}-${message.Precision}`
			console.log(`您上报的位置是${message.Latitude}-${message.Longitude}-${message.Precision}`)
		} else if (message.Event === 'CLICK') {
			if(message.EventKey === 'help'){
				reply = help
			}else{
				reply = '你点击菜单的' + message.EventKey
			}
			
			console.log('你点击菜单的' + message.EventKey)
		} else if (message.Event === 'VIEW') {
			reply = '你点击菜单链接' + message.EventKey + message.MenuID
			console.log('你点击菜单链接' + message.EventKey + message.MenuID)
		} else if (message.Event === 'scancode_push') {
			reply = '你扫码了' + message.ScanCodeInfo + message.ScanCodeInfo.ScanResult + message.ScanCodeInfo.ScanType
			console.log('你扫码了' + message.ScanCodeInfo + message.ScanCodeInfo.ScanResult + message.ScanCodeInfo.ScanType)
		} else if (message.Event === 'scancode_waitmsg') {
			reply = '你扫码了' + message.ScanCodeInfo + message.ScanCodeInfo.ScanResult + message.ScanCodeInfo.ScanType
			console.log('你扫码了' + message.ScanCodeInfo + message.ScanCodeInfo.ScanResult + message.ScanCodeInfo.ScanType)
		} else if (message.Event === 'pic_sysphoto') {
			reply = '系统拍照' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList)
			console.log('系统拍照' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList))
		} else if (message.Event === 'pic_photo_or_album') {
			reply = '拍照或者相册' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList)
			console.log('拍照或者相册' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList))
		} else if (message.Event === 'pic_weixin') {
			reply = '微信相册发图' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList)
			console.log('微信相册发图' + message.SendPicsInfo.Count + JSON.stringify(message.SendPicsInfo.PicList))
		} else if (message.Event === 'location_select') {
			reply = '地理位置' + JSON.stringify(message.SendLocationInfo)
			console.log('地理位置' + JSON.stringify(message.SendLocationInfo))
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
		} else if (content === '19') {
			try {
				await client.handle('deleteMenu')

				let menu = {
					button:[
						{
							name: '一级菜单',
							sub_button: [
								{
									name: '二级菜单 1',
									type: 'click',
									key: 'no_1'
								},
								{
									name: '二级菜单 2',
									type: 'click',
									key: 'no_2'
								},
								{
									name: '二级菜单 3',
									type: 'click',
									key: 'no_3'
								},
								{
									name: '二级菜单 4',
									type: 'click',
									key: 'no_4'
								},
								{
									name: '二级菜单 5',
									type: 'click',
									key: 'no_5'
								},
							]
						},
						{  
			               name: "搜索",
			               type: "view",
			               url: 'http://www.soso.com/',
						},
						{
							name: '新菜单_' + Math.random(),
							type: 'click',
							key: 'new_111'
						}
					]
				}
					
				await client.handle('createMenu', menu)

			} catch (e) {
				console.log(e)
			}
			
			
			reply = '菜单创建成功请等待5分钟，或者先取消关注，再重新关注就可以看到新菜单'
		} else if (content === '20') {
			try {
				// await client.handle('deleteMenu')

				let menu = {
					button:[
						{
							name: 'Scan_photo',
							sub_button: [
								{
									name: '系统拍照',
									type: 'pic_sysphoto',
									key: 'no_1'
								},
								{
									name: '拍照或者相册发图',
									type: 'pic_photo_or_album',
									key: 'no_2'
								},
								{
									name: '微信相册发图',
									type: 'pic_weixin',
									key: 'no_3'
								},
								{
									name: '扫码',
									type: 'scancode_push',
									key: 'no_4'
								},
								{
									name: '等待中扫码',
									type: 'scancode_waitmsg',
									key: 'no_5'
								},
							]
						},
						{  
			               name: "跳新连接",
			               type: "view",
			               url: 'http://www.soso.com/',
						},
						{
							name: '其他',
							sub_button: [
								{
									name: '点击',
									type: 'click',
									key: 'no_11'
								},
								{
									name: '地理位置',
									type: 'location_select',
									key: 'no_12'
								}
							]
						}
					]
				}
				let rules = {
					// tag_id:"2",
					// sex:"1",
					// country:"中国",
					// province:"广东",
					// city:"广州",
					// client_platform_type:"2",
					language:'zh_CN'
				}
				let createData = await client.handle('createMenu', menu , rules)

			} catch (e) {
				console.log(e)
			}
			
			let menus = await client.handle('fetchMenu')

			console.log(JSON.stringify(menus))
			
			reply = '菜单创建成功请等待5分钟，或者先取消关注，再重新关注就可以看到新菜单'
		}else if (content === '更新菜单') {
			try {
				await client.handle('deleteMenu')
				let createData = await client.handle('createMenu', commonMenu)
				console.log(createData)
			} catch (e) {
				console.log(e)
			}
			
			reply = '菜单创建成功请等待5分钟，或者先取消关注，再重新关注就可以看到新菜单'
		}else if (content === '首页') {		
			reply = [{
				title: '时光的预热',
		        description: '匆匆岁月时光去，总有一款你最爱',
		        picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
		        url: config.baseUrl
			}]
		}

		ctx.body = reply
	}

	await next()
} 