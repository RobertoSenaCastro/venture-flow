package br.com.venture.ventureflow.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Raised when an internal code or an (source, code) alias pair is already taken.
 *
 * <p>@ResponseStatus is resolved by Spring without any change to GlobalExceptionHandler.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateCodeException extends RuntimeException {

    public DuplicateCodeException(String message) {
        super(message);
    }
}
