const mongoose = require('mongoose')
const Category = mongoose.model('Category')

exports.homePage = async (ctx, next) => {
	const categories = await Category.find({}).populate({
		path: 'movies',
		select: '_id title poster',
		options: {limit: 8}
	})
	console.log(categories)
	await ctx.render('pages/index', {
		title: '首页',
		categories
	})
}