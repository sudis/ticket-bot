CREATE DATABASE TicketBot;

CREATE TABLE Tickets (
    pid INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    member_id CHAR(18) NOT NULL,
    claimed_staff CHAR(18),
    ticket_status ENUM('AÇIK','ARŞİVDE','KAPALI','SİLİNMİŞ') DEFAULT 'AÇIK' NOT NULL,
    ticket_type ENUM('GENEL','HATALAR','ÖNERİLER'),
    ticket_room CHAR(18),
    ticket_transcript VARCHAR(255),
    opening_timestamp CHAR(10) NOT NULL,
    opening_time DATETIME DEFAULT (CURRENT_TIME) NOT NULL
);

CREATE TABLE TicketStats (
    pid INT AUTO_INCREMENT UNIQUE NOT NULL,
    member_id CHAR(18) PRIMARY KEY NOT NULL,
    clicked_buttons INT DEFAULT 0 NOT NULL,
    opened_tickets INT DEFAULT 0 NOT NULL,
    solved_tickets INT DEFAULT 0 NOT NULL,
    unsolved_tickets INT DEFAULT 0 NOT NULL,
    general_ask INT DEFAULT 0 NOT NULL,
    problem_ask INT DEFAULT 0 NOT NULL,
    suggestion_ask INT DEFAULT 0 NOT NULL
);

CREATE TABLE Comments (
    pid INT AUTO_INCREMENT UNIQUE NOT NULL,
    staff_id CHAR(18) PRIMARY KEY NOT NULL,
    staff_solubility INT DEFAULT 0 NOT NULL,
    staff_unsolubility INT DEFAULT 0 NOT NULL,
    comment ENUM('Akıllı','Hızlı','Arkadaşça','Dalgacı','Bilgisiz','Kötü Hız','Belirtilmemiş') DEFAULT 'Belirtilmemiş' NOT NULL
);
