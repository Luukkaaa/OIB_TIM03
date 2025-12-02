import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "../audit-types/LogType";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>, private auditClient: AuditLogClient) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    // Osnovne validacije pre rada sa bazom
    if (!data.username || !data.password) {
      await this.auditClient.log(LogType.ERROR, "Prijava neuspesna: korisnicko ime i lozinka su obavezni");
      return { authenificated: false };
    }
    if (data.username.length < 3) {
      await this.auditClient.log(LogType.ERROR, `Prijava neuspesna: korisnicko ime je prekratko (${data.username})`);
      return { authenificated: false };
    }
    if (data.password.length < 6) {
      await this.auditClient.log(LogType.ERROR, `Prijava neuspesna: lozinka je prekratka za korisnika ${data.username}`);
      return { authenificated: false };
    }

    // Provera da li postoji korisnik
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) {
      await this.auditClient.log(LogType.WARNING, `Prijava neuspesna: korisnik ${data.username} ne postoji`);
      return { authenificated: false };
    }

    // Provera lozinke
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      await this.auditClient.log(LogType.WARNING, `Prijava neuspesna: pogresna lozinka za korisnika ${data.username}`);
      return { authenificated: false };
    }

    await this.auditClient.log(LogType.INFO, `Korisnik ${data.username} se uspesno prijavio`);

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
    // Osnovne validacije pre rada sa bazom
    if (!data.username || !data.password || !data.email || !data.firstName || !data.lastName || !data.role) {
      await this.auditClient.log(LogType.ERROR, "Registracija neuspesna: nedostaju obavezna polja");
      return { authenificated: false };
    }
    if (data.username.length < 3) {
      await this.auditClient.log(LogType.ERROR, `Registracija neuspesna: korisnicko ime je prekratko (${data.username})`);
      return { authenificated: false };
    }
    if (data.password.length < 6) {
      await this.auditClient.log(LogType.ERROR, `Registracija neuspesna: lozinka je prekratka za korisnika ${data.username}`);
      return { authenificated: false };
    }
    if (data.firstName.length < 2) {
      await this.auditClient.log(LogType.ERROR, `Registracija neuspesna: ime je prekratko za korisnika ${data.username}`);
      return { authenificated: false };
    }
    if (data.lastName.length < 2) {
      await this.auditClient.log(LogType.ERROR, `Registracija neuspesna: prezime je prekratko za korisnika ${data.username}`);
      return { authenificated: false };
    }
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      await this.auditClient.log(LogType.ERROR, `Registracija neuspesna: neispravan email za korisnika ${data.username}`);
      return { authenificated: false };
    }

    // Provera jedinstvenosti
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });
    if (existingUser) {
      await this.auditClient.log(LogType.WARNING, `Registracija neuspesna: korisnik ili email vec postoje (${data.username}/${data.email})`);
      return { authenificated: false };
    }

    // Hesiranje lozinke i cuvanje
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

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

    await this.auditClient.log(LogType.INFO, `Registrovan novi korisnik ${savedUser.username} (${savedUser.role})`);

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
