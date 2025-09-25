// //* backend/routes/productRoutes.js

// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/multer");
// const productController = require("../controllers/productController.js");

// // Routes

// router.post("/", upload.array("images"), productController.addProduct); 
// router.get("/", productController.getProducts);
// router.get("/:id", productController.getProduct);

// // Added multer middleware to the PUT route to accept new images
// router.put("/:id", upload.array("images"), productController.updateProduct);
// router.delete("/:id", productController.deleteProduct);

// // Route to update stock status
// router.put("/:id/status", productController.updateStockStatus);

// module.exports = router;



// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController.js");
// Agar aapne auth middleware banaya hai to use import karein
// const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Routes ---

router.post(
  "/",
  // protect, admin, // Agar auth hai to
  upload.array("images"),
  productController.addProduct
);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);


router.put(
  "/:id/status",
  productController.updateStockStatus
);


router.put(
  "/:id",
  upload.array("images"),
  productController.updateProduct
);


router.delete(
  "/:id",
  productController.deleteProduct
);

module.exports = router;