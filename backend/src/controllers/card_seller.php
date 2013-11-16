<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/card_sellers', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('CardSeller');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $card_sellers =  $query->find_array();

    return new Response(json_encode($card_sellers), 200, array('Content-Type' => 'application/json'));
});

$app->get('/card_sellers/{id}', function ($id) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/card_sellers', function (Request $request) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->create();
    $data = $request->request->all();
    $card_seller->set($data);

    if (!$card_seller->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/card_sellers/{id}', function ($id, Request $request) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }
    $card_seller->set($request->request->all());
    $card_seller->save();

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/card_sellers/{id}', function ($id) use ($app) {
    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }
    $card_seller->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});


$app->post('/card_sellers/upload', function () use ($app) {
    $model = $app['paris']->getModel('UploadSession');
    $upload =  $model->create();
    $upload->file_type = 'card_seller';
    $upload->save();

    $request = $app['request'];

    if ($request->getMethod() == 'POST') {
        try {

            ORM::get_db()->beginTransaction();
            ORM::get_db()->exec("TRUNCATE TABLE card_seller;");
            //remove all
            //$app['paris']->getModel('CardSeller')->delete_many();

            $file = $request->files->get("card_sellers");
            $path = __DIR__.'/../../upload/';
            $filename = $upload->id . "-card_seller.xls";
            $file->move($path,$filename);
            require_once __DIR__.'/../../vendor/php-excel-reader/excel_reader2.php';
            $data = new Spreadsheet_Excel_Reader($path.$filename);//, true, "windows-1251");
            $fields = array();
            $list = array();
            $card_seller_added = 0;
            $card_seller_modified = 0;
            $regions = array();


            for ($row=2; $row <= $data->rowcount(); $row++) {
                $cols = array();
                $cols["addr"] = $data->val($row, 'C');
                $cols["phone"] = $data->val($row, 'D');
                $cols["lat"] = $data->val($row, 'E');
                $cols["lon"] = $data->val($row, 'F');
                $region = $data->val($row, 'B');

                $region_rec = $app['paris']->getModel('Region')->where('name', $region)->find_one();
                if (!$region_rec) {
                    $app->abort(500,"Неизвестная область - $region - проверьте данные и залейте файл заново!");
                }

                $cols["region_id"] = $region_rec->id;
                $card_seller_rec = $app['paris']->getModel('CardSeller')->create();
                $card_seller_rec->set($cols);
                //$card_seller_rec->updated_at = date('Y-m-d H:i:s');
                //$card_seller_rec->created_at = date('Y-m-d H:i:s');
                $card_seller_added++;
                $card_seller_rec->save();
            }
            ORM::get_db()->commit();
        } catch (Exception $e) {
            ORM::get_db()->rollBack();
            $app->abort(500, $e->getMessage());
        }
    }

    $upload = $model->find_one($upload->id);
    return new Response(json_encode(array("added"=>$card_seller_added, "modified"=>$card_seller_modified)), 200, array('Content-Type' => 'application/json'));
});



?>