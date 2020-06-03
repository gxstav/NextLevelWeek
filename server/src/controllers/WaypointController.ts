import { Request , Response } from 'express';
import knex from '../database/connection';
class WaypointController {
  async index(request: Request, response: Response){
    const { city , uf , items } = request.query
    const parsedItems = String(items).split(',').map(item => Number(item.trim()))
    const waypoints = await knex('waypoint')
    .join('waypoint_item', 'waypoint.id', '=', 'waypoint_item.waypoint_id')
    .whereIn('waypoint_item.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('waypoint.*')
    return response.json(waypoints)
  }

  async create(request: Request, response: Response){
    const {
      name,
      email,
      phone,
      city,
      uf,
      latitude,
      longitude,
      items
    } = request.body
  
    const trx = await knex.transaction()

    const waypoint = {
      image: 'false-img',
      name,
      email,
      phone,
      city,
      uf,
      latitude,
      longitude
    }

    const insertedIds = await trx('waypoint').insert(waypoint)

    const waypoint_id = insertedIds[0]

    const waypointItems = items.map((item_id:Number) => {
      return {
        item_id,
        waypoint_id,
      }
    })
  
    await trx('waypoint_item').insert(waypointItems)
    await trx.commit();

    return response.json({ id: waypoint_id , ...waypoint })
  }

  async show(request: Request, response: Response){
    const { id } = request.params;
    const waypoint = await knex('waypoint').where('id', id).first();
    if (!waypoint) {
      return response.status(400).json({ message: 'Waypoint not found.' })
    }
    const items = await knex('item')
    .join('waypoint_item', 'item.id', '=', 'waypoint_item.item_id')
    .where('waypoint_item.item_id', id)
    .select('item.title')

    return response.json({ waypoint , items })
  }
}

export default WaypointController;