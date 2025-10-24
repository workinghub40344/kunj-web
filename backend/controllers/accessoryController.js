const Accessory = require('../models/accessoryModel');
const cloudinary = require('../config/cloudinary');


const streamifier = require('streamifier');
const uploadFromBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Create Accessories
const createAccessory = async (req, res) => {
    let imagePublicIds = [];
    try {
        const { name, description, category, colour, price, style_code, deity, single_product, countInStock, priceForKrishna, productType } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required.' });
        }

        let images = [];
        for (const file of req.files) {
            const result = await uploadFromBuffer(file.buffer);
            images.push(result.secure_url);
            imagePublicIds.push(result.public_id);
        }

        const newAccessory = new Accessory({
            name, description, category, colour, price: Number(price), style_code, deity, countInStock,
            images, 
            imagePublicIds, 
            single_product:JSON.parse(single_product),
            priceForKrishna: Number(priceForKrishna),
            productType: productType
        });

        const savedAccessory = await newAccessory.save();
        res.status(201).json(savedAccessory);

    } catch (error) {
        console.error("Error creating accessory:", error);

        // Cloudinary Rollback
        if (imagePublicIds.length > 0) {
            console.log("Rolling back Cloudinary uploads due to DB error...");
            await Promise.all(imagePublicIds.map(id => cloudinary.uploader.destroy(id)));
        }
        
        res.status(500).json({ message: "Server error while creating accessory." });
    }
};

// Fetch All Accessories
const getAllAccessories = async (req, res) => {
    try {
        const accessories = await Accessory.find({}).sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching accessories" });
    }
};

// Fetch by Accessory ID
const getAccessoryById = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (accessory) {
            res.json(accessory);
        } else {
            res.status(404).json({ message: "Accessory not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Accessory 
const updateAccessory = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) return res.status(404).json({ message: "Accessory not found" });

        const { name, description, category, colour, price, style_code, deity, removedImages, single_product, countInStock, priceForKrishna, productType } = req.body;

        // 1️⃣ Remove images
        if (removedImages) {
            const urlsToRemove = JSON.parse(removedImages); 
            for (const url of urlsToRemove) {
                const index = accessory.images.indexOf(url);
                if (index > -1) {
                    // Delete from Cloudinary
                    await cloudinary.uploader.destroy(accessory.imagePublicIds[index]);
                    // Remove from arrays
                    accessory.images.splice(index, 1);
                    accessory.imagePublicIds.splice(index, 1);
                }
            }
        }

        // 2️⃣ Upload new images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadFromBuffer(file.buffer);
                accessory.images.push(result.secure_url);
                accessory.imagePublicIds.push(result.public_id);
            }
        }

        // 3️⃣ Update other fields
        accessory.name = name || accessory.name;
        accessory.description = description || accessory.description;
        accessory.category = category || accessory.category;
        accessory.colour = colour || accessory.colour;
        accessory.price = price ? Number(price) : accessory.price;
        accessory.style_code = style_code || accessory.style_code;
        accessory.deity = deity || accessory.deity;
        accessory.countInStock = countInStock    || accessory.countInStock
        if (single_product) {
            accessory.single_product = JSON.parse(single_product);
        };
        accessory.priceForKrishna = priceForKrishna ? Number(priceForKrishna) : accessory.priceForKrishna;
        accessory.productType = productType || accessory.productType;

        const updated = await accessory.save();
        res.json(updated);

    } catch (error) {
        console.error("Error updating accessory:", error);
        res.status(500).json({ message: "Server error while updating accessory." });
    }
};


// Delete Accessory
const deleteAccessory = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(404).json({ message: "Accessory not found" });
        }

        // Delete Images form Cloudinary
        if (accessory.imagePublicIds && accessory.imagePublicIds.length > 0) {
            await Promise.all(accessory.imagePublicIds.map(id => cloudinary.uploader.destroy(id)));
        }

        await accessory.deleteOne();
        res.json({ message: "Accessory removed successfully" });

    } catch (error) {
        console.error("Error deleting accessory:", error);
        res.status(500).json({ message: "Server error while deleting accessory." });
    }
};


module.exports = {
    createAccessory,
    getAllAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory
};