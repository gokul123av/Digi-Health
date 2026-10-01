import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';
import { db } from './src/db/index.ts';
import { 
  patients, 
  doctors, 
  users, 
  loginHistory, 
  patientRecords, 
  prescriptions, 
  accessLogs 
} from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_PATIENTS, INITIAL_DOCTOR } from './src/data/mockHealthData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper: Seed initial database data if tables are empty
async function seedInitialDatabase() {
  try {
    const existingDoctors = await db.select().from(doctors).limit(1);
    if (existingDoctors.length === 0) {
      console.log('Seeding initial doctor into Cloud SQL database...');
      await db.insert(doctors).values({
        id: INITIAL_DOCTOR.id,
        name: INITIAL_DOCTOR.name,
        title: INITIAL_DOCTOR.title,
        specialty: INITIAL_DOCTOR.specialty,
        hospital: INITIAL_DOCTOR.hospital,
        licenseId: INITIAL_DOCTOR.licenseId,
        npiNumber: INITIAL_DOCTOR.npiNumber,
        avatar: INITIAL_DOCTOR.avatar,
        department: INITIAL_DOCTOR.department,
        email: 'dr.vance@stjude.org',
        phone: '+1 (555) 882-9400',
        password: '9402',
        activePatientsCount: INITIAL_DOCTOR.activePatientsCount
      });

      await db.insert(users).values({
        uid: INITIAL_DOCTOR.id,
        email: 'dr.vance@stjude.org',
        role: 'doctor',
        passwordHash: '9402',
        name: INITIAL_DOCTOR.name
      }).onConflictDoNothing();
    }

    const existingPatients = await db.select().from(patients).limit(1);
    if (existingPatients.length === 0) {
      console.log('Seeding initial patients into Cloud SQL database...');
      for (const p of INITIAL_PATIENTS) {
        await db.insert(patients).values({
          id: p.id,
          patientUid: p.patientUid,
          name: p.name,
          dob: p.dob,
          age: p.age,
          gender: p.gender,
          email: p.email,
          phone: p.phone,
          avatar: p.avatar,
          disease: p.disease || p.emergency?.disease || 'Hypertension',
          takingMedication: p.takingMedication || 'yes',
          password: 'password123',
          bloodType: p.emergency?.bloodType || 'O Rh+',
          allergies: JSON.stringify(p.emergency?.allergies || []),
          chronicConditions: JSON.stringify(p.emergency?.chronicConditions || []),
          medications: JSON.stringify(p.emergency?.medications || []),
          emergencyContacts: JSON.stringify(p.emergency?.emergencyContacts || []),
          qrCodeToken: p.emergency?.qrCodeToken || `QR-${p.patientUid}`
        }).onConflictDoNothing();

        await db.insert(users).values({
          uid: p.id,
          email: p.email,
          role: 'patient',
          passwordHash: 'password123',
          name: p.name
        }).onConflictDoNothing();

        // Seed records
        if (p.records && p.records.length > 0) {
          for (const r of p.records) {
            await db.insert(patientRecords).values({
              id: r.id,
              patientId: p.id,
              date: r.date,
              category: r.category,
              title: r.title,
              facility: r.facility,
              doctor: r.doctor,
              specialty: r.specialty,
              summary: r.summary,
              diagnosisCode: r.diagnosisCode,
              fileAttachment: r.fileAttachment,
              imageUrl: r.imageUrl,
              accessLevel: r.accessLevel,
              biomarkers: r.biomarkers ? JSON.stringify(r.biomarkers) : null
            }).onConflictDoNothing();
          }
        }

        // Seed prescriptions
        if (p.prescriptions && p.prescriptions.length > 0) {
          for (const rx of p.prescriptions) {
            await db.insert(prescriptions).values({
              id: rx.id,
              patientId: p.id,
              medication: rx.medication,
              dosage: rx.dosage,
              frequency: rx.frequency,
              prescribedBy: rx.prescribedBy,
              prescribedDate: rx.prescribedDate,
              refillsRemaining: rx.refillsRemaining,
              maxRefills: rx.maxRefills,
              pharmacy: rx.pharmacy,
              status: rx.status,
              instructions: rx.instructions
            }).onConflictDoNothing();
          }
        }

        // Seed access logs
        if (p.accessLogs && p.accessLogs.length > 0) {
          for (const al of p.accessLogs) {
            await db.insert(accessLogs).values({
              id: al.id,
              patientId: p.id,
              timestamp: al.timestamp,
              actor: al.actor,
              role: al.role,
              facility: al.facility,
              ipAddress: al.ipAddress,
              action: al.action,
              resource: al.resource,
              purpose: al.purpose,
              status: al.status
            }).onConflictDoNothing();
          }
        }
      }
    }
  } catch (err) {
    console.error('Initial database check / seed error:', err);
  }
}

