import { Router } from "express";
import adminRoutes from "../modules/admin/admin.route";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/category/category.route";
import providerGearRoutes from "../modules/gear/gear.provider.route";
import gearRoutes from "../modules/gear/gear.route";
import paymentRoutes from "../modules/payment/payment.route";
import providerOrderRoutes from "../modules/rental/rental.provider.route";
import rentalRoutes from "../modules/rental/rental.route";
import reviewRoutes from "../modules/review/review.route";
import userRoutes from "../modules/user/user.route";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/gear", route: gearRoutes },
  { path: "/provider/gear", route: providerGearRoutes },
  { path: "/rentals", route: rentalRoutes },
  { path: "/provider/orders", route: providerOrderRoutes },
  { path: "/payments", route: paymentRoutes },
  { path: "/reviews", route: reviewRoutes },
  { path: "/admin", route: adminRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
