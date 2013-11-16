/*
 Navicat Premium Data Transfer

 Source Server         : Avias
 Source Server Type    : SQLite
 Source Server Version : 3007006
 Source Database       : main

 Target Server Type    : SQLite
 Target Server Version : 3007006
 File Encoding         : utf-8

 Date: 12/18/2012 16:17:50 PM
*/

PRAGMA foreign_keys = false;

-- ----------------------------
--  Table structure for "area"
-- ----------------------------
DROP TABLE IF EXISTS "area";
CREATE TABLE area (id INTEGER PRIMARY KEY, region_id INTEGER, name TEXT, lat_center REAL, long_center REAL);

-- ----------------------------
--  Table structure for "card_seller"
-- ----------------------------
DROP TABLE IF EXISTS "card_seller";
CREATE TABLE card_seller (id INTEGER PRIMARY KEY, region_id INTEGER, addr TEXT, phone TEXT, gas_cards INTEGER, scratch_cards INTEGER, card_seller_lat REAL, card_seller_long REAL);

-- ----------------------------
--  Table structure for "fuel"
-- ----------------------------
DROP TABLE IF EXISTS "fuel";
CREATE TABLE fuel (id TEXT PRIMARY KEY, name TEXT, sort_order INTEGER, color TEXT);

-- ----------------------------
--  Table structure for "region"
-- ----------------------------
DROP TABLE IF EXISTS "region";
CREATE TABLE region (id INTEGER PRIMARY KEY, name TEXT, lat_center REAL, long_center REAL, a95e REAL DEFAULT 0, a95 REAL DEFAULT 0, a92 REAL DEFAULT 0, a80 REAL DEFAULT 0, dt REAL DEFAULT 0, dte REAL DEFAULT 0, gas REAL DEFAULT 0);

-- ----------------------------
--  Table structure for "service"
-- ----------------------------
DROP TABLE IF EXISTS "service";
CREATE TABLE service (id INTEGER PRIMARY KEY, name TEXT);

-- ----------------------------
--  Table structure for "station"
-- ----------------------------
DROP TABLE IF EXISTS "station";
CREATE TABLE station (id INTEGER PRIMARY KEY, area_id INTEGER, services TEXT, addr TEXT, brand TEXT, station_lat REAL, station_long REAL, a95e REAL DEFAULT 0, a95 REAL DEFAULT 0, a92 REAL DEFAULT 0, a80 REAL DEFAULT 0, dt REAL DEFAULT 0, dte REAL DEFAULT 0, gas REAL DEFAULT 0);

-- ----------------------------
--  Table structure for "wholesaler"
-- ----------------------------
DROP TABLE IF EXISTS "wholesaler";
CREATE TABLE wholesaler (id INTEGER PRIMARY KEY, region_id INTEGER, brand TEXT, addr TEXT, phone TEXT, wholesaler_lat REAL, wholesaler_long REAL);

PRAGMA foreign_keys = true;
