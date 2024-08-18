import express from "express";
import * as userController from '../controllers/userController.js';
import { checkJwt } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get('/ping', userController.ping);
router.get('/authentication', checkJwt, userController.getAuthentication);

// User Operations
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/addToFavourites', checkJwt, userController.addEventToFavorites);
router.post('/removeFromFavourites', checkJwt, userController.removeFromFavorites);
router.post('/getUserHistory', userController.getUserHistory);
router.post('/getEventsPosted', checkJwt, userController.getEventsPosted);
router.post('/buyTickets', checkJwt, userController.buyTickets);
router.post('/updateUserEventStatus', checkJwt,userController.updateUserEventStatus);
router.post('/sendConfirmationEmail', checkJwt,userController.sendConfirmationEmail);
router.get('/:id' ,checkJwt, userController.viewUser);
router.put('/:id', checkJwt, userController.updateUser);
router.delete('/:id', checkJwt, userController.deleteUser);

export default router;