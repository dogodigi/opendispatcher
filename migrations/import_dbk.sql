delete from opendispatcher."Alarms";
delete from opendispatcher."Compartiments";
delete from opendispatcher."ProtectionMedia";
delete from opendispatcher."Protections";
delete from opendispatcher."Contacts";
delete from opendispatcher."People";
delete from opendispatcher."Hazards";
delete from opendispatcher."Barriers";
delete from opendispatcher."Zooms";
delete from opendispatcher."Media";
delete from opendispatcher."Annotations";
delete from opendispatcher."Routes";
delete from opendispatcher."Terrains";
delete from opendispatcher."Buildings";
delete from opendispatcher."Levels";
delete from opendispatcher."Sites" where "OrganizationId" = 1;
delete from opendispatcher."Layers" where "OrganizationId" = 1;
delete from opendispatcher."Regions" where "OrganizationId" = 1;
delete from opendispatcher."Organizations" where id = 1;
-- Organizations
INSERT INTO opendispatcher."Organizations"(
            id, name, abbreviation, title, logo, workspace, "createdAt",
            "updatedAt", "deletedAt")
    VALUES (1, 'Brabant Noord', 'brabantnoord', 'DOIV', null, 'dbk', now(),
            now(), null);
-- Region
INSERT INTO opendispatcher."Regions"(id, source, "sourceId", geometry, "createdAt", "updatedAt", "OrganizationId")
    select gid, 'user', null, st_transform(the_geom, 4326) AS geometry, now(), now(), 1 from organisation.area;

-- Layers
INSERT INTO opendispatcher."Layers"(
            id, name, url, proxy, enabled, baselayer, params, options, getcapabilities,
            parent, index, pl, layertype, abstract, legend, "createdAt",
            "updatedAt", "deletedAt", "OrganizationId")
    select gid, name, url, proxy,
    enabled, baselayer, params, options,
    getcapabilities, parent, index, pl, layertype::opendispatcher."enum_Layers_layertype", abstract, legend, now(), now(), null, 1 from organisation.wms;


-- Sites / DBK:
insert into opendispatcher."Sites"
(id, name, title, checked, assistance, "createdAt", "updatedAt", "deletedAt", "OrganizationId")
select dbk."DBK_ID", dbk."Formele_Naam", dbk."Informele_Naam",
null,
case when lower(dbk2."BHVaanwezig") = 'ja' THEN true else false end,
case when dbk."Datum_Actualisatie" is null then now()::timestamp with time zone else
to_timestamp(dbk."Datum_Actualisatie"::text, 'YYYYMMDDHH24MISSMS'::text)::timestamp with time zone end,
case when dbk."Datum_Actualisatie" is null then now()::timestamp with time zone else
to_timestamp(dbk."Datum_Actualisatie"::text, 'YYYYMMDDHH24MISSMS'::text)::timestamp with time zone end,
CASE WHEN dbk."Deleted" = true then to_timestamp(dbk."Datum_Actualisatie"::text, 'YYYYMMDDHH24MISSMS'::text)::timestamp with time zone ELSE null END,
1 from wfs."DBK" dbk left join wfs."DBK2" dbk2 on dbk2."DBK_ID" = dbk."DBK_ID" where "Hoofdobject_ID" = 0;

-- Levels, needed for the other stuff / DBK2
INSERT INTO opendispatcher."Levels"(
            id, name, level, ground, "createdAt", "updatedAt", "deletedAt",
            "SiteId")
