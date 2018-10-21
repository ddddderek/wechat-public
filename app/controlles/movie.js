const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category') 
const _ = require('lodash')

//电影的录入页面
exports.show = async (ctx, next) => {
	const { _id } = ctx.params
	let movie = {}

	if (_id) {
		movie = await Movie.findOne({ _id })
	}

	let categories = await Category.find({})

	await ctx.render('pages/movie_admin', {
		title: '后台分类录入页面',
		movie,
		categories
	})
}

//电影的创建持久化
exports.new = async (ctx, next) => {
	console.log(ctx.request.body)
	const movieData = ctx.request.body || {}
	let movie
	if (movieData._id) {
		movie = await Movie.findOne({ _id: movieData._id })
	} 

	const categoryId = movieData.categoryId
	const categoryName = movieData.categoryName
	let category

	if (categoryId) {
		category = await Category.findOne({ _id: categoryId })
	} else if (categoryName) {
		category = new Category({ name: categoryName })

		await category.save()
	}

	if (movie) {
		movie = _.extend(movie, movieData)
		movie.category = category._id
	} else {
		delete movieData._id

		movieData.category = category._id
		movie = new Movie(movieData)
	}

	category = await Category.findOne({_id: category._id})

	if (category) {
		category.movies = category.movies || []

		category.movies.push(movie._id)

		category.save()
	}

	await movie.save()
	

	ctx.redirect('/admin/movie/list')
}

//电影的后台列表
exports.list = async (ctx, next) => {
	const movies = await Movie.find({}).populate('category','name')
	
	await ctx.render('pages/movie_list', {
		title: '分类列表的页面',
		movies
	})
}

//删除电影数据
exports.del = async (ctx, next) => {
	const id = ctx.query.id

	try {
		await Movie.remove({_id: id})
		ctx.body = {success: true}
	} catch (err) {
		ctx.body = {success: false}
	}
}
