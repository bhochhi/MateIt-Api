
//req.body holds parameters that are sent up from the client as part of a post request.
app.post('/api/users',function(req,res,next){
	var file;

	if(req.files)
		file = req.files.profilepic;

	seneca.act({controller:'user',action:'create',data:req.body.user,file:file},function(err,result){
		if(err){
			if(err.name == "CastError")
				return res.status(422).json({err:err});

			return res.status(422).json({errors:err.errors});
		}
		res.status(result.status).json(result.response);
	});
});

//returns a list of users via a query
app.get('/api/users',authorization.is('User'),function(req,res,next){
	var page = req.param('page') || 1;
	seneca.act({controller:'user',action:'list',query:{},page:page,blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			return res.status(500).json({err:err});
		}
		res.status(200).json({users:result.users,page:page});
	});
});

app.post('/api/users/list',authorization.is('User'),function(req,res,next){
	var page = req.param('page') || 1;
	seneca.act({controller:'user',action:'list',query:req.param('query'),page:page,limit:req.param('limit'),blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			return res.status(500).json({err:err});
		}
		res.status(200).json({users:result.users,page:page});
	});
});

//returns the value of parameter 'id' brings back a specific user id: id
app.get('/api/users/:id',authorization.is('User'),function(req,res,next){
	seneca.act({controller:'user',action:'get',id:req.param('id'),blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			if(err.name == "CastError")
				return res.status(422).json({err:err});

			if(err.name == "UserNotFound")
				return res.status(404).json({err:err});

			return res.status(500).json({err:err});
		}

		if(result.user===null)
		{
			res.status(404).json({message:'User does not exist'});	
		}
		else{
			res.status(200).json({user:result.user});
		}
	});
});
//works
app.del('/api/users/:id',authorization.is('Self'),function(req,res,next){
	seneca.act({controller:'user',action:'delete',id:req.param('id'),blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){

			if(err.name == "CastError")
				return res.status(422).json({err:err});

			if(err.name == "UserNotFound")
				return res.status(404).json({err:err});

			return res.status(500).json({err:err});
		}

		if(result.user===null)
		{
			res.status(404).json({message:'User does not exist'});	
		}

		res.status(200).json({user:{id:req.param('id')}});
	});
});

app.post('/api/users/:id',authorization.is('Self'),function(req,res,next){
	var file;

	if(req.files)
		file = req.files.profilepic;
	
	seneca.act({controller:'user',action:'update',data:req.param('user'),id:req.param('id'),file:file,blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			if(err.name == "CastError")
				return res.status(422).json({err:err});

			if(err.name == "UserNotFound")
				return res.status(404).json({err:err});

			return res.status(422).json({errors:err.errors});
		}
		res.status(200).json(result);
	});
});

app.post('/api/users/:id/profilepic',authorization.is('Self'),function(req,res){
	var id = req.param('id'),
	picture = req.files.picture;

	if( ! /image/.test(picture.headers['content-type']) ){
    return res.status(422).json({error:'file to upload is not an image'});
  }
	
	seneca.act({controller:"user",action:"editProfilePicture",id:id,picture:picture,blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			if(err.name == "CastError")
				return res.status(422).json({err:err});

			if(err.name == "UserNotFound")
				return res.status(404).json({err:err});

			return res.status(422).json({err:err});
		}
		res.status(200).json({user:result.user});
	});
});

app.del('/api/users/:id/property',authorization.is('Self'),function(req,res){
	var id = req.param('id');
	
	seneca.act({controller:"user",action:"leaveProperty", id:id,blacklist:'-password -emailKey -aId'},function(err,result){
		if(err){
			var status = err.status || 500;
			var error = err.message || err;
			return res.status(status).json({error:error});
		}
		res.status(200).json({property:result.property});
	});
});

app.get('/users/new',function(req,res){
	
	if(req.isAuthenticated())
		return res.status(404).send();

	var fs = require('fs');
	var data = fs.readFileSync(appRoot + '/data/countries.json',{encoding:"utf8"});
	var countries = JSON.parse(data);
	var message = req.param('message');

	res.render('users/new',{user:req.user,countries:countries,message:message});
});

app.get('/users/update',function(req,res){
	if(!req.isAuthenticated())
		return res.status(404).send();

	var fs = require('fs');
	var data = fs.readFileSync(appRoot + '/data/countries.json',{encoding:"utf8"});
	var countries = JSON.parse(data);

	res.render('users/update',{user:req.user,countries:countries});
});

app.post('/log/files',function(req,res){
	console.log(req.files);
});