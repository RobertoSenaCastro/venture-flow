package br.com.venture.ventureflow.reseller.exception;

import jakarta.persistence.EntityNotFoundException;

public class ResellerNotFoundException extends EntityNotFoundException {

    public ResellerNotFoundException(Long id) {
        super("Reseller not found: " + id);
    }
}
