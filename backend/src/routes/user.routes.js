const { Router } = require("express");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const { getUsers } = require("../controllers/user.controller");

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "annotator"),
  getUsers,
);


module.exports = router;
