const express = require('express');

const Users = require('./users-model')
const Posts = require('../posts/posts-model')

const {
  validateUserId, 
  validateUser,
  validatePost,
} = require('../middleware/middleware')

// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const router = express.Router();

router.get('/', (req, res, next) => {
  // RETURN AN ARRAY WITH ALL THE USERS
  Users.get()
  .then(users => {
    res.status(200).json(users)
  })
  .catch(next)
});

router.get('/:id', validateUserId, (req, res) => {
  res.json(req.user)
});

router.post('/', validateUser, (req, res, next) => {
  Users.insert({name: req.name})
  .then(newUser => {
    res.status(201).json(newUser)
  })
  .catch(next)
});

router.put('/:id', validateUserId, validateUser, (req, res, next) => {
 Users.update(req.params.id, {name: req.name})
 .then(() => {
  return Users.getById(req.params.id)
 })
 .then(user => {
  res.json(user)
 })
 .catch(next)

});

router.delete('/:id', validateUserId, async (req, res) => {
  try{
    await Users.remove(req.params.id)
    res.json(req.user)
  } catch(err){
    next(err)
  }

});

router.get('/:id/posts', validateUserId, async (req, res) => {
  try {
    const result = await Users.getUserPosts(req.params.id)
    res.json(result)
    
  } catch(err) {
    next(err)
  }
});

router.post('/:id/posts', validateUserId, validatePost, async (req, res) => {
 try {
  const result = await Posts.insert({
    user_id: req.params.id,
    text: req.text,  
  })
  res.status(201).json(result)
 } catch (err) {
  next(err)
 }

});

router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    customMessage: 'something tragic inside post router happened',
    message: err.message,
    stack: err.stack,
  })
})

// do not forget to export the router
module.exports = router