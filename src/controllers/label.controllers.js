import { Label } from "../models/label.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateLabelOwnership = async (labelId, userId) => {
  const label = await Label.findById(labelId);
  if (!label) {
    throw new ApiError(404, "LABEL NOT FOUND", ["Not Found"]);
  }
  if (label.userId.toString() !== userId.toString()) {
    throw new ApiError(401, "Unauthorized", [
      "Not authorized to access this label",
    ]);
  }
  return label;
};

const createLabel = asyncHandler(async (req, res) => {
  const { labelValue } = req.body;
  const userId = req.user._id;
  if (!req.user) {
    throw new ApiError(403, "User invalid", ["User details not available"]);
  }

  try {
    const myLabel = await Label.create({ labelValue, userId });
    if (!myLabel) {
      throw new ApiError(500, "Failed to create Label", [
        "Label creation failed",
      ]);
    }
    return res.json(
      new ApiResponse(200, myLabel, "Label created successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.toString(), ["Label creation failed"]);
  }
});

const updateLabel = asyncHandler(async (req, res) => {
  const { labelValue } = req.body;
  let { labelId } = req.params;
  labelId = labelId.substring(1, labelId.length);
  await validateLabelOwnership(labelId, req.user._id.toString());
  const label = await Label.findByIdAndUpdate(
    labelId,
    { labelValue },
    { new: true }
  );

  return res.json(new ApiResponse(200, label, "Updated Successfully"));
});

const getLabels = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "User invalid", ["User details not available"]);
  }
  try {
    const labels = await Label.find({ userId: { $eq: req.user._id } });
    return res.json(new ApiResponse(200, labels));
  } catch (err) {
    throw new ApiError(503, err.toString(), ["Cannot get labels"]);
  }
});

const deleteLabel = asyncHandler(async (req, res) => {
  let { labelId } = req.params;

  labelId = labelId.toString().substring(1, labelId.toString().length);

  await validateLabelOwnership(labelId, req.user._id);
  try {
    await Label.findByIdAndDelete(labelId);
  } catch (err) {
    throw new ApiError(500, "Delete UNSUCCESSFUL", ["NONE"]);
  }

  return res.json(new ApiResponse(200, {}, "Delete successful"));
});

export { createLabel, updateLabel, deleteLabel, getLabels };
