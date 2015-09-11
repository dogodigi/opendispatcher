CREATE SCHEMA bag_dummy;
CREATE SCHEMA bag_actueel;

CREATE SEQUENCE bag_dummy.adres_gid_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 8601921
  CACHE 1;

CREATE TABLE bag_dummy.adres
(
  openbareruimtenaam character varying(80),
  huisnummer numeric(5,0),
  huisletter character varying(1),
  huisnummertoevoeging character varying(4),
  postcode character varying(6),
  woonplaatsnaam character varying(80),
  gemeentenaam character varying(80),
  provincienaam character varying(16),
  typeadresseerbaarobject character varying(3),
  adresseerbaarobject numeric(16,0),
  nummeraanduiding numeric(16,0),
  nevenadres boolean DEFAULT false,
  geopunt geometry,
  textsearchable_adres tsvector,
  gid integer NOT NULL DEFAULT nextval('bag_dummy.adres_gid_seq'::regclass),
  CONSTRAINT adres_pkey PRIMARY KEY (gid),
  CONSTRAINT adres_gid_key UNIQUE (gid),
  CONSTRAINT enforce_dims_punt CHECK (st_ndims(geopunt) = 3),
  CONSTRAINT enforce_geotype_punt CHECK (geometrytype(geopunt) = 'POINT'::text OR geopunt IS NULL),
  CONSTRAINT enforce_srid_punt CHECK (st_srid(geopunt) = 28992)
)
WITH (
  OIDS=FALSE
);

-- Index: bag07jul2015.adres_adreseerbaarobject

-- DROP INDEX bag07jul2015.adres_adreseerbaarobject;

CREATE INDEX adres_adreseerbaarobject
  ON bag_dummy.adres
  USING btree
  (adresseerbaarobject);

-- Index: bag07jul2015.adres_gemeentenaam_idx

-- DROP INDEX bag07jul2015.adres_gemeentenaam_idx;

CREATE INDEX adres_gemeentenaam_idx
  ON bag_dummy.adres
  USING btree
  (gemeentenaam COLLATE pg_catalog."default");

-- Index: bag07jul2015.adres_geom_idx

-- DROP INDEX bag07jul2015.adres_geom_idx;

CREATE INDEX adres_geom_idx
  ON bag_dummy.adres
  USING gist
  (geopunt);

-- Index: bag07jul2015.adres_nummeraanduiding

-- DROP INDEX bag07jul2015.adres_nummeraanduiding;

CREATE INDEX adres_nummeraanduiding
  ON bag_dummy.adres
  USING btree
  (nummeraanduiding);

-- Index: bag07jul2015.adres_openbareruimtenaam_idx

-- DROP INDEX bag07jul2015.adres_openbareruimtenaam_idx;

CREATE INDEX adres_openbareruimtenaam_idx
  ON bag_dummy.adres
  USING btree
  (openbareruimtenaam COLLATE pg_catalog."default" varchar_pattern_ops);

-- Index: bag07jul2015.adres_openbareruimtenaam_idx1

-- DROP INDEX bag07jul2015.adres_openbareruimtenaam_idx1;

CREATE INDEX adres_openbareruimtenaam_idx1
  ON bag_dummy.adres
  USING btree
  (openbareruimtenaam COLLATE pg_catalog."default");

-- Index: bag07jul2015.adres_postcode_idx

-- DROP INDEX bag07jul2015.adres_postcode_idx;

CREATE INDEX adres_postcode_idx
  ON bag_dummy.adres
  USING btree
  (postcode COLLATE pg_catalog."default");

-- Index: bag07jul2015.adres_provincienaam_idx

-- DROP INDEX bag07jul2015.adres_provincienaam_idx;

CREATE INDEX adres_provincienaam_idx
  ON bag_dummy.adres
  USING btree
  (provincienaam COLLATE pg_catalog."default");

-- Index: bag07jul2015.adres_woonplaatsnaam_idx

-- DROP INDEX bag07jul2015.adres_woonplaatsnaam_idx;

CREATE INDEX adres_woonplaatsnaam_idx
  ON bag_dummy.adres
  USING btree
  (woonplaatsnaam COLLATE pg_catalog."default");

-- Index: bag07jul2015.adresvol_idx

-- DROP INDEX bag07jul2015.adresvol_idx;

CREATE INDEX adresvol_idx
  ON bag_dummy.adres
  USING gin
  (textsearchable_adres);

CREATE TABLE bag_dummy.nlx_bag_info
  (
    gid serial NOT NULL,
    tijdstempel timestamp without time zone DEFAULT now(),
    sleutel character varying(25),
    waarde text
  )
  WITH (
    OIDS=FALSE
  );

  CREATE TYPE bag_dummy.pandStatus AS ENUM (
    'Bouwvergunning verleend',
    'Niet gerealiseerd pand',
    'Bouw gestart',
    'Pand in gebruik (niet ingemeten)',
    'Pand in gebruik',
    'Sloopvergunning verleend',
    'Pand gesloopt',
    'Pand buiten gebruik');

  CREATE TABLE bag_dummy.pand
  (
    gid serial NOT NULL,
    identificatie numeric(16,0),
    aanduidingrecordinactief boolean,
    aanduidingrecordcorrectie integer,
    officieel boolean,
    inonderzoek boolean,
    begindatumtijdvakgeldigheid timestamp without time zone,
    einddatumtijdvakgeldigheid timestamp without time zone,
    documentnummer character varying(20),
    documentdatum date,
    pandstatus bag_dummy.pandstatus,
    bouwjaar numeric(4,0),
    geom_valid boolean,
    geovlak geometry,
    CONSTRAINT pand_pkey PRIMARY KEY (gid),
    CONSTRAINT enforce_dims_geometrie CHECK (st_ndims(geovlak) = 3),
    CONSTRAINT enforce_geotype_geometrie CHECK (geometrytype(geovlak) = 'POLYGON'::text OR geovlak IS NULL),
    CONSTRAINT enforce_srid_geometrie CHECK (st_srid(geovlak) = 28992)
  )
  WITH (
    OIDS=TRUE
  );

  -- Index: bag07jul2015.pand_geom_idx

  -- DROP INDEX bag07jul2015.pand_geom_idx;

  CREATE INDEX pand_geom_idx
    ON bag_dummy.pand
    USING gist
    (geovlak);

  -- Index: bag07jul2015.pand_key

  -- DROP INDEX bag07jul2015.pand_key;

  CREATE INDEX pand_key
    ON bag_dummy.pand
    USING btree
    (identificatie, aanduidingrecordinactief, aanduidingrecordcorrectie, begindatumtijdvakgeldigheid);



