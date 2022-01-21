const User = require("../model/User");

async function isAuthenticated(req, res, next) {
  const token = req.headers.authorization.replace("Bearer ", "");

  if (token) {
    req.user = await User.findOne({ token: token });
    next();
  } else {
    res.status(400).json({
      message: "Wesh t'es qui",
    });
  }
}

module.exports = isAuthenticated;
