package br.com.venture.ventureflow.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Raised when role and reseller disagree: a supervisor without a reseller,
 * or a factory employee carrying one.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidRoleAssignmentException extends RuntimeException {

    public InvalidRoleAssignmentException(String message) {
        super(message);
    }
}
