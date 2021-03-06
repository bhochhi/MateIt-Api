/* 
 * Property Controller
 * @author: Rolilink
 */

//Promises

// Find Property Function Wrapped in a Promise
var findProperty = function(id){
 	var deferred = q.defer();
 	
 	Property.findById(id,function(err,property){
 		if(err)
 			return deferred.reject(err);
 		
 		if(!property){
			var error = new Error("property not found");
			error.name = "PropertyNotFound";
			return deferred.reject(error);
		}
 		return deferred.resolve(property);
 	});

 	return deferred.promise;
};

// List Paginated Properties Function Wrapped in a Promise
var findProperties = function(query,attr,page,limit){
	var deferred = q.defer();
	Property.findPaginated(query,attr,page,limit).lean().exec(function(err,properties){
		if(err)
			return deferred.reject(err);
		return deferred.resolve(properties);
	});
	return deferred.promise;
}

// Save Property Function Wrapped in a Promise
var saveProperty = function(property){
	var deferred = q.defer();
	property.save(function(err){
		if(err)
			return deferred.reject(err);
		return deferred.resolve(property);
	});
	return deferred.promise
}

//Delete Property Function
var deleteProperty = function(property){
	var deferred = q.defer();
	property.remove(function(err,property){
		if(err)
			return deferred.reject(err);
		return deferred.resolve(property);
	});
	return deferred.promise
}

//Update User Property
var updateUserProperty = function(property){
	var deferred = q.defer();
	seneca.act({entity:'property',status:'created',by:property.owner,property:property.id},function(err,result){
		if(err)
			return deferred.reject(err);
		return deferred.resolve(property);
	});
	return deferred.promise;
}

// Seneca Micro Services
seneca.add({controller:'property',action:'create'},function(args,cb){
	var data = args.data,
	ownerId = args.owner,
	handleSuccess = function(data){ cb(null,{property:data}); },
	handleError = function(err){	cb(err,null); };

	var createdProperty = new Property(data);
	createdProperty.setOwner(ownerId);

	saveProperty(createdProperty).then(updateUserProperty).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'get'},function(args,cb){
	var id = args.id,
	handleSuccess = function(data){ cb(null,{property:data}); },
	handleError = function(err){	cb(err,null); };

	findProperty(id).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'list'},function(args,cb){
	var page = args.page || 1,
	query = args.query || {},
	limit = args.limit || 20,
	handleSuccess = function(data){ cb(null,{properties:data}); },
	handleError = function(err){	cb(err,null); };

	findProperties(query,'',page,limit).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'delete'},function(args,cb){
	var id = args.id,
	handleSuccess = function(data){ cb(null,{property:data}); },
	handleError = function(err){	cb(err,null); };

	findProperty(id).then(deleteProperty).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'update'},function(args,cb){
	var data = args.data,
	id = args.id,
	handleSuccess = function(data){ cb(null,{property:data}); },
	handleError = function(err){	cb(err,null); },
	updateProperty = function(property){ return _.extend(property,data); };

	findProperty(id).then(updateProperty).then(saveProperty).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'addPicture'},function(args,cb){
	var id = args.id,
	picture = args.picture,
	handleSuccess = function(data){ cb(null,{property: data}); },
	handleError = function(err){	cb(err,null); },
	addPicture = function(property){ return property.addPicture(picture); };

	findProperty(id).then(addPicture).then(saveProperty).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'listPictures'},function(args,cb){
	var id = args.id,
	handleSuccess = function(data){ cb(null,{pictures: data}); },
	handleError = function(err){	cb(err,null); },
	listPictures = function(property){ return property.listPictures(); };

	findProperty(id).then(listPictures).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'deletePicture'},function(args,cb){
	var id = args.id,
	pictureId = args.pictureId,
	handleSuccess = function(data){ cb(null,{property: data}); },
	handleError = function(err){	cb(err,null); },
	deletePicture = function(property){ return property.removePicture(pictureId); };

	findProperty(id).then(deletePicture).then(saveProperty).then(handleSuccess,handleError);
});

seneca.add({controller:'property',action:'removeUser'},function(args,cb){
	var id = args.id,
	userId = args.userId,
	handleSuccess = function(data){ cb(null,{property: data}); },
	handleError = function(err){	cb(err,null); },
	removeHabitant = function(property){ 
		var deferred = q.defer();
		property.removeHabitant(userId,function(property){
			deferred.resolve(property);
		});
		return deferred.promise; 
	};

	findProperty(id).then(removeHabitant).then(saveProperty).then(handleSuccess,handleError);
});