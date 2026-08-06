package br.com.venture.ventureflow.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class ResellerNotAvailableException extends RuntimeException {

    public ResellerNotAvailableException(Long id) {
        super("Reseller not found or inactive: " + id);
    }
}
