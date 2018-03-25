const express = require('express')
const utils = require('utility')
const Router = express.Router()
const model = require('./model')

const _filter = {'pwd': 0 , '__v': 0}

const User = model.getModel('user')
Router.get('/list' , function(req , res){
	const {type} = req.query
	User.find({type} , function(err , doc){
		return res.json({code: 0, data: doc})
	})
})

Router.post('/update' , function(req , res){
	const userid = req.cookies.userid
	if(!userid){
		return res.json({code:1})
	}
	const body = req.body
	User.findByIdAndUpdate(userid , body , function(err , doc){
		const data = Object.assign({},{
			user: doc.user,
			type: doc.type
		},body)
		return res.json({code:0 , data})
	})
})

Router.post('/register' , function(req , res){
	const {user , pwd , type} = req.body
	User.findOne({user , pwd:md5Pwd(pwd)} , _filter , function(err , doc){
		if(doc){
			return res.json({code: 1 , msg: '用户名重复'})
		}

		const userModel = new User({user , type , pwd:md5Pwd(pwd)})
		userModel.save(function(err , doc){
			if(err){
				return res.json({code: 1 , msg: '服务器出错'})
			}
			const {user , type , _id} = doc
			res.cookie('userid' , _id)
			return res.json({code: 0 , data: {user , type , _id}})
		})
	})
})

Router.post('/login' , function(req , res){
	const {user , pwd} = req.body
	User.findOne({user , pwd:md5Pwd(pwd)} , _filter , function(err , doc){
		if(!doc){
			return res.json({code: 1, msg: '用户名或密码错误'})
		}
		res.cookie('userid' , doc._id)
		return res.json({code: 0, data: doc})
	})
})

Router.get('/info' , function(req , res){
	const {userid} = req.cookies
	if(!userid){
		return res.json({code:1})
	}
	User.findOne({_id: userid} , _filter , function(err , doc){
		if(err){
			return res.json({code: 1 , msg: '服务器出错'})
		}
		if(doc){
			return res.json({code: 0 , data: doc})
		}
	})
})

function md5Pwd(pwd){
	const salt = 'lc_is_good_1992ccxx@1asd654~!#@'
	return utils.md5(utils.md5(pwd + salt))
}

module.exports = Router

