export type CreateReviewInput = {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
};
