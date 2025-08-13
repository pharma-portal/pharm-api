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

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Main Mart Categories
      'Personal Care',
      'Baby Products',
      'Health Supplements',
      'Medical Devices',
      'First Aid',
      'Wellness',
      'Dental Care',
      'Vision Care',
      'Over the counter(OTC)',
      'Prescription only medicine(POM)',
      'Uncategorized',
      // Personal Care Subcategories
      'Oral Care',
      'Hair Care',
      'Skin Care',
      'Bath & Body',
      'Feminine Care',
      'Men\'s Grooming',
      // Baby Products Subcategories
      'Diapers & Wipes',
      'Baby Food',
      'Baby Care',
      'Baby Feeding',
      'Baby Health',
      // Health Supplements Subcategories
      'Herbal Supplements',
      'Protein Supplements',
      'Weight Management',
      'Sports Nutrition',
      'Immune Support',
      'Sleep Aids',
      // Medical Devices Subcategories
      'Monitoring Devices',
      'Mobility Aids',
      'Respiratory Equipment',
      'Orthopedic Support',
      'Home Care',
      // First Aid Subcategories
      'Bandages & Dressings',
      'Antiseptics',
      'Pain Relief',
      'Emergency Supplies',
      'Wound Care',
      // Wellness Subcategories
      'Fitness & Exercise',
      'Nutrition & Diet',
      'Stress Relief',
      'Alternative Medicine',
      'Health Books',
      // Dental Care Subcategories
      'Toothbrushes',
      'Toothpaste',
      'Dental Floss',
      'Mouthwash',
      'Dental Accessories',
      // Vision Care Subcategories
      'Contact Lenses',
      'Contact Solutions',
      'Eye Drops',
      'Eye Care Accessories',
      'Reading Glasses'
    ]
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  reviews: [reviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weight: {
    type: String
  },
  dimensions: {
    type: String
  },
  barcode: {
    type: String
  },
  suitableFor: {
    type: String,
    required: [true, 'Please enter suitable age groups/conditions']
  },
  caution: {
    type: String,
    required: [true, 'Please enter caution/warning information']
  },
  howToUse: {
    type: String,
    required: [true, 'Please enter how to use instructions']
  },
  specifications: {
    type: String,
    required: [true, 'Please enter product specifications']
  }
}, {
  timestamps: true
});

// Static method to get all available categories
productSchema.statics.getCategories = function() {
  return this.schema.path('category').enumValues;
};

// Static method to get main categories only
productSchema.statics.getMainCategories = function() {
  return [
    'Personal Care',
    'Baby Products',
    'Health Supplements',
    'Medical Devices',
    'First Aid',
    'Wellness',
    'Dental Care',
    'Vision Care',
    'Over the counter(OTC)',
    'Prescription only medicine(POM)',
    'Uncategorized'
  ];
};

// Static method to get subcategories for a main category
productSchema.statics.getSubcategories = function(mainCategory) {
  const subcategoryMap = {
    'Personal Care': ['Oral Care', 'Hair Care', 'Skin Care', 'Bath & Body', 'Feminine Care', 'Men\'s Grooming'],
    'Baby Products': ['Diapers & Wipes', 'Baby Food', 'Baby Care', 'Baby Feeding', 'Baby Health'],
    'Health Supplements': ['Herbal Supplements', 'Protein Supplements', 'Weight Management', 'Sports Nutrition', 'Immune Support', 'Sleep Aids'],
    'Medical Devices': ['Monitoring Devices', 'Mobility Aids', 'Respiratory Equipment', 'Orthopedic Support', 'Home Care'],
    'First Aid': ['Bandages & Dressings', 'Antiseptics', 'Pain Relief', 'Emergency Supplies', 'Wound Care'],
    'Wellness': ['Fitness & Exercise', 'Nutrition & Diet', 'Stress Relief', 'Alternative Medicine', 'Health Books'],
    'Dental Care': ['Toothbrushes', 'Toothpaste', 'Dental Floss', 'Mouthwash', 'Dental Accessories'],
    'Vision Care': ['Contact Lenses', 'Contact Solutions', 'Eye Drops', 'Eye Care Accessories', 'Reading Glasses']
  };
  
  return subcategoryMap[mainCategory] || [];
};

const Product = mongoose.model('Product', productSchema);
export default Product; 