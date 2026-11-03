export function toBackendTaskType(type) {
  switch (type) {
    case "IMAGE_BOUNDING_BOX":
    case "POLYGON_SEGMENTATION":
    case "KEYPOINT_POSE":
      return "image";

    case "TEXT_CLASSIFICATION":
      return "text";

    default:
      return "image";
  }
}

export function toBackendTaskPriority(priority) {
  switch (priority) {
    case "LOW":
      return "low";

    case "MEDIUM":
      return "medium";

    case "HIGH":
    case "URGENT":
      return "high";

    default:
      return "medium";
  }
}
