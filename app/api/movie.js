const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')

exports.searchByCategory = async (catId) => {
	const data = await Category.find({
		_id: catId
	}).populate({
		path: 'movies',
		select: '_id title poster',
		options: { limit: 8 }
	})

	return data
}

exports.findCategoryById= async (id) => {
	const data = await Category.findOne({
		_id: id
	})

	return data
}

exports.findCategories= async () => {
	const data = await Category.find({})

	return data
}

exports.searchByKeyword = async (q) => {
	const data = await Movie.find({
		title: new RegExp(q + '.*', 'i')
	})

	return data
}

exports.findMovieById= async (id) => {
	const data = await Movie.findOne({
		_id: id
	})

	return data
}