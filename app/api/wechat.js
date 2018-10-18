const { getOAuth, getWechat } = require('../../wechat/index')
const util = require('../../wechat-lib/util')

exports.getSignature = async (url) => {
	const client = getWechat()
	const data = await client.fetchAccessToken()
	const token = data.access_token
	const ticketData = await client.fetchTicket(token)
	const ticket = ticketData.ticket

	let params = util.sign(ticket, url)
	params.appID = client.appID

	console.log(params)

	return params
}

exports.getAuthorizeUrl = async (scope, target, state) => {
	const oauth = getOAuth()
	const url = oauth.getAuthorizeURL(scope, target, state)

	return params
}