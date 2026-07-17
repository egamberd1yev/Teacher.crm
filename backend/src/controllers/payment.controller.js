import { paymentService } from "../services/payment.service.js";

export const paymentController = {
  // O'quvchi ismi ustiga bosilganda chaqiriladi
  async toggleStatus(req, res) {
    try {
      const { studentId } = req.params;
      const { month } = req.body; // masalan "2026-06"
      const payment = await paymentService.toggleStatus(req.teacherId, studentId, month);
      res.status(200).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Guruh sahifasida "kutilayotgan / yig'ilgan" summalarni ko'rsatish uchun
  async getGroupSummary(req, res) {
    try {
      const { groupId } = req.params;
      const { month } = req.query;
      const summary = await paymentService.getGroupSummary(req.teacherId, groupId, month);
      res.status(200).json(summary);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

    async getAll(req, res) {
    try {
      const { month } = req.query;
      const data = await paymentService.getAllForMonth(req.teacherId, month);
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async setAmount(req, res) {
    try {
      const { studentId } = req.params;
      const { month, amount } = req.body;
      const payment = await paymentService.setAmount(req.teacherId, studentId, month, amount);
      res.status(200).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

};
