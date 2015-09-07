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

insert into dbk.type_aanwezigheidsgroep (gid,naam) values (1,'Unspecified');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (2,'Inhabitants');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (3,'Visitors');
insert into dbk.type_aanwezigheidsgroep (gid,naam) values (4,'Staff');

insert into wfs."DBK" 
(siteid,"Section_ID","Formele_Naam","Informele_Naam","Gebruikstype","Bouwlaag_Max","Bouwlaag_Min","Datum_Actualisatie","Gebruiker","HasPolygon","Deleted",userid)
values
(1,0,'Formal name','Informal name','Recreation','4','1','20140227130318768','Demo User',1,false,1),
(2,0,'Stadium','Old stadium','Sports','4','1','20140227130318768','Demo User',1,false,1);

insert into wfs."DBK2" 
(siteid,"Datum_Begin","Datum_Eind","Status","Prioriteit","BHVaanwezig","Bouwlaag",userid,"inzetprocedure","Gebruikstype_Specifiek","Viewer")
values
(1,'20130101000000000','','Gereed','Prio 3','Nee','BG',1,'Offensive inside','Recreational',true),
(2,'20130101000000000','','Gereed','Prio 1','Nee','0',1,'','',true);

-- wfs."Adres" skipped

insert into wfs.occupation
(siteid,type_occupation,selfreliant,reliant,starttime,endtime,userid,monday,tuesday,wednesday,thursday,friday,saturday,sunday) 
values
(1,'Inhabitants','10','5','000000000','000000000',1,true,true,true,true,true,true,true),
(1,'Staff','12','0','000000000','090000000',1,true,true,true,true,true,true,true),
(1,'Staff','6','0','090000000','000000000',1,true,true,true,true,true,true,true),
(1,'Visitors','500','2','120000000','130000000',1,false,false,false,true,true,true,true);

insert into wfs."Brandcompartiment"
(siteid,"Soort","Omschrijving","VisibleToAll",userid,"Label",the_geom,"Uniek_ID")
values
(1,'60 minuten','',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93934896694183578 12.10550580140640875, -68.93916452357281344 12.10572410995509429, -68.93934896694183578 12.1058759766663453)',4326)),0),
(1,'30 minuten','',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93873739156033764 12.1057051266101201, -68.93898008020377688 12.10542037627357992)',4326)),0),
(1,'Rookwerend','',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93921447479492315 12.10566583496521353, -68.9389475815368229 12.10545385415680819)',4326)),0);

insert into wfs."Brandweervoorziening"
(siteid,"Symbol_Type_ID","Rotatie","X","Y","Omschrijving","Picturename","VisibleToAll",userid,the_geom,"Uniek_ID")
values
(1,1011,60,0,0,'First vehicle',NULL,false,1,st_geomfromtext('POINT(-68.93880119852251198 12.10586952096222291)',4326),0),
(1,1012,45,0,0,'Other vehicle',NULL,false,1,st_geomfromtext('POINT(-68.93895192131208205 12.10528003639316452)',4326),0);

insert into wfs."Contact"
(siteid,"Functie","Naam","Telefoonnummer",userid)
values
(1,'Manager','Carl Zeiss','555-1234',1),
(1,'Janitor','Milo van der Linden','555-1235',1);

insert into wfs."Foto"
(siteid,"Documentnaam","X","Y","VisibleToAll",userid,"Bestandstype",the_geom,"Uniek_ID")
values
(1,'image1.png',0,0,false,1,'Afbeelding',st_geomfromtext('POINT(-68.93951693588898877 12.10575071315334661)',4326),0),
(1,'image2.png',0,0,false,1,'Afbeelding',st_geomfromtext('POINT(-68.93941566431041679 12.10587036171409281)',4326),0);

insert into wfs."Gebied"
(siteid,"Section_ID",userid,the_geom,"Uniek_ID")
values
(2,0,1,st_multi(st_geomfromtext('POLYGON((-68.94098537377824698 12.10726625762936948,-68.93922437355089983 12.10700770800043635,-68.93919061635804724 12.10688668468388407,-68.93922437355089983 12.10671615173566629,-68.93904433518900987 12.10662263362105762,-68.93984325541994451 12.10569845284564217,-68.94096286898299297 12.10586348536147483,-68.94110352395324526 12.10680966981752604,-68.94098537377824698 12.10726625762936948))',4326)),0);

insert into wfs."GevaarlijkeStof"
(siteid,"Omschrijving","Symbol","GEVIcode","UNnr","X","Y","VisibleToAll",userid,the_geom,"Hoeveelheid","NaamStof","Uniek_ID")
values
(1,'Oxygen','EU-GHS07',25,1072,0,0,false,1,st_geomfromtext('POINT(-68.93919624255686074 12.10550041369206653)',4326),'200 l','',0);

insert into wfs."Hulplijn"
(siteid,"Type","VisibleToAll",userid,"Omschrijving",the_geom,"Uniek_ID")
values
(1,'Fence',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93964071226280055 12.10594600158116663, -68.93947192629852339 12.10581397561743344)',4326)),0),
(1,'Arrow',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93881928723662611 12.10731576710423418, -68.93866737986877524 12.10720024498193936, -68.93866737986877524 12.10709022386665445, -68.93862237027830986 12.10702421117572491, -68.9389486898092656 12.10662813468754351, -68.93911184957472926 12.10635308122520115, -68.93921874735210054 12.10624305976095805, -68.93882491343543961 12.10589099077086672)',4326)),0),
(1,'Broken',false,1,'',st_multi(st_geomfromtext('LINESTRING(-68.93855485589259047 12.10554992349422143, -68.93864487507353545 12.10543440060823706, -68.93883616583306662 12.10557742893590394)',4326)),0);

-- wfs."Light" skipped
-- wfs."LightLog" skipped
-- wfs."Locatie" skipped
-- wfs."Object" skipped
insert into wfs."Polygon"
(siteid,"Section_ID","Datum",userid,the_geom,"BAG_Pand_ID","Uniek_ID")
values
(1,0,'',1,st_multi(st_geomfromtext('POLYGON((-68.93920491176834275 12.10612489544584847,-68.93970761414360027 12.10554580199589836,-68.93968161229659586 12.10552037835225114,-68.93888855596324561 12.10537348614160891,-68.93889144505735089 12.10536501158851941,-68.93884088591042314 12.10535512460959318,-68.93884088591042314 12.10536924886510235,-68.93858664562867489 12.10531275183859634,-68.93854330921702456 12.10531275183859634,-68.93843496818787742 12.10536924886510235,-68.93841763362321728 12.10538196069440708,-68.93840607724676772 12.10540173464992009,-68.93840463269971508 12.10542009617873127,-68.93840463269971508 12.10543704528111952,-68.93841618907616464 12.10545116953229261,-68.93920491176834275 12.10612489544584847))',4326)),'',0);

-- wfs."Tekstobject" skipped
-- wfs."ToegangTerrein" skipped
-- wfs.sync skipped