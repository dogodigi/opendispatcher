exports.getDBKObject = function(req, res) {
    //console.log(req);
    //where identificatie = 1369659645
    if (req.query) {
        id = req.params.id;
        var dataset = [];
        //var query_str = 'select * from "dbk"."DBKObject_Feature" d JOIN (select * from "dbk"."type_aanwezigheidsgroep") t   ;';
        var query_str = 'select "DBKObject" from dbk."dbkobjectJSON" where identificatie = $1';
        var query = global.pool.query(query_str, [id],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    //only return first row
                    res.json(result.rows[0]);
                }
                return;
            }
        );
    }
};

exports.getDBKGebied = function(req, res) {
    //console.log(req);
    //where identificatie = 1369659645
    if (req.query) {
        id = req.params.id;
        var dataset = [];
        //var query_str = 'select * from "dbk"."DBKObject_Feature" d JOIN (select * from "dbk"."type_aanwezigheidsgroep") t   ;';
        var query_str = 'select "DBKGebied" from dbk."dbkgebiedJSON" where identificatie = $1';
        var query = global.pool.query(query_str, [id],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result.rows[0]);
                }
                return;
            }
        );
    }
};