// MongoDB initialization script for Aleem EHR
db = db.getSiblingDB('aleem_ehr');

// Create collections
db.createCollection('users');
db.createCollection('patients');
db.createCollection('doctors');
db.createCollection('appointments');
db.createCollection('call_logs');
db.createCollection('transcripts');
db.createCollection('notifications');

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.patients.createIndex({ phone: 1 }, { unique: true });
db.patients.createIndex({ patient_id: 1 }, { unique: true });
db.doctors.createIndex({ employee_id: 1 }, { unique: true });
db.doctors.createIndex({ specialization: 1 });
db.appointments.createIndex({ patient_id: 1 });
db.appointments.createIndex({ doctor_id: 1 });
db.appointments.createIndex({ date: 1, time_slot: 1 });
db.appointments.createIndex({ status: 1 });
db.call_logs.createIndex({ caller_phone: 1 });
db.call_logs.createIndex({ created_at: -1 });
db.transcripts.createIndex({ call_id: 1 });
db.notifications.createIndex({ user_id: 1, read: 1 });

// Seed admin user (password: admin123 - bcrypt hash)
db.users.insertOne({
    email: "admin@aleemehr.com",
    hashed_password: "$2b$12$LJ3m4ys3GZxkGJXQfVZpuOEqHCvHSMEMh2QL.V0fWMqgCmVvDqiCa",
    full_name: "System Admin",
    role: "admin",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
});

// Seed sample doctors
db.doctors.insertMany([
    {
        employee_id: "DOC001",
        full_name: "Dr. Sarah Ahmed",
        specialization: "General Medicine",
        phone: "+1234567001",
        email: "sarah.ahmed@aleemehr.com",
        schedule: {
            monday: { start: "09:00", end: "17:00", slot_duration: 30 },
            tuesday: { start: "09:00", end: "17:00", slot_duration: 30 },
            wednesday: { start: "09:00", end: "17:00", slot_duration: 30 },
            thursday: { start: "09:00", end: "17:00", slot_duration: 30 },
            friday: { start: "09:00", end: "13:00", slot_duration: 30 }
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        employee_id: "DOC002",
        full_name: "Dr. Ali Khan",
        specialization: "Cardiology",
        phone: "+1234567002",
        email: "ali.khan@aleemehr.com",
        schedule: {
            monday: { start: "10:00", end: "18:00", slot_duration: 30 },
            tuesday: { start: "10:00", end: "18:00", slot_duration: 30 },
            wednesday: { start: "10:00", end: "18:00", slot_duration: 30 },
            thursday: { start: "10:00", end: "18:00", slot_duration: 30 },
            friday: { start: "10:00", end: "14:00", slot_duration: 30 }
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        employee_id: "DOC003",
        full_name: "Dr. Fatima Noor",
        specialization: "Pediatrics",
        phone: "+1234567003",
        email: "fatima.noor@aleemehr.com",
        schedule: {
            monday: { start: "08:00", end: "16:00", slot_duration: 30 },
            tuesday: { start: "08:00", end: "16:00", slot_duration: 30 },
            wednesday: { start: "08:00", end: "16:00", slot_duration: 30 },
            thursday: { start: "08:00", end: "16:00", slot_duration: 30 },
            friday: { start: "08:00", end: "12:00", slot_duration: 30 }
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    }
]);

print("Aleem EHR database initialized successfully!");
