import jwt from "jsonwebtoken";
import userModel from "../../DB/model/user.model.js";

export const auth = (accessRoles = []) => {
  return async (req, res, next) => {
    try {
      let { token } = req.headers;
      if (!token.startsWith(process.env.BEARERKEY)) {
        res.status(400).json({ message: "invalid token bearer" });
      } else {
        token = token.split(process.env.BEARERKEY)[1];
        const decoded = jwt.verify(token, process.env.SIGNINTOKEN);
        if (!decoded) {
          res.status(400).json({ message: "invalid token payload" });
        } else {
          const user = await userModel.findById(decoded.id).select("_id role");
          if (!user) {
            res.status(401).json({ message: "not reg user" });
          } else {
            if (!accessRoles.includes(user.role)) {
              res.status(403).json({ message: "un authorized user" });
            } else {
              req.user = user;
              next();
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "server error", error });
    }
  };
};
