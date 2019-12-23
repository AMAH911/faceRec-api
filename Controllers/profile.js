const getProfile = ('/profile/:id', (req, res,db) => {
  const { id } = req.params

  db.select('*')
    .from('users')
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('error getting user')
      }
    })
  // if (!found) {
  //     res.status(400).json('Hmmm');
  // }
})


module.exports = {
    getprofile: getProfile
}
