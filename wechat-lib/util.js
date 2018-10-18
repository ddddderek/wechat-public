const xml2js = require('xml2js')
const template = require('./tpl')
const sha1 = require('sha1')

exports.parseXML = xml => {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xml, {trim:true}, (err,content) => {
			if(err) reject(err)
			else resolve(content)
		})
	})
}

const formatMessage = result => {
	let message = {}

	if(typeof result === 'object') {
		const keys = Object.keys(result)

		for(let i = 0; i < keys.length; i++) {
			let item = result[keys[i]]
			let key = keys[i]

			if(!(item instanceof Array) || item.length === 0) {
				continue
			}

			if(item.length === 1) {
				let val = item[0]

				if(typeof val === 'object') {
					message[key] = formatMessage(val)
				} else {
					message[key] = (val || '').trim()
				}
			} else {
				message[key] = []

				for(let j = 0; j < item.length; j++) {
					message[key].push(formatMessage(item[j]))
				}
			}
		}
	}

	return message
}

exports.tpl = (content, message) => {
	let type = 'text'

	if(Array.isArray(content)) {
		type = 'news'
	}

	if(!content) content = 'Empty News'
	if(content && content.type) {
		type = content.type
	}

	let info  = Object.assign({},{
		content,
		msgType:type,
		creatTime:new Date().getTime(),
		ToUserName: message.FromUserName,
		FromUserName: message.ToUserName
	})

	return template(info)
}
	

//加密签名入口方法
exports.sign = (ticket, url) => {
	//生成随机穿
	const noncestr = _createNonce()
	//生成时间戳
	const timestamp = _createTimestamp()
	//加密
	const signature = _shaIt(noncestr, ticket, timestamp, url)

	return {
		noncestr,
		timestamp,
		signature
	}
}

exports.formatMessage = formatMessage


const _createNonce = () => {
	return Math.random().toString(36).substr(2,16)
}

const _createTimestamp = () => {
	return parseInt(new Date().getTime() / 1000, 10) + ''
}

//字段排序
const _signIt = (paramsObj) => {
	let keys = Object.keys(paramsObj)
	let newArgs = {}
	let str = ''

	keys = keys.sort()

	keys.forEach(key => {
		newArgs[key.toLowerCase()] = paramsObj[key]
	})

	for(let k in newArgs) {
		str += '&' + k + '=' + newArgs[k]
	}

	return str.substr(1)
}
const _shaIt = (nonce, ticket, timestamp, url) => {
	const ret = {
		jsapi_ticket: ticket,
		noncestr: nonce,
		timestamp,
		url
	}

	const str = _signIt(ret)

	const sha = sha1(str)

	return sha
}