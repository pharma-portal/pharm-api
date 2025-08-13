import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/categoryModel.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Drug Categories with Subcategories
    const drugCategories = [
      {
        name: 'Antibiotics',
        description: 'Medications that fight bacterial infections',
        type: 'drug',
        displayOrder: 1,
        subcategories: [
          { name: 'Penicillins', description: 'Beta-lactam antibiotics like Amoxicillin' },
          { name: 'Cephalosporins', description: 'Broad-spectrum antibiotics' },
          { name: 'Macrolides', description: 'Azithromycin, Erythromycin' },
          { name: 'Tetracyclines', description: 'Doxycycline, Minocycline' },
          { name: 'Fluoroquinolones', description: 'Ciprofloxacin, Levofloxacin' },
          { name: 'Aminoglycosides', description: 'Gentamicin, Amikacin' }
        ]
      },
      {
        name: 'Pain Relief',
        description: 'Medications for pain management',
        type: 'drug',
        displayOrder: 2,
        subcategories: [
          { name: 'NSAIDs', description: 'Non-steroidal anti-inflammatory drugs' },
          { name: 'Opioids', description: 'Strong pain medications' },
          { name: 'Acetaminophen', description: 'Paracetamol-based pain relief' },
          { name: 'Muscle Relaxants', description: 'For muscle pain and spasms' },
          { name: 'Topical Pain Relief', description: 'Creams and gels for local pain' }
        ]
      },
      {
        name: 'Cardiovascular',
        description: 'Medications for heart and blood vessel conditions',
        type: 'drug',
        displayOrder: 3,
        subcategories: [
          { name: 'ACE Inhibitors', description: 'Blood pressure medications' },
          { name: 'Beta Blockers', description: 'Heart rate and blood pressure control' },
          { name: 'Calcium Channel Blockers', description: 'Blood vessel relaxation' },
          { name: 'Diuretics', description: 'Water pill medications' },
          { name: 'Statins', description: 'Cholesterol-lowering medications' },
          { name: 'Anticoagulants', description: 'Blood thinning medications' }
        ]
      },
      {
        name: 'Respiratory',
        description: 'Medications for breathing and lung conditions',
        type: 'drug',
        displayOrder: 4,
        subcategories: [
          { name: 'Bronchodilators', description: 'Asthma and COPD medications' },
          { name: 'Inhaled Corticosteroids', description: 'Anti-inflammatory inhalers' },
          { name: 'Expectorants', description: 'Cough and mucus medications' },
          { name: 'Decongestants', description: 'Nasal congestion relief' },
          { name: 'Antihistamines', description: 'Allergy and hay fever relief' }
        ]
      },
      {
        name: 'Mental Health',
        description: 'Medications for mental health conditions',
        type: 'drug',
        displayOrder: 5,
        subcategories: [
          { name: 'Antidepressants', description: 'Depression and anxiety medications' },
          { name: 'Antianxiety', description: 'Anxiety and panic disorder medications' },
          { name: 'Antipsychotics', description: 'Psychosis and schizophrenia medications' },
          { name: 'Mood Stabilizers', description: 'Bipolar disorder medications' },
          { name: 'ADHD Medications', description: 'Attention deficit hyperactivity disorder' }
        ]
      },
      {
        name: 'Diabetes',
        description: 'Medications for diabetes management',
        type: 'drug',
        displayOrder: 6,
        subcategories: [
          { name: 'Insulin', description: 'Various types of insulin' },
          { name: 'Oral Medications', description: 'Metformin, Sulfonylureas' },
          { name: 'GLP-1 Agonists', description: 'Injectable diabetes medications' },
          { name: 'DPP-4 Inhibitors', description: 'Oral diabetes medications' },
          { name: 'SGLT2 Inhibitors', description: 'Newer diabetes medications' }
        ]
      },
      {
        name: 'Vitamins & Supplements',
        description: 'Essential vitamins and dietary supplements',
        type: 'drug',
        displayOrder: 7,
        subcategories: [
          { name: 'Multivitamins', description: 'Complete vitamin supplements' },
          { name: 'Vitamin D', description: 'Sunshine vitamin supplements' },
          { name: 'Vitamin C', description: 'Immune system support' },
          { name: 'B Vitamins', description: 'Energy and metabolism support' },
          { name: 'Minerals', description: 'Iron, Calcium, Zinc supplements' },
          { name: 'Omega-3', description: 'Fish oil and fatty acid supplements' }
        ]
      },
      {
        name: 'Gastrointestinal',
        description: 'Medications for digestive system conditions',
        type: 'drug',
        displayOrder: 8,
        subcategories: [
          { name: 'Antacids', description: 'Acid reflux and heartburn relief' },
          { name: 'Proton Pump Inhibitors', description: 'Long-term acid control' },
          { name: 'Antiemetics', description: 'Nausea and vomiting relief' },
          { name: 'Laxatives', description: 'Constipation relief' },
          { name: 'Antidiarrheals', description: 'Diarrhea control' },
          { name: 'Probiotics', description: 'Gut health supplements' }
        ]
      }
    ];

    // Mart Categories with Subcategories
    const martCategories = [
      {
        name: 'Personal Care',
        description: 'Personal hygiene and care products',
        type: 'mart',
        displayOrder: 1,
        subcategories: [
          { name: 'Oral Care', description: 'Toothbrushes, toothpaste, mouthwash' },
          { name: 'Hair Care', description: 'Shampoo, conditioner, hair styling' },
          { name: 'Skin Care', description: 'Moisturizers, cleansers, sunscreens' },
          { name: 'Bath & Body', description: 'Soaps, body wash, lotions' },
          { name: 'Feminine Care', description: 'Sanitary products and hygiene' },
          { name: 'Men\'s Grooming', description: 'Shaving, beard care, grooming' }
        ]
      },
      {
        name: 'Baby Products',
        description: 'Products for infants and toddlers',
        type: 'mart',
        displayOrder: 2,
        subcategories: [
          { name: 'Diapers & Wipes', description: 'Baby diapers and cleaning wipes' },
          { name: 'Baby Food', description: 'Formula, baby food, snacks' },
          { name: 'Baby Care', description: 'Baby shampoo, lotion, powder' },
          { name: 'Baby Feeding', description: 'Bottles, pacifiers, feeding accessories' },
          { name: 'Baby Health', description: 'Thermometers, medicine dispensers' }
        ]
      },
      {
        name: 'Health Supplements',
        description: 'Natural health supplements and herbs',
        type: 'mart',
        displayOrder: 3,
        subcategories: [
          { name: 'Herbal Supplements', description: 'Natural herb-based supplements' },
          { name: 'Protein Supplements', description: 'Whey, casein, plant proteins' },
          { name: 'Weight Management', description: 'Weight loss and gain supplements' },
          { name: 'Sports Nutrition', description: 'Pre-workout, post-workout supplements' },
          { name: 'Immune Support', description: 'Immunity boosting supplements' },
          { name: 'Sleep Aids', description: 'Natural sleep support supplements' }
        ]
      },
      {
        name: 'Medical Devices',
        description: 'Home medical equipment and devices',
        type: 'mart',
        displayOrder: 4,
        subcategories: [
          { name: 'Monitoring Devices', description: 'Blood pressure, glucose monitors' },
          { name: 'Mobility Aids', description: 'Walkers, canes, wheelchairs' },
          { name: 'Respiratory Equipment', description: 'Nebulizers, CPAP machines' },
          { name: 'Orthopedic Support', description: 'Braces, supports, compression' },
          { name: 'Home Care', description: 'Bed pans, commodes, mobility aids' }
        ]
      },
      {
        name: 'First Aid',
        description: 'First aid supplies and emergency care',
        type: 'mart',
        displayOrder: 5,
        subcategories: [
          { name: 'Bandages & Dressings', description: 'Adhesive bandages, gauze' },
          { name: 'Antiseptics', description: 'Disinfectants and cleaning solutions' },
          { name: 'Pain Relief', description: 'Topical pain relief products' },
          { name: 'Emergency Supplies', description: 'First aid kits and emergency items' },
          { name: 'Wound Care', description: 'Advanced wound care products' }
        ]
      },
      {
        name: 'Wellness',
        description: 'Wellness and lifestyle products',
        type: 'mart',
        displayOrder: 6,
        subcategories: [
          { name: 'Fitness & Exercise', description: 'Exercise equipment and accessories' },
          { name: 'Nutrition & Diet', description: 'Meal replacement, diet products' },
          { name: 'Stress Relief', description: 'Relaxation and stress management' },
          { name: 'Alternative Medicine', description: 'Acupuncture, homeopathy supplies' },
          { name: 'Health Books', description: 'Health and wellness literature' }
        ]
      },
      {
        name: 'Dental Care',
        description: 'Dental hygiene and oral health products',
        type: 'mart',
        displayOrder: 7,
        subcategories: [
          { name: 'Toothbrushes', description: 'Manual and electric toothbrushes' },
          { name: 'Toothpaste', description: 'Various types of toothpaste' },
          { name: 'Dental Floss', description: 'Floss and interdental cleaners' },
          { name: 'Mouthwash', description: 'Oral rinses and fresheners' },
          { name: 'Dental Accessories', description: 'Tongue cleaners, dental picks' }
        ]
      },
      {
        name: 'Vision Care',
        description: 'Eye care and vision products',
        type: 'mart',
        displayOrder: 8,
        subcategories: [
          { name: 'Contact Lenses', description: 'Daily, weekly, monthly contacts' },
          { name: 'Contact Solutions', description: 'Cleaning and storage solutions' },
          { name: 'Eye Drops', description: 'Lubricating and medicated eye drops' },
          { name: 'Eye Care Accessories', description: 'Contact cases, eye masks' },
          { name: 'Reading Glasses', description: 'Over-the-counter reading glasses' }
        ]
      }
    ];

    console.log('📝 Creating main categories...');

    // Create main categories first
    const createdDrugCategories = [];
    const createdMartCategories = [];

    for (const categoryData of drugCategories) {
      const { subcategories, ...mainCategory } = categoryData;
      const category = await Category.create(mainCategory);
      createdDrugCategories.push({ category, subcategories });
    }

    for (const categoryData of martCategories) {
      const { subcategories, ...mainCategory } = categoryData;
      const category = await Category.create(mainCategory);
      createdMartCategories.push({ category, subcategories });
    }

    console.log('✅ Created main categories');

    console.log('📝 Creating subcategories...');

    // Create subcategories
    for (const { category, subcategories } of [...createdDrugCategories, ...createdMartCategories]) {
      for (const subcategoryData of subcategories) {
        await Category.create({
          ...subcategoryData,
          type: category.type,
          parent: category._id,
          displayOrder: 1
        });
      }
    }

    console.log('✅ Created subcategories');

    // Display the complete category structure
    const allCategories = await Category.find({}).populate('parent', 'name').sort('displayOrder');
    
    console.log('\n📋 Complete Category Structure:');
    console.log('\n💊 Drug Categories:');
    allCategories
      .filter(cat => cat.type === 'drug')
      .forEach(cat => {
        const indent = cat.parent ? '  ' : '';
        console.log(`${indent}${cat.name}${cat.parent ? ` (under ${cat.parent.name})` : ''}`);
      });

    console.log('\n🛍️  Mart Categories:');
    allCategories
      .filter(cat => cat.type === 'mart')
      .forEach(cat => {
        const indent = cat.parent ? '  ' : '';
        console.log(`${indent}${cat.name}${cat.parent ? ` (under ${cat.parent.name})` : ''}`);
      });

    console.log(`\n✨ Categories seeded successfully!`);
    console.log(`📊 Total Categories: ${allCategories.length}`);
    console.log(`💊 Drug Categories: ${allCategories.filter(c => c.type === 'drug' && !c.parent).length}`);
    console.log(`🛍️  Mart Categories: ${allCategories.filter(c => c.type === 'mart' && !c.parent).length}`);
    console.log(`🔗 Subcategories: ${allCategories.filter(c => c.parent).length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

seedCategories(); 