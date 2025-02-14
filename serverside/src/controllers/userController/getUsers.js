const Admin = require("../../models/coreModels/Admin");

module.exports = {
  get: async (req, res) => {
    try {
      let { id, page, limit } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const query = {};
      if (id) query._id = id;

      const users = await Admin.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -salt");

      const totalDocs = users.length;
      const totalPages = Math.ceil(totalDocs / limit);
      const currentPage = page;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      res.status(200).json({
        status: "success",
        message: users.length === 0 ? "No users found" : "Users found",
        data: users,
        pagination: {
          totalDocs,
          totalPages,
          currentPage,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};
