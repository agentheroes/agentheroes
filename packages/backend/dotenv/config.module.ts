import {Global, Module} from "@nestjs/common";
// import { ConfigModule } from '@nestjs/config';
// import { join } from 'path';

@Global()
@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   // point envFilePath to the root .env
    //   get envFilePath() {
    //     return join(__dirname, process.env.ENV_PATH || '../../.env');
    //   },
    // }),
    // // other modules...
  ],
  controllers: [],
  providers: [],
})
export class ConfigModuleImport {}