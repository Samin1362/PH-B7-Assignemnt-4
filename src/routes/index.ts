import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/category/category.route";
import providerGearRoutes from "../modules/gear/gear.provider.route";
import gearRoutes from "../modules/gear/gear.route";
import providerOrderRoutes from "../modules/rental/rental.provider.route";
import rentalRoutes from "../modules/rental/rental.route";
import userRoutes from "../modules/user/user.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/gear", route: gearRoutes },
  { path: "/provider/gear", route: providerGearRoutes },
  { path: "/rentals", route: rentalRoutes },
  { path: "/provider/orders", route: providerOrderRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
