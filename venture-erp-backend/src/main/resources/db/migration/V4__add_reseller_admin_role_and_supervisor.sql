-- Adds the RESELLER_ADMIN role to the check constraint, and the optional
-- assembly supervisor link on sales orders.

-- 1. Widen the role constraint to accept the new role.
ALTER TABLE users DROP CONSTRAINT users_role_check;

ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'RESELLER_ADMIN', 'ASSEMBLY_SUPERVISOR'));

-- 2. Optional supervisor assigned to a sales order.
--    Nullable: not every order has factory assembly.
--    ON DELETE SET NULL: deactivating/removing a user must not delete orders;
--    the assignment simply clears.
ALTER TABLE sales_orders
    ADD COLUMN assembly_supervisor_id BIGINT;

ALTER TABLE sales_orders
    ADD CONSTRAINT fk_sales_orders_assembly_supervisor
    FOREIGN KEY (assembly_supervisor_id) REFERENCES users(id)
    ON DELETE SET NULL;