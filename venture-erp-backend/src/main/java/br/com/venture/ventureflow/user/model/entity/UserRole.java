package br.com.venture.ventureflow.user.model.entity;

/**
 * What a user is allowed to be in the system.
 *
 * <p>Deliberately small, with roles for factory and reseller users.
 */
public enum UserRole {

    /** Works for the factory. Sees everything. Must not reference a reseller. */
    ADMIN,

    /** Admin linked to a reseller. Sees all sales orders for that reseller. */
    RESELLER_ADMIN,

    /** Works for a reseller. Sees only the sales orders assigned to them. */
    ASSEMBLY_SUPERVISOR
}
