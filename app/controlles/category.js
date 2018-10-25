const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const api = require('../api')

//电影分类的录入页面
exports.show = async (ctx, next) => {
	const { _id } = ctx.params
	let category = {}

	if (_id) {
		category = await api.movie.findCategoryById(_id)
	}

	await ctx.render('pages/category_admin', {
		title: '后台分类录入页面',
		category
	})
}

//电影分类的创建持久化
exports.new = async (ctx, next) => {
	const { name, _id } = ctx.request.body.category
	let category
	if ( _id ) {
		category = await api.movie.findCategoryById(_id)
	} 

	if (category) {
		category.name = name
	} else {
		category = new Category({ name })
	}

	await category.save()
	

	ctx.redirect('/admin/category/list')
}

//电影分类的后台列表
exports.list = async (ctx, next) => {
	const categories = await api.movie.findCategories()

	console.log(categories)
	
	await ctx.render('pages/category_list', {
		title: '分类列表的页面',
		categories
	})
}

exports.del = async (ctx, next) => {
	const id = ctx.query.id
	
	try {
		await api.movie.romoveCategoryById(id)
		await api.movie.romoveMovieByCategoryId(id)
		ctx.body = {success: true}
	} catch (err) {
		console.log(err)
		ctx.body = {success: false}
	}
}
