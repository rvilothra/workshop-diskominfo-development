const { Admin, initializeDatabase } = require("../lib/sequelize");

async function createAdmin() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Username: admin");
      console.log("Password: admin123");
      return;
    }

    // Create admin user
    const admin = await Admin.create({
      username: "admin",
      password: "admin123",
      email: "admin@example.com"
    });

    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Admin ID:", admin.id);

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
