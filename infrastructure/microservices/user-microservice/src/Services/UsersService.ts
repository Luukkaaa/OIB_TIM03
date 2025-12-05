import { Repository } from "typeorm";
import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { CreateUserDTO } from "../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../Domain/DTOs/UpdateUserDTO";
import bcrypt from "bcryptjs";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "../audit-types/LogType";

export class UsersService implements IUsersService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>, private auditClient: AuditLogClient) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.find();
    await this.auditClient.log(LogType.INFO, `Dohvaceni svi korisnici (${users.length})`);
    return users.map((u) => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      await this.auditClient.log(LogType.WARNING, `Korisnik sa ID ${id} nije pronadjen`);
      throw new Error(`User with ID ${id} not found`);
    }
    await this.auditClient.log(LogType.INFO, `Dohvacen korisnik ${user.username} (ID ${user.id})`);
    return this.toDTO(user);
  }

  /**
   * Create user with validation of unique username/email and hashed password
   */
  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    const existing = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });
    if (existing) {
      await this.auditClient.log(
        LogType.WARNING,
        `Neuspesno kreiranje korisnika - username/email vec postoji (${data.username}/${data.email})`
      );
      throw new Error("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser = this.userRepository.create({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      password: hashedPassword,
      email: data.email,
      profileImage: data.profileImage ?? null,
    });

    const saved = await this.userRepository.save(newUser);
    await this.auditClient.log(LogType.INFO, `Kreiran korisnik ${saved.username} sa ulogom ${saved.role}`);
    return this.toDTO(saved);
  }

  /**
   * Update user by ID (optionally hash password, ensure unique email)
   */
  async updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      await this.auditClient.log(LogType.WARNING, `Azuriranje neuspesno - korisnik sa ID ${id} nije pronadjen`);
      throw new Error(`User with ID ${id} not found`);
    }

    if (data.username) {
      const usernameConflict = await this.userRepository.findOne({ where: { username: data.username } });
      if (usernameConflict && usernameConflict.id !== id) {
        await this.auditClient.log(
          LogType.WARNING,
          `Azuriranje korisnika ${id} neuspesno - username zauzet (${data.username})`
        );
        throw new Error("Username already in use");
      }
      user.username = data.username;
    }

    if (data.email) {
      const conflict = await this.userRepository.findOne({ where: { email: data.email } });
      if (conflict && conflict.id !== id) {
        await this.auditClient.log(LogType.WARNING, `Azuriranje korisnika ${id} neuspesno - email zauzet (${data.email})`);
        throw new Error("Email already in use");
      }
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, this.saltRounds);
    }
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role;
    if (data.email !== undefined) user.email = data.email;
    if (data.profileImage !== undefined) user.profileImage = data.profileImage;

    const saved = await this.userRepository.save(user);
    await this.auditClient.log(LogType.INFO, `Azuriran korisnik ${saved.username} (ID ${saved.id})`);
    return this.toDTO(saved);
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) {
      await this.auditClient.log(LogType.WARNING, `Brisanje neuspesno - korisnik sa ID ${id} nije pronadjen`);
      throw new Error(`User with ID ${id} not found`);
    }
    await this.auditClient.log(LogType.INFO, `Obrisan korisnik sa ID ${id}`);
  }

  /**
   * Search users by substring across username, firstName, lastName, email
   */
  async searchUsers(query: string): Promise<UserDTO[]> {
    const users = await this.userRepository
      .createQueryBuilder("user")
      .where("user.username LIKE :q", { q: `%${query}%` })
      .orWhere("user.firstName LIKE :q", { q: `%${query}%` })
      .orWhere("user.lastName LIKE :q", { q: `%${query}%` })
      .orWhere("user.email LIKE :q", { q: `%${query}%` })
      .getMany();

    await this.auditClient.log(
      LogType.INFO,
      `Pretraga korisnika upit="${query}" -> ${users.length} rezultat(a)`
    );

    return users.map((u) => this.toDTO(u));
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ?? "",
    };
  }
}
