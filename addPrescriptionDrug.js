import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Drug from './models/drugModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const addPrescriptionDrug = async () => {
  try {
    // Create a drug that requires prescription
    const prescriptionDrug = new Drug({
      name: 'Amoxicillin',
      description: 'Antibiotic medication used to treat bacterial infections',
      price: 50.00,
      brand: 'PharmaBrand',
      category: 'Antibiotics',
      requiresPrescription: true,
      inStock: 100,
      dosageForm: 'tablet',
      strength: '500mg',
      image: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/pharmacy/drugs/default-drug.jpg'
    });

    await prescriptionDrug.save();
    console.log('Prescription drug added successfully!');
    console.log('Drug details:');
    console.log(prescriptionDrug);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

addPrescriptionDrug(); 