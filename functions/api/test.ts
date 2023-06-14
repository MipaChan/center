// import { Client } from "pg";

export interface Env {
    // This should be a valid Postgres connection string
    // For example, "postgres://reader:NWDMCE5xdipIjRrp@hh-pgsql-public.ebi.ac.uk:5432/pfmegrnargs"
    // Use `wrangler secret put DB_URL` to configure a Secret with your connection string
    DB_URL: string;
}


export const onRequestGet: PagesFunction<Env> = async (context) => {
    // const client = new Client({
    //     user: 'postgres',
    //     password: 'Slwnzq520..',
    //     host: '120.27.143.135',
    //     port: 15432,
    //     database: 'fgo'
    // })
    // await client.connect()

    // const result = await client.query({
    //     text: "SELECT * FROM configs LIMIT 10",
    // });
    // return new Response('Creating Todo: ' + JSON.stringify(result.rows));
    return new Response('Creating Todo: ' + JSON.stringify({}));

}