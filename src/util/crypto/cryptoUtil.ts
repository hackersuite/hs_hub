import { v4 } from 'uuid';

/**
 * Generates a uuid token for the hardware item reservation
 */
export const createToken = (): string => v4();
