const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// 加密权重
const SALT_WORK_FACTOR = 10
// 登录的最大失败尝试次数
const MAX_LOGIN_ATTEMPTS = 5
// 登录失败后锁定时间
const LOCK_TIME = 2 * 60 * 60 * 1000
const Schema = mongoose.Schema

const UserSchema = new Schema({
	//user admin superAdmin
	role: {
		type: String,
		default: 'user'
	},
	// 兼容各个微信应用，小程序或者公众号的微信用户 ID
	openid: [String],
	unionid: String,
	nickname: String,
	address: String,
	province: String,
	country: String,
	city: String,
	gender: String,
	email: {
		unique: true,
		type: String
	},
	password: String,
	loginAttempts: {
		type: Number,
		required: true,
		default: 0
	},
	lockUntil: Number,
	meta: {
		createdAt: {
			type: Date,
			default: Date.now()
		},
		updatedAt: {
			type: Date,
			default: Date.now()
		}
	}
})

// 虚拟字段
UserSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createdAt = this.meta.updatedAt = Date.now()
	} else {
		this.meta.updatedAt = Date.now()
	}

	next()
})

// 中间件
UserSchema.pre('save', function (next) {
	let user = this

	if (!user.isModified('password')) return next()

	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
		if (err) return next(err)

		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err)

			user.password = hash

			next()
		})
	})
})

// 静态方法
UserSchema.methods = {
	comparePassword: function (_password, password) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(_password, password, function (err, isMath) {
				if(!err) resolve(isMath)
				else reject(err)
			})
		})
	},

	incLoginAttempts: function (user) {
		const _this = this 
		return new Promise((resolve, reject) => {
			if(_this.lockUntil && _this.lockUntil < Date.now()) {
				_this.update({
					$set: {
						loginAttempts: 1
					},
					$unset: {
						lockUntil: 1
					}
				}, function(err) {
					if (!err) resolve(true)
					else reject(err)
				})
			} else {
				let updates = {
					$inc: {
						loginAttempts: 1
					}
				}

				if (_this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS || !_this.isLocked) {
					updates.$set = {
						lockUntil: Date.now() + LOCK_TIME
					}
				} 

				_this.update(updates, err => {
					if (!err) resolve(true)
					else reject(err)
				})
				
			}
		})
	}
}


mongoose.model('User',UserSchema)