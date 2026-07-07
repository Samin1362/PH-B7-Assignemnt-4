import { Router } from "express";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
