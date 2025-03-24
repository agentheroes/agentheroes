import {HttpException, HttpStatus} from "@nestjs/common";

export class HttpForbiddenException extends HttpException {
    constructor() {
        super('Forbidden', HttpStatus.FORBIDDEN);
    }
}

export class HttpBadRequestException extends HttpException {
    constructor() {
        super('Bad Request', HttpStatus.BAD_REQUEST);
    }
}

export class HttpUnauthorized extends HttpException {
    constructor() {
        super('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
}