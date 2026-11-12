import Annotation from "../models/annotation.model";

class AnnotationRepository {
  async findByTask(taskId) {
    return Annotation.find({ task: taskId })
      .populate("annotator", "name email")
      .sort({ createdAt: 1 });
  }

  async findById(id) {
    return Annotation.findById(id).populate("annotator", "name email");
  }

  async create(data) {
    const annotation = new Annotation(data);
    return annotation.save();
  }

  async update(id, data) {
    return Annotation.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Annotation.findByIdAndDelete(id);
  }

  async countByTask(taskId) {
    return Annotation.countDocuments({
      task: taskId,
    });
  }
}

export default new AnnotationRepository();
