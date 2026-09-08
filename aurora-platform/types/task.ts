import { UserRole } from './auth';

export type TaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REWORK_REQUIRED'
  | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'IMAGE_BOUNDING_BOX' | 'POLYGON_SEGMENTATION' | 'TEXT_CLASSIFICATION' | 'KEYPOINT_POSE';
export type RejectionSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';

export interface BoundingBoxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationObject {
  id: string;
  label: string;
  color: string;
  geometry: BoundingBoxGeometry;
  confidence: number;
  attributes: {
    occlusion: 'NONE' | 'PARTIAL' | 'HEAVY';
    truncated: boolean;
    difficult: boolean;
    notes?: string;
  };
  flaggedDefect?: boolean;
}

export interface QAPin {
  id: string;
  x: number;
  y: number;
  objectId?: string;
  comment: string;
  createdAt: string;
  reviewerName: string;
}

export interface TaskRevision {
  version: number;
  submittedAt: string;
  annotatorId: string;
  annotations: AnnotationObject[];
  reviewerFeedback?: {
    rejectionReason: string;
    severity: RejectionSeverity;
    feedback: string;
    requiredCorrections: string[];
    qaPins: QAPin[];
    reviewedAt: string;
    reviewerName: string;
  };
}

export interface ActivityEvent {
  id: string;
  taskId: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  action:
    | 'CREATED'
    | 'ASSIGNED'
    | 'REASSIGNED'
    | 'STARTED'
    | 'SAVED_DRAFT'
    | 'SUBMITTED'
    | 'REVIEW_STARTED'
    | 'REJECTED'
    | 'REWORK_STARTED'
    | 'RESUBMITTED'
    | 'APPROVED'
    | 'COMPLETED';
  timestamp: string;
  details: string;
  revisionVersion?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  datasetName: string;
  imageUrl: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  reviewerId?: string;
  reviewerName?: string;
  revisionVersion: number;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  slaDeadline: string;
  annotations: AnnotationObject[];
  revisions: TaskRevision[];
  activityHistory: ActivityEvent[];
  timeSpentSeconds: number;
}

export interface WorkflowMetrics {
  totalTasks: number;
  pendingCount: number;
  assignedCount: number;
  inProgressCount: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  reworkRequiredCount: number;
  completedCount: number;
  completionRate: number;
  rejectionRate: number;
  avgAnnotationTimeMinutes: number;
  avgReviewTimeMinutes: number;
  attentionRequiredCount: number;
}
