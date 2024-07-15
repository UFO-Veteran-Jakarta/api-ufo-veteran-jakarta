const exampleService = require("../services/exampleService");

exports.getExample = async (req, res) => {
  try {
    const data = await exampleService.getExampleData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
