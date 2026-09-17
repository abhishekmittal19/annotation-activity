import annotationRepository from "../repositories/annotation.repository";

class AnnotationService {
  async getAnnotations(taskId: string) {
    return annotationRepository.findByTask(taskId);
  }

  async getAnnotationById(id: string) {
    return annotationRepository.findById(id);
  }

  async createAnnotation(data: any) {
    return annotationRepository.create(data);
  }

  async updateAnnotation(id: string, data: any) {
    return annotationRepository.update(id, data);
  }

  async deleteAnnotation(id: string) {
    return annotationRepository.delete(id);
  }

  async getAnnotationCount(taskId: string) {
    return annotationRepository.countByTask(taskId);
  }
}

export default new AnnotationService();
