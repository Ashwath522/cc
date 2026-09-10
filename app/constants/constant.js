module.exports = {
  FILE_UPLOAD_STATUS: {
    PDF_GENERATED: "PDF_GENERATED",
    IN_PROGRESS: "IN_PROGRESS",
    VALIDATING_FILE: "VALIDATING_FILE",
    FILE_UPLOADED: "FILE_UPLOADED",
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  },
  PRODUCT_ATTRIBUTE_LABELS: {
    COLOUR: "Colour",
    FINISH: "Finish",
    PRIMARY_MATERIAL_TYPE: "Primary Material",
    LENGTH: "Length",
    WIDTH: "Width",
    HEIGHT: "Height",
  },
  FILE_TYPE: {
    CSV: "csv",
    EXCEL: "excel",
  },
  APP_MODE: {
    SERVER: "server",
  },
  TEMPLATE_TAG_TYPE: {
    PRODUCT_TALKER: "PRODUCT_TALKER",
    PRODUCT_TAG: "PRODUCT_TAG",
  },
  UPLOAD_NAMESPACE: "platform-extensions",
  BULK_IMPORT_JOB_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
  },
  BULK_IMPORT_MAX_ZIP_MB: 2048,
  BULK_IMPORT_MAX_SPREADSHEET_MB: 10,
  BULK_IMPORT_MAX_ROWS: 5000,
  BULK_IMPORT_QUEUE_NAME: "cms-bulk-import",
  BULK_IMPORT_PRODUCT_SKU_BATCH_SIZE: 50,
  AI_CONTENT_JOB_STATUS: {
    PENDING: "pending",
    RUNNING: "running",
    COMPLETED: "completed",
    FAILED: "failed",
  },
  AI_CONTENT_ROW_STATUS: {
    CLEAN: "clean",
    NEEDS_REVIEW: "needs_review",
    APPROVED: "approved",
    PUSHED: "pushed",
    FAILED: "failed",
  },
  AI_CONTENT_PRODUCT_BATCH_SIZE: 50,
  AI_CONTENT_QUEUE_NAME: "cms-ai-content",
};

