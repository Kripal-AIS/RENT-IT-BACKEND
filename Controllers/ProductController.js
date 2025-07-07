import Agreement from "../Models/Agreement.js";
import Product from "../Models/Product.js";
import Review from "../Models/Review.js";
import User from "../Models/User.js";
import ProductRequest from "../Models/ProductRequest.js";

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
      
      if (!req?.currUser?.isAdmin && findProduct._doc.renterid !== req.currUser._id.toString()) {
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

      const reviews = await Review.find({ productid: product._id });

      const { password, ...other } = renter._doc;

      const responseData = {
        ...product,
        renter: {
          ...other,
        },
        reviews: reviews || [],
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

      const result = await Product.find(queryForSearch)
      // .skip((page - 1)*limit)
      // .limit(limit);


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
      const isOwner = req.currUser._id.toString() === product.renterid.toString();
      if (!req.currUser.isAdmin && isOwner) {
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

export const assignProduct = {
  validator: async (req, res, next) => {
    console.log(req.body);
    if (!req.body.productid || !req.body.borrowerid || !req.body.revokedate) {
      return res.status(400).send("Please fill out all the fields");
    }
    const findProduct = await Product.findById(req.body.productid);
    if (!findProduct) {
      return res.status(400).send("Product is not available");
    }
    if (findProduct.renterid !== req.currUser._id.toString())
      return res
        .status(400)
        .send("You are not authenticated to assign this product");
    if (findProduct.renterid === req.body.borrowerid) {
      return res
        .status(400)
        .send("Renter user and Borrower user must be different");
    }
    if (findProduct.issued) {
      return res.status(400).send("Product is already issued");
    }
    const findBorrower = await User.findById(req.body.borrowerid);
    if (!findBorrower) return res.status(400).send("Borrower User not found");

    req.borrower = findBorrower;
    next();
  },
  controller: async (req, res, next) => {
    try {
      const today = new Date();
      const revokedate = new Date(req.body.revokedate);
      if (!!req.body?.reqId) {
        await ProductRequest.findByIdAndDelete(req.body.reqId);
      }
      const addAgreement = await Agreement.create({
        renterid: req.currUser._id.toString(),
        borrowerid: req.body.borrowerid,
        assigndate: today,
        revokedate: revokedate,
        productid: req.body.productid,
      });
      const updateProduct = await Product.findByIdAndUpdate(
        req.body.productid,
        {
          issued: true,
          borrowerid: req.body.borrowerid,
          borrower: {
            username: req.borrower.username,
            avatar: req.borrower.avatar,
          },
          agreement: {
            from: today,
            to: revokedate,
          },
        }
      );

      res.status(200).send({
        message: "Product assign successful",
        ...addAgreement._doc,
      });
    } catch (e) {
      // console.log(e);
      return res.status(500).send("Product assign failed");
    }
  },
};

export const revokeProduct = {
  validator: async (req, res, next) => {
    if (!req.query.productid) {
      return res.status(400).send("Please fill out all the fields");
    }
    // const today = new Date();
    // if (today < req.query.revokedate) {
    //     return res.status(400).send("You cannot revoke before revoke date");
    // }
    next();
  },
  controller: async (req, res) => {
    try {
      const findProduct = await Product.findById(req.query.productid);
      if (!findProduct) {
        return res.status(400).send("Product is not available");
      }
      if (findProduct.renterid !== req.currUser._id.toString())
        return res
          .status(400)
          .send("You are not authenticated to revoke this product");

      const updateProduct = await Product.findByIdAndUpdate(
        req.query.productid,
        {
          issued: false,
          borrowerid: "",
        }
      );

      await Agreement.findOneAndDelete({ productid: req.query.productid });

      res.status(200).send("Product revoke successful");
    } catch (e) {
      res.status(500).send("Revoking failed");
    }
  },
};
