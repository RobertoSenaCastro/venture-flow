package br.com.venture.ventureflow.user.model.dto;

import br.com.venture.ventureflow.user.model.entity.User;

/** Minimal shape for select inputs, such as supervisor assignment. */
public record UserOptionResponse(Long id, String name) {

    public static UserOptionResponse from(User user) {
        return new UserOptionResponse(user.getId(), user.getName());
    }
}
