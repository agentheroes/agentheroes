import {
  IsDefined,
  IsIn,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {makeId} from "@packages/backend/encryption/make.id";

export class ForgotReturnPasswordDto {
  @IsString()
  @IsDefined()
  @MinLength(3)
  password: string;

  @IsString()
  @IsDefined()
  @IsIn([makeId(10)], {
    message: 'Passwords do not match',
  })
  @ValidateIf((o) => o.password !== o.repeatPassword)
  repeatPassword: string;

  @IsString()
  @IsDefined()
  @MinLength(5)
  token: string;
}
