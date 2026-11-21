CREATE DATABASE  IF NOT EXISTS `credifit` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `credifit`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: credifit
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admission_cycles`
--

DROP TABLE IF EXISTS `admission_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_cycles` (
  `cycle_id` bigint NOT NULL AUTO_INCREMENT,
  `cycle_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `cycle_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cycle_id`),
  CONSTRAINT `admission_cycles_chk_1` CHECK ((`cycle_status` in (_utf8mb4'DRAFT',_utf8mb4'ACTIVE',_utf8mb4'CLOSED'))),
  CONSTRAINT `admission_cycles_chk_2` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_cycles`
--

LOCK TABLES `admission_cycles` WRITE;
/*!40000 ALTER TABLE `admission_cycles` DISABLE KEYS */;
INSERT INTO `admission_cycles` VALUES (1,'CrediFit Admission Cycle 2026-2027','2026-2027','2026-06-01','2027-03-31','ACTIVE','2026-11-09 18:25:35');
/*!40000 ALTER TABLE `admission_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applicant_profiles`
--

DROP TABLE IF EXISTS `applicant_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applicant_profiles` (
  `applicant_profile_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT 'Indian',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`applicant_profile_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `applicant_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applicant_profiles`
--

LOCK TABLES `applicant_profiles` WRITE;
/*!40000 ALTER TABLE `applicant_profiles` DISABLE KEYS */;
INSERT INTO `applicant_profiles` VALUES (1,1,'2005-12-31','Male','House No. 1, Main Road','Dharwad','Karnataka','580001','Indian','2026-11-09 18:31:53'),(2,2,'2005-12-30','Female','House No. 2, Main Road','Belagavi','Karnataka','580002','Indian','2026-11-09 18:31:53'),(3,3,'2005-12-29','Male','House No. 3, Main Road','Hubballi','Karnataka','580003','Indian','2026-11-09 18:31:53'),(4,4,'2005-12-28','Female','House No. 4, Main Road','Dharwad','Karnataka','580004','Indian','2026-11-09 18:31:53'),(5,5,'2005-12-27','Male','House No. 5, Main Road','Belagavi','Karnataka','580005','Indian','2026-11-09 18:31:53'),(6,6,'2005-12-26','Female','House No. 6, Main Road','Hubballi','Karnataka','580006','Indian','2026-11-09 18:31:53'),(7,7,'2005-12-25','Male','House No. 7, Main Road','Dharwad','Karnataka','580007','Indian','2026-11-09 18:31:53'),(8,8,'2005-12-24','Female','House No. 8, Main Road','Belagavi','Karnataka','580008','Indian','2026-11-09 18:31:53'),(9,9,'2005-12-23','Male','House No. 9, Main Road','Hubballi','Karnataka','580009','Indian','2026-11-09 18:31:53'),(10,10,'2005-12-22','Female','House No. 10, Main Road','Dharwad','Karnataka','580010','Indian','2026-11-09 18:31:53'),(11,11,'2005-12-21','Male','House No. 11, Main Road','Belagavi','Karnataka','580011','Indian','2026-11-09 18:31:53'),(12,12,'2005-12-20','Female','House No. 12, Main Road','Hubballi','Karnataka','580012','Indian','2026-11-09 18:31:53'),(13,13,'2005-12-19','Male','House No. 13, Main Road','Dharwad','Karnataka','580013','Indian','2026-11-09 18:31:53'),(14,14,'2005-12-18','Female','House No. 14, Main Road','Belagavi','Karnataka','580014','Indian','2026-11-09 18:31:53'),(15,15,'2005-12-17','Male','House No. 15, Main Road','Hubballi','Karnataka','580015','Indian','2026-11-09 18:31:53'),(16,16,'2005-12-16','Female','House No. 16, Main Road','Dharwad','Karnataka','580016','Indian','2026-11-09 18:31:53'),(17,17,'2005-12-15','Male','House No. 17, Main Road','Belagavi','Karnataka','580017','Indian','2026-11-09 18:31:53'),(18,18,'2005-12-14','Female','House No. 18, Main Road','Hubballi','Karnataka','580018','Indian','2026-11-09 18:31:53'),(19,19,'2005-12-13','Male','House No. 19, Main Road','Dharwad','Karnataka','580019','Indian','2026-11-09 18:31:53'),(20,20,'2005-12-12','Female','House No. 20, Main Road','Belagavi','Karnataka','580020','Indian','2026-11-09 18:31:53'),(21,21,'2005-12-11','Male','House No. 21, Main Road','Hubballi','Karnataka','580021','Indian','2026-11-09 18:31:53'),(22,22,'2005-12-10','Female','House No. 22, Main Road','Dharwad','Karnataka','580022','Indian','2026-11-09 18:31:53'),(23,23,'2005-12-09','Male','House No. 23, Main Road','Belagavi','Karnataka','580023','Indian','2026-11-09 18:31:53'),(24,24,'2005-12-08','Female','House No. 24, Main Road','Hubballi','Karnataka','580024','Indian','2026-11-09 18:31:53'),(25,25,'2005-12-07','Male','House No. 25, Main Road','Dharwad','Karnataka','580025','Indian','2026-11-09 18:31:53'),(26,26,'2005-12-06','Female','House No. 26, Main Road','Belagavi','Karnataka','580026','Indian','2026-11-09 18:31:53'),(27,27,'2005-12-05','Male','House No. 27, Main Road','Hubballi','Karnataka','580027','Indian','2026-11-09 18:31:53'),(28,28,'2005-12-04','Female','House No. 28, Main Road','Dharwad','Karnataka','580028','Indian','2026-11-09 18:31:53'),(29,29,'2005-12-03','Male','House No. 29, Main Road','Belagavi','Karnataka','580029','Indian','2026-11-09 18:31:53'),(30,30,'2005-12-02','Female','House No. 30, Main Road','Hubballi','Karnataka','580030','Indian','2026-11-09 18:31:53'),(31,31,'2005-12-01','Male','House No. 31, Main Road','Dharwad','Karnataka','580031','Indian','2026-11-09 18:31:53'),(32,32,'2005-11-30','Female','House No. 32, Main Road','Belagavi','Karnataka','580032','Indian','2026-11-09 18:31:53'),(33,33,'2005-11-29','Male','House No. 33, Main Road','Hubballi','Karnataka','580033','Indian','2026-11-09 18:31:53'),(34,34,'2005-11-28','Female','House No. 34, Main Road','Dharwad','Karnataka','580034','Indian','2026-11-09 18:31:53'),(35,35,'2005-11-27','Male','House No. 35, Main Road','Belagavi','Karnataka','580035','Indian','2026-11-09 18:31:53'),(36,36,'2005-11-26','Female','House No. 36, Main Road','Hubballi','Karnataka','580036','Indian','2026-11-09 18:31:53'),(37,37,'2005-11-25','Male','House No. 37, Main Road','Dharwad','Karnataka','580037','Indian','2026-11-09 18:31:53'),(38,38,'2005-11-24','Female','House No. 38, Main Road','Belagavi','Karnataka','580038','Indian','2026-11-09 18:31:53'),(39,39,'2005-11-23','Male','House No. 39, Main Road','Hubballi','Karnataka','580039','Indian','2026-11-09 18:31:53'),(40,40,'2005-11-22','Female','House No. 40, Main Road','Dharwad','Karnataka','580040','Indian','2026-11-09 18:31:53'),(41,41,'2005-11-21','Male','House No. 41, Main Road','Belagavi','Karnataka','580041','Indian','2026-11-09 18:31:53'),(42,42,'2005-11-20','Female','House No. 42, Main Road','Hubballi','Karnataka','580042','Indian','2026-11-09 18:31:53'),(43,43,'2005-11-19','Male','House No. 43, Main Road','Dharwad','Karnataka','580043','Indian','2026-11-09 18:31:53'),(44,44,'2005-11-18','Female','House No. 44, Main Road','Belagavi','Karnataka','580044','Indian','2026-11-09 18:31:53'),(45,45,'2005-11-17','Male','House No. 45, Main Road','Hubballi','Karnataka','580045','Indian','2026-11-09 18:31:53'),(46,46,'2005-11-16','Female','House No. 46, Main Road','Dharwad','Karnataka','580046','Indian','2026-11-09 18:31:53'),(47,47,'2005-11-15','Male','House No. 47, Main Road','Belagavi','Karnataka','580047','Indian','2026-11-09 18:31:53'),(48,48,'2005-11-14','Female','House No. 48, Main Road','Hubballi','Karnataka','580048','Indian','2026-11-09 18:31:53'),(49,49,'2005-11-13','Male','House No. 49, Main Road','Dharwad','Karnataka','580049','Indian','2026-11-09 18:31:53'),(50,50,'2005-11-12','Female','House No. 50, Main Road','Belagavi','Karnataka','580050','Indian','2026-11-09 18:31:53'),(51,51,'2005-11-11','Male','House No. 51, Main Road','Hubballi','Karnataka','580051','Indian','2026-11-09 18:31:53'),(52,52,'2005-11-10','Female','House No. 52, Main Road','Dharwad','Karnataka','580052','Indian','2026-11-09 18:31:53'),(53,53,'2005-11-09','Male','House No. 53, Main Road','Belagavi','Karnataka','580053','Indian','2026-11-09 18:31:53'),(54,54,'2005-11-08','Female','House No. 54, Main Road','Hubballi','Karnataka','580054','Indian','2026-11-09 18:31:53'),(55,55,'2005-11-07','Male','House No. 55, Main Road','Dharwad','Karnataka','580055','Indian','2026-11-09 18:31:53'),(56,56,'2005-11-06','Female','House No. 56, Main Road','Belagavi','Karnataka','580056','Indian','2026-11-09 18:31:53'),(57,57,'2005-11-05','Male','House No. 57, Main Road','Hubballi','Karnataka','580057','Indian','2026-11-09 18:31:53'),(58,58,'2005-11-04','Female','House No. 58, Main Road','Dharwad','Karnataka','580058','Indian','2026-11-09 18:31:53'),(59,59,'2005-11-03','Male','House No. 59, Main Road','Belagavi','Karnataka','580059','Indian','2026-11-09 18:31:53'),(60,60,'2005-11-02','Female','House No. 60, Main Road','Hubballi','Karnataka','580060','Indian','2026-11-09 18:31:53'),(61,61,'2005-11-01','Male','House No. 61, Main Road','Dharwad','Karnataka','580061','Indian','2026-11-09 18:31:53'),(62,62,'2005-10-31','Female','House No. 62, Main Road','Belagavi','Karnataka','580062','Indian','2026-11-09 18:31:53'),(63,63,'2005-10-30','Male','House No. 63, Main Road','Hubballi','Karnataka','580063','Indian','2026-11-09 18:31:53'),(64,64,'2005-10-29','Female','House No. 64, Main Road','Dharwad','Karnataka','580064','Indian','2026-11-09 18:31:53'),(65,65,'2005-10-28','Male','House No. 65, Main Road','Belagavi','Karnataka','580065','Indian','2026-11-09 18:31:53'),(66,66,'2005-10-27','Female','House No. 66, Main Road','Hubballi','Karnataka','580066','Indian','2026-11-09 18:31:53'),(67,67,'2005-10-26','Male','House No. 67, Main Road','Dharwad','Karnataka','580067','Indian','2026-11-09 18:31:53'),(68,68,'2005-10-25','Female','House No. 68, Main Road','Belagavi','Karnataka','580068','Indian','2026-11-09 18:31:53'),(69,69,'2005-10-24','Male','House No. 69, Main Road','Hubballi','Karnataka','580069','Indian','2026-11-09 18:31:53'),(70,70,'2005-10-23','Female','House No. 70, Main Road','Dharwad','Karnataka','580070','Indian','2026-11-09 18:31:53'),(71,71,'2005-10-22','Male','House No. 71, Main Road','Belagavi','Karnataka','580071','Indian','2026-11-09 18:31:53'),(72,72,'2005-10-21','Female','House No. 72, Main Road','Hubballi','Karnataka','580072','Indian','2026-11-09 18:31:53'),(73,73,'2005-10-20','Male','House No. 73, Main Road','Dharwad','Karnataka','580073','Indian','2026-11-09 18:31:53'),(74,74,'2005-10-19','Female','House No. 74, Main Road','Belagavi','Karnataka','580074','Indian','2026-11-09 18:31:53'),(75,75,'2005-10-18','Male','House No. 75, Main Road','Hubballi','Karnataka','580075','Indian','2026-11-09 18:31:53'),(76,76,'2005-10-17','Female','House No. 76, Main Road','Dharwad','Karnataka','580076','Indian','2026-11-09 18:31:53'),(77,77,'2005-10-16','Male','House No. 77, Main Road','Belagavi','Karnataka','580077','Indian','2026-11-09 18:31:53'),(78,78,'2005-10-15','Female','House No. 78, Main Road','Hubballi','Karnataka','580078','Indian','2026-11-09 18:31:53'),(79,79,'2005-10-14','Male','House No. 79, Main Road','Dharwad','Karnataka','580079','Indian','2026-11-09 18:31:53'),(80,80,'2005-10-13','Female','House No. 80, Main Road','Belagavi','Karnataka','580080','Indian','2026-11-09 18:31:53'),(81,81,'2005-10-12','Male','House No. 81, Main Road','Hubballi','Karnataka','580081','Indian','2026-11-09 18:31:53'),(82,82,'2005-10-11','Female','House No. 82, Main Road','Dharwad','Karnataka','580082','Indian','2026-11-09 18:31:53'),(83,83,'2005-10-10','Male','House No. 83, Main Road','Belagavi','Karnataka','580083','Indian','2026-11-09 18:31:53'),(84,84,'2005-10-09','Female','House No. 84, Main Road','Hubballi','Karnataka','580084','Indian','2026-11-09 18:31:53'),(85,85,'2005-10-08','Male','House No. 85, Main Road','Dharwad','Karnataka','580085','Indian','2026-11-09 18:31:53'),(86,86,'2005-10-07','Female','House No. 86, Main Road','Belagavi','Karnataka','580086','Indian','2026-11-09 18:31:53'),(87,87,'2005-10-06','Male','House No. 87, Main Road','Hubballi','Karnataka','580087','Indian','2026-11-09 18:31:53'),(88,88,'2005-10-05','Female','House No. 88, Main Road','Dharwad','Karnataka','580088','Indian','2026-11-09 18:31:53'),(89,89,'2005-10-04','Male','House No. 89, Main Road','Belagavi','Karnataka','580089','Indian','2026-11-09 18:31:53'),(90,90,'2005-10-03','Female','House No. 90, Main Road','Hubballi','Karnataka','580090','Indian','2026-11-09 18:31:53'),(91,91,'2005-10-02','Male','House No. 91, Main Road','Dharwad','Karnataka','580091','Indian','2026-11-09 18:31:53'),(92,92,'2005-10-01','Female','House No. 92, Main Road','Belagavi','Karnataka','580092','Indian','2026-11-09 18:31:53'),(93,93,'2005-09-30','Male','House No. 93, Main Road','Hubballi','Karnataka','580093','Indian','2026-11-09 18:31:53'),(94,94,'2005-09-29','Female','House No. 94, Main Road','Dharwad','Karnataka','580094','Indian','2026-11-09 18:31:53'),(95,95,'2005-09-28','Male','House No. 95, Main Road','Belagavi','Karnataka','580095','Indian','2026-11-09 18:31:53'),(96,96,'2005-09-27','Female','House No. 96, Main Road','Hubballi','Karnataka','580096','Indian','2026-11-09 18:31:53'),(97,97,'2005-09-26','Male','House No. 97, Main Road','Dharwad','Karnataka','580097','Indian','2026-11-09 18:31:53'),(98,98,'2005-09-25','Female','House No. 98, Main Road','Belagavi','Karnataka','580098','Indian','2026-11-09 18:31:53'),(99,99,'2005-09-24','Male','House No. 99, Main Road','Hubballi','Karnataka','580099','Indian','2026-11-09 18:31:53'),(100,100,'2005-09-23','Female','House No. 100, Main Road','Dharwad','Karnataka','580100','Indian','2026-11-09 18:31:53');
/*!40000 ALTER TABLE `applicant_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_documents` (
  `document_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `document_type_id` int NOT NULL,
  `uploaded_by` bigint NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `upload_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'UPLOADED',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `document_type_id` (`document_type_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_application_documents` (`application_id`),
  CONSTRAINT `application_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `application_documents_ibfk_2` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`document_type_id`),
  CONSTRAINT `application_documents_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_stage_history`
