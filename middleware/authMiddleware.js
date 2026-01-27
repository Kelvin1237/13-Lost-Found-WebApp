import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication invalid" });
  }

  try {
    const user = verifyJWT(token);
    const { userId, role } = user;
    req.user = { userId, role };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication invalid" });
  }
};
