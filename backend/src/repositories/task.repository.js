const Task = require("../models/task.model");

class TaskRepository {
  async findAll(page, pageSize, filters = {}) {
    const skip = (page - 1) * pageSize;

    const query = {};

    if (filters.status) {
      query.status = filters.status.toLowerCase();
    }

    if (filters.priority) {
      query.priority = filters.priority.toLowerCase();
    }

    console.log("Applied filters:", filters);
    console.log("Mongo query:", query);

    const [items, total] = await Promise.all([
      Task.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Task.countDocuments(query),
    ]);

    console.log("Total matching tasks:", total);

    return { items, total };
  }

  async findById(id) {
    return Task.findById(id).lean();
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
    }).lean();
  }

  async delete(id) {
    return Task.findByIdAndDelete(id);
  }

  async findByAssignee(userId, page, pageSize) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      Task.find({ "assignee.id": userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Task.countDocuments({ "assignee.id": userId }),
    ]);

    return { items, total };
  }
}

module.exports = { TaskRepository };
