import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
