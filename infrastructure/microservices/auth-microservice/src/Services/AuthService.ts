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

    //  Provera da li postoji korisnik sa prikazanim korisnickim imenom u sistemu
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) {
      await this.auditClient.log(LogType.WARNING, `Пријава одбијена зато што корисник ${data.username} не постоји`);
      return { authenificated: false };
    }

    // Provera da li je tacna lozinka za postojeceg korisnika u sistemu
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      await this.auditClient.log(LogType.WARNING, `Пријава одбијена зато што је нетачна лозинка за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Oba polja se moraju popuniti
    if (!data.username || !data.password) {
      await this.auditClient.log(LogType.ERROR, `Пријава неуспешна зато што обавезна поља недостају`);
      return { authenificated: false };
    }

    // Minimalna duzina lozinke
    if (data.password.length < 6) {
      await this.auditClient.log(LogType.ERROR, `Пријава неуспешна зато што је кратка лозинка за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Minimalna duzina usera
    if (data.username.length < 3) {
      await this.auditClient.log(LogType.ERROR, `Пријава неуспешна зато што је кратко корисничко име за корисника ${data.username}`);
      return { authenificated: false };
    }

    await this.auditClient.log(LogType.INFO, `Пријава прихваћена за корисника ${data.username}`);

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

    if (existingUser) {
      await this.auditClient.log(LogType.WARNING, `Регистрација одбијена зато што је у питању дупликат за корисника ${data.username}/${data.email}`);
      return { authenificated: false };
    }

    // Xesiranje lozinke
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Osnovna validacija za obavezna polja
    if (!data.username || !data.password || !data.email || !data.firstName || !data.lastName || !data.role) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што обавезна поља недостају`);
      return { authenificated: false };
    }

    // Regeks provera za e-mail
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што је неважећи емаил за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Minimalna duzina lozinke
    if (data.password.length < 6) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што је кратка лозинка за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Minimalna duzina usera
    if (data.username.length < 3) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што је кратко корисничко име за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Minimalna duzina imena
    if (data.firstName.length < 2) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што је кратко име за корисника ${data.username}`);
      return { authenificated: false };
    }

    // Minimalna duzina prezimena
    if (data.lastName.length < 2) {
      await this.auditClient.log(LogType.ERROR, `Регистрација неуспешна зато што је кратко презиме за корисника ${data.username}`);
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

    await this.auditClient.log(LogType.INFO, `Регистрација прихваћена за корисника ${savedUser.username}`);

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
