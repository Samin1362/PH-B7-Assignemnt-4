import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
