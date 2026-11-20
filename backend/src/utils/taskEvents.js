const emitTaskUpdate = (req, event, task) => {
  const io = req.app.get("io");

  if (!io || !task) return;

  const taskId = String(task._id || task.id);

  const payload = {
    taskId,
    status: task.status,
    updatedAt: task.updatedAt,
  };

  io.to("role:admin").emit(event, payload);
  io.to("role:manager").emit(event, payload);
};

module.exports = { emitTaskUpdate };
