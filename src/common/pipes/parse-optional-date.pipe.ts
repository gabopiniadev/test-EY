import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOptionalDatePipe implements PipeTransform<string, Date | undefined> {
  transform(value: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${value}`);
    }
    return date;
  }
}
