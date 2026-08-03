package br.com.venture.ventureflow.inventory.exception;

import jakarta.persistence.EntityNotFoundException;

/** Extends EntityNotFoundException so the existing GlobalExceptionHandler maps it to 404. */
public class ItemNotFoundException extends EntityNotFoundException {

    public ItemNotFoundException(Long id) {
        super("Item not found: " + id);
    }

    public ItemNotFoundException(String message) {
        super(message);
    }
}
