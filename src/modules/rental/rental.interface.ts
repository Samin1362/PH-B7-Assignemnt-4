export type CreateRentalInput = {
  startDate: Date;
  endDate: Date;
  items: { gearItemId: string; quantity: number }[];
};
