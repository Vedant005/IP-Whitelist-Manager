import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { AuditLog } from "../models/audit.model.js";

/**
 * Generate
 * @param {string | number} userId
 */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password, role].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  const clientIp = req.ip || req.connection.remoteAddress;

  if (existedUser) {
    await AuditLog.create({
      eventType: "AUTH_FAILURE",
      ipAddress: clientIp,
      details: {
        action: "Registration attempt",
        email,
        reason: "User already exists",
      },
    });

    return res.status(400).json(new ApiError(400), "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    await AuditLog.create({
      eventType: "SYSTEM_ERROR",
      ipAddress: clientIp,
      details: {
        action: "Registration attempt",
        email,
        reason: "Unable to create user",
      },
    });
    return res.status(500).json(new ApiError(500, "Unable to create user"));
  }

  await AuditLog.create({
    eventType: "USER_REGISTER",
    userId: user._id,
    ipAddress: clientIp,
    details: { email: user.email, role: user.role },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const clientIp = req.ip || req.connection.remoteAddress;

  if (!email) {
    await AuditLog.create({
      eventType: "AUTH_FAILURE",
      ipAddress: clientIp,
      details: {
        action: "Registration attempt",
        email,
        reason: "Email not given",
      },
    });
    return res.status(400).json(new ApiError(400), "Please enter email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    await AuditLog.create({
      eventType: "AUTH_FAILURE",
      ipAddress: clientIp,
      details: {
        action: "Login attempt",
        email,
        reason: "Invalid credentials - User not found",
      },
    });
    return res.status(400).json(new ApiError(400), "Invalid credentails");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    await AuditLog.create({
      eventType: "AUTH_FAILURE",
      ipAddress: clientIp,
      details: {
        action: "Login attempt",
        email,
        reason: "Invalid credentials - User not found",
      },
    });
    return res.status(400).json(new ApiError(400), "Invalid credentails");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        //set :{refreshToken:undefined}
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  const clientIp = req.ip || req.connection.remoteAddress;

  if (!incomingRefreshToken) {
    await AuditLog.create({
      eventType: "AUTH_FAILURE",
      ipAddress: clientIp,
      details: {
        action: "Token refresh attempt",
        email,
        reason: "Unable to retrieve token",
      },
    });
    return res.status(500).json(new ApiError(500), "Unable to retrieve token");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      await AuditLog.create({
        eventType: "AUTH_FAILURE",
        ipAddress: clientIp,
        details: {
          action: "User finding",
          email,
          reason: "User not found",
        },
      });
      return res.status(400).json(new ApiError(400), "User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      await AuditLog.create({
        eventType: "AUTH_FAILURE",
        ipAddress: clientIp,
        details: {
          action: "Token refresh attempt",
          email,
          reason: "Tokens did not match",
        },
      });
      return res.status(500).json(new ApiError(500), "Tokens did not match");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
