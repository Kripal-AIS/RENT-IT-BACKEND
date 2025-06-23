
import Product from "../Models/Product.js";

import User from "../Models/User.js";



export const createProduct = {
  validator: async (req, res, next) => {
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.age ||
      !req.body.rent ||
      !req.body.timeperiod ||
      !req.body.category ||
      !req.body.image ||
      !req.body.location
    ) {
      return res.status(400).send("Please Fill all the Fields");
    }
    if (req.body.title.length < 3) {
      return res.status(400).send("Title shoud be more than 3 characters");
    }
    if (req.body.description.length < 10) {
      return res
        .status(400)
        .send("Description shoud be more than 10 characters");
    }
    if (req.body.location.length < 2 || req.body.location.length > 20) {
      return res.status(400).send("Invalid City Location");
    }
    next();
  },
  controller: async (req, res, next) => {
    try {
      const newProduct = await Product.create({
        title: req.body.title,
        description: req.body.description,
        age: req.body.age,
        rent: req.body.rent,
        timeperiod: req.body.timeperiod,
        category: req.body.category,
        renterid: req.currUser._id,
        image: req.body.image,
        location: req.body.location,
      });
      return res.status(200).send({
        message: "Product uploaded successful",
        ...newProduct._doc,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send("Product upload Failed");
    }
  },
};

export const updateProduct = {
  validator: async (req, res, next) => {
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.age ||
      !req.body.rent ||
      !req.body.timeperiod ||
      !req.body.category ||
      !req.body.image ||
      !req.body.location
    ) {
      return res.status(400).send("Please Fill all the Fields");
    }
    if (req.body.title.length < 3) {
      return res.status(400).send("Title shoud be more than 3 characters");
    }
    if (req.body.description.length < 10) {
      return res
        .status(400)
        .send("Description shoud be more than 10 characters");
    }
    if (req.body.location.length < 2 || req.body.location.length > 20) {
      return res.status(400).send("Invalid City Location");
    }
    next();
  },
  controller: async (req, res, next) => {
    try {
      const findProduct = await Product.findById(req.body._id);

      if (!findProduct) {
        return res.status(401).send("Product not found");
      }

      if (findProduct._doc.renterid !== req.currUser._id.toString()) {
        return res
          .status(400)
          .send("You are not authenticated to Update product");
      }
      const updateProduct = await Product.findByIdAndUpdate(
        req.body._id,
        {
          title: req.body.title,
          description: req.body.description,
          age: req.body.age,
          rent: req.body.rent,
          timeperiod: req.body.timeperiod,
          category: req.body.category,
          image: req.body.image,
          location: req.body.location,
        },
        { new: true }
      );

      return res.status(200).send("Product Updation Successful");
    } catch (e) {
      return res.status(500).send("Product updation failed");
    }
  },
};

export const findProduct = {
  validator: async (req, res, next) => {
    if (!req.params.id) {
      return res.status(400).send("please enter product id");
    }
    next();
  },
  controller: async (req, res, next) => {
    try {
      const findProduct = await Product.findById(req.params.id);

      if (!findProduct) {
        return res.status(401).send("Product not found");
      }

      const product = findProduct._doc;

      const renter = await User.findById(product.renterid);

      if (!renter) {
        return res.status(401).send("Renter not found");
      }

    //   const reviews = await Review.find({ productid: product._id });

      const { password, ...other } = renter._doc;

      const responseData = {
        ...product,
        renter: {
          ...other,
        },
        // reviews: reviews || [],
      };

      return res.status(200).json(responseData);
    } catch (e) {
      return res.status(500).send("Product finding failed");
    }
  },
};

export const searchProduct = {
  validator: (req, res, next) => {
    next();
  },
  controller: async (req, res) => {
    try {
      const keyword = req.query.keyword || "";
      const category = req.query.category || null;
      const page = req.query.page || 1;
      const limit = req.query.limit || 2;

      const categoryArr = category ? category.split(",") : "";

      const queryForSearch = category
        ? {
          $and: [
            {
              $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
              ],
            },
            { category: { $in: categoryArr } },
          ],
        }
        : {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        };

      let result = await Product.find(queryForSearch)
      // const renter = await User.findById(result[0]?.renterid);
 
      return res.send(result);
    } catch (e) {
      console.log(e);
      return res.status(500).send("Error Occured");
    }
  },
};

export const findAllProducts = {
  controller: async (req, res, next) => {
    try {
      const page = req.query.page - 1 || 0;
      const limit = req.query.limit || 10;

      const currentProductidx = page * limit;
      const allProducts = await Product.find();

      if (allProducts.length - 1 < currentProductidx)
        return res.status(401).send("more products not available");

      const currentPageProducts = allProducts.slice(
        currentProductidx,
        currentProductidx + limit
      );

      res.status(200).send(currentPageProducts);
    } catch (e) {
      return res.status(400).send("Internal server error");
    }
  },
};

export const deleteProduct = {
  validator: async (req, res, next) => {
    if (!req.params.id) {
      return res
        .status(400)
        .send("Please specify which product you want to delete");
    }
    next();
  },
  controller: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(400).send("Product not found");
      }

      if (req.currUser._id.toString() !== product.renterid) {
        return res
          .status(400)
          .send("You are not authenticated to Delete product");
      }

      await Review.deleteMany({ productid: req.params.id });
      await Product.findByIdAndDelete(req.params.id);

      return res.status(200).send("Product deleted successfully");
    } catch (e) {
      return res.status(500).send("Product deletion failed");
    }
  },
};

