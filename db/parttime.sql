-- --------------------------------------------------------
-- ホスト:                          192.168.1.51
-- サーバーのバージョン:                   5.6.49 - MySQL Community Server (GPL)
-- サーバー OS:                      Win64
-- HeidiSQL バージョン:               11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- parttime のデータベース構造をダンプしています
CREATE DATABASE IF NOT EXISTS `parttime` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `parttime`;

--  テーブル parttime.memos の構造をダンプしています
CREATE TABLE IF NOT EXISTS `memos` (
  `yyyymm` char(6) NOT NULL,
  `id_users` char(10) NOT NULL,
  `memo` varchar(1000) DEFAULT NULL,
  `ymd_add` char(8) DEFAULT NULL,
  `id_add` varchar(50) DEFAULT NULL,
  `ymd_upd` char(8) DEFAULT NULL,
  `id_upd` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`yyyymm`,`id_users`),
  KEY `FK_memo_users` (`id_users`),
  CONSTRAINT `FK_memo_users` FOREIGN KEY (`id_users`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--  テーブル parttime.users の構造をダンプしています
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `ymd_add` char(8) NOT NULL DEFAULT '',
  `id_add` varchar(10) NOT NULL,
  `ymd_upd` char(8) NOT NULL DEFAULT '',
  `id_upd` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--  テーブル parttime.yms の構造をダンプしています
CREATE TABLE IF NOT EXISTS `yms` (
  `yyyymm` char(6) NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  `ymd_add` char(8) DEFAULT NULL,
  `id_add` varchar(10) DEFAULT NULL,
  `ymd_upd` char(8) DEFAULT NULL,
  `id_upd` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`yyyymm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--  テーブル parttime.yyyymmdds の構造をダンプしています
CREATE TABLE IF NOT EXISTS `yyyymmdds` (
  `id_users` varchar(10) NOT NULL,
  `yyyymm` char(6) DEFAULT NULL,
  `yyyymmdd` char(8) NOT NULL,
  `kubun` varchar(10) DEFAULT NULL,
  `ymd_add` char(8) DEFAULT NULL,
  `id_add` varchar(10) DEFAULT NULL,
  `ymd_upd` char(8) DEFAULT NULL,
  `id_upd` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_users`,`yyyymmdd`),
  KEY `FK_yyyymmdds_yms` (`yyyymm`),
  CONSTRAINT `FK_yyyymmdds_yms` FOREIGN KEY (`yyyymm`) REFERENCES `yms` (`yyyymm`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
