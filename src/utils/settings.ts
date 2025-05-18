export const STATUS_COLORS: Record<string, string> = {
    APPLICATION_CREATE: "#3498db",
    AWAIT_FOR_DOCUMENTS: "#9b59b6",
    NEW_PASSENGER: "#1abc9c",
    IN_TRAINING: "#f1c40f",
    DOCUMENT_VERIFY: "#e67e22",
    AWAIT_APPLICATION_ACCEPTANCE: "#16a085",
    GCC_MEDICAL: "#2ecc71",
    BUREAU_CLEARANCE: "#8e44ad",
    EMBASSY_CLEARANCE: "#2980b9",
    DOCUMENT_HANDOVER: "#27ae60",
    ABROADING_DONE: "#2c3e50",
};

export const JOB_ORDER_FACILITIES = [
    "FOOD",
    "ACCOMMODATION",
    "AIR TICKET ONE WAY",
    "AIR TICKET TWO WAY",
    "MEDICAL",
    "CONTRACT PERIOD",
];

export const JOB_ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: "yellow",
    ACTIVE: "green",
    EXPIRED: "red",
};
