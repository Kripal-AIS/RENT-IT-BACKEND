import Agreement from '../Models/Agreement.js';
import Product from '../Models/Product.js';
import User from '../Models/User.js';
// import Review from '../Models/Review.js';

export const updateUser = {
    controller: async (req, res) => {
        if (req.currUser._id.toString() !== req.params.id) {
            return res.status(400).send("You are not authenticated to update the profile");
        }

        if (!req.body.username || !req.body.email || !req.body.mobile || !req.body.location) {
            return res.status(400).json("Please Fill all the fields");
        }

        try {
            const findUser = await User.findOne({ _id: req.userId });
            if (!findUser) return res.status(401).send("User Not Found");

            let emailverified = req.body.email === findUser.email;
            let mobileverified = req.body.mobile === findUser.mobile;

            if (req.body.password && req.body.newPassword && req.body.rePassword) {
                const decryptedPass = CryptoJS.AES.decrypt(findUser.password, process.env.JWT_SEC_KEY).toString(CryptoJS.enc.Utf8);
                if (decryptedPass !== req.body.password) return res.status(401).send("Incorrect Current Password");
                if (req.body.newPassword !== req.body.rePassword) return res.status(401).send("Password and re-Enter Password Must be Same");

                const encryptedPassword = CryptoJS.AES.encrypt(req.body.newPassword, process.env.JWT_SEC_KEY).toString();

                const updateUser = await User.findByIdAndUpdate(req.userId, {
                    username: req.body.username,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    location: req.body.location,
                    avatar: req.body.avatar,
                    emailverified,
                    mobileverified,
                    password: encryptedPassword
                }, { new: true });

                const { password, ...others } = updateUser._doc;
                return res.status(200).json({ ...others });
            } else {
                const updateUser = await User.findByIdAndUpdate(req.userId, {
                    username: req.body.username,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    location: req.body.location,
                    avatar: req.body.avatar,
                    emailverified,
                    mobileverified
                }, { new: true });

                const { password, ...others } = updateUser._doc;
                return res.status(200).json({ ...others });
            }
        } catch (e) {
            return res.status(500).send("Updation Failed");
        }
    }
};


export const findUser = {
    controller: async (req, res) => {
        try {
            const findUser = await User.findById(req.params.id);
            // console.log(req.currUser);
            res.status(201).json(findUser);

        } catch (e) {
            res.status(500).json("Internal Server Error");
        }
    }
}

export const findAllUsers = {
    controller: async (req, res) => {
        try {
            const page = req.query.page - 1 || 0;
            const limit = req.query.limit || 100;

            const currentUseridx = page * limit;
            let allUsers = await User.find();
            let finalUsers = [];
            allUsers.map((user) => {
                const { password, ...others } = user._doc;
                finalUsers.push(others);
            })

            allUsers = finalUsers;

            if (allUsers.length - 1 < currentUseridx)
                return res.status(401).send("more users not available");

            const currentPageUsers = allUsers.slice(currentUseridx, currentUseridx + limit);
            // console.log(currentPageUsers);

            res.status(200).send(currentPageUsers);
        } catch (e) {
            console.log(e);
            return res.status(400).send("Internal server error");
        }
    }
}

export const deleteUser = {
    validator: async (req, res, next) => {
        if (req.currUser._id.toString() !== req.params.id) {
            return res.status(400).send("You are not authenticated to delete this user");
        }
        next()
    },
    controller: async (req, res) => {
        try {
            const findRenter = await Agreement.find({ renterid: req.params.id });

            if (findRenter.length > 0) {
                return res.status(400).send("Your products are rented, cannot delete account");
            }

            const findBorrower = await Agreement.find({ borrowerid: req.params.id });

            if (findBorrower.length > 0) {
                return res.status(400).send("You have borrowed products, cannot delete account");
            }

            await Product.deleteMany({ renterid: req.params.id });
            // await Review.deleteMany({ renterid: req.params.id });
            await User.findByIdAndDelete(req.params.id);

            return res.status(200).send("Account deletion Successfull");
        } catch (e) {
            console.log(e);
            return res.status(500).send("Account deletion Failed");
        }
    }
}

export const myTools = {
    controller: async (req, res) => {


        try {

            const product = await Product.find({ $or: [{ 'renterid': req.currUser._id }, { 'borrowerid': req.currUser._id }] })
            console.log(product);

            let borrowed = product.filter((prod) => (prod.borrowerid == req.currUser._id))
            let rented = product.filter((prod) => (prod.renterid == req.currUser._id))

            return res.send({
                borrowed, rented
            })
        }
        catch (e) {
            return res.status(500).send(e)
        }

    }
}
