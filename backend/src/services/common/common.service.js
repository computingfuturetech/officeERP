/**
 * Create a new document in the specified model.
 * @param {Mongoose.Model} Model
 * @param {Object} data
 * @param {Object} options - optional
 */
async function createDocument(Model, data, options) {
  const doc = new Model(data);
  return await doc.save(options);
}

/**
 * Create many documents in the specified model.
 * @param {Mongoose.Model} Model
 * @param {Array<Object>} dataArray
 * @param {Object} options - Mongoose insertMany options (e.g. { ordered: false })
 */
async function createManyDocuments(Model, dataArray, options = {}) {
  return await Model.insertMany(dataArray, options);
}

/**
 * Get one document by ID.
 * @param {Mongoose.Model} Model
 * @param {String} id
 * @param {Object} populateOptions - optional
 */
async function getDocumentById(Model, id, populateOptions = null) {
  let query = Model.findById(id);
  if (populateOptions) query = query.populate(populateOptions);
  return await query.exec();
}

/**
 * Get documents with pagination.
 * @param {Mongoose.Model} Model
 * @param {Object} filters
 * @param {Object} options { page, limit, sort, populate, projection, lean }
 */
async function getDocuments(Model, filters = {}, options = {}) {
  const {
    sort = { createdAt: -1 },
    populate = "",
    projection = null,
    lean = true,
  } = options;
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;

  const skip = (page - 1) * limit;

  const [totalDocs, docs] = await Promise.all([
    Model.countDocuments(filters),
    Model.find(filters, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate)
      .lean(lean),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    data: docs,
    meta: {
      pagination: {
        totalDocs,
        limit,
        totalPages,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    },
  };
}

/**
 * Get documents with pagination.
 * @param {Mongoose.Model} Model
 * @param {Object} filters
 * @param {Object} options
 */
async function getAllDocuments(Model, filters = {}, options = {}) {
  const {
    sort = { createdAt: -1 },
    populate = "",
    projection = null,
    lean = true,
  } = options;

  const docs = Model.find(filters, projection)
    .sort(sort)
    .populate(populate)
    .lean(lean);

  return docs;
}

/**
 * Update a document by ID.
 * @param {Mongoose.Model} Model
 * @param {String} id
 * @param {Object} updateData
 * @param {Object} options - Mongoose options (e.g., { new: true })
 */
async function updateDocumentById(
  Model,
  id,
  updateData,
  options = { new: true }
) {
  return await Model.findByIdAndUpdate(id, updateData, options).exec();
}

/**
 * Delete a document by ID.
 * @param {Mongoose.Model} Model
 * @param {String} id
 */
async function deleteDocumentById(Model, id) {
  return await Model.findByIdAndDelete(id).exec();
}

module.exports = {
  createDocument,
  createManyDocuments,
  getDocumentById,
  getDocuments,
  getAllDocuments,
  updateDocumentById,
  deleteDocumentById,
};
