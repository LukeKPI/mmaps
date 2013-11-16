<?php



//Model Area
class Area extends Model {
    public static $_table = 'area';
    public static $_id_column = 'id';

    public function region() {
        return $this->has_one('Region');
    }

    public function stations() {
        return $this->has_many('Station');
    }
    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model CardSeller
class CardSeller extends Model {
    public static $_table = 'card_seller';
    public static $_id_column = 'id';

    public function region() {
        return $this->has_one('Region');
    }

    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model Fuel
class Fuel extends Model {
    public static $_table = 'fuel';
    public static $_id_column = 'id';


    public function validate() {
        //if (preg_match("/#[\d[ABCDF]]{6}/", $this->color )) {
            //throw new Exception(json_encode(array("color" => "Цвет должен быть в формате #RRGGBB")), 444);
        //}
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model Region
class Region extends Model {
    public static $_table = 'region';
    public static $_id_column = 'id';


    public function areas() {
        return $this->has_many('Area');
    }
    public function card_sellers() {
        return $this->has_many('CardSeller');
    }
    public function wholesalers() {
        return $this->has_many('Wholesaler');
    }
    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model Service
class Service extends Model {
    public static $_table = 'service';
    public static $_id_column = 'id';


    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model Station
class Station extends Model {
    public static $_table = 'station';
    public static $_id_column = 'id';

    public function area() {
        return $this->has_one('Area');
    }

    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model UploadSession
class UploadSession extends Model {
    public static $_table = 'upload_session';
    public static $_id_column = 'id';


    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model User
class User extends Model {
    public static $_table = 'user';
    public static $_id_column = 'id';


    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}


//Model Wholesaler
class Wholesaler extends Model {
    public static $_table = 'wholesaler';
    public static $_id_column = 'id';

    public function region() {
        return $this->has_one('Region');
    }

    public function validate() {
        //throw new Exception("Invalid columns", 444);
        return true;
    }
    public function save() {
        if (!$this->validate()) {
            return false;
        }
        return parent::save();
    }
}

//Model Status
class Status extends Model {
    public static $_table = 'status';
    public static $_id_column = 'id';

}

?>