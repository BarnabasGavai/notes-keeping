import { Note } from "../models/note.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Label } from "../models/label.models.js";

const createNote = asyncHandler(async (req, res) => {
  try {
    const { subject, content, labelId, backgroundColor, fontColor } = req.body;
    const userId = req.user._id;
    let label;

    if (labelId) {
      try {
        label = await Label.findOne({ _id: labelId, userId: req.user._id });
        if (!label) {
          label = undefined;
        }
      } catch (error) {
        label = undefined;
        throw new ApiError(404, "Label does not exist", ["Bad request"]);
      }
    } else {
      label = undefined;
    }

    if (!req.user) {
      throw new ApiError(403, "User invalid", ["User details not available"]);
    }

    const myNote = await Note.create({
      subject,
      content,
      backgroundColor,
      fontColor,
      userId,
      labelId: label,
    });

    return res.json(new ApiResponse(200, myNote, "Successfully Created"));
  } catch (err) {
    throw new ApiError(500, err.toString(), ["Note creation failed"]);
  }
});

const deleteNote = asyncHandler(async (req, res) => {
  let { noteId } = req.params;
  noteId = noteId.substring(1, noteId.length);
  const note = await Note.findById(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  if (note.userId.toString() !== req.user._id.toString()) {
    throw new ApiError("500", "Unauthenticated");
  }
  try {
    await Note.findByIdAndDelete(noteId);
    return res.json(new ApiResponse(200, {}, "Deleted Successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to delete note");
  }
});

const updateNote = asyncHandler(async (req, res) => {
  let { noteId } = req.params;
  noteId = noteId.substring(1, noteId.length);

  const updates = req.body;
  const note = await Note.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  if (note.userId.toString() !== req.user._id.toString()) {
    throw new ApiError("500", "Unauthenticated");
  }
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { ...updates, labelId: updates.labelId || null },
      {
        new: true,
      }
    );
    return res.json(new ApiResponse(200, updatedNote, "Updated Success"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const getNotes = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(new ApiResponse(200, notes));
  } catch (err) {
    throw new ApiError(400, err);
  }
});

export { createNote, deleteNote, updateNote, getNotes };
