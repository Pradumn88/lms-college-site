import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
    logId: {
        type: String,
        unique: true,
        required: true
    },
    action: {
        type: String,
        enum: ['approve', 'reject', 'suspend', 'ban', 'unban', 'badge_assign', 'badge_remove', 'rollback', 'category_create', 'category_update', 'category_delete', 'course_delete', 'user_update'],
        required: true
    },
    targetType: {
        type: String,
        enum: ['educator', 'student', 'course', 'category'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetName: {
        type: String
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    adminEmail: {
        type: String
    },
    details: {
        type: String
    },
    previousState: {
        type: mongoose.Schema.Types.Mixed
    },
    newState: {
        type: mongoose.Schema.Types.Mixed
    },
    canRollback: {
        type: Boolean,
        default: true
    },
    isRolledBack: {
        type: Boolean,
        default: false
    },
    rolledBackAt: {
        type: Date
    },
    rolledBackBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

// Generate unique log ID
AuditLogSchema.pre('save', function (next) {
    if (!this.logId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        this.logId = `LOG-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
