import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token topilmadi" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.teacherId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati tugagan" });
  }
}
