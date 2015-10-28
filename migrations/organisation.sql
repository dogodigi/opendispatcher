CREATE EXTENSION POSTGIS;

DROP SCHEMA IF EXISTS organisation cascade;
CREATE SCHEMA organisation;
CREATE TABLE organisation.organisation (
    gid serial primary key,
    id character varying,
    logo character varying,
    workspace character varying,
    title character varying
);

grant select on table organisation.organisation to public;


CREATE TABLE organisation.support (
    gid serial primary key,
    mail character varying,
    button character varying
);

grant select on table organisation.support to public;

CREATE TABLE organisation.wms (
    gid serial PRIMARY KEY,
    name character varying,
    url character varying,
    proxy boolean,
    enabled boolean,
    baselayer boolean DEFAULT false,
    params json,
    options json,
    getcapabilities boolean DEFAULT false,
    parent character varying,
    pl character(2),
    layertype varchar default 'WMS',
    "index" integer DEFAULT 0,
    abstract varchar,
    legend varchar
);

comment on column organisation.wms.layertype is 'layertype parameter for Layer.initialize(); see dbkjs.successAuth() looping over dbkjs.options.organisation.wms';
grant select on table organisation.wms to public;

CREATE TABLE organisation.area (
    gid serial PRIMARY KEY,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'MULTIPOLYGON'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 4326))
);

grant select on table organisation.area to public;

CREATE TABLE organisation.care (
    gid serial PRIMARY KEY,
    button character varying,
    url character varying
);
grant select on table organisation.care to public;


CREATE TABLE organisation.modules (
    gid serial PRIMARY KEY,
    name character varying,
    enabled boolean
);
grant select on table organisation.modules to public;

CREATE OR REPLACE FUNCTION organisation.organisation_json(IN srid integer DEFAULT 4326)
  RETURNS TABLE(gid integer, organisation json) AS
$BODY$
SELECT t.gid,
    row_to_json(t.*) AS "organisation"
   FROM (
      select *,
      ( SELECT row_to_json(a) from ( select 
	st_asgeojson(st_transform(st_envelope(the_geom),$1),15,2)::json as geometry from organisation.area) a) as area,
	( SELECT row_to_json(a) from ( select 
	mail, button from organisation.support) a) as support,
      (
      select array_agg(name)
      from organisation.modules where enabled = true
      ) as modules,
      (
      select array_to_json(array_agg(row_to_json(a)))
      from (
        select * from organisation.wms where enabled = true order by baselayer asc, index asc
      ) a 
    ) as wms,
    (select array_to_json(array_agg(row_to_json(a)))
      from (
        select * from organisation.care
      ) a 
    ) as care
    
   FROM organisation.organisation d) t;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;

CREATE TABLE organisation.annotation (
    gid serial primary key,
    subject character varying,
    name character varying,
    email character varying,
    municipality character varying,
    place character varying,
    address character varying,
    phone character varying,
    remarks text,
    permalink text,
    sent boolean DEFAULT false,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 4326))
);
grant select on table organisation.annotation to public;
