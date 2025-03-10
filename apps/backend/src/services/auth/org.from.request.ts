import { createParamDecorator } from "@nestjs/common";

export const GetOrganizationFromRequest = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.org;
});
