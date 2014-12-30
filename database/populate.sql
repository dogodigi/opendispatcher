-- Organisation
insert into organisation.organisation (id,workspace,title) values ('test_team','dbk','Opendispatcher Test Team');
insert into organisation.support(mail,button) values ('support@opendispatcher.org','Found an error?');
insert into organisation.area (the_geom) values (st_multi(st_geomfromtext('POLYGON((-69.1682270163953 12.3927532947267,-69.113573333316 12.3927532947267,-68.9860480727975 12.2588729547804,-68.9763036176749 12.2165057585949,-68.8902982094182 12.1817646577228,-68.853015076775 12.1872723932269,-68.7589599012431 12.0974539373136,-68.7339632554937 12.0411055663868,-68.7619256049761 12.0309374393023,-68.847083669309 12.0372925187301,-68.9678301784378 12.0936408896569,-69.008079014814 12.1249926148342,-69.0390070680294 12.1796462979135,-69.0873056716809 12.1948984885403,-69.1432303706458 12.2423497482681,-69.1703453762046 12.3241184369061,-69.1741584238613 12.3673329770154,-69.1682270163953 12.3927532947267))',4326)));

insert into dbk.type_brandweervoorziening (gid,naam,brandweervoorziening_symbool,namespace,categorie,radius,omschrijving) values    
(1001,'Brandweeringang',                      'Tb1.001',    'NEN1414','preparatief',     12,null),
(1002,'Overige ingangen',                     'Tb1.002',    'NEN1414','preparatief',     12,null),
(1003,'Sleutelkluis',                         'Tb1.003',    'NEN1414','preparatief',     12,null),
(1004,'Brandmeldcentrale',                    'Tb1.004a',   'NEN1414','preventief',      12,null),
(1005,'Nevenbrandweerpaneel',                 'Tb1.005',    'NEN1414','preventief',      12,null),
(1006,'Verzamelplaats',                       'Tn06',       'NEN1414','preventief',      12,'Bij meer dan een verzamelplaats voorzien van nummer'),
(1007,'Droge blusleiding',                    'Tb1.007',    'NEN1414','preventief',      12,null),
(1008,'Schakelaar elektriciteit',             'Tb2.003',    'NEN1414','preparatief',     12,null),
(1009,'Afsluiter gas',                        'Tb2.021',    'NEN1414','preparatief',     12,null),
(1010,'C2000',                                'C2000',      'Other',  'preparatief',     12,'(Geen officieel NEN1414 object)'),
(1011,'Opstelplaats eerste blusvoertuig',     'Tb1.008',    'NEN1414','repressief',      14,null),
(1012,'Opstelplaats overige blusvoertuigen',  'Tb1.009',    'NEN1414','repressief',      14,null),
(1013,'Brandweerlift',                        'Tbk5.001',   'NEN1414','preventief',      12,null),
(1014,'Afsluiter water',                      'Tb2.022',    'NEN1414','preparatief',     12,null),
(1015,'Open water',                           'Openwater',  'Other',  'preparatief',     12,'(Geen officieel NEN1414 object)'),
(1016,'Aansluiting CAI',                      'CAI',        'Other',  null,              12,'(Geen officieel NEN1414 object)'),
(1017,'Signaal',                              'Signal',     'Other',  null,              12,'(Geen officieel NEN1414 object)'),
(1018,'Toegang riool',                        'Sewer',      'Other',  null,              12,'(Geen officieel NEN1414 object)'),
(1019,'Noodschakelaar neon',                  'Tb2.001',    'NEN1414','preparatief',     12,null),
(1020,'Schakelaar rook-/warmteafvoer',        'Tb2.005',    'NEN1414','preparatief',     12,null),
(1021,'Schakelaar luchtbehandeling',          'Tb2.004',    'NEN1414','preparatief',     12,null),
(1022,'Afsluiter sprinkler',                  'Tb2.023',    'NEN1414','preparatief',     12,null),
(1023,'Activering blussysteem',               'Tb2.041',    'NEN1414','preparatief',     12,null),
(1024,'Schakelkast elektriciteit',            'Tb2.042',    'NEN1414','preparatief',     12,null),
(1025,'Lift',                                 'Tbk7.004',   'NEN1414','objectinformatie',12,null),
(1026,'Blussysteem AFFF',                     'Tb4.021',    'NEN1414','preventief',      12,null),
(1027,'Blussysteem schuim',                   'Tb4.022',    'NEN1414','preventief',      12,null),
(1028,'Blussysteem water',                    'Tb4.023',    'NEN1414','preventief',      12,null),
(1029,'Blussysteem kooldioxide',              'Tb4.024',    'NEN1414','preventief',      12,null),
(1030,'Blussysteem Hi Fog',                   'Tb4.025',    'NEN1414','preventief',      12,null),
(1031,'Trap',                                 'Trap2',      'Other',  'objectinformatie',18,'(Geen officieel NEN1414 object)'),
(1032,'Geboorde put',                         'Tb4.003',    'NEN1414','preparatief',     12,null),
(1033,'Hydrant',                              'Tb4.001',    'NEN1414','preparatief',     12,null),
(1034,'Ondergrondse brandkraan',              'Tb4.002',    'NEN1414','preparatief',     12,null),
(1038,'Noodschakelaar CV',                    'Tb2.002',    'NEN1414','preparatief',     12,null),
(1044,'Algemeen gevaar',                      'Tw01',       'NEN1414','repressief',      12,null),
(1045,'Schacht of kanaal',                    'Falck11',    'Other',  'objectinformatie',12,null),
(1046,'Rook Warmte Afvoerluiken',             'Falck12',    'Other',  'preventief',      18,null),
(1047,'Flitslicht',                           'Falck13',    'Other',  'preparatief',     12,null),
(1048,'Noodstop',                             'Tb2.043',    'NEN1414','preparatief',     12,null),
(1049,'PGS 15 Kluis',                         'Falck15',    'Other',  'preparatief',     18,null),
(1050,'Brandweerpaneel',                      'Tb1.004',    'NEN1414','preventief',      12,null),
(1051,'Afname Droge Buisleiding',             'Tb.1007a',   'NEN1414','preventief',      12,null),
(1052,'Brandweervoorziening',                 'Falck14',    'Other',  'preparatief',     12,null),
(1053,'Trap standaard',                       'Falck16',    'Other',  'preventief',      16,null),
(1054,'Trap wokkel',                          'Falck17',    'Other',  'preventief',      16,null),
(1055,'Afsluiter schuimvormend middel',       'Tb2.026',    'NEN1414','preventief',      12,null),
(1056,'Electrische Spanning',                 'Tw02',       'NEN1414','preparatief',     12,null),
(1057,'Opstelplaats Redvoertuig',             'Tb1.010',    'NEN1414','preventief',      12,null),
(1100,'Afsluiter divers',                     'Falck27',    'Other',  'preventief',      12,null),
(1101,'Afsluiter LPG',                        'Falck28',    'Other',  'preventief',      12,null),
(1102,'Afsluiter omloop',                     'Falck25',    'Other',  'preventief',      12,null),
(1103,'Afsluiter Stadsverwarming',            'Falck26',    'Other',  'preventief',      12,null),
(1104,'Berijdbaar',                           'Falck23',    'Other',  'preventief',      12,null),
(1105,'Bluswaterriool',                       'Falck19',    'Other',  'preventief',      12,null),
(1106,'Brandbluspomp',                        'Falck29',    'Other',  'preventief',      12,null),
(1107,'Blussysteem divers',                   'Falck31',    'Other',  'preventief',      12,null),
(1108,'Droge Buisleiding HD',                 'Tb.1007a_HD','NEN1414','repressief',      14,null),
(1109,'Afname Droge Buisleiding HD',          'Tb.1007_HD', 'NEN1414','repressief',      14,null),
(1110,'Gasdetectiepaneel',                    'Falck24',    'Other',  'preventief',      12,null),
(1111,'Niet blussen met Water',               'Falck34',    'Other',  'preventief',      12,null),
(1112,'Openwater blauw',                      'Falck20',    'Other',  'preventief',      12,null),
(1113,'Poller',                               'Falck22',    'Other',  'preventief',      12,null),
(1114,'Trap rond',                            'Falck35',    'Other',  'preventief',      16,null),
(1115,'Verplaatsbare Sleutelpaal',            'Falck21',    'Other',  'preventief',      12,null),
(1116,'Vulpunt',                              'Falck33',    'Other',  'preventief',      12,null),
(1117,'Waterkanon',                           'Falck30',    'Other',  'preventief',      12,null),
(2000,'GHS00-Diverse',                        'EU-GHS00',   'Other',  'repressief',      12,null),
(3000,'Gevaar',                               'Tw01',       'NEN1414','preventief',      12,null),
(9001,'Brandwerende scheiding van 60 minuten','Tbk5.002',   'NEN1414','preventief',      12,null),
(9002,'Brandwerende scheiding van 30 minuten','Tbk5.003',   'NEN1414','preventief',      12,null),
(9003,'Rookwerende scheiding',                'Tbk5.004',   'NEN1414','preventief',      12,null);

