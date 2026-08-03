package br.com.venture.ventureflow.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Raised when a code lookup without a source matches aliases of more than one item.
 * The caller must retry informing the source.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class AmbiguousCodeException extends RuntimeException {

    public AmbiguousCodeException(String code) {
        super("Code matches aliases of more than one item, inform the source: " + code);
    }
}
