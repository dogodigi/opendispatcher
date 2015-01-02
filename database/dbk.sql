drop schema if exists dbk cascade;
create schema dbk;

CREATE TABLE dbk."OMS" (
    id serial NOT NULL,
    omsnummer character varying,
    objectnaam character varying,
    crit1 character varying,
    crit2 character varying,
    crit3 character varying,
    crit4 character varying,
    crit5 character varying,
    crit6 character varying,
    crit7 character varying,
    crit8 character varying,
    crit9 character varying,
    crit10 character varying,
    crit11 character varying,
    crit12 character varying,
    crit13 character varying,
    crit14 character varying,
    crit15 character varying,
    crit16 character varying,
    tel_alg character varying,
    sh_1_naam character varying,
    sh_1_tel_vast character varying,
    sh_1_tel_mob character varying,
    sh_2_naam character varying,
    sh_2_tel_vast character varying,
    sh_2_tel_mob character varying,
    sh_3_naam character varying,
    sh_3_tel_vast character varying,
    sh_3_tel_mob character varying,
    CONSTRAINT dbk_oms_pk PRIMARY KEY (omsnummer)
);
CREATE TABLE dbk.type_brandweervoorziening (
    gid serial PRIMARY KEY,
    naam character varying(50),
    omschrijving text,
    brandweervoorziening_symbool character varying(50) NOT NULL,
    namespace character varying(50),
    categorie character varying(20),
    radius integer
);
GRANT SELECT ON TABLE dbk.type_brandweervoorziening TO public;

CREATE TABLE dbk.type_gevaarlijkestof (
    gid serial PRIMARY KEY,
    naam character varying(50),
    gevaarlijkestof_symbool character varying(50) NOT NULL,
    namespace character varying(50)
);

GRANT SELECT ON TABLE dbk.type_gevaarlijkestof TO public;

CREATE TABLE dbk.type_toegangterrein (
    gid serial PRIMARY KEY,
    naam character varying(50),
    toegangterrein_symbool character varying(50) NOT NULL
);
GRANT SELECT ON TABLE dbk.type_toegangterrein TO public;

CREATE TABLE dbk.type_brandcompartiment (
    gid serial primary key,
    naam  character varying(50),
    brandcompartiment_symbool  character varying(50) NOT NULL,
    namespace character varying(50)
);
GRANT SELECT ON TABLE dbk.type_brandcompartiment TO public;


CREATE TABLE dbk.type_aanwezigheidsgroep (
    gid serial PRIMARY KEY,
    naam character varying(50)
);
GRANT SELECT ON TABLE dbk.type_aanwezigheidsgroep TO public;
CREATE INDEX ON dbk.type_aanwezigheidsgroep (gid ASC NULLS LAST);

/**
 * IMDBK v2.2
 *
 */
 
create view dbk."DBKFeature" as (
    select
        d.gid,
        d.siteid as identificatie,
        CASE WHEN d2."BHVaanwezig" is null then false else 
        case when lower(d2."BHVaanwezig") in ('ja','yes') then true else
        false end end as "BHVaanwezig",
        CASE WHEN d."Datum_Actualisatie" = '' THEN null ELSE to_timestamp(d."Datum_Actualisatie",'YYYYMMDDHH24MISSMS')::timestamp without time zone END as "controleDatum",
        d."Formele_Naam" as "formeleNaam",
        d."Informele_Naam" as "informeleNaam",
        CASE WHEN d."Nummer" = '' THEN null ELSE d."Nummer" END as "OMSNummer",
        CASE WHEN d2."inzetprocedure" = '' THEN null ELSE d2."inzetprocedure" END as inzetprocedure,
    	d2."Bouwlaag" as bouwlaag,
	d2."Status" as status,
        d2."RisicoKlasse" as risicoklasse,
        CASE WHEN not b.geometrie is null then 'Object' ELSE 
		CASE WHEN not g.geometrie is null then 'Gebied' ELSE 'Feature' END END as "typeFeature",
        CASE WHEN not b.geometrie is null then b.geometrie ELSE 
		CASE WHEN not g.geometrie is null then g.geometrie ELSE null END END as geometrie,
		d.verwerkt as verwerkt,
        CASE WHEN d2."Hoofdobject_ID" = 0 then NULL ELSE d2."Hoofdobject_ID" END as hoofdobject,
	d2."Viewer" as viewer,
	CASE WHEN d2."DatumTijd_Viewer_Begin" = '' THEN null ELSE to_timestamp(d2."DatumTijd_Viewer_Begin",'YYYYMMDDHH24MISSMS')::timestamp without time zone END as "datumtijdviewerbegin",
	CASE WHEN d2."DatumTijd_Viewer_Eind" = '' THEN null ELSE to_timestamp(d2."DatumTijd_Viewer_Eind",'YYYYMMDDHH24MISSMS')::timestamp without time zone END as "datumtijdviewereind"
    from wfs."DBK" d LEFT JOIN  wfs."DBK2" d2 on d.siteid = d2.siteid 
    LEFT JOIN ( SELECT wfs."Polygon".siteid AS siteid, st_setsrid(st_centroid(st_collect(st_transform(wfs."Polygon".the_geom,28992))),28992) AS geometrie
           FROM wfs."Polygon"
          GROUP BY wfs."Polygon".siteid) b ON d.siteid = b.siteid
    LEFT JOIN ( SELECT wfs."Gebied".siteid AS siteid, st_setsrid(st_centroid(st_collect(st_transform(wfs."Gebied".the_geom,28992))),28992) AS geometrie
           FROM wfs."Gebied"
          GROUP BY wfs."Gebied".siteid) g ON d.siteid = g.siteid
          where (d."Deleted" = false or d."Deleted" is null)
);
grant select on table  dbk."DBKFeature" to public;

