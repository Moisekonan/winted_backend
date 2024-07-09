import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CoreOutput } from 'src/common/dao/output.dto';

export function hashPassword(password: string): Promise<string> {
  try {
    return bcrypt.hash(password, 10);
  } catch (error) {
    throw new InternalServerErrorException();
  }
}

export const comparePasswords = async (
  newPassword: string,
  passwordHash: string,
): Promise<CoreOutput> => {
  const result = await bcrypt.compare(newPassword, passwordHash);
  if (result) {
    return { success: true };
  }
  return { success: false, error: 'Invalid authentication information.' };
};
