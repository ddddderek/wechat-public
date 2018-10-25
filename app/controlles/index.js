const api = require('../api')

exports.homePage = async (ctx, next) => {
	const categories = await api.movie.findMovieByCategory()
	await ctx.render('pages/index', {
		title: '首页',
		categories
	})
}