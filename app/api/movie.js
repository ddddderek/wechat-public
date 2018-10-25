const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const Comment = mongoose.model('Comment')
const User = mongoose.model('User')

//电影部分
//通过电影分类查询电影分类及包含的电影
exports.findMovieByCategory = async () => {
	const data = await Category.find().populate({
		path: 'movies',
		select: '_id title poster',
		options: { limit: 8 }
	})

	return data
}
exports.findMovieByCategoryId = async (id) => {
	const data = await Category.find({
		_id: id
	}).populate({
		path: 'movies',
		select: '_id title poster',
		options: { limit: 8 }
	})

	return data
}
//查询所有电影-populate(name)
exports.findMoviesPopulate = async () => {
	const data = Movie.find({}).populate('category','name')

	return data
}
//通过关键字查询电影
exports.searchByKeyword = async (q) => {
	const data = await Movie.find({
		title: new RegExp(q + '.*', 'i')
	})

	return data
}
//通过id查询电影数据
exports.findMovieById= async (id) => {
	const data = await Movie.findOne({
		_id: id
	})

	return data
}
//根据电影id更新电影pv数
exports.updatePVbyMovie= async (id) => {
	Movie.update({_id: id}, { $inc: { pv: 1 } })
}
//通过category删除电影
exports.romoveMovieByCategoryId= async (id) => {
	await Movie.remove({category: id})
}


//电影分类
//查询所有电影分类
exports.findCategories= async () => {
	const data = await Category.find({})

	return data
}
//通过id查询电影分类
exports.findCategoryById= async (id) => {
	const data = await Category.findOne({
		_id: id
	})

	return data
}
//通过id删除电影分类
exports.romoveCategoryById= async (id) => {
	await Category.remove({_id: id})
}
//通过电影id查询电影分类
exports.findCategoriesByMovieId= async (id) => {
	const data = Category.findOne({
		movies: {
			$in: [id]
		}
	})

	return data
}


//评论部分
//通过id查询评论数据
exports.findCommentById= async (id) => {
	const data = await Comment.findOne({
		_id: id
	})

	return data
}

//通过电影id查询评论
exports.findCommentByMovie= async (id) => {
	const data = await Comment.find({
		movie: id
	})
	.populate('from', '_id nickname')
	.populate('replies.from replies.to', '_id nickname')	
	console.log(data)
	return data
}


//User
//通过email查询用户信息
exports.findUserByEmail= async (email) => {
	const data = await User.findOne({ email })

	return data
}

//查询所有用户信息-已更新时间排序
exports.findUsersBySort= async () => {
	const data = await User.find({}).sort('meta.updatedAt')

	return data
}

//通过id删除用户数据
exports.removeUserById = async (_id) => {
	await User.remove({_id})
}