CREATE OR REPLACE VIEW bag_dummy.pandactueelbestaand AS
   SELECT pand.gid,
      pand.identificatie,
      pand.aanduidingrecordinactief,
      pand.aanduidingrecordcorrectie,
      pand.officieel,
      pand.inonderzoek,
      pand.documentnummer,
      pand.documentdatum,
      pand.pandstatus,
      pand.bouwjaar,
      pand.begindatumtijdvakgeldigheid,
      pand.einddatumtijdvakgeldigheid,
      pand.geovlak
     FROM bag_dummy.pand
    WHERE pand.begindatumtijdvakgeldigheid <= 'now'::text::timestamp without time zone AND (pand.einddatumtijdvakgeldigheid IS NULL OR pand.einddatumtijdvakgeldigheid >= 'now'::text::timestamp without time zone) AND pand.aanduidingrecordinactief = false AND pand.geom_valid = true AND pand.pandstatus <> 'Niet gerealiseerd pand'::bag07jul2015.pandstatus AND pand.pandstatus <> 'Pand gesloopt'::bag_dummy.pandstatus AND pand.pandstatus <> 'Bouwvergunning verleend'::bag_dummy.pandstatus;


CREATE TABLE bag_dummy.verblijfsobjectpand
  (
    gid serial NOT NULL,
    identificatie numeric(16,0),
    aanduidingrecordinactief boolean,
    aanduidingrecordcorrectie integer,
    begindatumtijdvakgeldigheid timestamp without time zone,
    einddatumtijdvakgeldigheid timestamp without time zone,
    gerelateerdpand numeric(16,0),
    CONSTRAINT verblijfsobjectpand_pkey PRIMARY KEY (gid)
  )
  WITH (
    OIDS=FALSE
  );

  -- Index: bag07jul2015.verblijfsobjectpand_pand

  -- DROP INDEX bag07jul2015.verblijfsobjectpand_pand;

CREATE INDEX verblijfsobjectpand_pand
    ON bag_dummy.verblijfsobjectpand
    USING btree
    (gerelateerdpand);

  -- Index: bag07jul2015.verblijfsobjectpandkey

  -- DROP INDEX bag07jul2015.verblijfsobjectpandkey;

CREATE INDEX verblijfsobjectpandkey
    ON bag_dummy.verblijfsobjectpand
    USING btree
    (identificatie, aanduidingrecordinactief, aanduidingrecordcorrectie, begindatumtijdvakgeldigheid, gerelateerdpand);



CREATE OR REPLACE VIEW bag_actueel.adres AS
  SELECT adres.openbareruimtenaam,
    adres.huisnummer,
    adres.huisletter,
    adres.huisnummertoevoeging,
    adres.postcode,
    adres.woonplaatsnaam,
    adres.gemeentenaam,
    adres.provincienaam,
    adres.typeadresseerbaarobject,
    adres.adresseerbaarobject,
    adres.nummeraanduiding,
    adres.nevenadres,
    adres.geopunt,
    adres.textsearchable_adres,
    adres.gid
  FROM bag_dummy.adres;

CREATE OR REPLACE VIEW bag_actueel.nlx_bag_info AS
  SELECT nlx_bag_info.gid,
    nlx_bag_info.tijdstempel,
    nlx_bag_info.sleutel,
    nlx_bag_info.waarde
   FROM bag_dummy.nlx_bag_info;

CREATE OR REPLACE VIEW bag_actueel.pandactueelbestaand AS
  SELECT pandactueelbestaand.gid,
       pandactueelbestaand.identificatie,
       pandactueelbestaand.aanduidingrecordinactief,
       pandactueelbestaand.aanduidingrecordcorrectie,
       pandactueelbestaand.officieel,
       pandactueelbestaand.inonderzoek,
       pandactueelbestaand.documentnummer,
       pandactueelbestaand.documentdatum,
       pandactueelbestaand.pandstatus,
       pandactueelbestaand.bouwjaar,
       pandactueelbestaand.begindatumtijdvakgeldigheid,
       pandactueelbestaand.einddatumtijdvakgeldigheid,
       pandactueelbestaand.geovlak
      FROM bag_dummy.pandactueelbestaand;

CREATE OR REPLACE VIEW bag_actueel.verblijfsobjectpand AS
  SELECT verblijfsobjectpand.gid,
    verblijfsobjectpand.identificatie,
    verblijfsobjectpand.aanduidingrecordinactief,
    verblijfsobjectpand.aanduidingrecordcorrectie,
    verblijfsobjectpand.begindatumtijdvakgeldigheid,
    verblijfsobjectpand.einddatumtijdvakgeldigheid,
    verblijfsobjectpand.gerelateerdpand
  FROM bag_dummy.verblijfsobjectpand;
