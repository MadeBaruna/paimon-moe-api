import { FastifyInstance } from 'fastify';
import { customAlphabet } from 'nanoid/async';
import { getRepository } from 'typeorm';
import { Deck } from '../entities/deck';

import DeckDataSchema from '../schemas/deckData.json';
import DeckRequestSchema from '../schemas/deckRequest.json';
import { DeckData } from '../types/deckData';
import { DeckRequest } from '../types/deckRequest';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

export default async function (server: FastifyInstance): Promise<void> {
  server.get<{ Params: DeckRequest }>('/deck/:id', {
    schema: {
      params: DeckRequestSchema,
    },
  }, async (request, reply) => {
    const id = request.params.id;

    const deckRepo = getRepository(Deck);
    const deck = await deckRepo.findOne(id);
    if (deck === undefined) {
      void reply.status(404);
      throw new Error('deck not found');
    }

    // deck.views += 1;
    // await deckRepo.save(deck);

    return deck;
  });

  server.post<{ Body: DeckData }>('/deck', {
    schema: {
      body: DeckDataSchema,
    },
  }, async (request) => {
    const { name, characters, actions } = request.body;

    const id = await nanoid();

    const deckRepo = getRepository(Deck);
    const deckString = JSON.stringify({ characters, actions });
    const deck = deckRepo.create({
      id,
      name,
      deck: deckString,
      views: 0,
      time: new Date().toISOString(),
    });

    await deckRepo.save(deck);
    return { id };
  });
}
