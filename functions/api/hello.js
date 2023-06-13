

import { Client } from "pg";

export const onRequestGet = async (context) => {

  const client = new Client({
    user: 'postgres',
    password: 'Slwnzq520..',
    host: '120.27.143.135',
    port: '15432',
    database: 'fgo'
  })
  await client.connect()

  const result = await client.query({
    text: "SELECT * FROM configs LIMIT 10",
  });
  console.log(JSON.stringify(result.rows[0]));
  return Response.json({
    message: "Hello Worldx",
  });
}
