const roles = {
  User: "user",
  Admin: "admin",
};

export const endpoint = {
  Admin: [roles.Admin],
  All: [roles.Admin, roles.User],
};
