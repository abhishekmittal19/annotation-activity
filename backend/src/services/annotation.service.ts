import annotationRepository from "../repositories/annotation.repository";
import Task from "../models/task.model";

class AnnotationService {
  async getAnnotations(taskId: string) {
    return annotationRepository.findByTask(taskId);
  }

  async getAnnotationById(id: string) {
    return annotationRepository.findById(id);
  }

  async createAnnotation(data: any) {
    const annotation = await annotationRepository.create(data);

    await Task.findByIdAndUpdate(annotation.task, {
      $inc: { annotationCount: 1 },
    });

    return annotation;
  }

  async updateAnnotation(id: string, data: any) {
    return annotationRepository.update(id, data);
  }

  async deleteAnnotation(id: string) {
    const annotation = await annotationRepository.findById(id);

    if (!annotation) {
      return null;
    }

    const deleted = await annotationRepository.delete(id);

    if (deleted) {
      await Task.findByIdAndUpdate(annotation.task, {
        $inc: { annotationCount: -1 },
      });
    }

    return deleted;
  }

  async getAnnotationCount(taskId: string) {
    return annotationRepository.countByTask(taskId);
  }
}

export default new AnnotationService();
