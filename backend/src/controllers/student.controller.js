import { studentService } from "../services/student.service.js";

export const studentController = {
  async create(req, res) {
    try {
      const student = await studentService.create(req.teacherId, req.params.groupId, req.body);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async findAllByGroup(req, res) {
    try {
      const students = await studentService.findAllByGroup(req.teacherId, req.params.groupId);
      res.status(200).json(students);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const student = await studentService.update(req.teacherId, req.params.id, req.body);
      res.status(200).json(student);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async remove(req, res) {
    try {
      await studentService.remove(req.teacherId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