// Run initial seed asynchronously
seedInitialDatabase();

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Database Status Healthcheck
app.get('/api/database/status', async (req, res) => {
  try {
    const docCount = await db.select().from(doctors);
    const patCount = await db.select().from(patients);
    const logCount = await db.select().from(loginHistory);
    res.json({
      connected: true,
      database: 'PostgreSQL (Cloud SQL / Supabase compatible)',
      counts: {
        doctors: docCount.length,
        patients: patCount.length,
        loginHistory: logCount.length
      }
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

// Record Login History & Authenticate
app.post('/api/auth/login', async (req, res) => {
  try {
    const { role, identifier, password, name, loginType, email, phone, bloodGroup, aadharNumber } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    let authenticated = false;
    let foundProfile: any = null;

    const resolvedEmail = email || (identifier.includes('@') ? identifier.trim() : null);
    const resolvedPhone = phone || null;
    const resolvedBlood = bloodGroup || null;
    const resolvedAadhar = aadharNumber || null;

    if (role === 'doctor') {
      const allDocs = await db.select().from(doctors);
      const doc = allDocs.find(d => 
        d.licenseId.toLowerCase() === identifier.toLowerCase() ||
        (d.email && d.email.toLowerCase() === identifier.toLowerCase())
      ) || allDocs[0];

      if (doc) {
        foundProfile = doc;
        // Check password or allow first-time
        if (!password || doc.password === password || loginType === 'doctor-domain') {
          authenticated = true;
          // Update doctor details in database if provided
          await db.update(doctors).set({
            name: name || doc.name,
            email: resolvedEmail || doc.email,
            phone: resolvedPhone || doc.phone,
            bloodGroup: resolvedBlood || doc.bloodGroup || 'O+',
            aadharNumber: resolvedAadhar || doc.aadharNumber || '',
            password: password || doc.password,
            updatedAt: new Date()
          }).where(eq(doctors.id, doc.id));
        } else {
          authenticated = false;
        }
      } else {
        authenticated = true; // allow first time
      }
    } else {
      // Patient login
      const allPats = await db.select().from(patients);
      const cleanIdentDigits = identifier.replace(/\D/g, '');
      const pat = allPats.find(p => 
        p.patientUid.toLowerCase() === identifier.toLowerCase() ||
        p.email.toLowerCase() === identifier.toLowerCase() ||
        p.id.toLowerCase() === identifier.toLowerCase() ||
        (p.idNumber && p.idNumber === cleanIdentDigits) ||
        (cleanIdentDigits.length >= 10 && p.aadharNumber && p.aadharNumber.replace(/\D/g, '').includes(cleanIdentDigits))
      );

      if (pat) {
        foundProfile = pat;
        if (!password || pat.password === password || loginType === 'first-time-mail') {
          authenticated = true;
          // Update patient details if provided during login
          if (resolvedBlood || resolvedAadhar || resolvedPhone) {
            await db.update(patients).set({
              name: name || pat.name,
              phone: resolvedPhone || pat.phone,
              aadharNumber: resolvedAadhar || pat.aadharNumber,
              bloodType: resolvedBlood || pat.bloodType,
              password: password || pat.password,
              updatedAt: new Date()
            }).where(eq(patients.id, pat.id));
          }
        } else {
          authenticated = false;
        }
      } else if (loginType === 'first-time-mail') {
        authenticated = true;
      }
    }

    // Insert into loginHistory table in PostgreSQL with all logginer details
    await db.insert(loginHistory).values({
      role: role || 'patient',
      identifier: identifier.trim(),
      name: name || (foundProfile ? foundProfile.name : identifier),
      email: resolvedEmail || (foundProfile ? foundProfile.email : null),
      phoneNumber: resolvedPhone || (foundProfile ? foundProfile.phone : null),
      bloodGroup: resolvedBlood || (foundProfile ? (foundProfile.bloodGroup || foundProfile.bloodType) : null),
      aadharNumber: resolvedAadhar || (foundProfile ? foundProfile.aadharNumber : null),
      loginType: loginType || 'credential',
      ipAddress: clientIp.split(',')[0].trim(),
      userAgent: userAgent.substring(0, 255),
      status: authenticated ? 'success' : 'failed'
    });

    if (!authenticated) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password or credentials. Please check your credentials.' 
      });
    }

    res.json({
      success: true,
      message: 'Login authenticated and stored in database',
      profile: foundProfile
    });
  } catch (err: any) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Authentication processing error' });
  }
});

// Retrieve Login History from PostgreSQL
app.get('/api/auth/login-history', async (req, res) => {
  try {
    const history = await db.select().from(loginHistory).orderBy(desc(loginHistory.timestamp)).limit(100);
    res.json(history);
  } catch (err: any) {
    console.error('Error fetching login history:', err);
    res.status(500).json({ error: 'Could not fetch login history' });
  }
});

// Get All Patients from Database
app.get('/api/patients', async (req, res) => {
  try {
    const pats = await db.select().from(patients);
    const recs = await db.select().from(patientRecords);
    const rxs = await db.select().from(prescriptions);
    const logs = await db.select().from(accessLogs);

    const fullPatients = pats.map(p => {
      let allergies: string[] = [];
      let chronicConditions: string[] = [];
      let medications: string[] = [];
      let emergencyContacts: any[] = [];

      try { allergies = p.allergies ? JSON.parse(p.allergies) : []; } catch(e) {}
      try { chronicConditions = p.chronicConditions ? JSON.parse(p.chronicConditions) : []; } catch(e) {}
      try { medications = p.medications ? JSON.parse(p.medications) : []; } catch(e) {}
      try { emergencyContacts = p.emergencyContacts ? JSON.parse(p.emergencyContacts) : []; } catch(e) {}

      const patientRecs = recs
        .filter(r => r.patientId === p.id)
        .map(r => {
          let parsedBiomarkers = undefined;
          try {
            if (r.biomarkers) parsedBiomarkers = JSON.parse(r.biomarkers);
          } catch(e) {}
          return {
            ...r,
            biomarkers: parsedBiomarkers
          };
        });

      const patientRxs = rxs.filter(rx => rx.patientId === p.id);
      const patientLogs = logs.filter(l => l.patientId === p.id);

      return {
        id: p.id,
        patientUid: p.patientUid,
        idNumber: p.idNumber || p.patientUid.replace(/\D/g, ''),
        name: p.name,
        dob: p.dob || '1990-01-01',
        age: p.age || 35,
        gender: p.gender || 'Not specified',
        email: p.email,
        phone: p.phone || '',
        aadharNumber: p.aadharNumber || '',
        avatar: p.avatar || '',
        disease: p.disease || '',
        takingMedication: p.takingMedication || 'no',
        password: p.password || 'password123',
        emergency: {
          fullName: p.name,
          dob: p.dob || '',
          bloodType: p.bloodType || 'O Rh+',
          allergies,
          chronicConditions,
          disease: p.disease || '',
          takingMedication: (p.takingMedication as 'yes' | 'no') || 'no',
          medications,
          emergencyContacts,
          organDonor: true,
          cloudSyncEnabled: true,
          lastSynced: 'Just now (Continuous)',
          qrCodeToken: p.qrCodeToken || `QR-${p.patientUid}`
        },
        records: patientRecs,
        prescriptions: patientRxs,
        doctorPermissions: [
          {
            id: 'perm-01',
            doctorName: 'Dr. Marcus Vance, MD',
            specialty: 'Cardiovascular & Internal Medicine',
            hospital: 'St. Jude Academic Medical Center',
            licenseNumber: 'MED-94021',
            grantedDate: '2026-08-10',
            expiresIn: 'Annual Authorized Clinician',
            status: 'active' as const,
            scopes: {
              timeline: true,
              prescriptions: true,
              labReports: true,
              imaging: true,
              emergencyOnly: false
            }
          }
        ],
        accessLogs: patientLogs
      };
    });

    res.json(fullPatients);
  } catch (err: any) {
    console.error('Error fetching patients from database:', err);
    res.status(500).json({ error: 'Could not fetch patients from database' });
  }
});

// Save or Update Patient in Database
app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    const { 
      id, 
      patientUid, 
      name, 
      dob, 
      age, 
      gender, 
      email, 
      phone, 
      avatar, 
      disease, 
      takingMedication, 
      password,
      emergency 
    } = patientData;

    const allergiesStr = emergency?.allergies ? JSON.stringify(emergency.allergies) : '[]';
    const chronicStr = emergency?.chronicConditions ? JSON.stringify(emergency.chronicConditions) : '[]';
    const medsStr = emergency?.medications ? JSON.stringify(emergency.medications) : '[]';
    const contactsStr = emergency?.emergencyContacts ? JSON.stringify(emergency.emergencyContacts) : '[]';

    const cleanUid = patientUid || `DH-${Math.floor(1000 + Math.random() * 9000)}`;
    const computedIdNumber = patientData.idNumber || cleanUid.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000).toString();
    const cleanPassword = password || 'password123';
    const cleanAadhar = patientData.aadharNumber || '';

    const existing = await db.select().from(patients).where(eq(patients.id, id));

    if (existing.length > 0) {
      await db.update(patients).set({
        patientUid: cleanUid,
        idNumber: computedIdNumber,
        name: name || existing[0].name,
        dob: dob || existing[0].dob,
        age: age || existing[0].age,
        gender: gender || existing[0].gender,
        email: email || existing[0].email,
        phone: phone || existing[0].phone,
        aadharNumber: cleanAadhar || existing[0].aadharNumber,
        avatar: avatar || existing[0].avatar,
        disease: disease || existing[0].disease,
        takingMedication: takingMedication || existing[0].takingMedication,
        password: cleanPassword,
        bloodType: emergency?.bloodType || existing[0].bloodType,
        allergies: allergiesStr,
        chronicConditions: chronicStr,
        medications: medsStr,
        emergencyContacts: contactsStr,
        updatedAt: new Date()
      }).where(eq(patients.id, id));
    } else {
      await db.insert(patients).values({
        id,
        patientUid: cleanUid,
        idNumber: computedIdNumber,
        name,
        dob: dob || '1995-01-01',
        age: age || 30,
        gender: gender || 'Female',
        email,
        phone: phone || '',
        aadharNumber: cleanAadhar,
        avatar: avatar || '',
        disease: disease || '',
        takingMedication: takingMedication || 'no',
        password: cleanPassword,
        bloodType: emergency?.bloodType || 'O Rh+',
        allergies: allergiesStr,
        chronicConditions: chronicStr,
        medications: medsStr,
        emergencyContacts: contactsStr,
        qrCodeToken: `QR-${cleanUid}`
      });
    }

    // Always ensure user credentials table has matching patient ID and password
    await db.insert(users).values({
      uid: id,
      email,
      role: 'patient',
      passwordHash: cleanPassword,
      name
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        passwordHash: cleanPassword,
        name
      }
    });

    res.json({ 
      success: true, 
      message: 'Patient, password, and ID number securely saved to database',
      patientUid: cleanUid,
      idNumber: computedIdNumber
    });
  } catch (err: any) {
    console.error('Error saving patient to database:', err);
    res.status(500).json({ error: 'Failed to save patient' });
  }
});

