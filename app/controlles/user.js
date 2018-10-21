const mongoose = require('mongoose') 
const User = mongoose.model('User')

// 实现一个注册页面的控制
exports.showSignup = async (ctx, next) => {
	await ctx.render('pages/signup', {title: '注册页面'})
}

// 增加一个登录页面的控制
exports.showSignin = async (ctx, next) => {
	await ctx.render('pages/signin',  {title: '登录页面'})
}

// 用户数据持久化
exports.signup = async (ctx, next) => {
	const {
		email,
		password,
		nickname
	} = ctx.request.body.user
	console.log(email,password,nickname)
	let user = await User.findOne({ email })

	if (user) return ctx.redirect('/user/signin')

	user = new User({
		email,
		password,
		nickname
	})

	console.log(user)
	
	ctx.session.user = {
		_id: user._id,
		role: user.role,
		nickname: user.nickname
	}

	user = await user.save()

	ctx.redirect('/')
}

// 增添一个登录的校验、判断
exports.signin = async (ctx, next) => {
	const { email,password } = ctx.request.body.user

	let user = await User.findOne({ email })

	if (!user) return ctx.redirect('/signup')

	const isMatch = await user.comparePassword(password, user.password)
	
	console.log(isMatch)

	if (isMatch) {
		ctx.session.user = {
			_id: user._id,
			role: user.role,
			nickname: user.nickname
		}

		ctx.redirect('/')
	} else {
		ctx.redirect('/user/signin')
	}
}

exports.logout = async (ctx, next) => {
	ctx.session.user = {}

	ctx.redirect('/')
}

exports.list = async (ctx, next) => {
	const users = await User.find({}).sort('meta.updatedAt')

	await ctx.render('pages/userlist', {
		title: '用户列表页面',
		users
	})
}

//需要登录的路由中间件控制
exports.signinRequired = async (ctx, next) => {
	const user = ctx.session.user

	if (!user || ! user._id) {
		return ctx.redirect('/user/signin')
	}

	await next()
}

//需要管理员身份的路由中间件控制
exports.adminRequired = async (ctx, next) => {
	const user = ctx.session.user

	if (user.role !== 'admin') {
		return ctx.redirect('/user/signin')
	}

	await next()
}

//删除电影数据
exports.del = async (ctx, next) => {
	const id = ctx.query.id
	
	try {
		await User.remove({_id: id})
		ctx.body = {success: true}
	} catch (err) {
		ctx.body = {success: false}
	}
}
