const { TaskService } = require("../services/task.service");
const { emitTaskUpdate } = require("../utils/taskEvents");

const service = new TaskService();

const getTasks = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await service.getTasks(page, pageSize);

    const items = result.items.map((task) => ({
      id: task._id,
      taskId: task.taskId,
      title: task.title,
      type: task.type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      annotationCount: task.annotationCount,
      updatedAt: task.updatedAt,
      meta: task.meta,
    }));

    return res.status(200).json({
      page,
      pageSize,
      total: result.total,
      items,
    });
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    return res.status(500).json({
      message: "Unable to fetch tasks",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await service.getTask(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      id: task._id,
      taskId: task.taskId,
      title: task.title,
      type: task.type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      annotationCount: task.annotationCount,
      updatedAt: task.updatedAt,
      meta: task.meta,
    });
  } catch (error) {
    console.error("GET TASK ERROR:", error);
    return res.status(500).json({
      message: "Unable to fetch task",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await service.createTask(req.body);

    emitTaskUpdate(req, "task:created", task);

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    return res.status(500).json({
      message: error.message || "Unable to create task",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await service.updateTask(id, req.body);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskUpdate(req, "task:updated", task);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    return res.status(500).json({
      message: error.message || "Unable to update task",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await service.deleteTask(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskUpdate(req, "task:deleted", task);

    return res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    return res.status(500).json({
      message: error.message || "Unable to delete task",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee } = req.body;

    const task = await service.assignTask(id, assignee);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskUpdate(req, "task:assigned", task);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("ASSIGN TASK ERROR:", error);
    return res.status(400).json({
      message: error.message || "Unable to assign task",
    });
  }
};

const unassignTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await service.unassignTask(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskUpdate(req, "task:unassigned", task);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("UNASSIGN TASK ERROR:", error);
    return res.status(500).json({
      message: error.message || "Unable to unassign task",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    const result = await service.getMyTasks(userId, page, pageSize);

    return res.status(200).json({
      page,
      pageSize,
      total: result.total,
      items: result.items,
    });
  } catch (error) {
    console.error("GET MY TASKS ERROR:", error);
    return res.status(500).json({
      message: "Unable to fetch assigned tasks",
    });
  }
};

const submitTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await service.submitTask(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    emitTaskUpdate(req, "task:submitted", task);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("SUBMIT TASK ERROR:", error);
    return res.status(500).json({
      message: error.message || "Unable to submit task",
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getMyTasks,
  submitTask,
};
