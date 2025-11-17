import { os } from "@orpc/server";
import { z } from "zod";
import { customersKV, bookingsKV } from "./storage";
import { CustomerSchema } from "./types";

const listCustomers = os.handler(async () => {
  const customers = await customersKV.getAllItems();
  return customers.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

const getCustomer = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return await customersKV.getItem(input.id);
  });

const findCustomerByContact = os
  .input(z.object({ mobile: z.string().optional(), email: z.string().optional() }))
  .handler(async ({ input }) => {
    const customers = await customersKV.getAllItems();
    return (
      customers.find(
        (c) =>
          (input.mobile && c.mobile === input.mobile) ||
          (input.email && c.email === input.email)
      ) || null
    );
  });

const getCustomerBookingHistory = os
  .input(z.object({ customerId: z.string() }))
  .handler(async ({ input }) => {
    const bookings = await bookingsKV.getAllItems();
    return bookings
      .filter((b) => b.customerId === input.customerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  });

const updateCustomer = os
  .input(
    z.object({
      id: z.string(),
      notes: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    const customer = await customersKV.getItem(input.id);
    if (!customer) throw new Error("Customer not found");

    if (input.notes !== undefined) customer.notes = input.notes;
    customer.updatedAt = new Date().toISOString();

    await customersKV.setItem(customer.id, customer);
    return customer;
  });

export const router = {
  listCustomers,
  getCustomer,
  findCustomerByContact,
  getCustomerBookingHistory,
  updateCustomer,
};