create view dbk."DBKObject" as (
select
    f.gid,
    f.siteid as siteid,
    CASE WHEN f."Bouwlaag_Max"~E'^\\d+$' THEN f."Bouwlaag_Max"::integer ELSE NULL END as "hoogsteBouwlaag",
    CASE WHEN f."Bouwlaag_Min"~E'^\\d+$' THEN f."Bouwlaag_Min"::integer ELSE NULL END as "laagsteBouwlaag",
    CASE WHEN f."Nummer" = '' THEN NULL ELSE f."Nummer" END as "OMSnummer",
    CASE WHEN o."Gebouwconstructie" = '' THEN NULL ELSE o."Gebouwconstructie" END as gebouwconstructie,
    f."Adres_ID" as adres_id,
    CASE WHEN f."Gebruikstype" = '' THEN NULL ELSE f."Gebruikstype" END as gebruikstype
from wfs."DBK" f LEFT JOIN (select * from wfs."Object") o on f.siteid = o.siteid
where (f."Deleted" = false or f."Deleted" is null)
);
grant select on table dbk."DBKObject" to public;

create view dbk."Pandgeometrie" as (
    select
        gid,
        siteid as siteid,
        the_geom as geometrie,
        "BAG_Pand_ID"::character varying as "bagId",
        null::character varying as "bagStatus"
    from wfs."Polygon"
);
grant select on table dbk."Pandgeometrie" to public;
create view dbk."Brandweervoorziening" as (
     select 
        p.gid,
        p.siteid as siteid,
        p.the_geom as locatie,
        "Omschrijving"::text as "aanvullendeInformatie",
        tbv.brandweervoorziening_symbool as "typeVoorziening",
        tbv.namespace as "namespace",
        tbv.categorie as "categorie",
		tbv.naam as "naamVoorziening",
        p."Rotatie"::double precision as hoek,
        tbv.radius as radius
    from wfs."Brandweervoorziening" p left join dbk.type_brandweervoorziening tbv on p."Symbol_Type_ID" = tbv.gid
);
grant select on table dbk."Brandweervoorziening" to public;
create view dbk."GevaarlijkeStof" as (
    select 
        gid,
        siteid as siteid,
        the_geom as locatie,
        "NaamStof"::character varying(50) as "naamStof",
        "GEVIcode" as gevaarsindicatienummer,
        "UNnr" as "UNnummer",
        "Hoeveelheid" as hoeveelheid,
        "Symbol" as "symboolCode",--type_gevaarlijkestof_id, Uit symboolcode, lookup in type_gevaarlijkestof
        (select replace(lower(namespace),'-','') from dbk.type_gevaarlijkestof tgs where gevaarlijkestof_symbool = p."Symbol") as namespace,
        "Omschrijving"::text as "aanvullendeInformatie"
    from wfs."GevaarlijkeStof" p
);
grant select on table dbk."GevaarlijkeStof" to public;
create view dbk."ToegangTerrein" as (
    select
        wfs."ToegangTerrein".gid,
        siteid as siteid,
        the_geom as geometrie,
        case when "Primair" = 1 then TRUE ELSE FALSE END as primair,
        CASE WHEN "NaamRoute" = '' THEN tt.naam
        ELSE "NaamRoute" END as "naamRoute",
        "Omschrijving"::text as "aanvullendeInformatie"
    from wfs."ToegangTerrein" join dbk.type_toegangterrein tt on "Primair" = tt.gid
);
grant select on table dbk."ToegangTerrein" to public;

