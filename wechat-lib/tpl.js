const ejs = require('ejs')


const tpl =
	`<xml> 
		<ToUserName><![CDATA[<%= ToUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<%= FromUserName %>]]></FromUserName>
		<CreateTime><%= creatTime %></CreateTime>
		<% if(msgType === 'text') { %>
			<MsgType><![CDATA[text]]></MsgType>
			<Content><![CDATA[<%= content %>]]></Content> 
		<% } else if(msgType === 'image') { %>
			<Image>
				<MediaId><![CDATA[<%= content.mediaId %>]]><MediaId>
			</Image>
		<% } else if(msgType === 'voice') { %>
			<Voice>
				<MediaId><![CDATA[<%= content.mediaId %>]]><MediaId>
			</Voice>
		<% } else if(msgType === 'video') { %>
			<video>
				<MediaId><![CDATA[<%= content.mediaId %>]]><MediaId>
				<Title><![CDATA[<%= content.title %>]]><Title>
				<Description><![CDATA[<%= content.description %>]]><Description>
			</video>
		<% } else if(msgType === 'music') { %>
			<Music>
				<MediaId><![CDATA[<%= content.mediaId %>]]><MediaId>
				<Title><![CDATA[<%= content.title %>]]><Title>
				<Description><![CDATA[<%= content.description %>]]><Description>
				<MusicUrl><![CDATA[content.musicUrl]]></MusicUrl>
				<HQMusicUrl><![CDATA[content.hqMusicUrl]]></HQMusicUrl>
				<ThumbMediaId>< ![CDATA[content.thumbMediaId]]></ThumbMediaId>
			</Music>
		<% } else if(msgType === 'news') { %>
			<ArticleCount><![CDATA[<%= content.length %>]]></ArticleCount>
			<Articles>
				<% content.forEach(function(item) { %>
					<item>
						<Title><![CDATA[<%= item.Title %>]]></Title> 
						<Description><![CDATA[<%= item.description %>]]></Description>
						<PicUrl><![CDATA[<%= item.picUrl %>] ]></PicUrl>
						<Url><![CDATA[<%= item.url %>]]></Url>
					</item>
				<% }) %>
			</Articles>
		<% } %>
	</xml>`

const compiled = ejs.compile(tpl)

module.exports = compiled
	
	