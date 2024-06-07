const mongoose = require('mongoose');
require('dotenv').config();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).then(()=>console.log("Database Connected"))