create view dbk."Brandcompartiment" as (
select 
        gid,
        siteid as siteid,
        the_geom as geometrie,
        CASE 
          WHEN lower("Soort") = '30 minuten' THEN (select naam from dbk.type_brandcompartiment where gid = 3)
          WHEN lower("Soort") = '60 minuten' THEN (select naam from dbk.type_brandcompartiment where gid = 2) 
          WHEN lower("Soort") = 'rookwerend' THEN (select naam from dbk.type_brandcompartiment where gid = 4) 
          WHEN lower("Soort") = '>60 minuten' THEN (select naam from dbk.type_brandcompartiment where gid = 5) 
          ELSE (select naam from dbk.type_brandcompartiment where gid = 1) END as "typeScheiding",
        CASE WHEN "Omschrijving" = '' THEN null ELSE "Omschrijving" END as "aanvullendeInformatie",
        CASE WHEN "Label" = '' THEN null ELSE "Label" END as "Label"
    from wfs."Brandcompartiment"
);
grant select on table dbk."Brandcompartiment" to public;
create view dbk."TekstObject" as (
    select
        gid,
        siteid as siteid,
        "Tekst"::character varying as tekst,
        the_geom as absolutepositie,
        "Rotatie"::double precision as hoek,
        "LabelSize"::integer as schaal
    from wfs."TekstObject"
);
grant select on table dbk."TekstObject" to public;
create view dbk."Hulplijn" as (
    select
        gid,
        siteid as siteid,
        "Type"::character varying as "typeHulplijn",
        CASE WHEN "Omschrijving" = '' THEN null ELSE "Omschrijving" END as "aanvullendeInformatie",
        the_geom as geometrie
    from wfs."Hulplijn"
);
grant select on table dbk."Hulplijn" to public;

create view dbk."DBKGebied" as (
    select
        gid,
        siteid as siteid, 
        the_geom as geometrie from wfs."Gebied"
);
grant select on table dbk."DBKGebied" to public;

create view dbk."AfwijkendeBinnendekking" as (
    select
        gid,
        siteid as siteid,
        the_geom as locatie,
        "AlternatiefComm"::character varying as "alternatieveCommInfrastructuur",
        "Dekking"::boolean as dekking,
        "Aanvullendeinformatie"::text as "aanvullendeInformatie"
    from wfs."AfwijkendeBinnendekking"
);
grant select on table dbk."AfwijkendeBinnendekking" to public;

/**
 * Occupation, people present in a building on a site
 */

CREATE OR REPLACE VIEW dbk.occupation AS 
 SELECT a.gid, a.siteid AS siteid, 
        CASE
            WHEN lower(a.type_occupation::text) = 'inhabitants'::text THEN ( SELECT type_aanwezigheidsgroep.naam
               FROM dbk.type_aanwezigheidsgroep
              WHERE type_aanwezigheidsgroep.gid = 2)
            WHEN lower(a.type_occupation::text) = 'staff'::text THEN ( SELECT type_aanwezigheidsgroep.naam
               FROM dbk.type_aanwezigheidsgroep
              WHERE type_aanwezigheidsgroep.gid = 4)
            WHEN lower(a.type_occupation::text) = 'visitors'::text THEN ( SELECT type_aanwezigheidsgroep.naam
               FROM dbk.type_aanwezigheidsgroep
              WHERE type_aanwezigheidsgroep.gid = 3)
            ELSE ( SELECT type_aanwezigheidsgroep.naam
               FROM dbk.type_aanwezigheidsgroep
              WHERE type_aanwezigheidsgroep.gid = 1)
        END AS type_occupation, a."Aantal" AS aantal, a."AantalNZR" AS "aantalNietZelfredzaam", 
        maandag,
        dinsdag,
        woensdag,
        donderdag,
        vrijdag,
        zaterdag,
        zondag,
        to_timestamp(a."Begintijd"::text, 'HH24MISSMS'::text)::time without time zone AS "tijdvakBegintijd", to_timestamp(a."Eindtijd"::text, 'HH24MISSMS'::text)::time without time zone AS "tijdvakEindtijd"
   FROM wfs.occupation a;
