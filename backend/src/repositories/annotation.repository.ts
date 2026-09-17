import Annotation, { IAnnotation } from "../models/annotation.model";

class AnnotationRepository {
  async findByTask(taskId: string): Promise<IAnnotation[]> {
    return Annotation.find({ task: taskId })
      .populate("annotator", "name email")
      .sort({ createdAt: 1 });
  }

  async findById(id: string): Promise<IAnnotation | null> {
    return Annotation.findById(id).populate("annotator", "name email");
  }

  async create(data: Partial<IAnnotation>): Promise<IAnnotation> {
    const annotation = new Annotation(data);
    return annotation.save();
  }

  async update(
    id: string,
    data: Partial<IAnnotation>,
  ): Promise<IAnnotation | null> {
    return Annotation.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<IAnnotation | null> {
    return Annotation.findByIdAndDelete(id);
  }

  async countByTask(taskId: string): Promise<number> {
    return Annotation.countDocuments({
      task: taskId,
    });
  }
}

export default new AnnotationRepository();