select
"DBK_ID" as id,
"Bouwlaag" as "name",
case when lower("Bouwlaag") = 'bg' then 0::integer
  when lower("Bouwlaag") = '+1' then 1::integer
  when lower("Bouwlaag") = '+2' then 2::integer
  when lower("Bouwlaag") = '+3' then 3::integer
  when lower("Bouwlaag") = '+4' then 4::integer
  when lower("Bouwlaag") = '+5' then 5::integer
  when lower("Bouwlaag") = '+6' then 6::integer
  when lower("Bouwlaag") = '+7' then 7::integer
  when lower("Bouwlaag") = '+8' then 8::integer
  when lower("Bouwlaag") = '+9' then 9::integer
  when lower("Bouwlaag") = '+10' then 10::integer
  when lower("Bouwlaag") = '+11' then 11::integer
  when lower("Bouwlaag") = '+12' then 12::integer
  when lower("Bouwlaag") = '+13' then 13::integer
  when lower("Bouwlaag") = '-1' then -1::integer
  when lower("Bouwlaag") = '-2' then -2::integer
  when lower("Bouwlaag") = '-3' then -3::integer
  when lower("Bouwlaag") = '-4' then -4::integer
  when lower("Bouwlaag") = '-5' then -5::integer
  when lower("Bouwlaag") = '-6' then -6::integer
  when lower("Bouwlaag") = '-7' then -7::integer
  when lower("Bouwlaag") = '-8' then -8::integer
  when lower("Bouwlaag") = '-9' then -9::integer
  when lower("Bouwlaag") = '-10' then -10::integer
  when lower("Bouwlaag") = '-11' then -11::integer
  when lower("Bouwlaag") = '-12' then -12::integer
  when lower("Bouwlaag") = '-13' then -13::integer
  else null::integer end,
case when lower("Bouwlaag") = 'bg' then true else false end as ground,
case when "Datum_Aanmaak" = '' then now()::timestamp with time zone else
to_timestamp("Datum_Aanmaak", 'YYYYMMDDHH24MISSMS'::text)::timestamp with time zone end as "createdAt",
case when "Datum_Aanmaak" = '' then now()::timestamp with time zone else
to_timestamp("Datum_Aanmaak", 'YYYYMMDDHH24MISSMS'::text)::timestamp with time zone end as "updatedAt",
null::timestamp with time zone as "deletedAt",
case when "Hoofdobject_ID" = 0 then "DBK_ID" else "Hoofdobject_ID" end as "Site"
FROM wfs."DBK2";

-- Building / Polygon
INSERT INTO opendispatcher."Buildings"(
            id, name, source, "sourceId", geometry,
            construction, usage, procedure, "riskCategory", "createdAt",
            "updatedAt", "deletedAt", "LevelId")
SELECT
poly.gid as id,
null::character varying as name,
CASE
  WHEN poly."BAG_Pand_ID" IS NULL THEN 'user'::opendispatcher."enum_Buildings_source"
  when poly."BAG_Pand_ID" = '' then 'user'::opendispatcher."enum_Buildings_source"
  ELSE 'bag'::opendispatcher."enum_Buildings_source"
END as source,
case
  when poly."BAG_Pand_ID" = '' then null
  when poly."BAG_Pand_ID" is null then null
  else poly."BAG_Pand_ID"
end  as "sourceId",
st_transform(poly.the_geom,4326) AS geometry,
case when obj."Gebouwconstructie" = '' THEN null
when obj."Gebouwconstructie" is null then null
ELSE obj."Gebouwconstructie" END as construction,
null::character varying as usage,
case
  when dbk2.inzetprocedure = '' then null
  when dbk2.inzetprocedure is null then null
  else dbk2.inzetprocedure
end as procedure,
case
  when dbk2."RisicoKlasse" = '' then null
  when dbk2."RisicoKlasse" is null then null
  else dbk2."RisicoKlasse"
end  as "riskCategory",
now(),
now(),
null,
poly."DBK_ID" AS "LevelId"
FROM wfs."Polygon" poly left join wfs."DBK2" dbk2 on poly."DBK_ID" = dbk2."DBK_ID" left join wfs."Object" obj on obj."DBK_ID" = dbk2."DBK_ID" where st_isvalid(poly."the_geom") = true and poly."DBK_ID" in (select id from opendispatcher."Levels");

-- Terrain / Gebied
INSERT INTO opendispatcher."Terrains"(id, geometry, "createdAt", "updatedAt", "deletedAt", "LevelId")
select gid, st_transform(the_geom,4326) AS geometry, now(), now(), null, "DBK_ID" from wfs."Gebied";