grant select on table dbk.occupation to public;

create view dbk."Adres" as (
   SELECT a.gid,
    a."Huisletter" AS huisletter,
    a."Straatnaam" AS "openbareRuimteNaam",
    a."Adres_ID" AS "bagId",
        CASE
            WHEN ltrim(a."Adresseerbaarobject_ID"::text, '0'::text) = ''::text THEN NULL::bigint
            ELSE ltrim(a."Adresseerbaarobject_ID"::text, '0'::text)::bigint
        END AS "adresseerbaarObject",
        CASE
            WHEN ltrim(a."Adresseerbaarobject_ID"::text, '0'::text) = ''::text THEN NULL::bigint
            ELSE ltrim(a."Adresseerbaarobject_ID"::text, '0'::text)::bigint
        END AS "bagId2",
    a."TypeAdresseerbaarobject" as "typeAdresseerbaarObject",    
    a."Huisnummer" AS huisnummer,
    a."Plaats" AS "woonplaatsNaam",
    a."Gemeente" AS "gemeenteNaam",
    a."Toevoeging" AS huisnummertoevoeging,
    a."Postcode" AS postcode
   FROM wfs."Adres" a
);
grant select on table dbk."Adres" to public;
--DROP VIEW dbk."Foto";
CREATE OR REPLACE VIEW dbk."Foto" AS (
    SELECT 
	bv.gid, 
	bv.siteid AS siteid, 
	CASE WHEN bv."Omschrijving" = '' THEN bv."Picturename" ELSE bv."Omschrijving"::character varying END AS naam, 
	bv."Picturename"::character varying AS "URL",
	substr(bv."Picturename"::character varying, (length(bv."Picturename"::character varying) - 4), 1) as pos,
	case when lower(RIGHT("Picturename", POSITION('.' in REVERSE("Picturename")) -1 )) 
	IN ('jpg','gif','png', 'jpeg') THEN 'afbeelding' ELSE 
	CASE WHEN lower(RIGHT("Picturename", POSITION('.' in REVERSE("Picturename")) -1 )) 
	IN ('doc','xls','pdf', 'docx') THEN 'document' ELSE 'weblink' END END as filetype,
	1 as bron
   FROM wfs."Brandweervoorziening" bv where not bv."Picturename" = ''
  UNION
   SELECT 
	f.gid, 
	f.siteid AS siteid, 
	f."Documentnaam"::character varying AS naam, 
	CASE WHEN position(f.siteid::character varying in f."Documentnaam") = 1 THEN f."Documentnaam" ELSE 
	  CASE WHEN lower(f."Bestandstype") = 'weblink' THEN f."Documentnaam" ELSE 
	(f.siteid::character varying || '-' || f."Documentnaam") END END AS "URL",
	'' as pos,
	lower(f."Bestandstype") as filetype,
	--lower(substr(f."Documentnaam"::character varying, (length(f."Documentnaam"::character varying) - 2), 3)) as filetype,
	
	2 as bron
   FROM wfs."Foto" f where not f."Documentnaam" = '');
 
GRANT SELECT ON TABLE dbk."Foto" TO public;

create view dbk."Contact" as (
    select 
        gid,
        siteid as siteid,
        CASE WHEN "Functie" = '' THEN 'Contact' ELSE "Functie" END as functie,
        "Naam" as naam,
        "Telefoonnummer" as telefoonnummer
    from wfs."Contact"
);
GRANT SELECT ON TABLE dbk."Contact" TO public;

