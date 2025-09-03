// Run: npm install sqlite3 faker uuid
const sqlite3 = require("sqlite3").verbose();
const faker = require("faker");
const { v4: uuidv4 } = require("uuid");

const db = new sqlite3.Database("./remotion_full.db");

// Helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randomInt(0, arr.length - 1)];

// Constants
const NUM = 100;
const roles = ["therapist", "doctor", "admin"];
const genders = ["male", "female", "other"];
const sessionTypes = ["in_person", "online", "group"];
const statusTypes = ["active", "inactive", "scheduled", "completed", "cancelled"];
const treatmentTypes = ["cognitive", "behavioral", "physical", "meditation", "art_therapy"];
const paymentMethods = ["cash", "card", "insurance"];
const metrics = ["avg_session_duration", "patient_satisfaction", "missed_appointments"];

// --- CREATE TABLES ---
db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    first_name TEXT, last_name TEXT, email TEXT, password_hash TEXT,
    role TEXT, specialization TEXT, created_at TEXT, last_login TEXT, status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    first_name TEXT, last_name TEXT, dob TEXT, gender TEXT,
    contact_info TEXT, emergency_contact TEXT, created_at TEXT, status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    appointment_id TEXT PRIMARY KEY,
    patient_id TEXT, doctor_id TEXT,
    scheduled_time TEXT, duration_minutes INTEGER,
    status TEXT, notes TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS therapy_sessions (
    session_id TEXT PRIMARY KEY,
    appointment_id TEXT, session_start TEXT, session_end TEXT,
    session_type TEXT, therapist_notes TEXT, ai_summary TEXT,
    recording_url TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS session_notes (
    note_id TEXT PRIMARY KEY, session_id TEXT,
    timestamp TEXT, note_text TEXT, note_type TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS session_treatments (
    treatment_id TEXT PRIMARY KEY, session_id TEXT,
    treatment_type TEXT, description TEXT, duration_minutes INTEGER, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS patient_history (
    history_id TEXT PRIMARY KEY, patient_id TEXT,
    date TEXT, condition TEXT, notes TEXT, medication TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id TEXT PRIMARY KEY, patient_id TEXT, doctor_id TEXT,
    medication TEXT, start_date TEXT, end_date TEXT, notes TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_documents (
    document_id TEXT PRIMARY KEY, patient_id TEXT, doctor_id TEXT,
    document_type TEXT, title TEXT, file_url TEXT, uploaded_at TEXT, notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_queries (
    query_id TEXT PRIMARY KEY, user_id TEXT,
    query_text TEXT, query_type TEXT, response TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY, patient_id TEXT, appointment_id TEXT,
    amount REAL, method TEXT, status TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS therapy_plans (
    plan_id TEXT PRIMARY KEY, patient_id TEXT, therapist_id TEXT,
    plan_name TEXT, goal TEXT, start_date TEXT, end_date TEXT, status TEXT, notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS therapy_plan_steps (
    step_id TEXT PRIMARY KEY, plan_id TEXT, step_number INTEGER,
    description TEXT, assigned_session_id TEXT, completed INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS session_activities (
    activity_id TEXT PRIMARY KEY, session_id TEXT,
    activity_type TEXT, description TEXT, duration_minutes INTEGER, completed INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    feedback_id TEXT PRIMARY KEY, session_id TEXT, patient_id TEXT,
    rating INTEGER, comments TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY, user_id TEXT, patient_id TEXT,
    alert_type TEXT, message TEXT, status TEXT, trigger_time TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS goals (
    goal_id TEXT PRIMARY KEY, patient_id TEXT, plan_id TEXT,
    description TEXT, target_date TEXT, achieved INTEGER, notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS document_shares (
    share_id TEXT PRIMARY KEY, document_id TEXT, shared_with_user_id TEXT,
    permission_type TEXT, expires_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    message_id TEXT PRIMARY KEY, session_id TEXT, sender_id TEXT,
    message_text TEXT, timestamp TEXT, message_type TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    analytics_id TEXT PRIMARY KEY, user_id TEXT,
    metric_name TEXT, metric_value REAL, period_start TEXT, period_end TEXT, created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS resources (
    resource_id TEXT PRIMARY KEY, therapist_id TEXT,
    title TEXT, resource_type TEXT, file_url TEXT, description TEXT, created_at TEXT
  )`);
});

// --- GENERATE FAKE DATA ---
let users = [], patients = [], appointments = [], sessions = [];

for (let i = 0; i < NUM; i++) {
  // Users
  const userId = uuidv4();
  users.push([userId, faker.name.firstName(), faker.name.lastName(),
    faker.internet.email(), faker.internet.password(),
    pick(roles), faker.name.jobTitle(),
    faker.date.past().toISOString(), faker.date.recent().toISOString(), pick(["active", "inactive"])
  ]);

  // Patients
  const patientId = uuidv4();
  patients.push([patientId, faker.name.firstName(), faker.name.lastName(),
    faker.date.past(50, "2005-01-01").toISOString(), pick(genders),
    JSON.stringify({ phone: faker.phone.phoneNumber(), email: faker.internet.email() }),
    JSON.stringify({ name: faker.name.findName(), phone: faker.phone.phoneNumber() }),
    faker.date.past().toISOString(), pick(["active", "inactive"])
  ]);

  // Appointment
  const appointmentId = uuidv4();
  appointments.push([appointmentId, patientId, userId,
    faker.date.soon().toISOString(), randomInt(30, 120),
    pick(statusTypes), faker.lorem.sentence(), faker.date.past().toISOString()
  ]);

  // Therapy Session
  const sessionId = uuidv4();
  sessions.push([sessionId, appointmentId,
    faker.date.future().toISOString(), faker.date.future().toISOString(),
    pick(sessionTypes), faker.lorem.paragraph(),
    JSON.stringify({ summary: faker.lorem.sentences(2) }),
    faker.internet.url(), faker.date.recent().toISOString()
  ]);
}

// --- INSERT DATA ---
db.serialize(() => {
  // Insert users
  const userStmt = db.prepare(`INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?,?)`);
  users.forEach(u => userStmt.run(u));
  userStmt.finalize();

  // Insert patients
  const patientStmt = db.prepare(`INSERT INTO patients VALUES (?,?,?,?,?,?,?,?,?)`);
  patients.forEach(p => patientStmt.run(p));
  patientStmt.finalize();

  // Insert appointments
  const apptStmt = db.prepare(`INSERT INTO appointments VALUES (?,?,?,?,?,?,?,?)`);
  appointments.forEach(a => apptStmt.run(a));
  apptStmt.finalize();

  // Insert sessions
  const sessStmt = db.prepare(`INSERT INTO therapy_sessions VALUES (?,?,?,?,?,?,?,?,?)`);
  sessions.forEach(s => sessStmt.run(s));
  sessStmt.finalize();

  // Generate & insert rest (session_notes, treatments, feedback, etc.)
  for (let i = 0; i < NUM; i++) {
    // Example: one session note per session
    db.run(`INSERT INTO session_notes VALUES (?,?,?,?,?,?)`, [
      uuidv4(), sessions[i][0], faker.date.recent().toISOString(),
      faker.lorem.sentence(), pick(["observation","reflection","intervention"]),
      faker.date.recent().toISOString()
    ]);

    // Example: one treatment per session
    db.run(`INSERT INTO session_treatments VALUES (?,?,?,?,?,?)`, [
      uuidv4(), sessions[i][0], pick(treatmentTypes),
      faker.lorem.sentences(2), randomInt(10,60), faker.date.recent().toISOString()
    ]);

    // Example: feedback
    db.run(`INSERT INTO feedback VALUES (?,?,?,?,?,?)`, [
      uuidv4(), sessions[i][0], patients[i][0],
      randomInt(1,5), faker.lorem.sentence(), faker.date.recent().toISOString()
    ]);

    // Example: payments
    db.run(`INSERT INTO payments VALUES (?,?,?,?,?,?,?)`, [
      uuidv4(), patients[i][0], appointments[i][0],
      randomInt(50,300), pick(paymentMethods), pick(["paid","pending","cancelled"]),
      faker.date.recent().toISOString()
    ]);

    // Example: analytics
    db.run(`INSERT INTO analytics VALUES (?,?,?,?,?,?,?)`, [
      uuidv4(), users[i][0], pick(metrics), randomInt(1,100),
      faker.date.past().toISOString(), faker.date.recent().toISOString(),
      faker.date.recent().toISOString()
    ]);
  }
});

console.log("✅ Fake data for ALL 21 tables inserted into SQLite.");
db.close();
