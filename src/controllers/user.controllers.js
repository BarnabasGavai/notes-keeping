import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(404, "Not Found", ["User not found"]);
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.toString(), ["Refresh token NOT generated"]);
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //get data from body
  const { email, password } = req.body;
  //validation
  if (!email) {
    throw new ApiError(400, "Email is required", ["Field is required"]);
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "Not Found", ["User not found"]);
  }

  //validate password

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials", ["Wrong Password"]);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(400, "Failed to get user data", ["Data unavailable"]);
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  //validation
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required", [
      "All fields are required",
    ]);
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with  this email or username already exists",
      ["User Exists"]
    );
  }

  try {
    const user = await User.create({
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "User was not created", [
        "User registration failed",
      ]);
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    throw new ApiError(500, error.toString(), ["User registration failed"]);
  }
});

const getUser = asyncHandler((req, res) => {
  if (!req.user) {
    throw new ApiError(404, "Not Found", ["User not found"]);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User is authorized"));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  req.user = undefined;

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "UserLogged out Successfully"));
});

export { loginUser, registerUser, getUser, logout };
