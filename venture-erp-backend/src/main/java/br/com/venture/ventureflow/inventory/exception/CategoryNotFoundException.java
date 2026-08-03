package br.com.venture.ventureflow.inventory.exception;

import jakarta.persistence.EntityNotFoundException;

/** Extends EntityNotFoundException so the existing GlobalExceptionHandler maps it to 404. */
public class CategoryNotFoundException extends EntityNotFoundException {

    public CategoryNotFoundException(Long id) {
        super("Category not found or inactive: " + id);
    }

    public CategoryNotFoundException(String message) {
        super(message);
    }
}
