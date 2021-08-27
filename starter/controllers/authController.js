const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);
    res.status(201).json({
      status: "success",
      token: token,
      data: {
        user: newUser,
      },
    });
    next();
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exists
    if (!email || !password) {
      res.status(404).json({
        status: "fail",
        message: "Plese enter correct email and password",
      });
      return next();
    }

    // Check if user exists and the password is correct
    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: "fail",
        message: "Incorrect credentials",
      });

      return next();
    }
    // If everything is okay, send token to the client
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token: token,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    // Get the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);
    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "Please login",
      });
      return next();
    }

    // Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      res.status(401).json({
        status: "fail",
        message: "Please login",
      });
      return next();
    }
    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      res.status(401).json({
        status: "fail",
        message: "Please login.Password changed",
      });
      return next();
    }
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is array ["admin","lead-guide"]
    if (!roles.includes(req.user.role)) {
      return next();
    }

    next();
  };
};
