const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

cloudinary.config({
  cloud_name: "dg7ewecoh",
  api_key: "187199175119948",
  api_secret: "nzvo4G0CKq7ks4Uww24-CjIsw28",
});

const Offer = require("../model/Offer");
const User = require("../model/User");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const pictureToUpload = req.files.picture.path;
    if (req.fields.product_description.length > 500) {
      res.json({
        message: "La description doit contenir maximum 500 caractères",
      });
    } else if (req.product_name.length > 50) {
      res.json({
        message: "Le titre doit contenir maximum 50 caractères",
      });
    } else if (req.product_price.price > 100000) {
      res.json({
        message: "Le prix ne peux pas couter plus cher que 100 000€",
      });
    } else {
      const newOffer = new Offer({
        product_name: req.fields.product_name,
        product_description: req.fields.product_description,
        product_price: req.fields.product_price,
        product_details: [
          {
            condition: req.fields.condition,
          },

          {
            city: req.fields.city,
          },
          {
            brand: req.fields.brand,
          },
          {
            size: req.fields.size,
          },
          {
            color: req.fields.color,
          },
        ],
        owner: req.user,
      });
      newOffer.save();

      newOffer.product_image = await cloudinary.uploader.upload(
        pictureToUpload,
        {
          folder: `vinted/offers/${newOffer._id}/`,
        }
      );

      newOffer.save();

      res.json(newOffer);
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.put("/update/offer", async (req, res) => {
  try {
    const offerToUpdate = await Offer.findById(req.query.id);

    offerToUpdate.product_name = req.fields.product_name;
    offerToUpdate.product_description = req.fields.product_description;
    offerToUpdate.product_price = req.fields.product_price;
    offerToUpdate.condition = req.fields.condition;
    offerToUpdate.city = req.fields.city;
    offerToUpdate.brand = req.fields.brand;
    offerToUpdate.size = req.fields.size;
    offerToUpdate.picture = req.files.picture;

    await offerToUpdate.save();
    res.status(200).json({
      message: "Les changements ont bien été apportés à l'offre",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

//appliquer des filtres sur la recherche
router.get("/offers", async (req, res) => {
  const filters = {};

  if (req.query.priceMin !== undefined || req.query.priceMax !== undefined) {
    const priceFilter = {};
    if (req.query.priceMin !== undefined) {
      priceFilter.$gte = parseInt(req.query.priceMin);
    }

    if (req.query.priceMax !== undefined) {
      priceFilter.$lte = parseInt(req.query.priceMax);
    }
    filters.product_price = priceFilter;
  }

  if (req.query.title !== undefined) {
    filters.product_name = req.query.title;
  }

  let sort = { product_price: "desc" };
  if (req.query.sort === "price-asc") {
    sort = { product_price: "asc" };
  }

  const pageSize = 2;

  let page = 1;
  if (req.query.page !== undefined) {
    page = parseInt(req.query.page);
  }

  const skip = (page - 1) * pageSize;

  const result = await Offer.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(pageSize);

  res.json({ result });
});

//afficher les détails d'une offre avec en paramètre params son ID
router.get("/offer/:id", async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  res.json({ offer });
});
module.exports = router;
