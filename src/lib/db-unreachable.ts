import { Prisma } from "@prisma/client";

const KNOWN_UNREACHABLE_CODES = new Set(["P1001", "P1017", "P2024", "P2028"]);

/** True when Prisma reports the database cannot be reached (matches API routes). */
export function isDatabaseUnreachableError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return KNOWN_UNREACHABLE_CODES.has(e.code);
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}
