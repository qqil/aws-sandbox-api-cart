CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE cart (
	id uuid DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
    is_ordered boolean DEFAULT false,
    PRIMARY KEY(id),
    UNIQUE(id, user_id)
);

CREATE TABLE cart_items (
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    "count" integer NOT NULL,
    PRIMARY KEY(cart_id, product_id),
    FOREIGN KEY(cart_id) REFERENCES cart(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE orders (
    id uuid DEFAULT uuid_generate_v4(),
    user_id uuid,
    cart_id uuid,
    payment json NOT NULL,
    delivery json NOT NULL,
    comments text,
    "status" varchar NOT NULL,
    total decimal NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(cart_id) REFERENCES cart(id) ON DELETE CASCADE ON UPDATE CASCADE
);

/*
    My cognito user id: 7fe9d6a0-6a9e-4346-9fc6-d8947d884d2d
*/
INSERT INTO cart (id, user_id, created_at, updated_at, is_ordered) 
VALUES ('70be2e0a-e06d-4040-930a-7cc5bf953960','7fe9d6a0-6a9e-4346-9fc6-d8947d884d2d', DEFAULT, DEFAULT, DEFAULT) RETURNING id;

/*
    Sample product ids, that already exist in dynamodb:

    3550e355-430a-463f-b798-4eb5bfbc4a59,
    b3a40595-a4a2-4eb1-b9ba-0064252844ba,
    1e375095-7f1c-44fc-81cc-76959b782f94
*/
INSERT INTO cart_items (cart_id, product_id, "count")
VALUES 
    ('70be2e0a-e06d-4040-930a-7cc5bf953960', '3550e355-430a-463f-b798-4eb5bfbc4a59', 1),
    ('70be2e0a-e06d-4040-930a-7cc5bf953960', 'b3a40595-a4a2-4eb1-b9ba-0064252844ba', 5),
    ('70be2e0a-e06d-4040-930a-7cc5bf953960', '1e375095-7f1c-44fc-81cc-76959b782f94', 3);

INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, "status", total)
VALUES (DEFAULT, '7fe9d6a0-6a9e-4346-9fc6-d8947d884d2d', '70be2e0a-e06d-4040-930a-7cc5bf953960', '{}', '{}', 'order comment', 'inProgress', 99);