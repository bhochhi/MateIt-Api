# Creating an User Flows and Responses
Users are people that want to search or list properties.

## Flow 1 - Success Flow
This Flow is the happy day flow

POST /api/users/:id
```javascript
{
	user:{
		username:"rolilink"
	}
} 
```

Return:
Status Code: 200
Body:
```javascript
{
	response:{
		user:{
			id: "29a1bd805c8c11e48ed60800200c9a66",
			email: "me@rolilink.com",
			username: "rolilink"
		}
	}	
} 
```

## Flow 2 - Error Flow: Fields Validation Failed

POST /api/users
```javascript
{
	user:{
		username:"roli",
	}
} 
```

Return:
Status Code: 422
Body:
```javascript
{
	errors:[
		{
			type:"validation_err"
			field:"email",
			message:"not a valid email format"
		}
	]
} 
```

## Flow 3 - Error Flow: User Trying to update another User or is Not Admin

POST /api/users
```javascript
{
	user:{
		username:"rolilink",
		email:"me@rolilink.com",
		password:"12345678"
	}
} 
```

Return:
Status Code: 401


## Flow 4 - Error Flow: User is not Authenticated

POST /api/users
```javascript
{
	user:{
		username:"rolilink",
		email:"me@rolilink.com",
		password:"12345678"
	}
} 
```

Return:
Status Code: 401

## Flow 5 - Error Flow: User associated to user id dont exist

POST /api/users
```javascript
{
	user:{
		username:"rolilink",
		email:"me@rolilink.com",
		password:"12345678"
	}
} 
```

Return:
Status Code: 404
