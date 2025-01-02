import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  let token;
  try {
    const mytoken =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");
    token = mytoken;
  } catch (err) {
    throw new ApiError(401, "Unauthorized", ["Invalid user"]);
  }

  if (!token) {
    throw new ApiError(401, "Unauthorized", ["User not authorized"]);
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized", ["User invalid"]);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token", [
      "Invalid access token",
    ]);
  }
});
