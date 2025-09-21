// // backend/routes/productRoutes.js


// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/multer");
// const productController = require("../controllers/productController.js");

// // Routes
// router.post("/", upload.array("images"), productController.addProduct);  // Add images
// router.post("/", productController.addProduct);           // Add product
// router.get("/", productController.getProducts);          // Get all products
// router.get("/:id", productController.getProduct);        // Get single product
// router.put("/:id", productController.updateProduct);     // Update product
// router.delete("/:id", productController.deleteProduct);  // Delete product


// module.exports = router;



// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController.js");

// Routes
// MODIFIED: The first line handles both cases, the second is redundant.
// The `upload.array("images")` middleware will handle file uploads.
router.post("/", upload.array("images"), productController.addProduct); 
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
// MODIFIED: Added multer middleware to the PUT route to accept new images
router.put("/:id", upload.array("images"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;