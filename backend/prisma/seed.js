const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Emergency Healthcare Database...');

  // Hash standard password for demo accounts
  const defaultPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@emergency.org' },
    update: {},
    create: {
      email: 'admin@emergency.org',
      name: 'System Administrator',
      password: adminPassword,
      phone: '+1 800-999-0000',
      role: 'ADMIN',
    },
  });

  // 2. Hospitals
  const hospital1User = await prisma.user.upsert({
    where: { email: 'citygeneral@hospital.com' },
    update: {},
    create: {
      email: 'citygeneral@hospital.com',
      name: 'City General Super Specialty Hospital',
      password: defaultPassword,
      phone: '+91 44 2835 1111',
      role: 'HOSPITAL',
    },
  });

  const hospital1 = await prisma.hospital.upsert({
    where: { userId: hospital1User.id },
    update: {},
    create: {
      userId: hospital1User.id,
      name: 'City General Super Specialty Hospital',
      phone: '+91 44 2835 1111',
      emergencyPhone: '+91 44 2835 9999',
      address: '124 Anna Salai, Thousand Lights, Chennai, TN',
      latitude: 13.0604,
      longitude: 80.2496,
      isVerified: true,
      totalBeds: 120,
      availableBeds: 34,
      totalICUBeds: 25,
      availableICUBeds: 8,
      totalVentilators: 12,
      availableVentilators: 4,
      emergencyDeptStatus: 'OPEN',
      oxygenAvailable: true,
    },
  });

  const hospital2User = await prisma.user.upsert({
    where: { email: 'apollo@hospital.com' },
    update: {},
    create: {
      email: 'apollo@hospital.com',
      name: 'Apollo Trauma & Emergency Center',
      password: defaultPassword,
      phone: '+91 44 2829 0200',
      role: 'HOSPITAL',
    },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { userId: hospital2User.id },
    update: {},
    create: {
      userId: hospital2User.id,
      name: 'Apollo Trauma & Emergency Center',
      phone: '+91 44 2829 0200',
      emergencyPhone: '+91 44 2829 1066',
      address: '21 Greams Lane, Off Greams Road, Chennai, TN',
      latitude: 13.0587,
      longitude: 80.2520,
      isVerified: true,
      totalBeds: 200,
      availableBeds: 45,
      totalICUBeds: 40,
      availableICUBeds: 12,
      totalVentilators: 20,
      availableVentilators: 7,
      emergencyDeptStatus: 'OPEN',
      oxygenAvailable: true,
    },
  });

  const hospital3User = await prisma.user.upsert({
    where: { email: 'stjude@hospital.com' },
    update: {},
    create: {
      email: 'stjude@hospital.com',
      name: 'St. Jude Medical & Trauma Care',
      password: defaultPassword,
      phone: '+91 44 2434 5678',
      role: 'HOSPITAL',
    },
  });

  const hospital3 = await prisma.hospital.upsert({
    where: { userId: hospital3User.id },
    update: {},
    create: {
      userId: hospital3User.id,
      name: 'St. Jude Medical & Trauma Care',
      phone: '+91 44 2434 5678',
      emergencyPhone: '+91 44 2434 9108',
      address: '78 Harrington Road, Chetpet, Chennai, TN',
      latitude: 13.0732,
      longitude: 80.2378,
      isVerified: true,
      totalBeds: 80,
      availableBeds: 18,
      totalICUBeds: 15,
      availableICUBeds: 3,
      totalVentilators: 8,
      availableVentilators: 2,
      emergencyDeptStatus: 'OPEN',
      oxygenAvailable: true,
    },
  });

  // Add hospital facilities
  const facilitiesData = [
    { hospitalId: hospital1.id, facilityName: '24/7 Level 1 Trauma Center', isAvailable: true, description: 'Dedicated cardiac & neuro emergency response team' },
    { hospitalId: hospital1.id, facilityName: 'Advanced Cardiac ICU', isAvailable: true, description: 'ECMO and cath-lab facility available' },
    { hospitalId: hospital1.id, facilityName: 'Helipad Emergency Transport', isAvailable: true, description: 'Air ambulance landing pad on rooftop' },
    { hospitalId: hospital2.id, facilityName: 'Comprehensive Stroke Center', isAvailable: true, description: 'Rapid CT angiography & thrombolytic care' },
    { hospitalId: hospital2.id, facilityName: 'Neonatal Emergency ICU (NICU)', isAvailable: true, description: 'Specialized infant life support equipment' },
    { hospitalId: hospital3.id, facilityName: 'Burn & Plastic Trauma Unit', isAvailable: true, description: 'Sterile isolation beds for severe burn patients' },
  ];

  for (const fac of facilitiesData) {
    await prisma.hospitalFacility.create({ data: fac });
  }

  // 3. Ambulances & Drivers
  // Ambulance 1
  const ambulance1 = await prisma.ambulance.upsert({
    where: { vehicleNumber: 'TN-01-EM-1008' },
    update: {},
    create: {
      vehicleNumber: 'TN-01-EM-1008',
      vehicleModel: 'Force Traveller ALS (Advanced Life Support)',
      type: 'ALS',
      hospitalId: hospital1.id,
      status: 'AVAILABLE',
      latitude: 13.0620,
      longitude: 80.2470,
    },
  });

  const driver1User = await prisma.user.upsert({
    where: { email: 'driver1@ambulance.com' },
    update: {},
    create: {
      email: 'driver1@ambulance.com',
      name: 'John Doe (Paramedic Lead)',
      password: defaultPassword,
      phone: '+91 98765 43210',
      role: 'AMBULANCE_DRIVER',
    },
  });

  await prisma.ambulanceDriver.upsert({
    where: { userId: driver1User.id },
    update: {},
    create: {
      userId: driver1User.id,
      licenseNumber: 'DL-TN01-20180099',
      experienceYears: 6,
      status: 'AVAILABLE',
      latitude: 13.0620,
      longitude: 80.2470,
      currentAmbulanceId: ambulance1.id,
    },
  });

  // Ambulance 2
  const ambulance2 = await prisma.ambulance.upsert({
    where: { vehicleNumber: 'TN-01-EM-2024' },
    update: {},
    create: {
      vehicleNumber: 'TN-01-EM-2024',
      vehicleModel: 'Tata Winger Mobile ICU Unit',
      type: 'ICU_MOBILE',
      hospitalId: hospital2.id,
      status: 'AVAILABLE',
      latitude: 13.0560,
      longitude: 80.2540,
    },
  });

  const driver2User = await prisma.user.upsert({
    where: { email: 'driver2@ambulance.com' },
    update: {},
    create: {
      email: 'driver2@ambulance.com',
      name: 'Sarah Connor',
      password: defaultPassword,
      phone: '+91 98765 11223',
      role: 'AMBULANCE_DRIVER',
    },
  });

  await prisma.ambulanceDriver.upsert({
    where: { userId: driver2User.id },
    update: {},
    create: {
      userId: driver2User.id,
      licenseNumber: 'DL-TN01-20190044',
      experienceYears: 4,
      status: 'AVAILABLE',
      latitude: 13.0560,
      longitude: 80.2540,
      currentAmbulanceId: ambulance2.id,
    },
  });

  // Ambulance 3
  const ambulance3 = await prisma.ambulance.upsert({
    where: { vehicleNumber: 'TN-01-EM-3099' },
    update: {},
    create: {
      vehicleNumber: 'TN-01-EM-3099',
      vehicleModel: 'Mahindra Bolero Emergency Ambulance',
      type: 'BLS',
      hospitalId: hospital3.id,
      status: 'AVAILABLE',
      latitude: 13.0710,
      longitude: 80.2350,
    },
  });

  const driver3User = await prisma.user.upsert({
    where: { email: 'driver3@ambulance.com' },
    update: {},
    create: {
      email: 'driver3@ambulance.com',
      name: 'Michael Scott',
      password: defaultPassword,
      phone: '+91 98765 55443',
      role: 'AMBULANCE_DRIVER',
    },
  });

  await prisma.ambulanceDriver.upsert({
    where: { userId: driver3User.id },
    update: {},
    create: {
      userId: driver3User.id,
      licenseNumber: 'DL-TN01-20200088',
      experienceYears: 5,
      status: 'AVAILABLE',
      latitude: 13.0710,
      longitude: 80.2350,
      currentAmbulanceId: ambulance3.id,
    },
  });

  // 4. Patients
  const patient1User = await prisma.user.upsert({
    where: { email: 'patient@demo.com' },
    update: {},
    create: {
      email: 'patient@demo.com',
      name: 'Robert Chen',
      password: defaultPassword,
      phone: '+91 99887 76655',
      role: 'PATIENT',
    },
  });

  const patient1 = await prisma.patient.upsert({
    where: { userId: patient1User.id },
    update: {},
    create: {
      userId: patient1User.id,
      age: 45,
      bloodGroup: 'O+',
      emergencyContactName: 'Alice Chen (Wife)',
      emergencyContactPhone: '+91 99887 76600',
      address: '45 Cathedral Road, Gopalapuram, Chennai, TN',
      latitude: 13.0512,
      longitude: 80.2562,
      medicalNotes: 'History of Hypertension & mild asthma',
    },
  });

  const patient2User = await prisma.user.upsert({
    where: { email: 'emily@demo.com' },
    update: {},
    create: {
      email: 'emily@demo.com',
      name: 'Emily Davis',
      password: defaultPassword,
      phone: '+91 91234 56789',
      role: 'PATIENT',
    },
  });

  await prisma.patient.upsert({
    where: { userId: patient2User.id },
    update: {},
    create: {
      userId: patient2User.id,
      age: 31,
      bloodGroup: 'B+',
      emergencyContactName: 'Mark Davis (Brother)',
      emergencyContactPhone: '+91 91234 56700',
      address: '12 Nungambakkam High Rd, Chennai, TN',
      latitude: 13.0618,
      longitude: 80.2415,
      medicalNotes: 'No known allergies',
    },
  });

  // Sample Historical Emergency Request
  await prisma.emergencyRequest.create({
    data: {
      patientId: patient1.id,
      hospitalId: hospital1.id,
      status: 'COMPLETED',
      emergencyType: 'CARDIAC',
      severity: 'CRITICAL',
      pickupLatitude: 13.0512,
      pickupLongitude: 80.2562,
      pickupAddress: '45 Cathedral Road, Gopalapuram, Chennai, TN',
      destinationLatitude: 13.0604,
      destinationLongitude: 80.2496,
      destinationAddress: hospital1.address,
      notes: 'Patient reported sharp chest pain radiating to left arm.',
      requestedAt: new Date(Date.now() - 86400000), // 1 day ago
      acceptedAt: new Date(Date.now() - 86100000),
      completedAt: new Date(Date.now() - 84000000),
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
