import { Router } from "express";
import { expressCallback } from "../utils/expressCallback.js";
import { BookController } from "../controllers/bookController.js";
import { BookRepository } from "../repositories/bookRepository.js";
import { BookService } from "../services/bookService.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = Router();

const repository = new BookRepository();
const service = new BookService(repository);
const controller = new BookController(service);

// All book routes require authentication
router.use(protectRoute);

router.route("/").get(expressCallback(controller.getMyBooks)).post(expressCallback(controller.createBook));
router.get("/all", expressCallback(controller.getAllBooks));
router.get("/edit-requests/pending", expressCallback(controller.getPendingEditRequests));

router.route("/:id").delete(expressCallback(controller.deleteBook));
router.post("/:id/publish", expressCallback(controller.publishBook));
router.post("/:id/edit-requests", expressCallback(controller.requestEdit));
router.get("/:id/edit-requests", expressCallback(controller.getEditRequests));
router.patch("/:id/edit-requests/:requestId", expressCallback(controller.resolveEditRequest));

export default router;
