const SHA256 = require("crypto-js/sha256");
const express = require("express");
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dg7ewecoh",
  api_key: "187199175119948",
  api_secret: "nzvo4G0CKq7ks4Uww24-CjIsw28",
});
const User = require("../model/User");

router.post("/user/signup", async (req, res) => {
  try {
    //je récupère le mdp que l'utilisateur a fournis en paramètre
    const password = req.fields.password;
    //je génère un salt
    const salt = uid2(16);
    //je génère un hash qui prend en paramètre le mdp et le salt
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(8);
    const pictureToUpload = req.files.avatar.path;

    if (req.fields.username === "") {
      res.json({
        message: "username doit être renseigné",
      });
    } else if (User.email === req.fields.email) {
      res.json({
        message: "L'email renseigné existe déjà",
      });
    } else {
      //Je crée mon nouvel utilisateur
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
        hash: hash,
        salt: salt,
        token: token,
      });

      await newUser.save();
      newUser.avatar = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `vinted/users/${newUser._id}/`,
      });

      newUser.save();

      res.json({
        id: newUser._id,
        token: token,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
          avatar: req.files.avatar,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const providedMail = req.fields.email;
    const userFromBdd = await User.findOne({ email: providedMail });

    if (userFromBdd) {
      const providedPassword = req.fields.password;
      const hashedUserPassword = SHA256(
        providedPassword + userFromBdd.salt
      ).toString(encBase64);

      if (hashedUserPassword === userFromBdd.hash) {
        res.json({
          id: userFromBdd._id,
          token: userFromBdd.token,
          account: userFromBdd.account,
        });
      } else {
        res.status(400).json({
          message: "le mot de passe n'est pas valide",
        });
      }
    } else {
      res.status(400).json({
        message: "Cet email n'existe pas",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
module.exports = router;
