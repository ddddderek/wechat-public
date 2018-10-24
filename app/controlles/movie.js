const { readFile, writeFile } = require('fs')
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category') 
const Comment = mongoose.model('Comment')
const _ = require('lodash')
const util = require('util')
const api = require('../api')	

const readFileAsync = util.promisify(readFile) 
const writeFileAsync = util.promisify(writeFile) 

//电影详情页
exports.detail = async (ctx, next) => {
	const id = ctx.params._id
	const movie = await Movie.findOne({ _id: id })

	const comments = await Comment.find({
		movie: id
	})
	.populate('from', '_id nickname')
	.populate('replies.from replies.to', '_id nickname')	
	await Movie.update({_id: id}, { $inc: { pv: 1 } })

	console.log(JSON.stringify(comments))

	await ctx.render('pages/detail', {
		title: '电影详情页',
		movie,
		comments
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
		const newPath = resolve(__dirname, '../../public/upload/' + poster)
		await writeFileAsync(newPath, data)
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

	const cat = await Category.findOne({
		movies: {
			$in: [id]
		}
	})

	if (cat && cat.movies.length) {
		const index = cat.movies.indexOf(id)
		cat.movies.splice(index, 1)
		await cat.save()
	}
	
	try {
		await Movie.remove({_id: id})
		ctx.body = {success: true}
	} catch (err) {
		ctx.body = {success: false}
	}
}

//电影搜索功能
exports.search = async (ctx, next) => {
	const { catId, p, q } = ctx.request.query
	const page = parseInt(p, 10) || 0
	const count = 2
	const index = page * count

	if (catId) {
		const categories = await api.movie.searchByCategory(catId)
		const category = categories[0]

		let movies = category.movies || []
		let results = movies.slice(index, index + count)

		await ctx.render('pages/results', {
			title: '分类搜索结果页面',
			keyword: category.name,
			currentPage: (page + 1),
			query: 'catId=' + catId,
			totalPage: Math.ceil(movies.length / count),
			movies: results
		})
	} else {
		let movies = await api.movie.searchByKeyword(q)
		let results = movies.slice(index, index + count)

		await ctx.render('pages/results', {
			title: '关键词搜索结果页面',
			keyword: q,
			currentPage: (page + 1),
			query: 'catId=' + q,
			totalPage: Math.ceil(movies.length / count),
			movies: results
		})
	}
}
