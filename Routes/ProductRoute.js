import { Router } from 'express';
import {  createProduct, deleteProduct, findAllProducts, findProduct, searchProduct, updateProduct } from '../Controllers/ProductController.js';
import VerifyToken from '../Helper/VerifyToken.js';

const router = Router();

router.post("/create", VerifyToken, createProduct.validator, createProduct.controller);

router.get("/findall", findAllProducts.controller);

router.get('/search',searchProduct.validator,searchProduct.controller)

router.get("/:id", findProduct.validator, findProduct.controller);

router.put("/:id", VerifyToken, updateProduct.validator, updateProduct.controller);

router.delete("/:id", VerifyToken, deleteProduct.validator, deleteProduct.controller);


export default router;