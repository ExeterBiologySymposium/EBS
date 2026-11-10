import { neon } from '@neondatabase/serverless';
import type { ContentNode, PageKey } from '../../src/content/model.js';
export type RecordValue={revision:number;draft:ContentNode[];published:ContentNode[]|null;updated_at?:string;actor?:string};
export type Publication={revision:number;content:ContentNode[];actor:string;published_at:string};
export interface ContentStore {read(page:PageKey):Promise<RecordValue|null>;history(page:PageKey):Promise<Publication[]>;save(page:PageKey,revision:number,content:ContentNode[],actor:string,publish:boolean):Promise<RecordValue|null>}
type Query=(sql:string,params:unknown[])=>Promise<Record<string,unknown>[]>;
export function createContentStore(query:Query,instance:string):ContentStore{
 return {
 async read(page){const [r]=await query('SELECT revision,draft,published,updated_at,actor FROM ebs_page_content WHERE instance_id=$1 AND page_key=$2',[instance,page]);return r as RecordValue||null;},
 async history(page){return await query('SELECT revision,content,actor,published_at FROM ebs_page_publications WHERE instance_id=$1 AND page_key=$2 ORDER BY revision DESC LIMIT 50',[instance,page]) as Publication[];},
 async save(page,revision,content,actor,publish){
 const rows=await query(`WITH changed AS (
 INSERT INTO ebs_page_content(instance_id,page_key,revision,draft,published,actor)
 SELECT $1,$2,1,$4::jsonb,CASE WHEN $6 THEN $4::jsonb ELSE NULL END,$5 WHERE $3=0
 ON CONFLICT(instance_id,page_key) DO NOTHING RETURNING *
 ), updated AS (
 UPDATE ebs_page_content SET revision=revision+1,draft=$4::jsonb,published=CASE WHEN $6 THEN $4::jsonb ELSE published END,actor=$5,updated_at=now()
 WHERE instance_id=$1 AND page_key=$2 AND revision=$3 AND $3>0 RETURNING *
 ), result AS (SELECT * FROM changed UNION ALL SELECT * FROM updated), logged AS (
 INSERT INTO ebs_page_publications(instance_id,page_key,revision,content,actor)
 SELECT instance_id,page_key,revision,published,actor FROM result WHERE $6 RETURNING revision
 ) SELECT revision,draft,published,updated_at,actor FROM result`,[instance,page,revision,JSON.stringify(content),actor,publish]);
 return rows[0] as RecordValue||null;
 }
 };
}
export function neonContentStore(connection:string,instance:string){const sql=neon(connection);return createContentStore((text,params)=>sql.query(text,params,{fetchOptions:{signal:AbortSignal.timeout(10000)}}),instance);}
