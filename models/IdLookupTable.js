const mongoose = require("mongoose");

const IDLookupSchema = new mongoose.Schema({
  UFID: String,
  DBID: mongoose.Schema.ObjectId,
  objectType: {
    type: String,
    enum: ["task", "category"],
  },
});

const IDLookup = mongoose.model("IDLookup", IDLookupSchema);

module.exports = IDLookup;
