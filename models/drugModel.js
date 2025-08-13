import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const drugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter drug name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter drug description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter drug price'],
    min: 0
  },
  brand: {
    type: String,
    required: [true, 'Please enter drug brand']
  },
  category: {
    type: String,
    required: [true, 'Please enter drug category'],
    enum: [
      // Main Drug Categories
      'Antibiotics',
      'Pain Relief',
      'Cardiovascular',
      'Respiratory',
      'Mental Health',
      'Diabetes',
      'Vitamins & Supplements',
      'Gastrointestinal',
      'Over the counter(OTC)',
      'Prescription only medicine(POM)',
      'Uncategorized',
      // Antibiotic Subcategories
      'Penicillins',
      'Cephalosporins',
      'Macrolides',
      'Tetracyclines',
      'Fluoroquinolones',
      'Aminoglycosides',
      // Pain Relief Subcategories
      'NSAIDs',
      'Opioids',
      'Acetaminophen',
      'Muscle Relaxants',
      'Topical Pain Relief',
      // Cardiovascular Subcategories
      'ACE Inhibitors',
      'Beta Blockers',
      'Calcium Channel Blockers',
      'Diuretics',
      'Statins',
      'Anticoagulants',
      // Respiratory Subcategories
      'Bronchodilators',
      'Inhaled Corticosteroids',
      'Expectorants',
      'Decongestants',
      'Antihistamines',
      // Mental Health Subcategories
      'Antidepressants',
      'Antianxiety',
      'Antipsychotics',
      'Mood Stabilizers',
      'ADHD Medications',
      // Diabetes Subcategories
      'Insulin',
      'Oral Medications',
      'GLP-1 Agonists',
      'DPP-4 Inhibitors',
      'SGLT2 Inhibitors',
      // Vitamins & Supplements Subcategories
      'Multivitamins',
      'Vitamin D',
      'Vitamin C',
      'B Vitamins',
      'Minerals',
      'Omega-3',
      // Gastrointestinal Subcategories
      'Antacids',
      'Proton Pump Inhibitors',
      'Antiemetics',
      'Laxatives',
      'Antidiarrheals',
      'Probiotics'
    ]
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Number,
    required: [true, 'Please enter stock quantity'],
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'low_stock'],
    default: 'out_of_stock'
  },
  dosageForm: {
    type: String,
    required: true,
    // enum: ['tablet', 'capsule', 'liquid', 'cream', 'ointment', 'injection', 'other']
  },
  strength: {
    type: String,
    required: true
  },
  ingredients: {
    type: String,
    required: [true, 'Please enter drug ingredients/composition']
  },
  dosage: {
    type: String,
    required: [true, 'Please enter dosage information']
  },
  directionsForUse: {
    type: String,
    required: [true, 'Please enter directions for use']
  },
  suitableFor: {
    type: String,
    required: [true, 'Please enter suitable age groups/conditions']
  },
  caution: {
    type: String,
    required: [true, 'Please enter caution/warning information']
  },
  storage: {
    type: String,
    required: [true, 'Please enter storage instructions']
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '/uploads/default-drug.jpg'
  }
}, {
  timestamps: true
});

// Calculate average rating when reviews are modified
drugSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, review) => review.rating + acc, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }

  // Update status based on inStock quantity
  if (this.inStock > 10) {
    this.status = 'available';
  } else if (this.inStock > 0) {
    this.status = 'low_stock';
  } else {
    this.status = 'out_of_stock';
  }

  next();
});

// Static method to get all available categories
drugSchema.statics.getCategories = function() {
  return this.schema.path('category').enumValues;
};

// Static method to get main categories only
drugSchema.statics.getMainCategories = function() {
  return [
    'Antibiotics',
    'Pain Relief',
    'Cardiovascular',
    'Respiratory',
    'Mental Health',
    'Diabetes',
    'Vitamins & Supplements',
    'Gastrointestinal',
    'Over the counter(OTC)',
    'Prescription only medicine(POM)',
    'Uncategorized'
  ];
};

// Static method to get subcategories for a main category
drugSchema.statics.getSubcategories = function(mainCategory) {
  const subcategoryMap = {
    'Antibiotics': ['Penicillins', 'Cephalosporins', 'Macrolides', 'Tetracyclines', 'Fluoroquinolones', 'Aminoglycosides'],
    'Pain Relief': ['NSAIDs', 'Opioids', 'Acetaminophen', 'Muscle Relaxants', 'Topical Pain Relief'],
    'Cardiovascular': ['ACE Inhibitors', 'Beta Blockers', 'Calcium Channel Blockers', 'Diuretics', 'Statins', 'Anticoagulants'],
    'Respiratory': ['Bronchodilators', 'Inhaled Corticosteroids', 'Expectorants', 'Decongestants', 'Antihistamines'],
    'Mental Health': ['Antidepressants', 'Antianxiety', 'Antipsychotics', 'Mood Stabilizers', 'ADHD Medications'],
    'Diabetes': ['Insulin', 'Oral Medications', 'GLP-1 Agonists', 'DPP-4 Inhibitors', 'SGLT2 Inhibitors'],
    'Vitamins & Supplements': ['Multivitamins', 'Vitamin D', 'Vitamin C', 'B Vitamins', 'Minerals', 'Omega-3'],
    'Gastrointestinal': ['Antacids', 'Proton Pump Inhibitors', 'Antiemetics', 'Laxatives', 'Antidiarrheals', 'Probiotics']
  };
  
  return subcategoryMap[mainCategory] || [];
};

const Drug = mongoose.model('Drug', drugSchema);
export default Drug; 