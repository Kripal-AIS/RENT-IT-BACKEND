import Review from "../Models/Review.js";
import Product from "../Models/Product.js"

export const createReview = {
    validator: async (req, res, next) => {
        if (!req.body.productid || !req.body.rating || !req.body.review || !req.body.username) {
            return res.status(400).send("Please Fill all the Fields");
        }
        if (req.body.review.length < 10) {
            return res.status(400).send("Review should be more than 10 characters");
        }
        if (req.body.rating < 1 || req.body.rating > 5) {
            return res.status(400).send("Rating should be between 1 to 5");
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const findProduct = await Product.findById(req.body.productid);

            if (!findProduct)
                return res.status(400).send("Product not found");

            // console.log(req.userId)
            if (findProduct.renterid === req.userId.toString()) {
                return res.status(400).send("You cannot give review to your product");
            }

            const findReview = await Review.findOne({
                userid: req.userId.toString(),
                productid: req.body.productid
            })

            if (findReview)
                return res.status(400).send("You have already reviewed this product");

            console.log(findProduct.rating)
            const updateRating = await Product.findByIdAndUpdate(req.body.productid, {
                ratedusers: findProduct.ratedusers + 1,
                rating: ((findProduct.rating * findProduct.ratedusers) + req.body.rating) / (findProduct.ratedusers + 1)
            })

            const addReview = await Review.create({
                productid: req.body.productid,
                rating: req.body.rating,
                review: req.body.review,
                userid: req.userId.toString(),
                renterid: findProduct.renterid,
                username:req.body.username
            })

            return res.status(200).json({
                "message": "Review posted successfully",
                ...addReview._doc
            })

        } catch (e) {
            console.log(e);
            return res.status(500).send("Review adding failed");
        }
    }
}

export const deleteReview = {
    validator: async (req, res, next) => {
        if (!req.body.productid || !req.params.id) {
            return res.status(400).send("Please Fill all the Fields");
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const findProduct = await Product.findById(req.body.productid);

            if (!findProduct)
                return res.status(400).send("Product not found");

            const findReview = await Review.findOne({
                userid: req.userId.toString(),
                productid: req.body.productid
            })

            if (!findReview)
                return res.status(400).send("You have not gave any review to this product");

            await Review.findByIdAndDelete(req.params.id)

            return res.status(200).send("Review deleted successfully")

        } catch (e) {
            console.log(e);
            return res.status(500).send("Review deletion failed");
        }
    }
}