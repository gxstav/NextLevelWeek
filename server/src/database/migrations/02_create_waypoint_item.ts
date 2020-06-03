import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('waypoint_item', table => {
    table.increments('id').primary();
    table.integer('waypoint_id').notNullable().references('id').inTable('waypoint');
    table.integer('item_id').notNullable().references('id').inTable('item');
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('waypoint_item')
}