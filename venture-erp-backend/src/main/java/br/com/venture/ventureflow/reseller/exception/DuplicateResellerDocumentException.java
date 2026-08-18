package br.com.venture.ventureflow.reseller.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResellerDocumentException extends RuntimeException {

    public DuplicateResellerDocumentException(String documentNumber) {
        super("Reseller document already in use: " + documentNumber);
    }
}