create view dbk."Bijzonderheid" as
select * from (select
    gid,
	siteid as siteid, 
	"Bijzonderheden" as tekst,
	'Algemeen'::character varying as soort,
	1 as seq
from wfs."DBK" where "Bijzonderheden" <> '' AND not "Bijzonderheden" is null 
UNION 
select 
    gid,
	siteid as siteid, 
	"Bijzonderheden2" as tekst,
	'Algemeen' as soort,
	 2 as seq
from wfs."DBK" where "Bijzonderheden2" <> '' AND not "Bijzonderheden2" is null
UNION
select 
    gid,
	siteid as siteid, 
	"Prev_Bijz_1" as tekst,
	'Preventie' as soort,
	 1 as seq
from wfs."DBK" where "Prev_Bijz_1" <> '' AND not "Prev_Bijz_1" is null
UNION
select
    gid,
	siteid as siteid, 
	"Prev_Bijz_2" as tekst,
	'Preventie' as soort,
	 2 as seq
from wfs."DBK" where "Prev_Bijz_2" <> '' AND not "Prev_Bijz_2" is null
UNION
select
    gid,
	siteid as siteid, 
	"Prep_Bijz_1" as tekst,
	'Preparatie' as soort,
	 1 as seq
from wfs."DBK" where "Prep_Bijz_1" <> '' AND not "Prep_Bijz_1" is null
UNION
select 
    gid,
	siteid as siteid, 
	"Prep_Bijz_2" as tekst,
	'Preparatie' as soort,
	 2 as seq
from wfs."DBK" where "Prep_Bijz_2" <> '' AND not "Prep_Bijz_2" is null
UNION
select 
    gid,
	siteid as siteid, 
	"Repr_Bijz_1" as tekst,
	'Repressie' as soort,
	 1 as seq
from wfs."DBK" where "Repr_Bijz_1" <> '' AND not "Repr_Bijz_1" is null
UNION
select 
    gid,
	siteid as siteid, 
	"Repr_Bijz_2" as tekst,
	'Repressie' as soort,
	 2 as seq
from wfs."DBK" where "Repr_Bijz_2" <> '' AND not "Repr_Bijz_2" is null) a order by a.siteid, soort, seq;
GRANT SELECT ON TABLE dbk."Bijzonderheid" TO public;

CREATE OR REPLACE VIEW dbk."DBKGebied_Feature" AS 
 SELECT df.gid, df.identificatie, df."BHVaanwezig", df."controleDatum", df."formeleNaam", df."informeleNaam", df.inzetprocedure, dg.geometrie, df.verwerkt, df.hoofdobject, df.risicoklasse
   FROM dbk."DBKFeature" df
   JOIN dbk."DBKGebied" dg ON df.identificatie = dg.siteid where df."typeFeature" = 'Gebied'
   ;

GRANT SELECT ON TABLE dbk."DBKGebied_Feature" TO public;

CREATE OR REPLACE VIEW dbk."DBKObject_Feature" AS 
 SELECT df.gid, df.identificatie, df."BHVaanwezig", df."controleDatum", df."formeleNaam", df."informeleNaam", df.inzetprocedure, dob."laagsteBouwlaag", dob."hoogsteBouwlaag", dob."OMSnummer", 
 dob.gebouwconstructie, dob.adres_id, dob.gebruikstype, df.verwerkt, df.hoofdobject, df.bouwlaag, df.risicoklasse,df.status
   FROM dbk."DBKFeature" df
   JOIN dbk."DBKObject" dob ON df.identificatie = dob.siteid  where df."typeFeature" = 'Object';

GRANT SELECT ON TABLE dbk."DBKObject_Feature" TO public;

CREATE FUNCTION dbk.dbkgebied_json(id integer, srid integer = 28992) RETURNS TABLE (identificatie integer, "DBKGebied" json) AS 
'
SELECT t.identificatie,
    row_to_json(t.*) AS "DBKGebied" 
    FROM (
  select "identificatie","BHVaanwezig","controleDatum","formeleNaam","informeleNaam", "inzetprocedure",risicoklasse, st_asgeojson(st_transform(geometrie, $2),15,2)::json as geometry, "verwerkt",
    (
      select array_to_json(array_agg(row_to_json(a)))
      from (
        select type_occupation,"aantal","aantalNietZelfredzaam","tijdvakBegintijd","tijdvakEindtijd", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag" from dbk."AantalPersonen" where siteid = d.identificatie
      ) a 
    ) as verblijf,
    (
      select array_to_json(array_agg(row_to_json(a)))
      from (
        select "seq","soort","tekst" from dbk."Bijzonderheid" where siteid = d.identificatie order by soort asc, "seq" asc
      ) a 
    ) as bijzonderheid,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "typeScheiding", "Label", "aanvullendeInformatie", st_asgeojson(geometrie,15,2)::json as geometry from dbk."Brandcompartiment" where siteid = d.identificatie
      ) b
    ) as brandcompartiment,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "typeVoorziening", "naamVoorziening", lower("namespace") as namespace, "aanvullendeInformatie", hoek, radius, st_asgeojson(st_transform(locatie,$2),15,2)::json as geometry from dbk."Brandweervoorziening" where siteid = d.identificatie
      ) b
    ) as brandweervoorziening,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "functie", "naam", "telefoonnummer"from dbk."Contact" where siteid = d.identificatie order by "naam" asc
      ) b
    ) as contact,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "naam", "URL", "filetype" from dbk."Foto" where siteid = d.identificatie order by bron, pos, "URL"
      ) b
    ) as foto,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "naamStof", "gevaarsindicatienummer", "UNnummer", "hoeveelheid",
        "symboolCode", lower("namespace") as namespace, "aanvullendeInformatie", st_asgeojson(st_transform(locatie, $2),15,2)::json as geometry from dbk."GevaarlijkeStof" where siteid = d.identificatie
      ) b
    ) as gevaarlijkestof,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "typeHulplijn", "aanvullendeInformatie", st_asgeojson(st_transform(geometrie,$2),15,2)::json as geometry from dbk."Hulplijn" where siteid = d.identificatie
      ) b
    ) as hulplijn,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "bagId", "bagStatus", st_asgeojson(st_transform(geometrie,$2),15,2)::json as geometry from dbk."Pandgeometrie" where siteid = d.identificatie
      ) b
    ) as pandgeometrie,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "tekst", "hoek", "schaal", st_asgeojson(st_transform(absolutepositie,$2),15,2)::json as geometry from dbk."TekstObject" where siteid = d.identificatie
      ) b
    ) as tekstobject,
    (
      select array_to_json(array_agg(row_to_json(b)))
      from (
        select "primair", "naamRoute", "aanvullendeInformatie", st_asgeojson(st_transform(geometrie,$2),15,2)::json as geometry from dbk."ToegangTerrein" where siteid = d.identificatie
      ) b
    ) as toegangterrein
    from dbk."DBKGebied_Feature" d WHERE d.identificatie = $1) t;
