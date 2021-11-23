import { FastifyRequest } from 'fastify';
import HttpErrors from 'http-errors';

const HEADER_SECRET = process.env.HEADER_SECRET ?? '';

export const authorization = async (request: FastifyRequest): Promise<void> => {
  if (request.headers.authorization !== `Bearer ${HEADER_SECRET}`) {
    throw new HttpErrors.Unauthorized();
  }
};