// Get Doctor Profile
app.get('/api/doctor', async (req, res) => {
  try {
    const docs = await db.select().from(doctors).limit(1);
    if (docs.length > 0) {
      const d = docs[0];
      res.json({
        ...d,
        bloodGroup: d.bloodGroup || 'O+',
        aadharNumber: d.aadharNumber || '4589 1234 5678'
      });
    } else {
      res.json(INITIAL_DOCTOR);
    }
  } catch (err: any) {
    console.error('Error fetching doctor from database:', err);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Update Doctor Profile & Password
app.put('/api/doctor', async (req, res) => {
  try {
    const docData = req.body;
    const { id, name, title, specialty, hospital, licenseId, npiNumber, avatar, department, email, phone, bloodGroup, aadharNumber, password } = docData;

    const existing = await db.select().from(doctors).where(eq(doctors.id, id || 'doc-01'));
    if (existing.length > 0) {
      await db.update(doctors).set({
        name: name || existing[0].name,
        title: title || existing[0].title,
        specialty: specialty || existing[0].specialty,
        hospital: hospital || existing[0].hospital,
        licenseId: licenseId || existing[0].licenseId,
        npiNumber: npiNumber || existing[0].npiNumber,
        avatar: avatar || existing[0].avatar,
        department: department || existing[0].department,
        email: email || existing[0].email,
        phone: phone || existing[0].phone,
        bloodGroup: bloodGroup || existing[0].bloodGroup || 'O+',
        aadharNumber: aadharNumber || existing[0].aadharNumber || '',
        password: password || existing[0].password,
        updatedAt: new Date()
      }).where(eq(doctors.id, id || 'doc-01'));
    } else {
      await db.insert(doctors).values({
        id: id || 'doc-01',
        name,
        title,
        specialty,
        hospital,
        licenseId,
        npiNumber,
        avatar,
        department,
        email,
        phone,
        bloodGroup: bloodGroup || 'O+',
        aadharNumber: aadharNumber || '',
        password: password || '9402',
        activePatientsCount: 38
      });
    }

    res.json({ success: true, message: 'Doctor profile and credentials updated in database' });
  } catch (err: any) {
    console.error('Error updating doctor profile in database:', err);
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
});

// Add Patient Record
app.post('/api/records', async (req, res) => {
  try {
    const r = req.body;
    await db.insert(patientRecords).values({
      id: r.id || `rec-${Date.now()}`,
      patientId: r.patientId,
      date: r.date,
      category: r.category,
      title: r.title,
      facility: r.facility,
      doctor: r.doctor,
      specialty: r.specialty,
      summary: r.summary,
      diagnosisCode: r.diagnosisCode,
      fileAttachment: r.fileAttachment,
      imageUrl: r.imageUrl,
      accessLevel: r.accessLevel || 'full',
      biomarkers: r.biomarkers ? JSON.stringify(r.biomarkers) : null
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error adding patient record:', err);
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// Add Prescription
app.post('/api/prescriptions', async (req, res) => {
  try {
    const rx = req.body;
    await db.insert(prescriptions).values({
      id: rx.id || `rx-${Date.now()}`,
      patientId: rx.patientId,
      medication: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      prescribedBy: rx.prescribedBy,
      prescribedDate: rx.prescribedDate,
      refillsRemaining: rx.refillsRemaining || 0,
      maxRefills: rx.maxRefills || 0,
      pharmacy: rx.pharmacy || 'CVS Pharmacy',
      status: rx.status || 'active',
      instructions: rx.instructions
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error adding prescription:', err);
    res.status(500).json({ error: 'Failed to add prescription' });
  }
});

// Add Access Log
app.post('/api/access-logs', async (req, res) => {
  try {
    const log = req.body;
    await db.insert(accessLogs).values({
      id: log.id || `log-${Date.now()}`,
      patientId: log.patientId,
      timestamp: log.timestamp || new Date().toISOString(),
      actor: log.actor,
      role: log.role,
      facility: log.facility,
      ipAddress: log.ipAddress || '127.0.0.1',
      action: log.action,
      resource: log.resource,
      purpose: log.purpose,
      status: log.status || 'Authorized'
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error adding access log:', err);
    res.status(500).json({ error: 'Failed to add access log' });
  }
});

// -------------------------------------------------------------
// DOWNLOAD PROJECT CODEBASE AS A ZIP FILE
// -------------------------------------------------------------
app.get('/api/download-zip', (req, res) => {
  res.attachment('degihealth-project.zip');
  const archive = new (ZipArchive as any)({
    zlib: { level: 9 }
  });

  archive.on('error', (err: any) => {
    console.error('Archive generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  archive.pipe(res);

  // Archive project source code, schemas, and configurations
  archive.glob('**/*', {
    cwd: __dirname,
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      '.vite/**',
      '.cache/**',
      '*.log'
    ],
    dot: true
  });

  archive.finalize();
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (Database: PostgreSQL / Cloud SQL)`);
  });
}

startServer();
