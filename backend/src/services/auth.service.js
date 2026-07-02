import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { teacherRepository } from "../repositories/teacher.repository.js";

function generateTokens(teacher) {
  const accessToken = jwt.sign({ id: teacher.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: teacher.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register({ fullName, email, password, phone }) {
    const existing = await teacherRepository.findOneBy({ email });
    if (existing) {
      throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = teacherRepository.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    await teacherRepository.save(teacher);

    const { accessToken, refreshToken } = generateTokens(teacher);
    teacher.refreshToken = refreshToken;
    await teacherRepository.save(teacher);

    return {
      teacher: { id: teacher.id, fullName: teacher.fullName, email: teacher.email },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }) {
    const teacher = await teacherRepository.findOneBy({ email });
    if (!teacher) {
      throw new Error("Email yoki parol noto'g'ri");
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      throw new Error("Email yoki parol noto'g'ri");
    }

    const { accessToken, refreshToken } = generateTokens(teacher);
    teacher.refreshToken = refreshToken;
    await teacherRepository.save(teacher);

    return {
      teacher: { id: teacher.id, fullName: teacher.fullName, email: teacher.email },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token) {
    if (!token) throw new Error("Refresh token topilmadi");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new Error("Refresh token yaroqsiz");
    }

    const teacher = await teacherRepository.findOneBy({ id: decoded.id });
    if (!teacher || teacher.refreshToken !== token) {
      throw new Error("Refresh token mos kelmadi");
    }

    const tokens = generateTokens(teacher);
    teacher.refreshToken = tokens.refreshToken;
    await teacherRepository.save(teacher);

    return tokens;
  },
};
