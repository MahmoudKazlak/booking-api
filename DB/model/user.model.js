import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "username is required"],
      minlength: [3, "min length is 3"],
      maxlength: [25, "max length is 25"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 6,
    },
    phone: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    image: String,
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
