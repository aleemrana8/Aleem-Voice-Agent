// MongoDB initialization script for Aleem EHR System
db = db.getSiblingDB('aleem_ehr');

// Create collections
db.createCollection('users');
db.createCollection('patients');
db.createCollection('doctors');
db.createCollection('doctor_availability');
db.createCollection('appointments');
db.createCollection('call_logs');
db.createCollection('transcripts');
db.createCollection('notifications');
db.createCollection('ehr_sync_logs');

// Indexes
db.users.createIndex({ username: 1 });
db.users.createIndex({ role: 1 });
db.patients.createIndex({ phone: 1 }, { unique: true });
db.patients.createIndex({ patient_id: 1 }, { unique: true });
db.doctors.createIndex({ employee_id: 1 }, { unique: true });
db.doctors.createIndex({ specialization: 1 });
db.doctors.createIndex({ is_active: 1 });
db.doctor_availability.createIndex({ doctor_id: 1, date: 1 });
db.appointments.createIndex({ appointment_id: 1 });
db.appointments.createIndex({ patient_id: 1, date: 1 });
db.appointments.createIndex({ doctor_id: 1, date: 1, time_slot: 1, status: 1 });
db.appointments.createIndex({ status: 1 });
db.appointments.createIndex({ date: 1 });
db.call_logs.createIndex({ call_id: 1 }, { unique: true });
db.call_logs.createIndex({ caller_phone: 1 });
db.call_logs.createIndex({ status: 1 });
db.call_logs.createIndex({ created_at: -1 });
db.transcripts.createIndex({ call_id: 1 }, { unique: true });
db.transcripts.createIndex({ created_at: -1 });
db.notifications.createIndex({ user_id: 1, read: 1, created_at: -1 });
db.ehr_sync_logs.createIndex({ sync_id: 1 }, { unique: true });
db.ehr_sync_logs.createIndex({ entity_id: 1 });
db.ehr_sync_logs.createIndex({ status: 1, next_retry_at: 1 });

// Seed doctors with hospital schedule (3 PM - 12 AM, Break 8-9 PM, 30 min slots)
var schedule = {};
var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
days.forEach(function(day) {
    schedule[day] = {
        start: '15:00',
        end: '00:00',
        slot_duration: 30,
        breaks: [{ start: '20:00', end: '21:00', label: 'Evening Break' }]
    };
});

db.doctors.insertMany([
    {
        employee_id: "DOC001",
        full_name: "Dr Aleem",
        specialization: "General Medicine",
        phone: "+923001234501",
        email: "dr.aleem@aleemhospital.com",
        qualification: "MBBS, FCPS",
        experience_years: 15,
        consultation_fee: 2000,
        schedule: schedule,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        employee_id: "DOC002",
        full_name: "Dr Mohsin",
        specialization: "General Medicine",
        phone: "+923001234502",
        email: "dr.mohsin@aleemhospital.com",
        qualification: "MBBS, MD",
        experience_years: 10,
        consultation_fee: 1500,
        schedule: schedule,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        employee_id: "DOC003",
        full_name: "Dr Zain",
        specialization: "General Medicine",
        phone: "+923001234503",
        email: "dr.zain@aleemhospital.com",
        qualification: "MBBS, MRCP",
        experience_years: 8,
        consultation_fee: 1500,
        schedule: schedule,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    }
]);

print("✓ Aleem EHR database initialized successfully!");
print("  - Collections created: 9");
print("  - Doctors seeded: Dr Aleem, Dr Mohsin, Dr Zain");
print("  - Schedule: 3 PM - 12 AM, Break 8-9 PM, 30 min slots");
