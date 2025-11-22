const { log } = require('console');
const mongoose = require('mongoose');

// Cache for dynamic models
const modelCache = new Map();

/**
 * Create or get a dynamic model for a cluster
 * @param {string} collectionName - Name of the collection
 * @param {Object} schemaDefinition - Optional schema fields
 * @param {boolean} strict - Whether schema is strict
 * @returns {mongoose.Model}
 */
const getDynamicModel = (collectionName, schemaDefinition = null, strict = false) => {
  // Check cache first
  if (modelCache.has(collectionName)) {
    return modelCache.get(collectionName);
  }

  // Create schema
  const schemaOptions = {
    strict: strict,
    timestamps: true,
    collection: collectionName,
  };

  let schema;
  
  if (schemaDefinition && schemaDefinition.fields && schemaDefinition.fields.length > 0) {
    // Build schema from definition
    const schemaFields = {};
    schemaDefinition.fields.forEach((field) => {
      const fieldType = getMongooseType(field.type);
      const fieldConfig = {
        type: fieldType,
        required: field.required || false,
      };

      if (field.default !== undefined) {
        fieldConfig.default = field.default;
      }

      if (field.enum && field.enum.length > 0) {
        fieldConfig.enum = field.enum;
      }

      schemaFields[field.name] = fieldConfig;
    });

    schema = new mongoose.Schema(schemaFields, schemaOptions);
  } else {
    // No schema - use flexible schema
    schema = new mongoose.Schema({}, schemaOptions);
  }

  // Create and cache model
  const model = mongoose.model(collectionName, schema);
  modelCache.set(collectionName, model);

  return model;
};

/**
 * Get Mongoose type from string
 */
const getMongooseType = (typeString) => {
  const typeMap = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: Array,
    Object: Object,
    Mixed: mongoose.Schema.Types.Mixed,
  };
  return typeMap[typeString] || mongoose.Schema.Types.Mixed;
};

/**
 * Create indexes for a model
 */
const createIndexes = async (model, indexes) => {
  if (!indexes || indexes.length === 0) {
    return;
  }

  const indexDefinitions = {};
  indexes.forEach((index) => {
    indexDefinitions[index.field] = index.order || 1;
  });

  try {
    await model.collection.createIndex(indexDefinitions);
    // If unique flag is set, create unique index
    const uniqueIndexes = indexes.filter((idx) => idx.unique);
    for (const uniqueIndex of uniqueIndexes) {
      await model.collection.createIndex({ [uniqueIndex.field]: 1 }, { unique: true });
    }
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

/**
 * Clear model from cache
 */
const clearModelCache = (collectionName) => {
  if (modelCache.has(collectionName)) {
    modelCache.delete(collectionName);
  }

  
  delete mongoose.models[collectionName];
  // delete mongoose.modelSchemas[collectionName];
};

module.exports = {
  getDynamicModel,
  createIndexes,
  clearModelCache,
};

