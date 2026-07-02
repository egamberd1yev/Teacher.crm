import { attendanceService } from "../services/attendance.service.js";

export const attendanceController = {
  // Kalendarda sana bosilganda - shu kun uchun ro'yxat
  async getByGroupAndDate(req, res) {
    try {
      const { groupId } = req.params;
      const { date } = req.query; // masalan "2026-06-24"
      const result = await attendanceService.getByGroupAndDate(req.teacherId, groupId, date);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // O'quvchi qatorida keldi/kelmadi bosilganda
  async toggleStatus(req, res) {
    try {
      const { studentId } = req.params;
      const { groupId, date } = req.body;
      const result = await attendanceService.toggleStatus(req.teacherId, studentId, groupId, date);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
