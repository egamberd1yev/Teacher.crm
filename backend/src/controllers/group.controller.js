import { groupService } from "../services/group.service.js";

export const groupController = {
  async create(req, res) {
    try {
      const group = await groupService.create(req.teacherId, req.body);
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async findAll(req, res) {
    try {
      const groups = await groupService.findAllByTeacher(req.teacherId);
      res.status(200).json(groups);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async findOne(req, res) {
    try {
      const group = await groupService.findOne(req.teacherId, req.params.id);
      res.status(200).json(group);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const group = await groupService.update(req.teacherId, req.params.id, req.body);
      res.status(200).json(group);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async remove(req, res) {
    try {
      await groupService.remove(req.teacherId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