insert into dbk.type_gevaarlijkestof (gid,naam,gevaarlijkestof_symbool,namespace) values 
(1,   'NFPA-gevarendiamant',                           'Tw2.002', 'NEN1414'),
(2000,'GHS00-Diverse',                                 'EU-GHS00','other'),
(2001,'Explosief',                                     'EU-GHS01','EU-GHS'),
(2002,'Ontvlambaar',                                   'EU-GHS02','EU-GHS'),
(2003,'Brand bevorderend (oxiderend)',                 'EU-GHS03','EU-GHS'),
(2004,'Houder onder druk',                             'EU-GHS04','EU-GHS'),
(2005,'Corrosief (bijtend)',                           'EU-GHS05','EU-GHS'),
(2006,'Toxisch (giftig)',                              'EU-GHS06','EU-GHS'),
(2007,'Schadelijk',                                    'EU-GHS07','EU-GHS'),
(2008,'Schadelijk voor de gezondheid op lange termijn','EU-GHS08','EU-GHS'),
(2009,'Milieugevaarlijk',                              'EU-GHS09','EU-GHS'),
(3001,'Electrische Spanning',                          'Tw02',    'NEN1414'),
(3002,'Radioactief Materiaal',                         'Tw09',    'NEN1414'),
(3003,'Laserstralen',                                  'Tw10',    'NEN1414'),
(3004,'Niet-ioniserende Straling',                     'Tw11',    'NEN1414'),
(3005,'Magnetisch Veld',                               'Tw12',    'NEN1414'),
(3006,'Vallen door Hoogteverschil',                    'Tw14',    'NEN1414'),
(3007,'Biologische Agentia',                           'Tw15',    'NEN1414'),
(3008,'Lage temperatuur of bevriezing',                'Tw16',    'NEN1414'),
(3009,'Explosieve atmosfeer',                          'Tw19',    'NEN1414'),
(3010,'Accus en klein chemisch materiaal',             'Tw28',    'NEN1414');