-- Routes / ToegangTerrein
INSERT INTO opendispatcher."Routes"(
            id, name, description, geometry, "createdAt", "updatedAt", "deletedAt",
            "RouteTypeId", "LevelId")
    select gid, case when "NaamRoute" = '' then null else "NaamRoute" end, case when "Omschrijving" = '' then null else "Omschrijving" end, st_transform(the_geom,4326) AS geometry, now(), now(), null, "Primair", "DBK_ID" from wfs."ToegangTerrein";

-- Annotations / TekstObject
INSERT INTO opendispatcher."Annotations"(
            id, text, "labelSize", font, scale, rotation, geometry, "createdAt",
            "updatedAt", "deletedAt", "LevelId")
    select gid, "Tekst", "LabelSize", "Font", "Scale", "Rotatie", st_transform(the_geom,4326) AS geometry, now(), now(), null, "DBK_ID" from wfs."TekstObject";

-- Media / Foto
INSERT INTO opendispatcher."Media"(
            id, name, external, hyperlink, "mimeType", media, geometry, "createdAt", "updatedAt",
            "deletedAt", "LevelId")
SELECT gid,
"Documentnaam",
true as external,
case when lower(left("Documentnaam",4)) = 'http' then true else false end as hyperlink,
case
  when lower(right("Documentnaam",3)) = 'jpg' then 'image/jpeg'::character varying
  when lower(right("Documentnaam",3)) = 'bmp' then 'image/bmp'::character varying
  when lower(right("Documentnaam",3)) = 'pdf' then 'application/pdf'::character varying
  when lower(right("Documentnaam",3)) = 'png' then 'image/png'::character varying
  else 'text/html' end as "mimeType",
null::text as media,
st_transform(the_geom,4326) AS geometry, now() as "createdAt", now() as "updatedAt", null as "deletedAt", "DBK_ID" as "LevelId"  FROM wfs."Foto";

-- Zooms / Locatie
INSERT INTO opendispatcher."Zooms" (id, "type", "zoom", geometry, "createdAt", "updatedAt",
            "deletedAt", "LevelId")
select gid, case when "Map_Type" = 'Object' then 'Building'::opendispatcher."enum_Zooms_type" else "Map_Type"::opendispatcher."enum_Zooms_type" end as "type",
"Zoom" as zoom, st_transform(ST_SetSRID(ST_Point("Xcenter","Ycenter"), 28992),4326) as geometry, now(), now(), null,
"DBK_ID" as "LevelId" from wfs."Locatie" where "DBK_ID" in (select id from opendispatcher."Levels");

-- Barriers / Hulplijn
insert into opendispatcher."Barriers" (id, "name", "description", geometry, "createdAt", "updatedAt",
            "deletedAt", "BarrierTypeId", "LevelId")
select gid, null, case when "Omschrijving" = '' then null else "Omschrijving" end,
st_transform(the_geom,4326),
now(),
now(),
null,
case
  when "Type" = 'HEAT' then 1::integer
  when "Type" = 'Broken' then 2::integer
  when "Type" = 'Fence' then 3::integer
  when "Type" = 'Gate' then 4::integer
  when "Type" = 'Cable' then 5::integer
  when "Type" = 'Arrow' then 6::integer
  when "Type" = 'Line' then 7::integer
  when "Type" = 'Bbarrier' then 8::integer
  when "Type" = 'Conduit' then 9::integer
  else null end,
  "DBK_ID" from wfs."Hulplijn" where "DBK_ID" in (select id from opendispatcher."Levels");

