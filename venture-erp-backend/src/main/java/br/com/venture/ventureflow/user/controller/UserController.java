package br.com.venture.ventureflow.user.controller;

import br.com.venture.ventureflow.user.model.dto.PasswordChangeRequest;
import br.com.venture.ventureflow.user.model.dto.UserCreationRequest;
import br.com.venture.ventureflow.user.model.dto.UserOptionResponse;
import br.com.venture.ventureflow.user.model.dto.UserRequest;
import br.com.venture.ventureflow.user.model.dto.UserResponse;
import br.com.venture.ventureflow.user.model.entity.UserRole;
import br.com.venture.ventureflow.user.model.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreationRequest request) {
        UserResponse created = userService.create(request);
        return ResponseEntity.created(URI.create("/api/users/" + created.id())).body(created);
    }

    @GetMapping
    public List<UserResponse> search(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Long resellerId
    ) {
        return userService.search(role, resellerId);
    }

    @GetMapping("/trash")
    public List<UserResponse> findInactive() {
        return userService.findInactive();
    }

    @GetMapping("/supervisors")
    public List<UserOptionResponse> findSupervisorOptions(@RequestParam Long resellerId) {
        return userService.findSupervisorOptions(resellerId);
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return userService.update(id, request);
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        userService.activate(id);
        return ResponseEntity.noContent().build();
    }
}
