import { Router } from "express";
import { expressCallback } from "../utils/expressCallback.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { PageController } from "../controllers/pageController.js";
import { PageRepository } from "../repositories/pageRepository.js";
import { PageService } from "../services/pageService.js";

const router = Router();
const controller = new PageController(new PageService(new PageRepository()));

router.use(protectRoute);
router.get("/book/:bookId", expressCallback(controller.list));
router.post("/book/:bookId", expressCallback(controller.create));
router.post("/book/:bookId/reorder", expressCallback(controller.reorder));
router.get("/:pageId", expressCallback(controller.get));
router.patch("/:pageId", expressCallback(controller.update));
router.delete("/:pageId", expressCallback(controller.remove));

export default router;