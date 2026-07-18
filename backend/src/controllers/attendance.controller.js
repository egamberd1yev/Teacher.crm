import { attendanceService } from "../services/attendance.service.js";

export const attendanceController = {
  async getByGroupAndDate(req, res) {
    try {
      const { groupId } = req.params;
      const { date } = req.query;
      const result = await attendanceService.getByGroupAndDate(req.teacherId, groupId, date);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async setStatus(req, res) {
    try {
      const { studentId } = req.params;
      const { groupId, date, status, reason } = req.body;
      const result = await attendanceService.setStatus(req.teacherId, studentId, groupId, date, status, reason);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};