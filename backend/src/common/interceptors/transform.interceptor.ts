import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Handle cases where data is an error object
        if (data && typeof data === 'object' && (data as any).success === false) {
          return {
            success: false,
            statusCode: (data as any).statusCode || response.statusCode,
            data: (data as any).data || null,
            message: (data as any).message || 'Request failed',
            ...(data?.meta ? { meta: data.meta } : {}),
          };
        }
        
        return {
          success: true,
          statusCode: response.statusCode,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message || 'Request successful',
          ...(data?.meta ? { meta: data.meta } : {}),
        };
      }),
    );
  }
}
