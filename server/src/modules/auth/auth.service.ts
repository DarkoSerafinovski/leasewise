import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Autentifikacija korisnika na osnovu email-a i lozinke.
   * Proverava postojanje korisnika i validnost lozinke koristeći bcrypt poređenje.
   * U slučaju uspeha, generiše JWT token sa osnovnim podacima (payload).
   * * @param email Email adresa korisnika
   * @param pass Lozinka u plain-text formatu
   * @throws UnauthorizedException ako su podaci netačni ili korisnik ne postoji
   * @returns Objekat koji sadrži access_token i osnovne podatke o ulogovanom korisniku
   */
  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new UnauthorizedException('Pogrešan email ili lozinka');
  }
}