insert into dbk.type_toegangterrein (gid,naam,toegangterrein_symbool) values (1,'Route eerste TS (Primair)','');
insert into dbk.type_toegangterrein (gid,naam,toegangterrein_symbool) values (2,'Route overige voertuigen','');

insert into dbk.type_brandcompartiment (gid,naam,brandcompartiment_symbool,namespace) values (1,'Scheiding (algemeen)','','CUSTOM');
insert into dbk.type_brandcompartiment (gid,naam,brandcompartiment_symbool,namespace) values (2,'60 minuten brandwerende scheiding','Tbk5.002','NEN1414');
insert into dbk.type_brandcompartiment (gid,naam,brandcompartiment_symbool,namespace) values (3,'30 minuten brandwerende scheiding','Tbk5.003','NEN1414');
insert into dbk.type_brandcompartiment (gid,naam,brandcompartiment_symbool,namespace) values (4,'Rookwerende scheiding','Tbk5.004','NEN1414');
insert into dbk.type_brandcompartiment (gid,naam,brandcompartiment_symbool,namespace) values (5,'> 60 minuten brandwerende scheiding','Tbk5.005','NEN1414');

insert into dbk.type_aanwezigheidsgroep (gid,naam) values (1,'Niet gespecificeerd');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (2,'Bewoners');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (3,'Bezoekers');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (4,'Personeel');

insert into wfs."DBK" 
("DBK_ID","Section_ID","Formele_Naam","Informele_Naam","Gebruikstype","Bouwlaag_Max","Bouwlaag_Min","Datum_Actualisatie","Gebruiker","HasPolygon","Deleted","Licence_ID")
values
(1,0,'Formal name','Informal name','woonfunctie','4','1','20140227130318768','Demo User',1,false,1);

