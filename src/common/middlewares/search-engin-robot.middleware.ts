import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NoIndexMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        next();
    }
}
