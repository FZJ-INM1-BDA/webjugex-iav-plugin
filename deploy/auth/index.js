const passport = require('passport')
const hbpOidcV2 = require('./hbp-oidc-v2')
const objStoreDb = new Map()
const HOST_PATHNAME = process.env.HOST_PATHNAME || ''

module.exports = async app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    const { tokenset, rest } = user
    objStoreDb.set(user.id, user)
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    const user = objStoreDb.get(id)
    if (user) return done(null, user)
    else return done(null, false)
  })

  await hbpOidcV2(app)

  app.get('/logout', (req, res) => {

    if (req.user && req.user.id) objStoreDb.delete(req.user.id)
    req.logout()
    res.redirect(`${HOST_PATHNAME}/`)
  })
}