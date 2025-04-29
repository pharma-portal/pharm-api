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

const findDrug = async () => {
  try {
    const drug = await Drug.findOne({ name: 'Amoxicillin' });
    
    if (drug) {
      console.log('Found drug:');
      console.log({
        _id: drug._id,
        name: drug.name,
        description: drug.description,
        price: drug.price,
        requiresPrescription: drug.requiresPrescription
      });
    } else {
      console.log('Drug not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

findDrug(); 