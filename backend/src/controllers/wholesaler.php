<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/wholesalers', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Wholesaler');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $wholesalers =  $query->find_array();

    return new Response(json_encode($wholesalers), 200, array('Content-Type' => 'application/json'));
});

$app->get('/wholesalers/{id}', function ($id) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/wholesalers', function (Request $request) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->create();
    $data = $request->request->all();
    $wholesaler->set($data);

    if (!$wholesaler->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/wholesalers/{id}', function ($id, Request $request) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }
    $wholesaler->set($request->request->all());
    $wholesaler->save();

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/wholesalers/{id}', function ($id) use ($app) {
    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }
    $wholesaler->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});

$app->post('/wholesalers/upload', function () use ($app) {
    $model = $app['paris']->getModel('UploadSession');
    $upload =  $model->create();
    $upload->file_type = 'wholesaler';
    $upload->save();

    $request = $app['request'];

    if ($request->getMethod() == 'POST') {
        $fuels = $app['paris']->getModel('Fuel')->find_many();
        $acols = array();
        foreach($fuels as $f) {
            $col = ORM::for_table('fuel')->raw_query("SHOW COLUMNS IN wholesaler where Field='".$f->code."'")->find_array();
            if (!$col) {
                $acols[] = "ADD column ".$f->code." TINYINT";
            }
        }
        if (count($acols) > 0) {
            //echo "ALTER TABLE station ".implode(",", $acols).";";
            //exit;
            ORM::get_db()->exec("ALTER TABLE wholesaler ".implode(",", $acols).";");
        }
        ORM::get_db()->beginTransaction();
        ORM::get_db()->exec("TRUNCATE TABLE wholesaler;");
        try {
            $file = $request->files->get("wholesalers");
            $path = __DIR__.'/../../upload/';
            $filename = $upload->id . "-wholesaler.xls";
            $file->move($path,$filename);
            require_once __DIR__.'/../../vendor/php-excel-reader/excel_reader2.php';
            $data = new Spreadsheet_Excel_Reader($path.$filename);//, true, "windows-1251");
            $fields = array();
            $list = array();
            $wholesaler_added = 0;
            $wholesaler_modified = 0;
            $regions = array();


            for ($row=2; $row <= $data->rowcount(); $row++) {
                $cols = array();
                $cols["addr"] = $data->val($row, 'D');
                if (!$cols["addr"]) continue;
                $cols["brand"] = $data->val($row, 'C');
                $cols["phone"] = $data->val($row, 'E');
                $cols["lat"] = $data->val($row, 'F');
                $cols["lon"] = $data->val($row, 'G');

                //add areas and regions
                $region = $data->val($row, 'B');

                $region_rec = $app['paris']->getModel('Region')->where('name', $region)->find_one();
                if (!$region_rec) {
                    $app->abort(500,"Неизвестная область - $region - проверьте данные и залейте файл заново!");
                }
                $cols["region_id"] = $region_rec->id;


                for ($col=8; $col <= $data->colcount(); $col++) {
                    $fname = $data->val(1, $col);
                    if (!$fname) {
                        continue;
                    }
                    $fprice = $data->val($row, $col);
                    $fuel_rec = $app['paris']->getModel('Fuel')->where("name", $fname)->find_one();
                    if (!$fuel_rec) {
                        $app->abort(500, "Неизвестное горючее - $fname - проверьте таблицу типов горючего!");
                    }
                    if ($fprice == "+") {
                        $cols[$fuel_rec->code] =  1;
                    } else {
                        $cols[$fuel_rec->code] =  null;
                    }
                }

                $wholesaler_rec = $app['paris']->getModel('Wholesaler')->create();
                $wholesaler_rec->set($cols);
                //$wholesaler_rec->updated_at = date('Y-m-d H:i:s');
                //$wholesaler_rec->created_at = date('Y-m-d H:i:s');
                $wholesaler_added++;
                $wholesaler_rec->save();
            }
            ORM::get_db()->commit();
        } catch (Exception $e) {
            ORM::get_db()->rollBack();
            $app->abort(500, $e->getMessage());
        }
    }

    $upload = $model->find_one($upload->id);
    return new Response(json_encode(array("added"=>$wholesaler_added, "modified"=>$wholesaler_modified)), 200, array('Content-Type' => 'application/json'));
});



?>