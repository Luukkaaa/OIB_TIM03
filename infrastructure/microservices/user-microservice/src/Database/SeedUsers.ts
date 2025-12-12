import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { User } from "../Domain/models/User";
import { UserRole } from "../Domain/enums/UserRole";

const defaultUsers: Array<{
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}> = [
  {
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@oib.local",
    role: UserRole.ADMIN,
    password: "Admin123!",
  },
  {
    username: "sales_manager",
    firstName: "Sales",
    lastName: "Manager",
    email: "sales.manager@oib.local",
    role: UserRole.SALES_MANAGER,
    password: "Sales123!",
  },
  {
    username: "seller",
    firstName: "Store",
    lastName: "Seller",
    email: "seller@oib.local",
    role: UserRole.SELLER,
    password: "Seller123!",
  },
];

export async function seedInitialUsers(userRepository: Repository<User>): Promise<void> {
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

  for (const seed of defaultUsers) {
    const existing = await userRepository.findOne({
      where: [{ username: seed.username }, { email: seed.email }],
    });

    if (existing) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(seed.password, saltRounds);
    const newUser = userRepository.create({
      username: seed.username,
      firstName: seed.firstName,
      lastName: seed.lastName,
      email: seed.email,
      role: seed.role,
      password: hashedPassword,
      profileImage: null,
    });

    await userRepository.save(newUser);
    console.log(`\x1b[34m[DbSeed@users]\x1b[0m Kreiran korisnik ${seed.username} (${seed.role})`);
  }
}
