module.exports = {
    getDashboard: (req, res) => {
      res.json({ message: 'Welcome to the dashboard', userId: req.userId });
    },
  };
  