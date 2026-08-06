package br.com.venture.ventureflow.user.model.entity;

/**
 * What a user is allowed to be in the system.
 *
 * <p>Deliberately small. A reseller-facing role is not declared yet because
 * resellers do not access the system; adding one later is a single constant.
 */
public enum UserRole {

    /** Works for the factory. Sees everything. Must not reference a reseller. */
    EMPLOYEE,

    /** Works for a reseller. Sees only the sales orders assigned to them. */
    ASSEMBLY_SUPERVISOR
}
