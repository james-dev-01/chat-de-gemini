import { IsArray, IsIn, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(4000)
  content!: string;
}

export class SendMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  history!: MessageDto[];
}
