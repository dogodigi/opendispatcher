drop schema if exists wfs cascade;
create schema wfs;
CREATE TABLE wfs.occupation
(
  gid serial PRIMARY KEY,
  siteid integer,
  type_occupation character varying,
  "Aantal" character varying,
  "AantalNZR" character varying,
  "Begintijd" character varying,
  "Eindtijd" character varying,
  "Licence_ID" integer,
  maandag boolean,
  dinsdag boolean,
  woensdag boolean,
  donderdag boolean,
  vrijdag boolean,
  zaterdag boolean,
  zondag boolean
);

CREATE TABLE wfs."Adres"
(
  gid serial PRIMARY KEY,
  "Adres_ID" integer,
  "Straatnaam" character varying,
  "Huisnummer" integer,
  "Huisletter" character varying,
  "Toevoeging" character varying,
  "Postcode" character varying,
  "Plaats" character varying,
  "Gemeente" character varying,
  "Licence_ID" integer,
  the_geom geometry,
  "Adresseerbaarobject_ID" character varying,
  "TypeAdresseerbaarobject" character varying,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."AfwijkendeBinnendekking"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Section_ID" integer,
  "AlternatiefComm" character varying,
  "Dekking" boolean,
  "Aanvullendeinformatie" character varying,
  the_geom geometry,
  "Uniek_ID" integer,
  "Licence_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Brandcompartiment"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Soort" character varying,
  "Omschrijving" character varying,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  "Label" character varying,
  the_geom geometry,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTILINESTRING'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."type_brandcompartiment"
(
  gid serial PRIMARY KEY,
  "Soort" character varying,
  "Code" character varying,
  the_geom geometry,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Contact"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Functie" character varying,
  "Naam" character varying,
  "Telefoonnummer" character varying,
  "Licence_ID" integer
);

CREATE TABLE wfs."Hulplijn"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Type" character varying,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  "Omschrijving" character varying,
  the_geom geometry,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTILINESTRING'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

-- Table: public."WFS_tblDBK"

-- DROP TABLE public."WFS_tblDBK";

CREATE TABLE wfs."DBK"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Section_ID" integer,
  "Nummer" character varying,
  "Formele_Naam" character varying,
  "Informele_Naam" character varying,
  "Adres_ID" integer,
  "Gebruikstype" character varying,
  "Bouwlaag_Max" character varying,
  "Bouwlaag_Min" character varying,
  "Datum_Actualisatie" character varying,
  "Datum_Akkoord" character varying,
  "Bijzonderheden" character varying,
  "Bijzonderheden2" character varying,
  "Prev_Bijz_1" character varying,
  "Prev_Bijz_2" character varying,
  "Prep_Bijz_1" character varying,
  "Prep_Bijz_2" character varying,
  "Repr_Bijz_1" character varying,
  "Repr_Bijz_2" character varying,
  "Personen_DAG" character varying,
  "Personen_AVOND" character varying,
  "Personen_NACHT" character varying,
  "Gebruiker" character varying,
  "HasPolygon" integer,
  "Deleted" boolean,
  "Licence_ID" integer,
  the_geom geometry,
  verwerkt boolean DEFAULT false,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTIPOLYGON'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."DBK2"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Datum_Begin" character varying,
  "Datum_Eind" character varying,
  "Status" character varying,
  "Prioriteit" character varying,
  "BHVaanwezig" character varying,
  "Bouwlaag" character varying,
  "Licence_ID" integer,
  inzetprocedure character varying,
  "Datum_Aanmaak" character varying,
  "Gebruiker_Aanmaak" character varying,
  "Gebruikstype_Specifiek" character varying,
  "RisicoKlasse" character varying,
  "Hoofdobject_ID" integer,
  "Viewer" boolean,
  "DatumTijd_Viewer_Begin" character varying,
  "DatumTijd_Viewer_Eind" character varying,
  "Datum_Controle_Preventie" character varying,
  "Landscape_Layout" boolean,
  "MapRotation" double precision
);

CREATE TABLE wfs."Gebied"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Section_ID" integer,
  "Licence_ID" integer,
  "Uniek_ID" integer,
  the_geom geometry,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTIPOLYGON'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Object"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Section_ID" integer,
  "Nummer" character varying,
  "Adres_ID" integer,
  "Gebruikstype" character varying,
  "Gebouwconstructie" character varying,
  "Bouwlaag_Max" character varying,
  "Bouwlaag_Min" character varying,
  "Licence_ID" integer
);

CREATE TABLE wfs."Polygon"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Section_ID" integer,
  "Datum" character varying,
  "Licence_ID" integer,
  the_geom geometry,
  "BAG_Pand_ID" character varying,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTIPOLYGON'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."GevaarlijkeStof"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Omschrijving" character varying,
  "Symbol" character varying,
  "GEVIcode" integer,
  "UNnr" integer,
  "X" double precision,
  "Y" double precision,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  the_geom geometry,
  "Hoeveelheid" character varying,
  "NaamStof" character varying,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."TekstObject"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Tekst" character varying,
  "LabelSize" integer,
  "Font" character varying,
  "Scale" double precision,
  "XBegin" double precision,
  "YBegin" double precision,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  the_geom geometry,
  "Rotatie" double precision,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Light"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "NaamBeheerder" character varying,
  "Email" character varying,
  "Telfoonnummer" character varying,
  "OmschrijvingWijziging" character varying,
  "DatumTijd" character varying,
  "BrandweerOefening" boolean,
  "Goedgekeurd" boolean,
  "Afgehandeld" boolean,
  "Web" boolean,
  "Licence_ID" integer
);

CREATE TABLE wfs."LightLog"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Omschrijving" character varying,
  "DatumTijd" character varying,
  "Licence_ID" integer
);

CREATE TABLE wfs."Locatie"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Map_Type" character varying,
  "Zoom" double precision,
  "Xcenter" double precision,
  "Ycenter" double precision,
  "Licence_ID" integer,
  the_geom geometry,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Foto"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Documentnaam" character varying,
  "X" double precision,
  "Y" double precision,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  "Bestandstype" character varying,
  the_geom geometry,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs.type_brandweervoorziening
(
  gid serial PRIMARY KEY,
  "Symbol_Type_ID" integer,
  "Omschrijving" character varying,
  "Code" character varying,
  the_geom geometry,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."Brandweervoorziening"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Symbol_Type_ID" integer,
  "Rotatie" integer,
  "X" double precision,
  "Y" double precision,
  "Omschrijving" character varying,
  "Picturename" character varying,
  "VisibleToAll" boolean,
  "Licence_ID" integer,
  the_geom geometry,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs.sync
(
  gid serial PRIMARY KEY,
  "Busy" boolean,
  "Licence_ID" integer,
  the_geom geometry,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);

CREATE TABLE wfs."ToegangTerrein"
(
  gid serial PRIMARY KEY,
  siteid integer,
  "Primair" integer,
  "Licence_ID" integer,
  the_geom geometry,
  "Omschrijving" character varying,
  "NaamRoute" character varying,
  "Uniek_ID" integer,
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_the_geom CHECK (geometrytype(the_geom) = 'MULTILINESTRING'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);