'
LANGUAGE SQL;


CREATE FUNCTION dbk.dbkobject_json(id integer, srid integer = 28992) RETURNS TABLE (identificatie integer, "DBKObject" json) AS 
'
SELECT t.identificatie,
    row_to_json(t.*) AS "DBKObject"
   FROM ( SELECT d.identificatie,
            d."BHVaanwezig",
            d."controleDatum",
            d."formeleNaam",
            d."informeleNaam",
            d."OMSnummer",
            d.inzetprocedure,
            d."laagsteBouwlaag",
            d."hoogsteBouwlaag",
	    d.bouwlaag,
            d.risicoklasse,
            d.gebouwconstructie,
            d.gebruikstype,
            d.verwerkt,
	    d.status,
            ( SELECT array_to_json(array_agg(row_to_json(a.*))) AS array_to_json
                   FROM ( SELECT "AantalPersonen".type_occupation,
                            op.aantal,
                            op."aantalNietZelfredzaam",
                            op."tijdvakBegintijd",
                            op."tijdvakEindtijd",
                            op.maandag,
                            op.dinsdag,
                            op.woensdag,
                            op.donderdag,
                            op.vrijdag,
                            op.zaterdag,
                            op.zondag
                           FROM dbk.occupation op
                          WHERE op.siteid = d.identificatie) a) AS verblijf,
            ( SELECT array_to_json(array_agg(row_to_json(a.*))) AS array_to_json
                   FROM ( SELECT "Adres"."bagId",
                            "Adres"."openbareRuimteNaam",
                            "Adres".huisnummer,
                            "Adres".huisletter,
                            "Adres"."woonplaatsNaam",
                            "Adres"."gemeenteNaam",
                            "Adres"."adresseerbaarObject",
                            "Adres"."typeAdresseerbaarObject",
                            "Adres".huisnummertoevoeging,
                            "Adres".postcode
                           FROM dbk."Adres"
                          WHERE "Adres"."bagId" = d.adres_id) a) AS adres,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "AfwijkendeBinnendekking"."alternatieveCommInfrastructuur",
                            "AfwijkendeBinnendekking".dekking,
                            "AfwijkendeBinnendekking"."aanvullendeInformatie",
                            st_asgeojson(st_transform("AfwijkendeBinnendekking".locatie,$2), 15, 2)::json AS geometry
                           FROM dbk."AfwijkendeBinnendekking"
                          WHERE "AfwijkendeBinnendekking".siteid = d.identificatie) b) AS afwijkendebinnendekking,
            ( SELECT array_to_json(array_agg(row_to_json(a.*))) AS array_to_json
                   FROM ( SELECT "Bijzonderheid".seq,
                            "Bijzonderheid".soort,
                            "Bijzonderheid".tekst
                           FROM dbk."Bijzonderheid"
                          WHERE "Bijzonderheid".siteid = d.identificatie
                          ORDER BY "Bijzonderheid".soort, "Bijzonderheid".seq) a) AS bijzonderheid,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Brandcompartiment"."typeScheiding","Label", "aanvullendeInformatie", 
                            st_asgeojson(st_transform("Brandcompartiment".geometrie,$2), 15, 2)::json AS geometry
                           FROM dbk."Brandcompartiment"
                          WHERE "Brandcompartiment".siteid = d.identificatie) b) AS brandcompartiment,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Brandweervoorziening"."typeVoorziening",
                            "Brandweervoorziening"."naamVoorziening",
			    lower("namespace") as namespace,
                            "Brandweervoorziening"."aanvullendeInformatie",
                            "Brandweervoorziening".hoek,
                            categorie,
                            radius,
                            st_asgeojson(st_transform("Brandweervoorziening".locatie,$2), 15, 2)::json AS geometry
                           FROM dbk."Brandweervoorziening"
                          WHERE "Brandweervoorziening".siteid = d.identificatie) b) AS brandweervoorziening,
	      ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT identificatie,
                            bouwlaag,
                            case when hoofdobject is null then ''hoofdobject'' else ''verdieping'' end as "type"
                           FROM dbk."DBKFeature"
                          WHERE (dbk."DBKFeature".hoofdobject = d.identificatie OR dbk."DBKFeature".identificatie = d.identificatie OR dbk."DBKFeature".hoofdobject = d.hoofdobject OR 
                          dbk."DBKFeature".identificatie = d.hoofdobject) AND
                          (viewer = true) AND ((now() > datumtijdviewerbegin and now() <= datumtijdviewereind) OR 
(datumtijdviewerbegin is null and datumtijdviewereind is null) OR
(now() > datumtijdviewerbegin and datumtijdviewereind is null) OR
(datumtijdviewerbegin is null and now() <= datumtijdviewereind))
                          ORDER BY bouwlaag) b) AS verdiepingen,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Contact".functie,
                            "Contact".naam,
                            "Contact".telefoonnummer
                           FROM dbk."Contact"
                          WHERE "Contact".siteid = d.identificatie
                          ORDER BY "Contact".naam) b) AS contact,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Foto".naam,
                            "Foto"."URL",
                            "Foto".filetype
                           FROM dbk."Foto"
                          WHERE "Foto".siteid = d.identificatie
                          ORDER BY "Foto".bron, "Foto".pos, "Foto"."URL") b) AS foto,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "GevaarlijkeStof"."naamStof",
                            "GevaarlijkeStof".gevaarsindicatienummer,
                            "GevaarlijkeStof"."UNnummer",
                            "GevaarlijkeStof".hoeveelheid,
                            lower("GevaarlijkeStof".namespace) as namespace,
                            "GevaarlijkeStof"."symboolCode",
                            "GevaarlijkeStof"."aanvullendeInformatie",
                            st_asgeojson(st_transform("GevaarlijkeStof".locatie,$2), 15, 2)::json AS geometry
                           FROM dbk."GevaarlijkeStof"
                          WHERE "GevaarlijkeStof".siteid = d.identificatie) b) AS gevaarlijkestof,
                   --OMS integratie siemens met voorwaarde om te kijken of siemens schema en tabel wel bestaan.
                   ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT *
                           FROM dbk."OMS"
                          WHERE dbk."OMS".omsnummer = d."OMSnummer") b) AS oms_details,
                   -- OMS integratie einde
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Hulplijn"."typeHulplijn", "aanvullendeInformatie",
                            st_asgeojson(st_transform("Hulplijn".geometrie, $2), 15, 2)::json AS geometry
                           FROM dbk."Hulplijn"
                          WHERE "Hulplijn".siteid = d.identificatie) b) AS hulplijn,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "Pandgeometrie"."bagId",
                            "Pandgeometrie"."bagStatus",
                            st_asgeojson(st_transform("Pandgeometrie".geometrie,$2), 15, 2)::json AS geometry
                           FROM dbk."Pandgeometrie"
                          WHERE "Pandgeometrie".siteid = d.identificatie) b) AS pandgeometrie,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "TekstObject".tekst,
                            "TekstObject".hoek,
                            "TekstObject".schaal,
                            st_asgeojson(st_transform("TekstObject".absolutepositie, $2), 15, 2)::json AS geometry
                           FROM dbk."TekstObject"
                          WHERE "TekstObject".siteid = d.identificatie) b) AS tekstobject,
            ( SELECT array_to_json(array_agg(row_to_json(b.*))) AS array_to_json
                   FROM ( SELECT "ToegangTerrein".primair,
                            "ToegangTerrein"."naamRoute",
                            "ToegangTerrein"."aanvullendeInformatie",
                            st_asgeojson(st_transform("ToegangTerrein".geometrie,$2), 15, 2)::json AS geometry
                           FROM dbk."ToegangTerrein"
                          WHERE "ToegangTerrein".siteid = d.identificatie) b) AS toegangterrein
           FROM dbk."DBKObject_Feature" d WHERE d.identificatie = $1) t;
