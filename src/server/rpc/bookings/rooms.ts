import { os, call } from "@orpc/server";
import { z } from "zod";
import { roomsKV } from "./storage";
import { RoomSchema } from "./types";

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

const listRooms = os.handler(async () => {
  const rooms = await roomsKV.getAllItems();
  return rooms.sort((a, b) => a.order - b.order);
});

const createRoom = os
  .input(
    z.object({
      name: z.string(),
      capacity: z.number(),
      hourlyRate: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const rooms = await roomsKV.getAllItems();
    const order = rooms.length;

    const room = {
      id: generateId(),
      name: input.name,
      capacity: input.capacity,
      hourlyRate: input.hourlyRate,
      order,
      createdAt: new Date().toISOString(),
    };

    await roomsKV.setItem(room.id, room);
    return room;
  });

const updateRoom = os
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      capacity: z.number().optional(),
      hourlyRate: z.number().optional(),
    })
  )
  .handler(async ({ input }) => {
    const room = await roomsKV.getItem(input.id);
    if (!room) throw new Error("Room not found");

    if (input.name) room.name = input.name;
    if (input.capacity) room.capacity = input.capacity;
    if (input.hourlyRate) room.hourlyRate = input.hourlyRate;

    await roomsKV.setItem(room.id, room);
    return room;
  });

const deleteRoom = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await roomsKV.removeItem(input.id);
    return true;
  });

const subscribeToRooms = os.handler(async function* ({ signal }) {
  yield call(listRooms, {}, { signal });
  for await (const _event of roomsKV.subscribe()) {
    yield call(listRooms, {}, { signal });
  }
});

export const router = {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  live: {
    rooms: subscribeToRooms,
  },
};
