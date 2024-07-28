const {
  uploadSingle,
  deleteFiles,
  uploadMultiple,
} = require("src/utils/uploadFile");
const cloudinary = require("src/config/cloudinary");
const streamifier = require("streamifier");
const sharp = require("sharp");

jest.mock("src/config/cloudinary");
jest.mock("streamifier");
jest.mock("sharp");

describe("uploadFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload a single file", async () => {
    const mockFile = { name: "test", data: "test data" };
    const mockFolder = "testFolder";
    const mockResult = { secure_url: "http://test.com" };

    cloudinary.uploader.upload_stream.mockImplementationOnce(
      (options, callback) => {
        callback(null, mockResult);
        return "stream";
      }
    );

    sharp.mockReturnValue({
      toFormat: jest.fn().mockReturnThis(),
      pipe: jest.fn(),
    });

    const result = await uploadSingle(mockFile, mockFolder);

    expect(result).toEqual({
      secure_url: mockResult.secure_url,
      name: mockFile.name,
    });
  });

  it("should delete a file", async () => {
    const mockName = "testFolder/test";
    const mockResult = { result: "ok" };

    cloudinary.uploader.destroy.mockResolvedValueOnce(mockResult);

    const result = await deleteFiles(mockName);

    expect(result).toEqual(mockResult);
  });

  it("should upload multiple files", async () => {
    const mockReq = {
      files: [
        { originalname: "test1", buffer: "buffer1" },
        { originalname: "test2", buffer: "buffer2" },
      ],
    };
    const mockFolder = "testFolder";
    const mockResult = { secure_url: "http://test.com" };

    cloudinary.uploader.upload_stream.mockImplementation(
      (options, callback) => {
        callback(null, mockResult);
        return "stream";
      }
    );

    streamifier.createReadStream.mockReturnValue({
      pipe: jest.fn().mockReturnThis(),
    });

    const result = await uploadMultiple(mockReq, mockFolder);

    expect(result).toEqual([
      { name: "test1", file: mockResult.secure_url },
      { name: "test2", file: mockResult.secure_url },
    ]);
  });
});
