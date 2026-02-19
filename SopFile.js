const mongoose = require("mongoose");

const SopFileSchema = new mongoose.Schema({
    filename: { type: String, required: true, unique: true },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SopFile", SopFileSchema);
