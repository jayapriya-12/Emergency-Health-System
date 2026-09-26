const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'smart_emergency_health_jwt_secret_2026_super_secure',
    { expiresIn: '7d' }
  );
};

// Register User (PATIENT, HOSPITAL, AMBULANCE_DRIVER)
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      role = 'PATIENT',
      // Patient details
      age,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      address,
      latitude,
      longitude,
      medicalNotes,
      // Hospital details
      hospitalName,
      emergencyPhone,
      totalBeds,
      totalICUBeds,
      totalVentilators,
      // Driver details
      licenseNumber,
      experienceYears,
      vehicleNumber,
      vehicleModel,
      ambulanceType
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || '',
        role: role.toUpperCase(),
      }
    });

    const targetRole = role.toUpperCase();

    if (targetRole === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
          age: age ? parseInt(age) : null,
          bloodGroup: bloodGroup || 'O+',
          emergencyContactName: emergencyContactName || '',
          emergencyContactPhone: emergencyContactPhone || '',
          address: address || '',
          latitude: latitude ? parseFloat(latitude) : 13.0604,
          longitude: longitude ? parseFloat(longitude) : 80.2496,
          medicalNotes: medicalNotes || '',
        }
      });
    } else if (targetRole === 'HOSPITAL') {
      await prisma.hospital.create({
        data: {
          userId: user.id,
          name: hospitalName || name,
          phone: phone || '',
          emergencyPhone: emergencyPhone || phone || '',
          address: address || 'Emergency Center',
          latitude: latitude ? parseFloat(latitude) : 13.0604,
          longitude: longitude ? parseFloat(longitude) : 80.2496,
          totalBeds: totalBeds ? parseInt(totalBeds) : 50,
          availableBeds: totalBeds ? parseInt(totalBeds) : 20,
          totalICUBeds: totalICUBeds ? parseInt(totalICUBeds) : 10,
          availableICUBeds: totalICUBeds ? parseInt(totalICUBeds) : 4,
          totalVentilators: totalVentilators ? parseInt(totalVentilators) : 5,
          availableVentilators: totalVentilators ? parseInt(totalVentilators) : 2,
        }
      });
    } else if (targetRole === 'AMBULANCE_DRIVER') {
      let ambulance = null;
      if (vehicleNumber) {
        ambulance = await prisma.ambulance.create({
          data: {
            vehicleNumber,
            vehicleModel: vehicleModel || 'Emergency Response Van',
            type: ambulanceType || 'ALS',
            status: 'AVAILABLE',
            latitude: latitude ? parseFloat(latitude) : 13.0604,
            longitude: longitude ? parseFloat(longitude) : 80.2496,
          }
        });
      }

      await prisma.ambulanceDriver.create({
        data: {
          userId: user.id,
          licenseNumber: licenseNumber || `DL-${Date.now()}`,
          experienceYears: experienceYears ? parseInt(experienceYears) : 2,
          status: 'AVAILABLE',
          latitude: latitude ? parseFloat(latitude) : 13.0604,
          longitude: longitude ? parseFloat(longitude) : 80.2496,
          currentAmbulanceId: ambulance ? ambulance.id : null,
        }
      });
    }

    const token = generateToken(user.id, user.role);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { patient: true, hospital: true, driver: { include: { ambulance: true } } }
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        patient: fullUser.patient,
        hospital: fullUser.hospital,
        driver: fullUser.driver,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        hospital: true,
        driver: { include: { ambulance: true } }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        patient: user.patient,
        hospital: user.hospital,
        driver: user.driver,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patient: true,
        hospital: true,
        driver: { include: { ambulance: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        patient: user.patient,
        hospital: user.hospital,
        driver: user.driver,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

module.exports = { register, login, getMe };
