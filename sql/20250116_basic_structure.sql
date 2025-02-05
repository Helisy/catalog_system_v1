CREATE TABLE products(
id BIGINT NOT NULL AUTO_INCREMENT,

sku varchar(128) not null,
old_sku varchar(256),
description text,
observation text,
gross_weight real default 0,
net_weight real default 0,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

CREATE FULLTEXT INDEX index_products ON products (sku, old_sku, description);
-- SELECT * FROM products WHERE MATCH (sku, old_sku, description) AGAINST ('gato') limit 1, 2;
-- SELECT * FROM products WHERE MATCH (sku,old_sku,description) AGAINST ('CLM0010*' IN BOOLEAN MODE);#IN BOOLEAN MODE

-- SELECT * FROM products WHERE sku REGEXP '^CLM0010-' OR old_sku REGEXP '^CLM0010-' OR description REGEXP '^CLM0010-';
-- SELECT * FROM products WHERE sku LIKE '%cop%' OR old_sku LIKE '%cop%' OR description LIKE '%cop%';

-- SELECT * FROM products limit 0, 2;

-- select * from images where product_id = 138 and deleted_at is null and is_main = 1;
-- update images set is_main = 1 where product_id = 138 and deleted_at is null order by id limit 1;


-- insert into products(sku, old_sku, description, observation) values("CLA0145-ESP", "EA0020-M", "Gato Sentado", "Peça única");

CREATE TABLE parts(
id BIGINT NOT NULL AUTO_INCREMENT,

width real not null,
height real not null,
depth real not null,
part_type_id int not null,
product_id int not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

-- insert into parts(width, height, depth, part_type_id, product_id) values(500, 30, 400, 1, 1);
-- select 
-- 	parts.id,
--     parts.width,
--     parts.height,
--     parts.depth,
-- 	parts.part_type_id,
--     part_type.label as part_type,
--     part_type.created_at,
--     part_type.updated_at,
--     part_type.deleted_at
-- from 
-- parts 
-- join part_type on part_type.id = parts.part_type_id
-- where parts.product_id = 1 and parts.deleted_at is null;

-- CREATE TABLE part_type(
-- id BIGINT NOT NULL AUTO_INCREMENT,

-- label varchar(32) not null,

-- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
-- deleted_at DATETIME DEFAULT NULL,
-- primary key(id)
-- );

insert into part_type(label) values("Produto Final");
insert into part_type(label) values("Subparte");


CREATE TABLE images(
id BIGINT NOT NULL AUTO_INCREMENT,

product_id int not null,
path varchar(256) not null,
is_main bool not null default false,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

-- select * from images where product_id = 1 and deleted_at is null;
-- update images set is_main = 0 where product_id = 1;
-- update images set is_main = 1 where product_id = 1 and id = 1;

-- insert into images(product_id, path) values();
    
CREATE TABLE directories(
id BIGINT NOT NULL AUTO_INCREMENT,

product_id int not null,
path varchar(256) not null,
label varchar(64),
directory_type_id int not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

-- select * from directories;

-- insert into directories(product_id, path, label, directory_type_id) values(1, "H:\Meu Drive\1.DELIQUADROS\1.PRODUTOS\ESPELHOS\EA0020 - GATO", "Drive - Artes Antigas", 3);

-- select 
-- 	directories.path,
--     directories.label,
--     directories.directory_type_id,
--     directory_type.label as directory_type,
-- 	directory_type.created_at,
--     directory_type.updated_at,
--     directory_type.deleted_at
-- from directories
-- join directory_type on directory_type.id = directories.directory_type_id
-- where
-- 	directories.product_id = 1 and 
--     directories.deleted_at is null;

CREATE TABLE directory_type(
id BIGINT NOT NULL AUTO_INCREMENT,

label varchar(32) not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME DEFAULT NULL,
primary key(id)
);

insert into directory_type(label) values("Produção");
insert into directory_type(label) values("Criação");
insert into directory_type(label) values("Anúncio");



select * from products WHERE deleted_at is null  LIMIT 1, 2;