'
LANGUAGE SQL;
--todo; deze aanpassen aan viewer en dataumtijd voorwaarden.
CREATE FUNCTION dbk.dbkfeatures_json(srid integer = 28992) RETURNS TABLE (identificatie integer, "feature" json) AS 
'
SELECT t.identificatie,
    row_to_json(t.*) AS "feature"
   FROM ( SELECT 
	gid, identificatie, "BHVaanwezig", "controleDatum", "formeleNaam", 
        "informeleNaam", "OMSNummer", inzetprocedure, "typeFeature", 
        (select initcap(df."gebruikstype") from dbk."DBKObject_Feature" df where d.identificatie = df.identificatie) as functie,
	(select count(*) from dbk."GevaarlijkeStof" gs where d.identificatie = gs.siteid) as gevaarlijkestoffen,
        st_asgeojson(st_transform(geometrie,$1),15,2)::json as geometry, verwerkt, hoofdobject, bouwlaag, risicoklasse,
        (select count(*) from dbk."DBKFeature" d2 where d2.hoofdobject = d.identificatie) as verdiepingen
   FROM dbk."DBKFeature" d where d.hoofdobject is null AND (not d.geometrie is null and not st_isempty(d.geometrie) and not d."typeFeature" is null) AND (viewer = true) AND ((now() > datumtijdviewerbegin and now() <= datumtijdviewereind) OR 
(datumtijdviewerbegin is null and datumtijdviewereind is null) OR
(now() > datumtijdviewerbegin and datumtijdviewereind is null) OR
(datumtijdviewerbegin is null and now() <= datumtijdviewereind))
) t;
'
LANGUAGE SQL;