-- Hazards / Gevaarlijke stof
INSERT INTO opendispatcher."Hazards"(
            id, name, hin, un, quantity, "quantityString", estimate, description,
            geometry, "createdAt", "updatedAt", "deletedAt", "LevelId", "UnitTypeId",
            "HazardTypeId")
 select gid,
 case when "NaamStof" = '' then null else "NaamStof" end,
 case when "GEVIcode" = 0 then null else "GEVIcode" end,
 case when "UNnr" = 0 then null else "UNnr" end, null,
 case when "Hoeveelheid" = '' then null else "Hoeveelheid" end,
 false,
 case when "Omschrijving" = '' then null else "Omschrijving" end,
 st_transform(the_geom,4326), now(), now(), null, "DBK_ID", null,
 (select id from opendispatcher."HazardTypes" b where b."symbol" = "Symbol")
  from wfs."GevaarlijkeStof";

 -- Person / Contact
 INSERT INTO opendispatcher."People"(
            id, name, email, phone, "createdAt", "updatedAt", "deletedAt")
    select gid,
    case when "Naam" = '' then null else "Naam" end,
    case when "Functie" = '' then null else "Functie" end,
    case when "Telefoonnummer" = '' then null else "Telefoonnummer" end,
    now(), now(), null from wfs."Contact";

 -- Person /Light (id + 10000)
 INSERT INTO opendispatcher."People"(
            id, name, email, phone, "createdAt", "updatedAt", "deletedAt")
    select gid + 10000,
    case when "NaamBeheerder" = '' then null else "NaamBeheerder" end,
    case when "Email" = '' then null else "Email" end,
    case when "Telfoonnummer" = '' then null else "Telfoonnummer" end,
    now(), now(), null from wfs."Light";
 update opendispatcher."People" set "deletedAt" = now() where name is null and email is null and phone is null;


-- Contacts
INSERT INTO opendispatcher."Contacts"("PersonId", "SiteId", "createdAt", "updatedAt")
select gid, "DBK_ID",now(), now() from wfs."Contact";

-- Protections / Brandweervoorziening
INSERT INTO opendispatcher."Protections"(
            id, rotation, description, geometry, "LevelId", "ProtectionTypeId",
            "createdAt", "updatedAt", "deletedAt")
 select gid, "Rotatie",
 case when "Omschrijving" = '' then null else "Omschrijving" end,
 st_transform(the_geom, 4326),
 "DBK_ID",
 "Symbol_Type_ID",
 now(),
 now(),
 null from wfs."Brandweervoorziening";

-- Media from Brandweervoorziening
insert into opendispatcher."Media" (id, hyperlink, external, name, "mimeType", media, geometry, "createdAt", "updatedAt", "deletedAt", "LevelId")
select 100000 + gid, false, true,
"Picturename",
case
  when lower(right("Picturename",3)) = 'jpg' then 'image/jpeg'::character varying
  when lower(right("Picturename",3)) = 'bmp' then 'image/bmp'::character varying
  when lower(right("Picturename",3)) = 'pdf' then 'application/pdf'::character varying
  when lower(right("Picturename",3)) = 'png' then 'image/png'::character varying
  else 'text/html' end as "mimeType",
false, st_transform(the_geom, 4326), now(), now(), null, "DBK_ID" from wfs."Brandweervoorziening" where "Picturename" <> '';

-- Maintain relation between Protection and Media;
insert into opendispatcher."ProtectionMedia" ("ProtectionId", "MediaId", "createdAt", "updatedAt")
select gid, 100000 + gid, now(), now() from wfs."Brandweervoorziening" where "Picturename" <> '';

-- Compartiments / Brandcompartiment
INSERT INTO opendispatcher."Compartiments"(
            id, label, description, geometry, "createdAt", "updatedAt", "deletedAt",
            "LevelId", "CompartimentTypeId")
    select gid, case when "Label" = '' then null else "Label" end, case when "Omschrijving" = '' then null else "Omschrijving" end,st_transform(the_geom, 4326), now(), now(), null, "DBK_ID",
    case when "Soort" = '60 minuten' then 2
    when "Soort" = '30 minuten' then 3
    when "Soort" = 'Rookwerend' then 4
    when "Soort" = '>60 minuten' then 5
    else 1 end
from wfs."Brandcompartiment";

-- Alarms / OMS
insert into opendispatcher."Alarms"(id, "AlarmTypeId", "providerId", "createdAt", "updatedAt", "LevelId")
select gid, 4, "Nummer", now(), now(), "DBK_ID" from wfs."DBK" where not "Nummer" is null AND "Nummer"  <> '' AND "DBK_ID" in (select id from opendispatcher."Levels");
