const { readFile, writeFile } = require('fs')
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category') 
const _ = require('lodash')
const util = require('util')

const readFileAsync = util.promisify(readFile) 
const writeFileAsync = util.promisify(writeFile) 

//电影详情页
exports.detail = async (ctx, next) => {
	const id = ctx.params._id
	const movie = await Movie.findOne({ _id: id })

	await Movie.update({_id: id}, { $inc: { pv: 1 } })

	await ctx.render('pages/detail', {
		title: '电影详情页',
		movie
	})
}

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

exports.savePoster = async (ctx, next) => {
	const posterData = ctx.request.body.files.uploadPoster
	const filePath = posterData.path
	const fileName = posterData.name
	if (fileName) {
		const data = await readFileAsync(filePath)
		const timestamp = Date.now()
		const type = posterData.type.split('/')[1]
		const poster = timestamp + '.' + type
		console.log(111111111111)
		console.log(data)
		console.log(3333333333333)
		const newPath = resolve(__dirname, '../../public/upload/' + poster)
		console.log(newPath)
		console.log(222222222222222)
		await writeFileAsync(newPath, data)
		console.log(44444444444444)
		ctx.poster = poster
	}

	await next()
}

//电影的创建持久化
exports.new = async (ctx, next) => {
	const movieData = ctx.request.body.fields || {}
	let movie
	if (movieData._id) {
		movie = await Movie.findOne({ _id: movieData._id })
	} 

	if (ctx.poster) {
		movieData.poster = ctx.poster
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
