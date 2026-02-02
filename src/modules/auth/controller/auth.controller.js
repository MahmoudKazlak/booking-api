import bcrypt from "bcrypt";
import sendEmail from "../../../services/email.js";
import jwt from "jsonwebtoken";
import userModel from "../../../../DB/model/user.model.js";
import confirmEmailTemplate from "../../../tamplates/signup.tamplate.js";

export const signup = async (req, res) => {
  const { userName, email, password } = req.body;
  const user = await userModel.findOne({ email }).select("email");
  if (user) {
    res.status(409).json({ message: "email exists" });
  } else {
    const newUser = await userModel({
      userName,
      email,
      password,
    });
    if (!newUser) {
      res.status(400).json({ message: "fail to register" });
    } else {
      const token = jwt.sign({ id: newUser._id }, process.env.EMAILTOKEN, {
        expiresIn: "1h",
      });
      let info;
      try {
        info = await sendEmail(
          email,
          "confirm email",
          confirmEmailTemplate(req, token, userName)
        );
        console.log("Email sent:", info.accepted);
      } catch (emailError) {
        console.error("Failed to send email:", emailError.message);
        return res.status(500).json({
          message: "Email service error",
          error: emailError.message,
        });
      }

      if (info?.accepted?.length) {
        const savedUser = await newUser.save();
        return res.status(201).json({
          message: "success",
          savedUser: savedUser._id,
        });
      } else {
        return res.status(400).json({ message: "Email not accepted" });
      }
    }
  }
};

export const confirmEmail = async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.EMAILTOKEN);
  if (!decoded) {
    res.status(400).json({ message: "Invalid token" });
  } else {
    const user = await userModel.findOneAndUpdate(
      { _id: decoded.id, confirmEmail: false },
      { confirmEmail: true }
    );
    if (!user) {
      res.status(400).json({ message: "account already confirmed" });
    } else {
      res.status(200).json({ message: "Email confirmed plz login" });
    }
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new Error("Invalid login credentials", { cause: 400 }));
    }

    if (!user.confirmEmail) {
      const rtoken = jwt.sign({ id: user._id }, process.env.EMAILTOKEN, {
        expiresIn: "5m",
      });
      const message = `<a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${rtoken}">Click to confirm</a>`;

      await sendEmail(user.email, "Confirm Email", message);
      return res
        .status(400)
        .json({ message: "Please confirm your email. A link has been sent." });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "This account is blocked" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SIGNINTOKEN, {
      expiresIn: "2h",
    });

    return res.status(200).json({ message: "Success", token });
  } catch (error) {
    return next(new Error(error.message, { cause: 500 }));
  }
};

export const sendCode = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email }).select("email");
  let token = jwt.sign({ id: user._id }, process.env.FORGOTPASSWORDTOKEN, {
    expiresIn: "1h",
  });
  if (!user) {
    res.json({ message: "User not found" });
  } else {
    const code = nanoid();
    await sendEmail(email, "Forgot Password", `Verify Code :${code}`);
    

    const updateUser = await userModel.updateOne(
      { _id: user._id },
      { sendCode: code }
    );
    if (!updateUser) {
      res.json({ message: "failed" });
    } else {
      res.json({ message: "Success", token });
    }
  }
};

export const forgotPassword = async (req, res) => {
  const { otp, email, newPassword } = req.body;
  let { token } = req.headers;
  if (!token.startsWith(process.env.authBearerToken)) {
    res.json({ message: "invalid barear" });
  }
  token = token.split(process.env.authBearerToken)[1];
  console.log(token);
  const decoded = jwt.verify(token, process.env.FORGOTPASSWORDTOKEN);
  if (otp == null || !decoded) {
    res.json({ message: "fail" });
  } else {
    const hash = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALTROUND)
    );
    const user = await userModel.findOneAndUpdate(
      {
        email,
        sendCode: otp,
        _id: decoded.id,
      },
      { password: hash }
    );
    if (!user) {
      res.json({ message: "failed" });
    } else {
      res.json({ message: "Success" });
    }
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.refreshTokenEmail);
  if (!decoded?.id) {
    res.json({ message: "invalid token payload" });
  } else {
    const user = await userModel.findById(decoded.id).select("email");
    if (!user) {
      res.json({ messagE: "not registered user" });
    } else {
      let token = await jwt.sign({ id: user._id }, process.env.EMAILTOKEN, {
        expiresIn: 60 * 5,
      });
      let message = `
        <a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}">
        Click to confirm your email
        </a>`;
      await sendMail(user.email, "confirm email", message);
      res.status(201).json({ message: "Success" });
    }
  }
};
