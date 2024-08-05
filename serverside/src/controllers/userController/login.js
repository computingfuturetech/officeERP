const mongoose= require('mongoose')
const admin=require('../../models/coreModels/Admin')
const bcrypt= require('bcryptjs');
const {generate: uniqueId} = require('shortid')
const jwt = require('jsonwebtoken');
const express = require('express');  
const dotenv = require('dotenv');

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    try {
 
      const user = await admin.findOne({ email });

      if (!user) { 
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = user.validPassword(user.salt, password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
}