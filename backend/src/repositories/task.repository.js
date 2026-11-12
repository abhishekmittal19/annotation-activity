const Task = require("../models/task.model");

class TaskRepository {
  async findAll(page, pageSize) {
    const skip = (page - 1) * pageSize;

    const items = await Task.find()
      .populate("assignee", "name email role")
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: -1 });

    const total = await Task.countDocuments();

    return {
      items,
      total,
    };
  }

  async findById(id) {
    return Task.findById(id).populate("assignee", "name email role");
  }

  async create(data) {
    return Task.create({
      taskId: data.taskId,
      title: data.title,
      type: data.type,
      status: data.status || "pending",
      priority: data.priority || "medium",
      assignee: data.assignee || null,
      annotationCount: data.annotationCount || 0,
      meta: data.meta || {},
    });
  }

  async update(id, data) {
    return Task.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("assignee", "name email role");
  }

  async delete(id) {
    return Task.findByIdAndDelete(id);
  }

  async findByAssignee(userId, page, pageSize) {
    const skip = (page - 1) * pageSize;

    const items = await Task.find({
      assignee: userId,
    })
      .populate("assignee", "name email role")
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: -1 });

    const total = await Task.countDocuments({
      assignee: userId,
    });

    return {
      items,
      total,
    };
  }
}

module.exports = { TaskRepository };
