import express from 'express';
import WaypointController from './controllers/WaypointController';
import ItemController from './controllers/ItemController';

const routes = express.Router();
const waypointController = new WaypointController();
const itemController = new ItemController();

routes.get('/items', itemController.index)

routes.post('/waypoints', waypointController.create)
routes.get('/waypoints', waypointController.index)
routes.get('/waypoints/:id', waypointController.show)

export default routes;
