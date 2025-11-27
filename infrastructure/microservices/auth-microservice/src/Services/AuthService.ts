import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) return { authenificated: false };

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) return { authenificated: false };

    // Oba polja se moraju popuniti
    if (!data.username || !data.password) {
      return { authenificated: false };
    }

    return {
      authenificated: true,
      userData: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Register new user
   */
  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {

    // Provera da li korsisnik sa datim imenom ili emailom vec postoji
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) return { authenificated: false };

    // Xesiranje lozinke
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Osnovna validacija za obavezna polja
    if (!data.username || !data.password || !data.email || !data.firstName || !data.lastName || !data.role) {
      return { authenificated: false };
    }

    // Regeks provera za e-mail
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      return { authenificated: false };
    }

    // Minimalna duzina lozinke
    if (data.password.length < 6) {
      return { authenificated: false };
    }

    // Dodavanje novog korisnika
    const newUser = this.userRepository.create({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(newUser);

    return {
      authenificated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
      },
    };
  }
}
