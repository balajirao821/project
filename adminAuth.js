module.exports = function adminAuth(req, res, next) {
    const adminKey = req.headers["x-admin-key"];
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "Unauthorized (Admin only)" });
    }
    next();
  };  