<?php

<% for (var table in tables) { %>
<% var t = tables[table] %>
//Model <%= grunt.util._.classify(table) %>
class <%= grunt.util._.classify(table) %> extends Model {
    public static $_table = '<%=table%>';
    public static $_id_column = 'id';
<% for (var i in t.belongs) { %>
    public function <%= t.belongs[i] %>() {
        return $this->has_one('<%= grunt.util._.classify(t.belongs[i]) %>');
    }<%}%>
<% for (var m in t.has_many) { %>
    public function <%= t.has_many[m] %>s() {
        return $this->has_many('<%= grunt.util._.classify(t.has_many[m]) %>');
    }<%}%>
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
<% } %>

?>