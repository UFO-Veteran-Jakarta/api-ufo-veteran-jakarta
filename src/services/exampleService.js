const exampleModel = require("../models/exampleModel");

exports.getExampleData = async () => {
  return await exampleModel.getExampleData();
};
