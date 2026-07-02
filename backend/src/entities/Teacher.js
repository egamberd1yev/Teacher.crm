import { EntitySchema } from "typeorm";

export const TeacherEntity = new EntitySchema({
  name: "Teacher",
  tableName: "teachers",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    fullName: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    refreshToken: {
      type: "varchar",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    groups: {
      type: "one-to-many",
      target: "Group",
      inverseSide: "teacher",
    },
  },
});
