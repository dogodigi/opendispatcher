CREATE SCHEMA bag_dummy;
CREATE SCHEMA bag_actueel;

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
