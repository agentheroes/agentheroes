import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import {UsersRepository} from "@packages/backend/database/users/users.repository";

@Injectable()
export class UsersService {
  constructor(
    private _usersRepository: UsersRepository,
  ) {}

  getUserByEmail(email: string) {
    return this._usersRepository.getUserByEmail(email);
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._usersRepository.getUserByProvider(providerId, provider);
  }

  activateUser(id: string) {
    return this._usersRepository.activateUser(id);
  }

  updatePassword(id: string, password: string) {
    return this._usersRepository.updatePassword(id, password);
  }

  getOrgUser(orgUserId: string) {
    return this._usersRepository.getOrgUser(orgUserId);
  }

  getAllUsers(search: string) {
    return this._usersRepository.getAllUsers(search);
  }
}
