const router = require("express").Router();
const auth = require("../middleware/auth");

const { addTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");

router.post("/", auth, addTask);
router.get("/", auth, getTasks);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;
