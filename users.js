users = {}

function addUser(user)
{
   const username = user.username
   if(!findUser(username))
   {
      
      users[username] = user
      return {success:true}
   }
   return {error:'oops! your username is already taken'}

}

function findUser(username)
{
   user = users[username]
   if(user) 
   {
      return user
   }
   return false
}

function removeUser(username)
{
   delete users[username]
}

function userCount()
{
   return Object.keys(users).length
}




module.exports = {addUser,findUser,removeUser,userCount}