DROP TABLE "area";
DROP TABLE "card_seller";
DROP TABLE "fuel";
DROP TABLE "region";
DROP TABLE "service";
DROP TABLE "station";
DROP TABLE "wholesaler";

CREATE TABLE "area" (
"id" INTEGER,
"region_id" INTEGER,
"name" TEXT,
"lat_center" REAL,
"long_center" REAL,
PRIMARY KEY ("id") 
);

CREATE TABLE "card_seller" (
"id" INTEGER,
"region_id" INTEGER,
"addr" TEXT,
"phone" TEXT,
"gas_cards" INTEGER,
"scratch_cards" INTEGER,
"card_seller_lat" REAL,
"card_seller_long" REAL,
PRIMARY KEY ("id") 
);

CREATE TABLE "fuel" (
"id" TEXT,
"name" TEXT,
"sort_order" INTEGER,
"color" TEXT,
PRIMARY KEY ("id") 
);

CREATE TABLE "region" (
"id" INTEGER,
"name" TEXT,
"lat_center" REAL,
"long_center" REAL,
"a95e" REAL DEFAULT 0,
"a95" REAL DEFAULT 0,
"a92" REAL DEFAULT 0,
"a80" REAL DEFAULT 0,
"dt" REAL DEFAULT 0,
"dte" REAL DEFAULT 0,
"gas" REAL DEFAULT 0,
PRIMARY KEY ("id") 
);

CREATE TABLE "service" (
"id" INTEGER,
"name" TEXT,
PRIMARY KEY ("id") 
);

CREATE TABLE "station" (
"id" INTEGER,
"area_id" INTEGER,
"services" TEXT,
"addr" TEXT,
"brand" TEXT,
"station_lat" REAL,
"station_long" REAL,
"a95e" REAL DEFAULT 0,
"a95" REAL DEFAULT 0,
"a92" REAL DEFAULT 0,
"a80" REAL DEFAULT 0,
"dt" REAL DEFAULT 0,
"dte" REAL DEFAULT 0,
"gas" REAL DEFAULT 0,
PRIMARY KEY ("id") 
);

CREATE TABLE "wholesaler" (
"id" INTEGER,
"region_id" INTEGER,
"brand" TEXT,
"addr" TEXT,
"phone" TEXT,
"wholesaler_lat" REAL,
"wholesaler_long" REAL,
"a95e" REAL DEFAULT 0,
"a95" REAL DEFAULT 0,
"a92" REAL DEFAULT 0,
"a80" REAL DEFAULT 0,
"dt" REAL DEFAULT 0,
"dte" REAL DEFAULT 0,
"gas" REAL DEFAULT 0,
PRIMARY KEY ("id") 
);

