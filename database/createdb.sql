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
insert into organisation.organisation (id,workspace,title) values ('test_organisation','dbk','First Responders for Freedom');
grant select on table organisation.organisation to public;


CREATE TABLE organisation.support (
    gid serial primary key,
    mail character varying,
    button character varying
);
insert into organisation.support(mail,button) values ('support@opendispatcher.org','Found an error?');
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
insert into organisation.area (the_geom) values (st_geomfromtext('POLYGON((-69.1682270163953 12.3927532947267,-69.113573333316 12.3927532947267,-68.9860480727975 12.2588729547804,-68.9763036176749 12.2165057585949,-68.8902982094182 12.1817646577228,-68.853015076775 12.1872723932269,-68.7589599012431 12.0974539373136,-68.7339632554937 12.0411055663868,-68.7619256049761 12.0309374393023,-68.847083669309 12.0372925187301,-68.9678301784378 12.0936408896569,-69.008079014814 12.1249926148342,-69.0390070680294 12.1796462979135,-69.0873056716809 12.1948984885403,-69.1432303706458 12.2423497482681,-69.1703453762046 12.3241184369061,-69.1741584238613 12.3673329770154,-69.1682270163953 12.3927532947267))'));
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
