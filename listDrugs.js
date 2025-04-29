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

const listDrugs = async () => {
  try {
    const drugs = await Drug.find({});
    console.log(`Found ${drugs.length} drugs:`);
    
    drugs.forEach(drug => {
      console.log(`ID: ${drug._id}`);
      console.log(`Name: ${drug.name}`);
      console.log(`Price: ${drug.price}`);
      console.log(`Requires Prescription: ${drug.requiresPrescription}`);
      console.log('-------------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

listDrugs(); 