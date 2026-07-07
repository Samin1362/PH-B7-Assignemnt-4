import bcrypt from "bcrypt";
import config from "../config";

const saltRounds = Number(config.bcrypt_salt_rounds) || 12;

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, saltRounds);

export const comparePassword = (
  plain: string,
  hashed: string,
): Promise<boolean> => bcrypt.compare(plain, hashed);
