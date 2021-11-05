const advanceResult =
  (model, ...populate) =>
  async (req, res, next) => {
    const { select, sort } = req.query;

    // Number value filter
    const queryStr = JSON.stringify(req.query);
    const queryFilter = queryStr.replace(
      /\b(lt|lte|gt|gte|in)\b/g,
      match => `$${match}`
    );

    let DBQuery = model.find(JSON.parse(queryFilter));

    // Filtering field
    if (select) {
      const selected = select.split(',').join(' ');
      DBQuery = DBQuery.select(selected);
    }

    // Sorting
    if (sort) {
      const sorted = sort.split(',').join(' ');
      DBQuery = DBQuery.sort(sorted);
    } else {
      DBQuery = DBQuery.sort('-createdAt');
    }

    // Pagination
    const total = await model.countDocuments();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    DBQuery.skip(startIndex).limit(limit);

    const pagination = {};

    if (startIndex > 0) {
      pagination.prev = page - 1;
    }

    if (endIndex < total) {
      pagination.next = page + 1;
    }

    // Populate
    if (populate) {
      DBQuery = DBQuery.populate(populate);
    }

    const results = await DBQuery;

    req.advanceResult = {
      success: true,
      count: results.length ? results.length : undefined,
      pagination: results.length ? pagination : undefined,
      data: results,
    };

    next();
  };

module.exports = advanceResult;
