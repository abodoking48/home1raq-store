/**
 * REAL customer reviews / photos only — never invent entries.
 *
 * To add one: put the customer's photo in `public/reviews/` (e.g. `ali-blender.jpg`) and add:
 *   { name: "علي - بغداد", text: "وصل الخلاط بيومين وشغال ممتاز", photo: "/reviews/ali-blender.jpg", product: "خلاط كهربائي" },
 * `photo`, `text` and `product` are optional, but give at least a photo or a text.
 * The section stays hidden while this list is empty.
 */
export type CustomerReview = {
  name: string;
  text?: string;
  photo?: string;
  product?: string;
};

export const customerReviews: CustomerReview[] = [];
