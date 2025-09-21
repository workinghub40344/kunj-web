// controllers/productController.js


const Product = require("../models/Products.js");
const cloudinary = require('../config/cloudinary.js');
const streamifier = require("streamifier");



// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, category, sizes } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Upload function returning both secure_url and public_id
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            // Return both URL and public_id
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const uploadedImages = [];
    const uploadedPublicIds = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);
      uploadedImages.push(result.secure_url);
      uploadedPublicIds.push(result.public_id);
    }

    const product = await Product.create({
      name,
      description,
      category,
      sizes: JSON.parse(sizes),
      images: uploadedImages,
      imagePublicIds: uploadedPublicIds, // Save public_ids for deletion
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Delete images from Cloudinary
    for (const public_id of product.imagePublicIds) {
      await cloudinary.uploader.destroy(public_id);
    }

    // Delete product from DB
    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product and images deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

