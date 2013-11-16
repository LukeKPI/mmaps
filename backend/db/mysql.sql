DROP INDEX `area_id_idx` ON `station`;

ALTER TABLE `area`DROP PRIMARY KEY;
ALTER TABLE `card_seller`DROP PRIMARY KEY;
ALTER TABLE `fuel`DROP PRIMARY KEY;
ALTER TABLE `region`DROP PRIMARY KEY;
ALTER TABLE `service`DROP PRIMARY KEY;
ALTER TABLE `station`DROP PRIMARY KEY;
ALTER TABLE `wholesaler`DROP PRIMARY KEY;

DROP TABLE `area`;
DROP TABLE `card_seller`;
DROP TABLE `fuel`;
DROP TABLE `region`;
DROP TABLE `service`;
DROP TABLE `station`;
DROP TABLE `wholesaler`;

CREATE TABLE `area` (
`id` int NOT NULL,
`region_id` int NOT NULL,
`name` text NULL,
`lat_center` double NULL,
`long_center` double NULL,
PRIMARY KEY (`id`) 
);

CREATE TABLE `card_seller` (
`id` int NOT NULL,
`region_id` int NOT NULL,
`addr` text NULL,
`phone` text NULL,
`gas_cards` int NULL,
`scratch_cards` int NULL,
`card_seller_lat` double NULL,
`card_seller_long` double NULL,
PRIMARY KEY (`id`) 
);

CREATE TABLE `fuel` (
`id` longtext NOT NULL,
`name` longtext NOT NULL,
`sort_order` int NULL,
`color` longtext NULL,
PRIMARY KEY (`id`) 
);

CREATE TABLE `region` (
`id` int NOT NULL,
`name` text NULL,
`lat_center` double NULL,
`long_center` double NULL,
`a95e` double NULL DEFAULT 0,
`a95` double NULL DEFAULT 0,
`a92` double NULL DEFAULT 0,
`a80` double NULL DEFAULT 0,
`dt` double NULL DEFAULT 0,
`dte` double NULL DEFAULT 0,
`gas` double NULL DEFAULT 0,
PRIMARY KEY (`id`) 
);

CREATE TABLE `service` (
`id` int NOT NULL,
`name` longtext NULL,
PRIMARY KEY (`id`) 
);

CREATE TABLE `station` (
`id` int NOT NULL,
`area_id` int NULL,
`services` text NULL,
`addr` text NULL,
`brand` text NULL,
`station_lat` double NULL,
`station_long` double NULL,
`a95e` double NULL DEFAULT 0,
`a95` double NULL DEFAULT 0,
`a92` double NULL DEFAULT 0,
`a80` double NULL DEFAULT 0,
`dt` double NULL DEFAULT 0,
`dte` double NULL DEFAULT 0,
`gas` double NULL DEFAULT 0,
PRIMARY KEY (`id`) ,
INDEX `area_id_idx` (`area_id`)
)
DEFAULT CHARACTER SET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `wholesaler` (
`id` int NOT NULL,
`region_id` int NULL,
`brand` text NULL,
`addr` text NULL,
`phone` text NULL,
`wholesaler_lat` double NULL,
`wholesaler_long` double NULL,
`a95e` double NULL DEFAULT 0,
`a95` double NULL DEFAULT 0,
`a92` double NULL DEFAULT 0,
`a80` double NULL DEFAULT 0,
`dt` double NULL DEFAULT 0,
`dte` double NULL DEFAULT 0,
`gas` double NULL DEFAULT 0,
PRIMARY KEY (`id`) 
);