-- met adres
CREATE FUNCTION dbk.dbkfeatures_adres_json(srid integer = 28992) RETURNS TABLE (identificatie integer, "feature" json) AS 
'
SELECT t.identificatie,
    row_to_json(t.*) AS "feature"
   FROM ( SELECT 
	gid, identificatie, "BHVaanwezig", "controleDatum", "formeleNaam", 
        "informeleNaam", "OMSNummer", inzetprocedure, "typeFeature", 
        st_asgeojson(st_transform(geometrie,$1),15,2)::json as geometry, verwerkt, hoofdobject, bouwlaag, risicoklasse,
-- XXX deleted checken       (select count(*) from wfs."DBK2" d2 where d2."Hoofdobject_ID" = d.identificatie) as verdiepingen,
        (select count(*) from dbk."DBKFeature" d2 where d2.hoofdobject = d.identificatie) as verdiepingen,
            ( SELECT array_to_json(array_agg(row_to_json(a.*))) AS array_to_json
                   FROM ( SELECT "Adres"."bagId",
                            "Adres"."openbareRuimteNaam",
                            "Adres".huisnummer,
                            "Adres".huisletter,
                            "Adres"."woonplaatsNaam",
                            "Adres"."gemeenteNaam",
                            "Adres"."adresseerbaarObject",
                            "Adres"."typeAdresseerbaarObject",
                            "Adres".huisnummertoevoeging,
                            "Adres".postcode
                           FROM dbk."Adres"
                          WHERE "Adres"."bagId" = (select dob.adres_id from dbk."DBKObject" dob where dob.siteid = d.identificatie)) a) AS adres        
   FROM dbk."DBKFeature" d where d.hoofdobject is null AND (not d.geometrie is null and not st_isempty(d.geometrie) and not d."typeFeature" is null) AND (viewer = true) AND ((now() > datumtijdviewerbegin and now() <= datumtijdviewereind) OR 
(datumtijdviewerbegin is null and datumtijdviewereind is null) OR
(now() > datumtijdviewerbegin and datumtijdviewereind is null) OR
(datumtijdviewerbegin is null and now() <= datumtijdviewereind))
) t;
'
LANGUAGE SQL;