--

DROP TABLE IF EXISTS `application_stage_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_stage_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `stage_id` int NOT NULL,
  `stage_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `application_id` (`application_id`),
  KEY `stage_id` (`stage_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `application_stage_history_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `application_stage_history_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `application_stages` (`stage_id`),
  CONSTRAINT `application_stage_history_ibfk_3` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `application_stage_history_chk_1` CHECK ((`stage_status` in (_utf8mb4'PENDING',_utf8mb4'IN_PROGRESS',_utf8mb4'PASS',_utf8mb4'FAIL')))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_stage_history`
--

LOCK TABLES `application_stage_history` WRITE;
/*!40000 ALTER TABLE `application_stage_history` DISABLE KEYS */;
INSERT INTO `application_stage_history` VALUES (1,1,1,'IN_PROGRESS',1,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(2,2,1,'IN_PROGRESS',2,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(3,3,1,'IN_PROGRESS',3,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(4,4,1,'IN_PROGRESS',4,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(5,5,1,'IN_PROGRESS',5,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(6,6,1,'IN_PROGRESS',6,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(7,7,1,'IN_PROGRESS',7,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(8,8,1,'IN_PROGRESS',8,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(9,9,1,'IN_PROGRESS',9,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(10,10,1,'IN_PROGRESS',10,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(11,11,1,'IN_PROGRESS',11,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(12,12,1,'IN_PROGRESS',12,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(13,13,1,'IN_PROGRESS',13,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(14,14,1,'IN_PROGRESS',14,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(15,15,1,'IN_PROGRESS',15,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(16,16,1,'IN_PROGRESS',16,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(17,17,1,'IN_PROGRESS',17,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(18,18,1,'IN_PROGRESS',18,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(19,19,1,'IN_PROGRESS',19,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(20,20,1,'IN_PROGRESS',20,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(21,21,1,'IN_PROGRESS',21,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(22,22,1,'IN_PROGRESS',22,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(23,23,1,'IN_PROGRESS',23,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(24,24,1,'IN_PROGRESS',24,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(25,25,1,'IN_PROGRESS',25,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(26,26,1,'IN_PROGRESS',26,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(27,27,1,'IN_PROGRESS',27,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(28,28,1,'IN_PROGRESS',28,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(29,29,1,'IN_PROGRESS',29,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(30,30,1,'IN_PROGRESS',30,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(31,31,1,'IN_PROGRESS',31,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(32,32,1,'IN_PROGRESS',32,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(33,33,1,'IN_PROGRESS',33,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(34,34,1,'IN_PROGRESS',34,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(35,35,1,'IN_PROGRESS',35,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(36,36,1,'IN_PROGRESS',36,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(37,37,1,'IN_PROGRESS',37,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(38,38,1,'IN_PROGRESS',38,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(39,39,1,'IN_PROGRESS',39,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(40,40,1,'IN_PROGRESS',40,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(41,41,1,'IN_PROGRESS',41,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(42,42,1,'IN_PROGRESS',42,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(43,43,1,'IN_PROGRESS',43,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(44,44,1,'IN_PROGRESS',44,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(45,45,1,'IN_PROGRESS',45,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(46,46,1,'IN_PROGRESS',46,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(47,47,1,'IN_PROGRESS',47,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(48,48,1,'IN_PROGRESS',48,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(49,49,1,'IN_PROGRESS',49,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(50,50,1,'IN_PROGRESS',50,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(51,51,1,'IN_PROGRESS',51,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(52,52,1,'IN_PROGRESS',52,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(53,53,1,'IN_PROGRESS',53,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(54,54,1,'IN_PROGRESS',54,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(55,55,1,'IN_PROGRESS',55,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(56,56,1,'IN_PROGRESS',56,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(57,57,1,'IN_PROGRESS',57,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(58,58,1,'IN_PROGRESS',58,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(59,59,1,'IN_PROGRESS',59,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(60,60,1,'IN_PROGRESS',60,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(61,61,1,'IN_PROGRESS',61,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(62,62,1,'IN_PROGRESS',62,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(63,63,1,'IN_PROGRESS',63,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(64,64,1,'IN_PROGRESS',64,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(65,65,1,'IN_PROGRESS',65,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(66,66,1,'IN_PROGRESS',66,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(67,67,1,'IN_PROGRESS',67,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(68,68,1,'IN_PROGRESS',68,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(69,69,1,'IN_PROGRESS',69,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(70,70,1,'IN_PROGRESS',70,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(71,71,1,'IN_PROGRESS',71,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(72,72,1,'IN_PROGRESS',72,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(73,73,1,'IN_PROGRESS',73,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(74,74,1,'IN_PROGRESS',74,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(75,75,1,'IN_PROGRESS',75,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(76,76,1,'IN_PROGRESS',76,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(77,77,1,'IN_PROGRESS',77,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(78,78,1,'IN_PROGRESS',78,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(79,79,1,'IN_PROGRESS',79,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(80,80,1,'IN_PROGRESS',80,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(81,81,1,'IN_PROGRESS',81,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(82,82,1,'IN_PROGRESS',82,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(83,83,1,'IN_PROGRESS',83,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(84,84,1,'IN_PROGRESS',84,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(85,85,1,'IN_PROGRESS',85,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(86,86,1,'IN_PROGRESS',86,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(87,87,1,'IN_PROGRESS',87,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(88,88,1,'IN_PROGRESS',88,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(89,89,1,'IN_PROGRESS',89,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(90,90,1,'IN_PROGRESS',90,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(91,91,1,'IN_PROGRESS',91,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(92,92,1,'IN_PROGRESS',92,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(93,93,1,'IN_PROGRESS',93,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(94,94,1,'IN_PROGRESS',94,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(95,95,1,'IN_PROGRESS',95,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(96,96,1,'IN_PROGRESS',96,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(97,97,1,'IN_PROGRESS',97,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(98,98,1,'IN_PROGRESS',98,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(99,99,1,'IN_PROGRESS',99,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16'),(100,100,1,'IN_PROGRESS',100,'Initial application created. Submission is not yet completed.','2026-11-09 18:48:16');
/*!40000 ALTER TABLE `application_stage_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_stages`
--

DROP TABLE IF EXISTS `application_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_stages` (
  `stage_id` int NOT NULL AUTO_INCREMENT,
  `stage_code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage_order` int NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`stage_id`),
  UNIQUE KEY `stage_code` (`stage_code`),
  UNIQUE KEY `stage_order` (`stage_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_stages`
--

LOCK TABLES `application_stages` WRITE;
/*!40000 ALTER TABLE `application_stages` DISABLE KEYS */;
INSERT INTO `application_stages` VALUES (1,'APPLICATION_SUBMISSION','Application Submission',1,'Applicant registration and application submission'),(2,'DOCUMENT_VERIFICATION','Document Verification',2,'Verification of submitted admission documents'),(3,'ELIGIBILITY_SCREENING','Eligibility Screening',3,'Checking academic eligibility requirements'),(4,'DEPARTMENT_REVIEW','Department Review',4,'Evaluation by the assigned department evaluator'),(5,'FINAL_ADMISSION_DECISION','Final Admission Decision',5,'Recording the final admission decision');
/*!40000 ALTER TABLE `application_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `application_id` bigint NOT NULL AUTO_INCREMENT,
  `application_reference` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_user_id` bigint NOT NULL,
  `programme_id` bigint NOT NULL,
  `cycle_id` bigint NOT NULL,
  `current_stage_id` int DEFAULT NULL,
  `qualification` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_statement` text COLLATE utf8mb4_unicode_ci,
  `application_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `application_reference` (`application_reference`),
  KEY `cycle_id` (`cycle_id`),
  KEY `current_stage_id` (`current_stage_id`),
  KEY `idx_applicant` (`applicant_user_id`),
  KEY `idx_application_status` (`application_status`),
  KEY `idx_programme_cycle` (`programme_id`,`cycle_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`applicant_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`),
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`cycle_id`) REFERENCES `admission_cycles` (`cycle_id`),
  CONSTRAINT `applications_ibfk_4` FOREIGN KEY (`current_stage_id`) REFERENCES `application_stages` (`stage_id`),
  CONSTRAINT `applications_chk_1` CHECK ((`application_status` in (_utf8mb4'DRAFT',_utf8mb4'SUBMITTED',_utf8mb4'UNDER_REVIEW',_utf8mb4'CLARIFICATION_REQUIRED',_utf8mb4'COMPLETED',_utf8mb4'WITHDRAWN')))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,'CF-2026-0001',1,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(2,'CF-2026-0002',2,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(3,'CF-2026-0003',3,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(4,'CF-2026-0004',4,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(5,'CF-2026-0005',5,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(6,'CF-2026-0006',6,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(7,'CF-2026-0007',7,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(8,'CF-2026-0008',8,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(9,'CF-2026-0009',9,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(10,'CF-2026-0010',10,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(11,'CF-2026-0011',11,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(12,'CF-2026-0012',12,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(13,'CF-2026-0013',13,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(14,'CF-2026-0014',14,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(15,'CF-2026-0015',15,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(16,'CF-2026-0016',16,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(17,'CF-2026-0017',17,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(18,'CF-2026-0018',18,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(19,'CF-2026-0019',19,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(20,'CF-2026-0020',20,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(21,'CF-2026-0021',21,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(22,'CF-2026-0022',22,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(23,'CF-2026-0023',23,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(24,'CF-2026-0024',24,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(25,'CF-2026-0025',25,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(26,'CF-2026-0026',26,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(27,'CF-2026-0027',27,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(28,'CF-2026-0028',28,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(29,'CF-2026-0029',29,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(30,'CF-2026-0030',30,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(31,'CF-2026-0031',31,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(32,'CF-2026-0032',32,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(33,'CF-2026-0033',33,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(34,'CF-2026-0034',34,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(35,'CF-2026-0035',35,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(36,'CF-2026-0036',36,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(37,'CF-2026-0037',37,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(38,'CF-2026-0038',38,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(39,'CF-2026-0039',39,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(40,'CF-2026-0040',40,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(41,'CF-2026-0041',41,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(42,'CF-2026-0042',42,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(43,'CF-2026-0043',43,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(44,'CF-2026-0044',44,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(45,'CF-2026-0045',45,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(46,'CF-2026-0046',46,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(47,'CF-2026-0047',47,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(48,'CF-2026-0048',48,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(49,'CF-2026-0049',49,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(50,'CF-2026-0050',50,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(51,'CF-2026-0051',51,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(52,'CF-2026-0052',52,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(53,'CF-2026-0053',53,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(54,'CF-2026-0054',54,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(55,'CF-2026-0055',55,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(56,'CF-2026-0056',56,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(57,'CF-2026-0057',57,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(58,'CF-2026-0058',58,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(59,'CF-2026-0059',59,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(60,'CF-2026-0060',60,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(61,'CF-2026-0061',61,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(62,'CF-2026-0062',62,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(63,'CF-2026-0063',63,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(64,'CF-2026-0064',64,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(65,'CF-2026-0065',65,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(66,'CF-2026-0066',66,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(67,'CF-2026-0067',67,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(68,'CF-2026-0068',68,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(69,'CF-2026-0069',69,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(70,'CF-2026-0070',70,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(71,'CF-2026-0071',71,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(72,'CF-2026-0072',72,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(73,'CF-2026-0073',73,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(74,'CF-2026-0074',74,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(75,'CF-2026-0075',75,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(76,'CF-2026-0076',76,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(77,'CF-2026-0077',77,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(78,'CF-2026-0078',78,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(79,'CF-2026-0079',79,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(80,'CF-2026-0080',80,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(81,'CF-2026-0081',81,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(82,'CF-2026-0082',82,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(83,'CF-2026-0083',83,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(84,'CF-2026-0084',84,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(85,'CF-2026-0085',85,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(86,'CF-2026-0086',86,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(87,'CF-2026-0087',87,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(88,'CF-2026-0088',88,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(89,'CF-2026-0089',89,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(90,'CF-2026-0090',90,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(91,'CF-2026-0091',91,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(92,'CF-2026-0092',92,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(93,'CF-2026-0093',93,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(94,'CF-2026-0094',94,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(95,'CF-2026-0095',95,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(96,'CF-2026-0096',96,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(97,'CF-2026-0097',97,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(98,'CF-2026-0098',98,2,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(99,'CF-2026-0099',99,3,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24'),(100,'CF-2026-0100',100,1,1,1,'12TH',NULL,'DRAFT',NULL,'2026-11-09 18:38:24','2026-11-09 18:38:24');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clarification_requests`
--

DROP TABLE IF EXISTS `clarification_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clarification_requests` (
  `clarification_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `raised_by` bigint NOT NULL,
  `assigned_to` bigint DEFAULT NULL,
  `clarification_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_response` text COLLATE utf8mb4_unicode_ci,
  `clarification_status` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`clarification_id`),
  KEY `application_id` (`application_id`),
  KEY `raised_by` (`raised_by`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `clarification_requests_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `clarification_requests_ibfk_2` FOREIGN KEY (`raised_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `clarification_requests_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`),
  CONSTRAINT `clarification_requests_chk_1` CHECK ((`clarification_status` in (_utf8mb4'OPEN',_utf8mb4'RESPONDED',_utf8mb4'RESOLVED',_utf8mb4'CLOSED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clarification_requests`
--

LOCK TABLES `clarification_requests` WRITE;
/*!40000 ALTER TABLE `clarification_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `clarification_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_review_scores`
--

DROP TABLE IF EXISTS `department_review_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_review_scores` (
  `score_id` bigint NOT NULL AUTO_INCREMENT,
  `department_review_id` bigint NOT NULL,
  `criterion_id` bigint NOT NULL,
  `score` decimal(6,2) NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`score_id`),
  UNIQUE KEY `department_review_id` (`department_review_id`,`criterion_id`),
  KEY `criterion_id` (`criterion_id`),
  CONSTRAINT `department_review_scores_ibfk_1` FOREIGN KEY (`department_review_id`) REFERENCES `department_reviews` (`department_review_id`),
  CONSTRAINT `department_review_scores_ibfk_2` FOREIGN KEY (`criterion_id`) REFERENCES `rubric_criteria` (`criterion_id`),
  CONSTRAINT `department_review_scores_chk_1` CHECK ((`score` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_review_scores`
--

LOCK TABLES `department_review_scores` WRITE;
/*!40000 ALTER TABLE `department_review_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `department_review_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_reviews`
--

DROP TABLE IF EXISTS `department_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_reviews` (
  `department_review_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `evaluator_user_id` bigint NOT NULL,
  `rubric_id` bigint NOT NULL,
  `review_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `recommendation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `conflict_confirmed` tinyint(1) DEFAULT '0',
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_review_id`),
  KEY `application_id` (`application_id`),
  KEY `evaluator_user_id` (`evaluator_user_id`),
  KEY `rubric_id` (`rubric_id`),
  CONSTRAINT `department_reviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `department_reviews_ibfk_2` FOREIGN KEY (`evaluator_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `department_reviews_ibfk_3` FOREIGN KEY (`rubric_id`) REFERENCES `evaluation_rubrics` (`rubric_id`),
  CONSTRAINT `department_reviews_chk_1` CHECK ((`review_status` in (_utf8mb4'DRAFT',_utf8mb4'SUBMITTED'))),
  CONSTRAINT `department_reviews_chk_2` CHECK (((`recommendation` is null) or (`recommendation` in (_utf8mb4'RECOMMEND',_utf8mb4'DO_NOT_RECOMMEND',_utf8mb4'CLARIFICATION_REQUIRED'))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_reviews`
--

LOCK TABLES `department_reviews` WRITE;
/*!40000 ALTER TABLE `department_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `department_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_reviews`
--

DROP TABLE IF EXISTS `document_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_reviews` (
  `review_id` bigint NOT NULL AUTO_INCREMENT,
  `document_id` bigint NOT NULL,
  `reviewer_user_id` bigint NOT NULL,
  `decision` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `document_id` (`document_id`),
  KEY `reviewer_user_id` (`reviewer_user_id`),
  CONSTRAINT `document_reviews_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `application_documents` (`document_id`),
  CONSTRAINT `document_reviews_ibfk_2` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `document_reviews_chk_1` CHECK ((`decision` in (_utf8mb4'VERIFIED',_utf8mb4'CLARIFICATION_REQUESTED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_reviews`
--

LOCK TABLES `document_reviews` WRITE;
/*!40000 ALTER TABLE `document_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_types` (
  `document_type_id` int NOT NULL AUTO_INCREMENT,
  `document_code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`document_type_id`),
  UNIQUE KEY `document_code` (`document_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'SSLC_MARKSHEET','10th Marks Card','Secondary school marksheet',1),(2,'PUC_MARKSHEET','12th Marks Card','Higher secondary marksheet',1),(3,'PASSPORT_PHOTO','Passport Size Photograph','Recent applicant photograph',1),(4,'ID_PROOF','Identity Proof','Government approved identity document',1),(5,'TRANSFER_CERTIFICATE','Transfer Certificate','Transfer certificate from previous institution',1);
/*!40000 ALTER TABLE `document_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education_records`
--

DROP TABLE IF EXISTS `education_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education_records` (
  `education_record_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `qualification` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_of_passing` year NOT NULL,
  `marks_obtained` decimal(10,2) NOT NULL,
  `maximum_marks` decimal(10,2) NOT NULL,
  `percentage` decimal(5,2) GENERATED ALWAYS AS (((`marks_obtained` / nullif(`maximum_marks`,0)) * 100)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`education_record_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `education_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `education_records_chk_1` CHECK ((`maximum_marks` > 0)),
  CONSTRAINT `education_records_chk_2` CHECK (((`marks_obtained` >= 0) and (`marks_obtained` <= `maximum_marks`)))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education_records`
--

LOCK TABLES `education_records` WRITE;
/*!40000 ALTER TABLE `education_records` DISABLE KEYS */;
INSERT INTO `education_records` (`education_record_id`, `user_id`, `qualification`, `institution`, `board`, `year_of_passing`, `marks_obtained`, `maximum_marks`, `created_at`) VALUES (1,1,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2025,307.00,500.00,'2026-11-09 18:32:22'),(2,2,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2026,314.00,500.00,'2026-11-09 18:32:22'),(3,3,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2024,321.00,500.00,'2026-11-09 18:32:22'),(4,4,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2025,328.00,500.00,'2026-11-09 18:32:22'),(5,5,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2026,335.00,500.00,'2026-11-09 18:32:22'),(6,6,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2024,342.00,500.00,'2026-11-09 18:32:22'),(7,7,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2025,349.00,500.00,'2026-11-09 18:32:22'),(8,8,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2026,356.00,500.00,'2026-11-09 18:32:22'),(9,9,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2024,363.00,500.00,'2026-11-09 18:32:22'),(10,10,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2025,370.00,500.00,'2026-11-09 18:32:22'),(11,11,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2026,377.00,500.00,'2026-11-09 18:32:22'),(12,12,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2024,384.00,500.00,'2026-11-09 18:32:22'),(13,13,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2025,391.00,500.00,'2026-11-09 18:32:22'),(14,14,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2026,398.00,500.00,'2026-11-09 18:32:22'),(15,15,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2024,405.00,500.00,'2026-11-09 18:32:22'),(16,16,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2025,412.00,500.00,'2026-11-09 18:32:22'),(17,17,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2026,419.00,500.00,'2026-11-09 18:32:22'),(18,18,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2024,426.00,500.00,'2026-11-09 18:32:22'),(19,19,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2025,433.00,500.00,'2026-11-09 18:32:22'),(20,20,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2026,440.00,500.00,'2026-11-09 18:32:22'),(21,21,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2024,447.00,500.00,'2026-11-09 18:32:22'),(22,22,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2025,454.00,500.00,'2026-11-09 18:32:22'),(23,23,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2026,461.00,500.00,'2026-11-09 18:32:22'),(24,24,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2024,468.00,500.00,'2026-11-09 18:32:22'),(25,25,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2025,475.00,500.00,'2026-11-09 18:32:22'),(26,26,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2026,482.00,500.00,'2026-11-09 18:32:22'),(27,27,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2024,489.00,500.00,'2026-11-09 18:32:22'),(28,28,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2025,496.00,500.00,'2026-11-09 18:32:22'),(29,29,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2026,302.00,500.00,'2026-11-09 18:32:22'),(30,30,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2024,309.00,500.00,'2026-11-09 18:32:22'),(31,31,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2025,316.00,500.00,'2026-11-09 18:32:22'),(32,32,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2026,323.00,500.00,'2026-11-09 18:32:22'),(33,33,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2024,330.00,500.00,'2026-11-09 18:32:22'),(34,34,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2025,337.00,500.00,'2026-11-09 18:32:22'),(35,35,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2026,344.00,500.00,'2026-11-09 18:32:22'),(36,36,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2024,351.00,500.00,'2026-11-09 18:32:22'),(37,37,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2025,358.00,500.00,'2026-11-09 18:32:22'),(38,38,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2026,365.00,500.00,'2026-11-09 18:32:22'),(39,39,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2024,372.00,500.00,'2026-11-09 18:32:22'),(40,40,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2025,379.00,500.00,'2026-11-09 18:32:22'),(41,41,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2026,386.00,500.00,'2026-11-09 18:32:22'),(42,42,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2024,393.00,500.00,'2026-11-09 18:32:22'),(43,43,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2025,400.00,500.00,'2026-11-09 18:32:22'),(44,44,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2026,407.00,500.00,'2026-11-09 18:32:22'),(45,45,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2024,414.00,500.00,'2026-11-09 18:32:22'),(46,46,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2025,421.00,500.00,'2026-11-09 18:32:22'),(47,47,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2026,428.00,500.00,'2026-11-09 18:32:22'),(48,48,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2024,435.00,500.00,'2026-11-09 18:32:22'),(49,49,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2025,442.00,500.00,'2026-11-09 18:32:22'),(50,50,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2026,449.00,500.00,'2026-11-09 18:32:22'),(51,51,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2024,456.00,500.00,'2026-11-09 18:32:22'),(52,52,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2025,463.00,500.00,'2026-11-09 18:32:22'),(53,53,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2026,470.00,500.00,'2026-11-09 18:32:22'),(54,54,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2024,477.00,500.00,'2026-11-09 18:32:22'),(55,55,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2025,484.00,500.00,'2026-11-09 18:32:22'),(56,56,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2026,491.00,500.00,'2026-11-09 18:32:22'),(57,57,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2024,498.00,500.00,'2026-11-09 18:32:22'),(58,58,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2025,304.00,500.00,'2026-11-09 18:32:22'),(59,59,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2026,311.00,500.00,'2026-11-09 18:32:22'),(60,60,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2024,318.00,500.00,'2026-11-09 18:32:22'),(61,61,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2025,325.00,500.00,'2026-11-09 18:32:22'),(62,62,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2026,332.00,500.00,'2026-11-09 18:32:22'),(63,63,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2024,339.00,500.00,'2026-11-09 18:32:22'),(64,64,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2025,346.00,500.00,'2026-11-09 18:32:22'),(65,65,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2026,353.00,500.00,'2026-11-09 18:32:22'),(66,66,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2024,360.00,500.00,'2026-11-09 18:32:22'),(67,67,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2025,367.00,500.00,'2026-11-09 18:32:22'),(68,68,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2026,374.00,500.00,'2026-11-09 18:32:22'),(69,69,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2024,381.00,500.00,'2026-11-09 18:32:22'),(70,70,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2025,388.00,500.00,'2026-11-09 18:32:22'),(71,71,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2026,395.00,500.00,'2026-11-09 18:32:22'),(72,72,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2024,402.00,500.00,'2026-11-09 18:32:22'),(73,73,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2025,409.00,500.00,'2026-11-09 18:32:22'),(74,74,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2026,416.00,500.00,'2026-11-09 18:32:22'),(75,75,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2024,423.00,500.00,'2026-11-09 18:32:22'),(76,76,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2025,430.00,500.00,'2026-11-09 18:32:22'),(77,77,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2026,437.00,500.00,'2026-11-09 18:32:22'),(78,78,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2024,444.00,500.00,'2026-11-09 18:32:22'),(79,79,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2025,451.00,500.00,'2026-11-09 18:32:22'),(80,80,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2026,458.00,500.00,'2026-11-09 18:32:22'),(81,81,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2024,465.00,500.00,'2026-11-09 18:32:22'),(82,82,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2025,472.00,500.00,'2026-11-09 18:32:22'),(83,83,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2026,479.00,500.00,'2026-11-09 18:32:22'),(84,84,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2024,486.00,500.00,'2026-11-09 18:32:22'),(85,85,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2025,493.00,500.00,'2026-11-09 18:32:22'),(86,86,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2026,500.00,500.00,'2026-11-09 18:32:22'),(87,87,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2024,306.00,500.00,'2026-11-09 18:32:22'),(88,88,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2025,313.00,500.00,'2026-11-09 18:32:22'),(89,89,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2026,320.00,500.00,'2026-11-09 18:32:22'),(90,90,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2024,327.00,500.00,'2026-11-09 18:32:22'),(91,91,'12TH','CrediFit Demo College 2','Karnataka Pre-University Board',2025,334.00,500.00,'2026-11-09 18:32:22'),(92,92,'12TH','CrediFit Demo College 3','Karnataka Pre-University Board',2026,341.00,500.00,'2026-11-09 18:32:22'),(93,93,'12TH','CrediFit Demo College 4','Karnataka Pre-University Board',2024,348.00,500.00,'2026-11-09 18:32:22'),(94,94,'12TH','CrediFit Demo College 5','Karnataka Pre-University Board',2025,355.00,500.00,'2026-11-09 18:32:22'),(95,95,'12TH','CrediFit Demo College 6','Karnataka Pre-University Board',2026,362.00,500.00,'2026-11-09 18:32:22'),(96,96,'12TH','CrediFit Demo College 7','Karnataka Pre-University Board',2024,369.00,500.00,'2026-11-09 18:32:22'),(97,97,'12TH','CrediFit Demo College 8','Karnataka Pre-University Board',2025,376.00,500.00,'2026-11-09 18:32:22'),(98,98,'12TH','CrediFit Demo College 9','Karnataka Pre-University Board',2026,383.00,500.00,'2026-11-09 18:32:22'),(99,99,'12TH','CrediFit Demo College 10','Karnataka Pre-University Board',2024,390.00,500.00,'2026-11-09 18:32:22'),(100,100,'12TH','CrediFit Demo College 1','Karnataka Pre-University Board',2025,397.00,500.00,'2026-11-09 18:32:22');
/*!40000 ALTER TABLE `education_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eligibility_evaluation_checks`
--

DROP TABLE IF EXISTS `eligibility_evaluation_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eligibility_evaluation_checks` (
  `check_id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `check_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actual_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`check_id`),
  KEY `evaluation_id` (`evaluation_id`),
  CONSTRAINT `eligibility_evaluation_checks_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `eligibility_evaluations` (`evaluation_id`),
  CONSTRAINT `eligibility_evaluation_checks_chk_1` CHECK ((`check_status` in (_utf8mb4'PASS',_utf8mb4'FAIL',_utf8mb4'PENDING')))
) ENGINE=InnoDB AUTO_INCREMENT=512 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eligibility_evaluation_checks`
--

LOCK TABLES `eligibility_evaluation_checks` WRITE;
/*!40000 ALTER TABLE `eligibility_evaluation_checks` DISABLE KEYS */;
INSERT INTO `eligibility_evaluation_checks` VALUES (1,34,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(2,1,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(3,68,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(4,35,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(5,2,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(6,69,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(7,36,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(8,3,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(9,70,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(10,37,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(11,4,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(12,71,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(13,38,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(14,5,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(15,72,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(16,39,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(17,6,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(18,73,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(19,40,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(20,7,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(21,74,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(22,41,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(23,8,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(24,75,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(25,42,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(26,9,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(27,76,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(28,43,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(29,10,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(30,77,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(31,44,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(32,11,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(33,78,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(34,45,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(35,12,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(36,79,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(37,46,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(38,13,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(39,80,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(40,47,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(41,14,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(42,81,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(43,48,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(44,15,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(45,82,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(46,49,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(47,16,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(48,83,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(49,50,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(50,17,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(51,84,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(52,51,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(53,18,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(54,85,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(55,52,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(56,19,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(57,86,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(58,53,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(59,20,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(60,87,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(61,54,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(62,21,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(63,88,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(64,55,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(65,22,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(66,89,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(67,56,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(68,23,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(69,90,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(70,57,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(71,24,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(72,91,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(73,58,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(74,25,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(75,92,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(76,59,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(77,26,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(78,93,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(79,60,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(80,27,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(81,94,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(82,61,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(83,28,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(84,95,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(85,62,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(86,29,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(87,96,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(88,63,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(89,30,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(90,97,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(91,64,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(92,31,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(93,98,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(94,65,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(95,32,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(96,99,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(97,66,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(98,33,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(99,100,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(100,67,'Application Submission','SUBMITTED','DRAFT','PENDING','Application is still in draft status.'),(101,34,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(102,1,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(103,68,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(104,35,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(105,2,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(106,69,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(107,36,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(108,3,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(109,70,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(110,37,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(111,4,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(112,71,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(113,38,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(114,5,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(115,72,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(116,39,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(117,6,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(118,73,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(119,40,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(120,7,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(121,74,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(122,41,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(123,8,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(124,75,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(125,42,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(126,9,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(127,76,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(128,43,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(129,10,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(130,77,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(131,44,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(132,11,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(133,78,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(134,45,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(135,12,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(136,79,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(137,46,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(138,13,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(139,80,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(140,47,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(141,14,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(142,81,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(143,48,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(144,15,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(145,82,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(146,49,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(147,16,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(148,83,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(149,50,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(150,17,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(151,84,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(152,51,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(153,18,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(154,85,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(155,52,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(156,19,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(157,86,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(158,53,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(159,20,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(160,87,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(161,54,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(162,21,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(163,88,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(164,55,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(165,22,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(166,89,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(167,56,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(168,23,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(169,90,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(170,57,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(171,24,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(172,91,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(173,58,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(174,25,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(175,92,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(176,59,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(177,26,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(178,93,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(179,60,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(180,27,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(181,94,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(182,61,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(183,28,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(184,95,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(185,62,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(186,29,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(187,96,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(188,63,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(189,30,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(190,97,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(191,64,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(192,31,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(193,98,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(194,65,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(195,32,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(196,99,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(197,66,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(198,33,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(199,100,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(200,67,'Document Verification','All mandatory documents verified','No verified documents recorded','PENDING','Actual document uploads and verification are pending.'),(201,1,'Minimum Academic Percentage','Minimum 50.00%','62.80%','PASS','Academic percentage comparison using the configured demo rule.'),(202,2,'Minimum Academic Percentage','Minimum 50.00%','67.00%','PASS','Academic percentage comparison using the configured demo rule.'),(203,3,'Minimum Academic Percentage','Minimum 50.00%','71.20%','PASS','Academic percentage comparison using the configured demo rule.'),(204,4,'Minimum Academic Percentage','Minimum 50.00%','75.40%','PASS','Academic percentage comparison using the configured demo rule.'),(205,5,'Minimum Academic Percentage','Minimum 50.00%','79.60%','PASS','Academic percentage comparison using the configured demo rule.'),(206,6,'Minimum Academic Percentage','Minimum 50.00%','83.80%','PASS','Academic percentage comparison using the configured demo rule.'),(207,7,'Minimum Academic Percentage','Minimum 50.00%','88.00%','PASS','Academic percentage comparison using the configured demo rule.'),(208,8,'Minimum Academic Percentage','Minimum 50.00%','92.20%','PASS','Academic percentage comparison using the configured demo rule.'),(209,9,'Minimum Academic Percentage','Minimum 50.00%','96.40%','PASS','Academic percentage comparison using the configured demo rule.'),(210,10,'Minimum Academic Percentage','Minimum 50.00%','60.40%','PASS','Academic percentage comparison using the configured demo rule.'),(211,11,'Minimum Academic Percentage','Minimum 50.00%','64.60%','PASS','Academic percentage comparison using the configured demo rule.'),(212,12,'Minimum Academic Percentage','Minimum 50.00%','68.80%','PASS','Academic percentage comparison using the configured demo rule.'),(213,13,'Minimum Academic Percentage','Minimum 50.00%','73.00%','PASS','Academic percentage comparison using the configured demo rule.'),(214,14,'Minimum Academic Percentage','Minimum 50.00%','77.20%','PASS','Academic percentage comparison using the configured demo rule.'),(215,15,'Minimum Academic Percentage','Minimum 50.00%','81.40%','PASS','Academic percentage comparison using the configured demo rule.'),(216,16,'Minimum Academic Percentage','Minimum 50.00%','85.60%','PASS','Academic percentage comparison using the configured demo rule.'),(217,17,'Minimum Academic Percentage','Minimum 50.00%','89.80%','PASS','Academic percentage comparison using the configured demo rule.'),(218,18,'Minimum Academic Percentage','Minimum 50.00%','94.00%','PASS','Academic percentage comparison using the configured demo rule.'),(219,19,'Minimum Academic Percentage','Minimum 50.00%','98.20%','PASS','Academic percentage comparison using the configured demo rule.'),(220,20,'Minimum Academic Percentage','Minimum 50.00%','62.20%','PASS','Academic percentage comparison using the configured demo rule.'),(221,21,'Minimum Academic Percentage','Minimum 50.00%','66.40%','PASS','Academic percentage comparison using the configured demo rule.'),(222,22,'Minimum Academic Percentage','Minimum 50.00%','70.60%','PASS','Academic percentage comparison using the configured demo rule.'),(223,23,'Minimum Academic Percentage','Minimum 50.00%','74.80%','PASS','Academic percentage comparison using the configured demo rule.'),(224,24,'Minimum Academic Percentage','Minimum 50.00%','79.00%','PASS','Academic percentage comparison using the configured demo rule.'),(225,25,'Minimum Academic Percentage','Minimum 50.00%','83.20%','PASS','Academic percentage comparison using the configured demo rule.'),(226,26,'Minimum Academic Percentage','Minimum 50.00%','87.40%','PASS','Academic percentage comparison using the configured demo rule.'),(227,27,'Minimum Academic Percentage','Minimum 50.00%','91.60%','PASS','Academic percentage comparison using the configured demo rule.'),(228,28,'Minimum Academic Percentage','Minimum 50.00%','95.80%','PASS','Academic percentage comparison using the configured demo rule.'),(229,29,'Minimum Academic Percentage','Minimum 50.00%','100.00%','PASS','Academic percentage comparison using the configured demo rule.'),(230,30,'Minimum Academic Percentage','Minimum 50.00%','64.00%','PASS','Academic percentage comparison using the configured demo rule.'),(231,31,'Minimum Academic Percentage','Minimum 50.00%','68.20%','PASS','Academic percentage comparison using the configured demo rule.'),(232,32,'Minimum Academic Percentage','Minimum 50.00%','72.40%','PASS','Academic percentage comparison using the configured demo rule.'),(233,33,'Minimum Academic Percentage','Minimum 50.00%','76.60%','PASS','Academic percentage comparison using the configured demo rule.'),(234,34,'Minimum Academic Percentage','Minimum 50.00%','61.40%','PASS','Academic percentage comparison using the configured demo rule.'),(235,35,'Minimum Academic Percentage','Minimum 50.00%','65.60%','PASS','Academic percentage comparison using the configured demo rule.'),(236,36,'Minimum Academic Percentage','Minimum 50.00%','69.80%','PASS','Academic percentage comparison using the configured demo rule.'),(237,37,'Minimum Academic Percentage','Minimum 50.00%','74.00%','PASS','Academic percentage comparison using the configured demo rule.'),(238,38,'Minimum Academic Percentage','Minimum 50.00%','78.20%','PASS','Academic percentage comparison using the configured demo rule.'),(239,39,'Minimum Academic Percentage','Minimum 50.00%','82.40%','PASS','Academic percentage comparison using the configured demo rule.'),(240,40,'Minimum Academic Percentage','Minimum 50.00%','86.60%','PASS','Academic percentage comparison using the configured demo rule.'),(241,41,'Minimum Academic Percentage','Minimum 50.00%','90.80%','PASS','Academic percentage comparison using the configured demo rule.'),(242,42,'Minimum Academic Percentage','Minimum 50.00%','95.00%','PASS','Academic percentage comparison using the configured demo rule.'),(243,43,'Minimum Academic Percentage','Minimum 50.00%','99.20%','PASS','Academic percentage comparison using the configured demo rule.'),(244,44,'Minimum Academic Percentage','Minimum 50.00%','63.20%','PASS','Academic percentage comparison using the configured demo rule.'),(245,45,'Minimum Academic Percentage','Minimum 50.00%','67.40%','PASS','Academic percentage comparison using the configured demo rule.'),(246,46,'Minimum Academic Percentage','Minimum 50.00%','71.60%','PASS','Academic percentage comparison using the configured demo rule.'),(247,47,'Minimum Academic Percentage','Minimum 50.00%','75.80%','PASS','Academic percentage comparison using the configured demo rule.'),(248,48,'Minimum Academic Percentage','Minimum 50.00%','80.00%','PASS','Academic percentage comparison using the configured demo rule.'),(249,49,'Minimum Academic Percentage','Minimum 50.00%','84.20%','PASS','Academic percentage comparison using the configured demo rule.'),(250,50,'Minimum Academic Percentage','Minimum 50.00%','88.40%','PASS','Academic percentage comparison using the configured demo rule.'),(251,51,'Minimum Academic Percentage','Minimum 50.00%','92.60%','PASS','Academic percentage comparison using the configured demo rule.'),(252,52,'Minimum Academic Percentage','Minimum 50.00%','96.80%','PASS','Academic percentage comparison using the configured demo rule.'),(253,53,'Minimum Academic Percentage','Minimum 50.00%','60.80%','PASS','Academic percentage comparison using the configured demo rule.'),(254,54,'Minimum Academic Percentage','Minimum 50.00%','65.00%','PASS','Academic percentage comparison using the configured demo rule.'),(255,55,'Minimum Academic Percentage','Minimum 50.00%','69.20%','PASS','Academic percentage comparison using the configured demo rule.'),(256,56,'Minimum Academic Percentage','Minimum 50.00%','73.40%','PASS','Academic percentage comparison using the configured demo rule.'),(257,57,'Minimum Academic Percentage','Minimum 50.00%','77.60%','PASS','Academic percentage comparison using the configured demo rule.'),(258,58,'Minimum Academic Percentage','Minimum 50.00%','81.80%','PASS','Academic percentage comparison using the configured demo rule.'),(259,59,'Minimum Academic Percentage','Minimum 50.00%','86.00%','PASS','Academic percentage comparison using the configured demo rule.'),(260,60,'Minimum Academic Percentage','Minimum 50.00%','90.20%','PASS','Academic percentage comparison using the configured demo rule.'),(261,61,'Minimum Academic Percentage','Minimum 50.00%','94.40%','PASS','Academic percentage comparison using the configured demo rule.'),(262,62,'Minimum Academic Percentage','Minimum 50.00%','98.60%','PASS','Academic percentage comparison using the configured demo rule.'),(263,63,'Minimum Academic Percentage','Minimum 50.00%','62.60%','PASS','Academic percentage comparison using the configured demo rule.'),(264,64,'Minimum Academic Percentage','Minimum 50.00%','66.80%','PASS','Academic percentage comparison using the configured demo rule.'),(265,65,'Minimum Academic Percentage','Minimum 50.00%','71.00%','PASS','Academic percentage comparison using the configured demo rule.'),(266,66,'Minimum Academic Percentage','Minimum 50.00%','75.20%','PASS','Academic percentage comparison using the configured demo rule.'),(267,67,'Minimum Academic Percentage','Minimum 50.00%','79.40%','PASS','Academic percentage comparison using the configured demo rule.'),(268,68,'Minimum Academic Percentage','Minimum 50.00%','64.20%','PASS','Academic percentage comparison using the configured demo rule.'),(269,69,'Minimum Academic Percentage','Minimum 50.00%','68.40%','PASS','Academic percentage comparison using the configured demo rule.'),(270,70,'Minimum Academic Percentage','Minimum 50.00%','72.60%','PASS','Academic percentage comparison using the configured demo rule.'),(271,71,'Minimum Academic Percentage','Minimum 50.00%','76.80%','PASS','Academic percentage comparison using the configured demo rule.'),(272,72,'Minimum Academic Percentage','Minimum 50.00%','81.00%','PASS','Academic percentage comparison using the configured demo rule.'),(273,73,'Minimum Academic Percentage','Minimum 50.00%','85.20%','PASS','Academic percentage comparison using the configured demo rule.'),(274,74,'Minimum Academic Percentage','Minimum 50.00%','89.40%','PASS','Academic percentage comparison using the configured demo rule.'),(275,75,'Minimum Academic Percentage','Minimum 50.00%','93.60%','PASS','Academic percentage comparison using the configured demo rule.'),(276,76,'Minimum Academic Percentage','Minimum 50.00%','97.80%','PASS','Academic percentage comparison using the configured demo rule.'),(277,77,'Minimum Academic Percentage','Minimum 50.00%','61.80%','PASS','Academic percentage comparison using the configured demo rule.'),(278,78,'Minimum Academic Percentage','Minimum 50.00%','66.00%','PASS','Academic percentage comparison using the configured demo rule.'),(279,79,'Minimum Academic Percentage','Minimum 50.00%','70.20%','PASS','Academic percentage comparison using the configured demo rule.'),(280,80,'Minimum Academic Percentage','Minimum 50.00%','74.40%','PASS','Academic percentage comparison using the configured demo rule.'),(281,81,'Minimum Academic Percentage','Minimum 50.00%','78.60%','PASS','Academic percentage comparison using the configured demo rule.'),(282,82,'Minimum Academic Percentage','Minimum 50.00%','82.80%','PASS','Academic percentage comparison using the configured demo rule.'),(283,83,'Minimum Academic Percentage','Minimum 50.00%','87.00%','PASS','Academic percentage comparison using the configured demo rule.'),(284,84,'Minimum Academic Percentage','Minimum 50.00%','91.20%','PASS','Academic percentage comparison using the configured demo rule.'),(285,85,'Minimum Academic Percentage','Minimum 50.00%','95.40%','PASS','Academic percentage comparison using the configured demo rule.'),(286,86,'Minimum Academic Percentage','Minimum 50.00%','99.60%','PASS','Academic percentage comparison using the configured demo rule.'),(287,87,'Minimum Academic Percentage','Minimum 50.00%','63.60%','PASS','Academic percentage comparison using the configured demo rule.'),(288,88,'Minimum Academic Percentage','Minimum 50.00%','67.80%','PASS','Academic percentage comparison using the configured demo rule.'),(289,89,'Minimum Academic Percentage','Minimum 50.00%','72.00%','PASS','Academic percentage comparison using the configured demo rule.'),(290,90,'Minimum Academic Percentage','Minimum 50.00%','76.20%','PASS','Academic percentage comparison using the configured demo rule.'),(291,91,'Minimum Academic Percentage','Minimum 50.00%','80.40%','PASS','Academic percentage comparison using the configured demo rule.'),(292,92,'Minimum Academic Percentage','Minimum 50.00%','84.60%','PASS','Academic percentage comparison using the configured demo rule.'),(293,93,'Minimum Academic Percentage','Minimum 50.00%','88.80%','PASS','Academic percentage comparison using the configured demo rule.'),(294,94,'Minimum Academic Percentage','Minimum 50.00%','93.00%','PASS','Academic percentage comparison using the configured demo rule.'),(295,95,'Minimum Academic Percentage','Minimum 50.00%','97.20%','PASS','Academic percentage comparison using the configured demo rule.'),(296,96,'Minimum Academic Percentage','Minimum 50.00%','61.20%','PASS','Academic percentage comparison using the configured demo rule.'),(297,97,'Minimum Academic Percentage','Minimum 50.00%','65.40%','PASS','Academic percentage comparison using the configured demo rule.'),(298,98,'Minimum Academic Percentage','Minimum 50.00%','69.60%','PASS','Academic percentage comparison using the configured demo rule.'),(299,99,'Minimum Academic Percentage','Minimum 50.00%','73.80%','PASS','Academic percentage comparison using the configured demo rule.'),(300,100,'Minimum Academic Percentage','Minimum 50.00%','78.00%','PASS','Academic percentage comparison using the configured demo rule.');
/*!40000 ALTER TABLE `eligibility_evaluation_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eligibility_evaluations`
--

DROP TABLE IF EXISTS `eligibility_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eligibility_evaluations` (
  `evaluation_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `rule_id` bigint NOT NULL,
  `evaluated_by` bigint NOT NULL,
  `eligibility_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_percentage` decimal(5,2) DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `evaluated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evaluation_id`),
  KEY `application_id` (`application_id`),
  KEY `rule_id` (`rule_id`),
  KEY `evaluated_by` (`evaluated_by`),
  CONSTRAINT `eligibility_evaluations_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `eligibility_evaluations_ibfk_2` FOREIGN KEY (`rule_id`) REFERENCES `eligibility_rules` (`rule_id`),
  CONSTRAINT `eligibility_evaluations_ibfk_3` FOREIGN KEY (`evaluated_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `eligibility_evaluations_chk_1` CHECK ((`eligibility_status` in (_utf8mb4'ELIGIBLE',_utf8mb4'NOT_ELIGIBLE',_utf8mb4'INCOMPLETE')))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eligibility_evaluations`
--

LOCK TABLES `eligibility_evaluations` WRITE;
/*!40000 ALTER TABLE `eligibility_evaluations` DISABLE KEYS */;
INSERT INTO `eligibility_evaluations` VALUES (1,2,1,129,'INCOMPLETE',62.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(2,5,1,129,'INCOMPLETE',67.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(3,8,1,129,'INCOMPLETE',71.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(4,11,1,129,'INCOMPLETE',75.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(5,14,1,129,'INCOMPLETE',79.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(6,17,1,129,'INCOMPLETE',83.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(7,20,1,129,'INCOMPLETE',88.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(8,23,1,129,'INCOMPLETE',92.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(9,26,1,129,'INCOMPLETE',96.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(10,29,1,129,'INCOMPLETE',60.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(11,32,1,129,'INCOMPLETE',64.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(12,35,1,129,'INCOMPLETE',68.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(13,38,1,129,'INCOMPLETE',73.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(14,41,1,129,'INCOMPLETE',77.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(15,44,1,129,'INCOMPLETE',81.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(16,47,1,129,'INCOMPLETE',85.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(17,50,1,129,'INCOMPLETE',89.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(18,53,1,129,'INCOMPLETE',94.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(19,56,1,129,'INCOMPLETE',98.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(20,59,1,129,'INCOMPLETE',62.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(21,62,1,129,'INCOMPLETE',66.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(22,65,1,129,'INCOMPLETE',70.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(23,68,1,129,'INCOMPLETE',74.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(24,71,1,129,'INCOMPLETE',79.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(25,74,1,129,'INCOMPLETE',83.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(26,77,1,129,'INCOMPLETE',87.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(27,80,1,129,'INCOMPLETE',91.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(28,83,1,129,'INCOMPLETE',95.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(29,86,1,129,'INCOMPLETE',100.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(30,89,1,129,'INCOMPLETE',64.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(31,92,1,129,'INCOMPLETE',68.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(32,95,1,129,'INCOMPLETE',72.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(33,98,1,129,'INCOMPLETE',76.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(34,1,2,129,'INCOMPLETE',61.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(35,4,2,129,'INCOMPLETE',65.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(36,7,2,129,'INCOMPLETE',69.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(37,10,2,129,'INCOMPLETE',74.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(38,13,2,129,'INCOMPLETE',78.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(39,16,2,129,'INCOMPLETE',82.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(40,19,2,129,'INCOMPLETE',86.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(41,22,2,129,'INCOMPLETE',90.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(42,25,2,129,'INCOMPLETE',95.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(43,28,2,129,'INCOMPLETE',99.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(44,31,2,129,'INCOMPLETE',63.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(45,34,2,129,'INCOMPLETE',67.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(46,37,2,129,'INCOMPLETE',71.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(47,40,2,129,'INCOMPLETE',75.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(48,43,2,129,'INCOMPLETE',80.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(49,46,2,129,'INCOMPLETE',84.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(50,49,2,129,'INCOMPLETE',88.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(51,52,2,129,'INCOMPLETE',92.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(52,55,2,129,'INCOMPLETE',96.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(53,58,2,129,'INCOMPLETE',60.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(54,61,2,129,'INCOMPLETE',65.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(55,64,2,129,'INCOMPLETE',69.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(56,67,2,129,'INCOMPLETE',73.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(57,70,2,129,'INCOMPLETE',77.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(58,73,2,129,'INCOMPLETE',81.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(59,76,2,129,'INCOMPLETE',86.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(60,79,2,129,'INCOMPLETE',90.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(61,82,2,129,'INCOMPLETE',94.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(62,85,2,129,'INCOMPLETE',98.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(63,88,2,129,'INCOMPLETE',62.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(64,91,2,129,'INCOMPLETE',66.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(65,94,2,129,'INCOMPLETE',71.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(66,97,2,129,'INCOMPLETE',75.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(67,100,2,129,'INCOMPLETE',79.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(68,3,3,129,'INCOMPLETE',64.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(69,6,3,129,'INCOMPLETE',68.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(70,9,3,129,'INCOMPLETE',72.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(71,12,3,129,'INCOMPLETE',76.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(72,15,3,129,'INCOMPLETE',81.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(73,18,3,129,'INCOMPLETE',85.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(74,21,3,129,'INCOMPLETE',89.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(75,24,3,129,'INCOMPLETE',93.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(76,27,3,129,'INCOMPLETE',97.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(77,30,3,129,'INCOMPLETE',61.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(78,33,3,129,'INCOMPLETE',66.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(79,36,3,129,'INCOMPLETE',70.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(80,39,3,129,'INCOMPLETE',74.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(81,42,3,129,'INCOMPLETE',78.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(82,45,3,129,'INCOMPLETE',82.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(83,48,3,129,'INCOMPLETE',87.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(84,51,3,129,'INCOMPLETE',91.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(85,54,3,129,'INCOMPLETE',95.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(86,57,3,129,'INCOMPLETE',99.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(87,60,3,129,'INCOMPLETE',63.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(88,63,3,129,'INCOMPLETE',67.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(89,66,3,129,'INCOMPLETE',72.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(90,69,3,129,'INCOMPLETE',76.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(91,72,3,129,'INCOMPLETE',80.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(92,75,3,129,'INCOMPLETE',84.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(93,78,3,129,'INCOMPLETE',88.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(94,81,3,129,'INCOMPLETE',93.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(95,84,3,129,'INCOMPLETE',97.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(96,87,3,129,'INCOMPLETE',61.20,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(97,90,3,129,'INCOMPLETE',65.40,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(98,93,3,129,'INCOMPLETE',69.60,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(99,96,3,129,'INCOMPLETE',73.80,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46'),(100,99,3,129,'INCOMPLETE',78.00,'Demo evaluation: application is still in DRAFT status. Document verification and final eligibility screening are pending.','2026-11-09 18:58:46');
/*!40000 ALTER TABLE `eligibility_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eligibility_rules`
--

DROP TABLE IF EXISTS `eligibility_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eligibility_rules` (
  `rule_id` bigint NOT NULL AUTO_INCREMENT,
  `programme_id` bigint NOT NULL,
  `qualification` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minimum_percentage` decimal(5,2) NOT NULL,
  `rule_description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_id`),
  KEY `programme_id` (`programme_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `eligibility_rules_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`),
  CONSTRAINT `eligibility_rules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `eligibility_rules_chk_1` CHECK ((`minimum_percentage` between 0 and 100))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eligibility_rules`
--

LOCK TABLES `eligibility_rules` WRITE;
/*!40000 ALTER TABLE `eligibility_rules` DISABLE KEYS */;
INSERT INTO `eligibility_rules` VALUES (1,2,'12TH',50.00,'Demonstration rule: minimum 50 percent in 12th qualification',1,NULL,'2026-11-09 18:25:35'),(2,1,'12TH',50.00,'Demonstration rule: minimum 50 percent in 12th qualification',1,NULL,'2026-11-09 18:25:35'),(3,3,'12TH',50.00,'Demonstration rule: minimum 50 percent in 12th qualification',1,NULL,'2026-11-09 18:25:35');
/*!40000 ALTER TABLE `eligibility_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluation_rubrics`
--

DROP TABLE IF EXISTS `evaluation_rubrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_rubrics` (
  `rubric_id` bigint NOT NULL AUTO_INCREMENT,
  `programme_id` bigint NOT NULL,
  `rubric_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rubric_id`),
  KEY `programme_id` (`programme_id`),
  CONSTRAINT `evaluation_rubrics_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_rubrics`
--

LOCK TABLES `evaluation_rubrics` WRITE;
/*!40000 ALTER TABLE `evaluation_rubrics` DISABLE KEYS */;
INSERT INTO `evaluation_rubrics` VALUES (1,2,'BBA Department Evaluation Rubric','Standard department evaluation rubric for Bachelor of Business Administration',1,'2026-11-09 19:01:29'),(2,1,'BCA Department Evaluation Rubric','Standard department evaluation rubric for Bachelor of Computer Applications',1,'2026-11-09 19:01:29'),(3,3,'BCOM Department Evaluation Rubric','Standard department evaluation rubric for Bachelor of Commerce',1,'2026-11-09 19:01:29');
/*!40000 ALTER TABLE `evaluation_rubrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluator_assignments`
--

DROP TABLE IF EXISTS `evaluator_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluator_assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `evaluator_user_id` bigint NOT NULL,
  `assigned_by` bigint NOT NULL,
  `assignment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `application_id` (`application_id`),
  KEY `evaluator_user_id` (`evaluator_user_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `evaluator_assignments_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `evaluator_assignments_ibfk_2` FOREIGN KEY (`evaluator_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `evaluator_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `evaluator_assignments_chk_1` CHECK ((`assignment_status` in (_utf8mb4'ACTIVE',_utf8mb4'COMPLETED',_utf8mb4'REVOKED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluator_assignments`
--

LOCK TABLES `evaluator_assignments` WRITE;
/*!40000 ALTER TABLE `evaluator_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluator_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `final_decisions`
--

DROP TABLE IF EXISTS `final_decisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `final_decisions` (
  `decision_id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `decided_by` bigint NOT NULL,
  `decision` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `decision_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`decision_id`),
  UNIQUE KEY `application_id` (`application_id`),
  KEY `decided_by` (`decided_by`),
  CONSTRAINT `final_decisions_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `final_decisions_ibfk_2` FOREIGN KEY (`decided_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `final_decisions_chk_1` CHECK ((`decision` in (_utf8mb4'ADMITTED',_utf8mb4'REJECTED',_utf8mb4'WAITLISTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `final_decisions`
--

LOCK TABLES `final_decisions` WRITE;
/*!40000 ALTER TABLE `final_decisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `final_decisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_notifications` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programme_document_requirements`
--

DROP TABLE IF EXISTS `programme_document_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programme_document_requirements` (
  `requirement_id` bigint NOT NULL AUTO_INCREMENT,
  `programme_id` bigint NOT NULL,
  `document_type_id` int NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`requirement_id`),
  UNIQUE KEY `programme_id` (`programme_id`,`document_type_id`),
  KEY `document_type_id` (`document_type_id`),
  CONSTRAINT `programme_document_requirements_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`),
  CONSTRAINT `programme_document_requirements_ibfk_2` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`document_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programme_document_requirements`
--

LOCK TABLES `programme_document_requirements` WRITE;
/*!40000 ALTER TABLE `programme_document_requirements` DISABLE KEYS */;
INSERT INTO `programme_document_requirements` VALUES (1,1,4,1,'2026-11-09 18:25:35'),(2,1,3,1,'2026-11-09 18:25:35'),(3,1,2,1,'2026-11-09 18:25:35'),(4,1,1,1,'2026-11-09 18:25:35'),(8,1,5,0,'2026-11-09 18:25:35'),(9,2,4,1,'2026-11-09 18:25:35'),(10,2,3,1,'2026-11-09 18:25:35'),(11,2,2,1,'2026-11-09 18:25:35'),(12,2,1,1,'2026-11-09 18:25:35'),(16,2,5,0,'2026-11-09 18:25:35'),(17,3,4,1,'2026-11-09 18:25:35'),(18,3,3,1,'2026-11-09 18:25:35'),(19,3,2,1,'2026-11-09 18:25:35'),(20,3,1,1,'2026-11-09 18:25:35'),(24,3,5,0,'2026-11-09 18:25:35');
/*!40000 ALTER TABLE `programme_document_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programmes`
--

DROP TABLE IF EXISTS `programmes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programmes` (
  `programme_id` bigint NOT NULL AUTO_INCREMENT,
  `programme_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `programme_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_years` int NOT NULL,
  `qualification_required` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '12TH',
  `programme_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`programme_id`),
  UNIQUE KEY `programme_code` (`programme_code`),
  CONSTRAINT `programmes_chk_1` CHECK ((`duration_years` > 0)),
  CONSTRAINT `programmes_chk_2` CHECK ((`programme_status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programmes`
--

LOCK TABLES `programmes` WRITE;
/*!40000 ALTER TABLE `programmes` DISABLE KEYS */;
INSERT INTO `programmes` VALUES (1,'BCA','Bachelor of Computer Applications','Undergraduate programme in Computer Applications',3,'12TH','ACTIVE','2026-11-09 18:25:35'),(2,'BBA','Bachelor of Business Administration','Undergraduate programme in Business Administration',3,'12TH','ACTIVE','2026-11-09 18:25:35'),(3,'BCOM','Bachelor of Commerce','Undergraduate programme in Commerce',3,'12TH','ACTIVE','2026-11-09 18:25:35');
/*!40000 ALTER TABLE `programmes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_sessions`
--

DROP TABLE IF EXISTS `refresh_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_sessions` (
  `session_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  CONSTRAINT `refresh_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_sessions`
--

LOCK TABLES `refresh_sessions` WRITE;
/*!40000 ALTER TABLE `refresh_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_code` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'APPLICANT','Applicant','Student applying for admission','2026-11-09 18:25:35'),(2,'ADMISSION_OFFICER','Admission Officer','Manages applications and document verification','2026-11-09 18:25:35'),(3,'EVALUATOR','Evaluator','Evaluates eligible applications','2026-11-09 18:25:35'),(4,'ADMIN','Administrator','Manages the complete admission system','2026-11-09 18:25:35');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rubric_criteria`
--

DROP TABLE IF EXISTS `rubric_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rubric_criteria` (
  `criterion_id` bigint NOT NULL AUTO_INCREMENT,
  `rubric_id` bigint NOT NULL,
  `criterion_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `weight_percentage` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`criterion_id`),
  KEY `rubric_id` (`rubric_id`),
  CONSTRAINT `rubric_criteria_ibfk_1` FOREIGN KEY (`rubric_id`) REFERENCES `evaluation_rubrics` (`rubric_id`),
  CONSTRAINT `rubric_criteria_chk_1` CHECK (((`weight_percentage` > 0) and (`weight_percentage` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rubric_criteria`
--

LOCK TABLES `rubric_criteria` WRITE;
/*!40000 ALTER TABLE `rubric_criteria` DISABLE KEYS */;
INSERT INTO `rubric_criteria` VALUES (1,3,'Academic Performance','Assessment of previous academic performance.',30.00,1),(2,2,'Academic Performance','Assessment of previous academic performance.',30.00,1),(3,1,'Academic Performance','Assessment of previous academic performance.',30.00,1),(4,3,'Subject Knowledge','Assessment of knowledge related to the selected programme.',25.00,1),(5,2,'Subject Knowledge','Assessment of knowledge related to the selected programme.',25.00,1),(6,1,'Subject Knowledge','Assessment of knowledge related to the selected programme.',25.00,1),(7,3,'Communication Skills','Assessment of verbal and written communication.',25.00,1),(8,2,'Communication Skills','Assessment of verbal and written communication.',25.00,1),(9,1,'Communication Skills','Assessment of verbal and written communication.',25.00,1),(10,3,'Overall Aptitude','Assessment of learning ability and problem-solving aptitude.',20.00,1),(11,2,'Overall Aptitude','Assessment of learning ability and problem-solving aptitude.',20.00,1),(12,1,'Overall Aptitude','Assessment of learning ability and problem-solving aptitude.',20.00,1);
/*!40000 ALTER TABLE `rubric_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_profiles` (
  `staff_profile_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `employee_code` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_profile_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (1,128,'CF-EMP-001','Computer Applications','Admission Officer','2026-11-09 18:56:52'),(2,129,'CF-EMP-002','Computer Applications','Eligibility Evaluator','2026-11-09 18:56:52'),(3,130,'CF-EMP-003','Computer Applications','Department Evaluator','2026-11-09 18:56:52'),(4,131,'CF-EMP-004','Computer Applications','System Administrator','2026-11-09 18:56:52');
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_country_code` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT '+91',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `users_chk_1` CHECK ((`account_status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'SUSPENDED')))
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Aarav Sharma','applicant001@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000001','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(2,1,'Ananya Sharma','applicant002@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000002','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(3,1,'Rohan Sharma','applicant003@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000003','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(4,1,'Diya Sharma','applicant004@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000004','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(5,1,'Arjun Sharma','applicant005@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000005','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(6,1,'Sneha Sharma','applicant006@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000006','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(7,1,'Aditya Sharma','applicant007@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000007','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(8,1,'Priya Sharma','applicant008@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000008','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(9,1,'Rahul Sharma','applicant009@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000009','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(10,1,'Kavya Sharma','applicant010@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000010','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(11,1,'Aarav Patil','applicant011@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000011','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(12,1,'Ananya Patil','applicant012@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000012','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(13,1,'Rohan Patil','applicant013@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000013','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(14,1,'Diya Patil','applicant014@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000014','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(15,1,'Arjun Patil','applicant015@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000015','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(16,1,'Sneha Patil','applicant016@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000016','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(17,1,'Aditya Patil','applicant017@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000017','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(18,1,'Priya Patil','applicant018@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000018','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(19,1,'Rahul Patil','applicant019@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000019','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(20,1,'Kavya Patil','applicant020@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000020','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(21,1,'Aarav Kulkarni','applicant021@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000021','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(22,1,'Ananya Kulkarni','applicant022@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000022','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(23,1,'Rohan Kulkarni','applicant023@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000023','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(24,1,'Diya Kulkarni','applicant024@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000024','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(25,1,'Arjun Kulkarni','applicant025@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000025','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(26,1,'Sneha Kulkarni','applicant026@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000026','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(27,1,'Aditya Kulkarni','applicant027@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000027','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(28,1,'Priya Kulkarni','applicant028@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000028','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(29,1,'Rahul Kulkarni','applicant029@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000029','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(30,1,'Kavya Kulkarni','applicant030@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000030','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(31,1,'Aarav Desai','applicant031@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000031','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(32,1,'Ananya Desai','applicant032@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000032','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(33,1,'Rohan Desai','applicant033@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000033','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(34,1,'Diya Desai','applicant034@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000034','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(35,1,'Arjun Desai','applicant035@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000035','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(36,1,'Sneha Desai','applicant036@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000036','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(37,1,'Aditya Desai','applicant037@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000037','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(38,1,'Priya Desai','applicant038@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000038','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(39,1,'Rahul Desai','applicant039@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000039','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(40,1,'Kavya Desai','applicant040@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000040','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(41,1,'Aarav Reddy','applicant041@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000041','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(42,1,'Ananya Reddy','applicant042@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000042','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(43,1,'Rohan Reddy','applicant043@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000043','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(44,1,'Diya Reddy','applicant044@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000044','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(45,1,'Arjun Reddy','applicant045@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000045','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(46,1,'Sneha Reddy','applicant046@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000046','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(47,1,'Aditya Reddy','applicant047@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000047','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(48,1,'Priya Reddy','applicant048@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000048','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(49,1,'Rahul Reddy','applicant049@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000049','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(50,1,'Kavya Reddy','applicant050@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000050','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(51,1,'Aarav Joshi','applicant051@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000051','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(52,1,'Ananya Joshi','applicant052@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000052','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(53,1,'Rohan Joshi','applicant053@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000053','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(54,1,'Diya Joshi','applicant054@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000054','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(55,1,'Arjun Joshi','applicant055@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000055','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(56,1,'Sneha Joshi','applicant056@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000056','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(57,1,'Aditya Joshi','applicant057@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000057','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(58,1,'Priya Joshi','applicant058@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000058','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(59,1,'Rahul Joshi','applicant059@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000059','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(60,1,'Kavya Joshi','applicant060@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000060','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(61,1,'Aarav Nair','applicant061@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000061','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(62,1,'Ananya Nair','applicant062@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000062','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(63,1,'Rohan Nair','applicant063@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000063','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(64,1,'Diya Nair','applicant064@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000064','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(65,1,'Arjun Nair','applicant065@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000065','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(66,1,'Sneha Nair','applicant066@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000066','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(67,1,'Aditya Nair','applicant067@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000067','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(68,1,'Priya Nair','applicant068@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000068','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(69,1,'Rahul Nair','applicant069@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000069','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(70,1,'Kavya Nair','applicant070@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000070','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(71,1,'Aarav Shetty','applicant071@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000071','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(72,1,'Ananya Shetty','applicant072@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000072','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(73,1,'Rohan Shetty','applicant073@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000073','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(74,1,'Diya Shetty','applicant074@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000074','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(75,1,'Arjun Shetty','applicant075@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000075','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(76,1,'Sneha Shetty','applicant076@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000076','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(77,1,'Aditya Shetty','applicant077@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000077','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(78,1,'Priya Shetty','applicant078@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000078','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(79,1,'Rahul Shetty','applicant079@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000079','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(80,1,'Kavya Shetty','applicant080@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000080','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(81,1,'Aarav Gowda','applicant081@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000081','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(82,1,'Ananya Gowda','applicant082@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000082','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(83,1,'Rohan Gowda','applicant083@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000083','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(84,1,'Diya Gowda','applicant084@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000084','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(85,1,'Arjun Gowda','applicant085@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000085','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(86,1,'Sneha Gowda','applicant086@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000086','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(87,1,'Aditya Gowda','applicant087@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000087','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(88,1,'Priya Gowda','applicant088@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000088','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(89,1,'Rahul Gowda','applicant089@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000089','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(90,1,'Kavya Gowda','applicant090@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000090','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(91,1,'Aarav Verma','applicant091@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000091','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(92,1,'Ananya Verma','applicant092@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000092','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(93,1,'Rohan Verma','applicant093@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000093','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(94,1,'Diya Verma','applicant094@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000094','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(95,1,'Arjun Verma','applicant095@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000095','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(96,1,'Sneha Verma','applicant096@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000096','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(97,1,'Aditya Verma','applicant097@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000097','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(98,1,'Priya Verma','applicant098@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000098','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(99,1,'Rahul Verma','applicant099@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000099','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(100,1,'Kavya Verma','applicant100@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000100','ACTIVE',0,'2026-11-09 18:31:35','2026-11-09 18:31:35'),(128,2,'Admission Officer One','officer1@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000001','ACTIVE',1,'2026-11-09 18:56:24','2026-11-09 18:56:24'),(129,3,'Evaluator One','evaluator1@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000002','ACTIVE',1,'2026-11-09 18:56:24','2026-11-09 18:56:24'),(130,3,'Evaluator Two','evaluator2@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000003','ACTIVE',1,'2026-11-09 18:56:24','2026-11-09 18:56:24'),(131,4,'System Administrator','admin@credifit.demo','!DEMO_SEED_ACCOUNT_NO_LOGIN!','+91','9000000004','ACTIVE',1,'2026-11-09 18:56:24','2026-11-09 18:56:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_application_overview`
--

DROP TABLE IF EXISTS `v_application_overview`;
/*!50001 DROP VIEW IF EXISTS `v_application_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_application_overview` AS SELECT 
 1 AS `application_id`,
 1 AS `application_reference`,
 1 AS `user_id`,
 1 AS `applicant_name`,
 1 AS `applicant_email`,
 1 AS `city`,
 1 AS `state`,
 1 AS `programme_code`,
 1 AS `programme_name`,
 1 AS `academic_year`,
 1 AS `qualification`,
 1 AS `academic_percentage`,
 1 AS `application_status`,
 1 AS `current_stage`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_application_overview`
--

/*!50001 DROP VIEW IF EXISTS `v_application_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_application_overview` AS select `a`.`application_id` AS `application_id`,`a`.`application_reference` AS `application_reference`,`u`.`user_id` AS `user_id`,`u`.`full_name` AS `applicant_name`,`u`.`email` AS `applicant_email`,`ap`.`city` AS `city`,`ap`.`state` AS `state`,`p`.`programme_code` AS `programme_code`,`p`.`programme_name` AS `programme_name`,`c`.`academic_year` AS `academic_year`,`e`.`qualification` AS `qualification`,`e`.`percentage` AS `academic_percentage`,`a`.`application_status` AS `application_status`,`s`.`stage_name` AS `current_stage`,`a`.`created_at` AS `created_at` from ((((((`applications` `a` join `users` `u` on((`a`.`applicant_user_id` = `u`.`user_id`))) left join `applicant_profiles` `ap` on((`u`.`user_id` = `ap`.`user_id`))) join `programmes` `p` on((`a`.`programme_id` = `p`.`programme_id`))) join `admission_cycles` `c` on((`a`.`cycle_id` = `c`.`cycle_id`))) left join `education_records` `e` on((`u`.`user_id` = `e`.`user_id`))) left join `application_stages` `s` on((`a`.`current_stage_id` = `s`.`stage_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 22:30:13
