import {Injectable, CanActivate, ExecutionContext, UseGuards} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class IsSuperAdmin implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return request?.user?.isSuperAdmin || false;
  }
}

export const IsSuperAdminGuard = () => UseGuards(IsSuperAdmin);